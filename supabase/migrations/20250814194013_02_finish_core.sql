-- =====================================================================================
-- SAFE UTF-8 (no BOM). Migration bổ sung cho thiết kế hiện tại của bạn.
-- Phù hợp với:
--  - Enums: gender_type, match_type, match_status (đã có ở migration trước)
--  - Bảng nền: provinces, wards, courts, admin_settings (kv JSONB), profiles, matches
-- =====================================================================================

-- 1) BẢNG BỔ SUNG
-- 1.1 Rank events (audit log cho thay đổi điểm)
CREATE TABLE IF NOT EXISTS public.rank_events (
                                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    delta NUMERIC(10,2) NOT NULL,
    old_score NUMERIC(10,2),
    new_score NUMERIC(10,2),
    reason TEXT,                     -- 'win' | 'loss' | 'walkover' | 'adjust'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

-- 1.2 CMS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
CREATE TYPE post_status AS ENUM ('draft','published');
END IF;
END
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.news_categories (
                                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
    );

CREATE TABLE IF NOT EXISTS public.news_posts (
                                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT,
    cover_image_url TEXT,
    status post_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    author_profile_id UUID REFERENCES public.profiles(id),
    category_id UUID REFERENCES public.news_categories(id),
    highlight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

-- 2) TRIGGERS updated_at (tận dụng public.update_updated_at_column() bạn đã có)
DROP TRIGGER IF EXISTS update_news_posts_updated_at ON public.news_posts;
CREATE TRIGGER update_news_posts_updated_at
    BEFORE UPDATE ON public.news_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- (Đảm bảo đã có triggers cho courts, admin_settings, profiles, matches từ migration trước)

-- 3) RLS & POLICIES (đồng bộ phong cách hiện tại)
ALTER TABLE public.rank_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- Rank events: chỉ chính chủ xem (hoặc mở rộng nếu cần)
DROP POLICY IF EXISTS "Rank events readable by owner or admin" ON public.rank_events;
CREATE POLICY "Rank events readable by owner or admin"
ON public.rank_events FOR SELECT TO authenticated
                                          USING (
                                          profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
                                          );

-- Categories công khai
DROP POLICY IF EXISTS "Categories public read" ON public.news_categories;
CREATE POLICY "Categories public read"
ON public.news_categories FOR SELECT USING (true);

-- Posts: public read nếu published, admin tuỳ bạn thêm sau
DROP POLICY IF EXISTS "News public read" ON public.news_posts;
CREATE POLICY "News public read"
ON public.news_posts FOR SELECT
                                         USING (status = 'published');

-- 4) HELPERS đọc cấu hình dạng JSONB trong admin_settings
-- Lưu ý: setting_value của bạn đang chèn chuỗi '1000'… Hàm dưới tự cố gắng ép kiểu.
CREATE OR REPLACE FUNCTION public.get_setting_numeric(p_key TEXT, p_default NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql STABLE AS $$
DECLARE
v JSONB;
  n NUMERIC;
BEGIN
SELECT setting_value INTO v
FROM public.admin_settings
WHERE setting_key = p_key
ORDER BY created_at DESC
    LIMIT 1;

IF v IS NULL THEN
    RETURN p_default;
END IF;

BEGIN
    -- Nếu setting_value là số: {"value": 1000} / 1000 / "1000" đều thử ép
    n := (v #>> '{}')::NUMERIC;
RETURN n;
EXCEPTION WHEN others THEN
    RETURN p_default;
END;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_setting_int(p_key TEXT, p_default INT)
RETURNS INT
LANGUAGE plpgsql STABLE AS $$
DECLARE
v JSONB;
  i INT;
BEGIN
SELECT setting_value INTO v
FROM public.admin_settings
WHERE setting_key = p_key
ORDER BY created_at DESC
    LIMIT 1;

IF v IS NULL THEN
    RETURN p_default;
END IF;

BEGIN
    i := (v #>> '{}')::INT;
RETURN i;
EXCEPTION WHEN others THEN
    RETURN p_default;
END;
END;
$$;

-- 5) RPC: ÁP KẾT QUẢ TRẬN (đọc điểm từ JSONB mảng set)
-- Logic: đếm set thắng/thua theo từng index của mảng; cộng/trừ điểm theo setting;
-- cập nhật profiles.current_rank, wins/losses, total_matches và lưu audit rank_events.
CREATE OR REPLACE FUNCTION public.apply_match_result(p_match_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
m RECORD;
  creator_sets INT := 0;
  opponent_sets INT := 0;
  margin_sum   INT := 0;
  nsets        INT := 0;
  idx          INT;
  c INT; o INT;

  base_win  INT := public.get_setting_int('rank_points_win', 25);
  base_loss INT := public.get_setting_int('rank_points_loss', 25);
  k_setdiff NUMERIC := public.get_setting_numeric('set_difference_multiplier', 2);

  creator_old NUMERIC; opponent_old NUMERIC;
  creator_new NUMERIC; opponent_new NUMERIC;

  creator_delta NUMERIC := 0;
  opponent_delta NUMERIC := 0;
BEGIN
  -- Lấy bản ghi trận
SELECT * INTO m FROM public.matches WHERE id = p_match_id FOR UPDATE;
IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % not found', p_match_id;
END IF;

  -- Bảo vệ dữ liệu
  IF m.creator_score IS NULL OR m.opponent_score IS NULL THEN
    RAISE EXCEPTION 'Scores are required';
END IF;

  nsets := GREATEST(
    COALESCE(jsonb_array_length(m.creator_score),0),
    COALESCE(jsonb_array_length(m.opponent_score),0)
  );

  IF nsets = 0 THEN
    RAISE EXCEPTION 'Empty scores';
END IF;

  -- Tính set thắng/thua và tổng chênh lệch điểm
FOR idx IN 0..(nsets-1) LOOP
    c := COALESCE((m.creator_score->>idx)::INT, 0);
    o := COALESCE((m.opponent_score->>idx)::INT, 0);

    IF c > o THEN
      creator_sets := creator_sets + 1;
    ELSIF o > c THEN
      opponent_sets := opponent_sets + 1;
END IF;

    margin_sum := margin_sum + ABS(c - o);
END LOOP;

  -- Điểm trước trận
SELECT current_rank INTO creator_old FROM public.profiles WHERE id = m.creator_id FOR UPDATE;
SELECT current_rank INTO opponent_old FROM public.profiles WHERE id = m.opponent_id FOR UPDATE;

IF creator_sets > opponent_sets THEN
    creator_delta  := base_win  + (margin_sum * k_setdiff);
    opponent_delta := - base_loss - (margin_sum * k_setdiff);
ELSE
    creator_delta  := - base_loss - (margin_sum * k_setdiff);
    opponent_delta := base_win  + (margin_sum * k_setdiff);
END IF;

  -- Cập nhật rank & counters
UPDATE public.profiles
SET current_rank = COALESCE(current_rank,0) + creator_delta,
    total_matches = COALESCE(total_matches,0) + 1,
    wins = COALESCE(wins,0) + CASE WHEN creator_sets > opponent_sets THEN 1 ELSE 0 END,
    losses = COALESCE(losses,0) + CASE WHEN creator_sets > opponent_sets THEN 0 ELSE 1 END,
    updated_at = now()
WHERE id = m.creator_id
    RETURNING current_rank INTO creator_new;

UPDATE public.profiles
SET current_rank = COALESCE(current_rank,0) + opponent_delta,
    total_matches = COALESCE(total_matches,0) + 1,
    wins = COALESCE(wins,0) + CASE WHEN opponent_sets > creator_sets THEN 1 ELSE 0 END,
    losses = COALESCE(losses,0) + CASE WHEN opponent_sets > creator_sets THEN 0 ELSE 1 END,
    updated_at = now()
WHERE id = m.opponent_id
    RETURNING current_rank INTO opponent_new;

-- Ghi audit
INSERT INTO public.rank_events(profile_id, match_id, delta, old_score, new_score, reason)
VALUES
    (m.creator_id,  m.id, creator_delta,  creator_old,  creator_new,  CASE WHEN creator_sets > opponent_sets THEN 'win'  ELSE 'loss' END),
    (m.opponent_id, m.id, opponent_delta, opponent_old, opponent_new, CASE WHEN opponent_sets > creator_sets THEN 'win'  ELSE 'loss' END);

-- Lưu thông tin vào matches
UPDATE public.matches
SET status = 'completed',
    creator_rank_before  = creator_old,
    opponent_rank_before = opponent_old,
    creator_rank_after   = creator_new,
    opponent_rank_after  = opponent_new,
    points_gained_creator  = creator_delta,
    points_gained_opponent = opponent_delta,
    updated_at = now()
WHERE id = m.id;
END;
$$;

-- 6) HẾT HẠN XÁC NHẬN TRẬN (expire pending)
-- Dùng setting 'match_confirmation_hours' (mặc định 24h).
-- (Tuỳ chọn) hỗ trợ 'walkover_points' nếu bạn thêm vào admin_settings (mặc định 0).
CREATE OR REPLACE FUNCTION public.expire_stale_matches()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
ttl_hours INT := public.get_setting_int('match_confirmation_hours', 24);
  walkover  INT := public.get_setting_int('walkover_points', 0);
  rec RECORD;
  creator_old NUMERIC; creator_new NUMERIC;
BEGIN
FOR rec IN
SELECT id, creator_id, confirmation_deadline, created_at
FROM public.matches
WHERE status = 'pending'
  AND now() > COALESCE(confirmation_deadline, created_at + make_interval(hours => ttl_hours))
    LOOP
-- expire
UPDATE public.matches SET status = 'expired', updated_at = now()
WHERE id = rec.id;

-- walkover cho creator (nếu có cấu hình)
IF walkover > 0 THEN
SELECT current_rank INTO creator_old FROM public.profiles WHERE id = rec.creator_id FOR UPDATE;
UPDATE public.profiles
SET current_rank = COALESCE(current_rank,0) + walkover,
    updated_at = now()
WHERE id = rec.creator_id
    RETURNING current_rank INTO creator_new;

INSERT INTO public.rank_events(profile_id, match_id, delta, old_score, new_score, reason)
VALUES (rec.creator_id, rec.id, walkover, creator_old, creator_new, 'walkover');
END IF;
END LOOP;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $cron$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-matches-every-5m') THEN
    PERFORM cron.schedule(
      'expire-matches-every-5m',
      '*/5 * * * *',
      'select public.expire_stale_matches();'
    );
END IF;
END
$cron$ LANGUAGE plpgsql;
