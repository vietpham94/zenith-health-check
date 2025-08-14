-- ===== ENUMS (bổ sung nếu chưa có) =====
do $$ begin
  if not exists (select 1 from pg_type where typname = 'team_side') then
create type team_side as enum ('A','B');
end if;
  if not exists (select 1 from pg_type where typname = 'post_status') then
create type post_status as enum ('draft','published');
end if;
end $$;

-- đảm bảo admin_settings có bản ghi id=1
insert into admin_settings(id)
values (1) on conflict (id) do nothing;

-- ===== TABLES còn thiếu =====
create table if not exists match_participants (
                                                  id uuid primary key default gen_random_uuid(),
    match_id uuid references matches(id) on delete cascade,
    team team_side not null,
    profile_id uuid references profiles(id) on delete cascade,
    is_creator boolean default false
    );
create unique index if not exists ux_match_participant on match_participants(match_id, team, profile_id);

create table if not exists match_sets (
                                          id bigserial primary key,
                                          match_id uuid references matches(id) on delete cascade,
    set_no smallint not null,
    score_a smallint not null default 0,
    score_b smallint not null default 0,
    unique(match_id, set_no)
    );

create table if not exists rank_events (
                                           id uuid primary key default gen_random_uuid(),
    profile_id uuid references profiles(id) on delete cascade,
    match_id uuid references matches(id) on delete set null,
    delta numeric(6,2) not null,
    old_score numeric(6,2),
    new_score numeric(6,2),
    reason text,
    created_at timestamptz default now()
    );

create table if not exists news_categories (
                                               id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null
    );

create table if not exists news_posts (
                                          id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text unique not null,
    summary text,
    content text,
    cover_image_url text,
    status post_status default 'draft',
    published_at timestamptz,
    author_profile_id uuid references profiles(id),
    category_id uuid references news_categories(id),
    highlight boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
    );

-- ===== TRIGGERS updated_at (tận dụng hàm bạn đã có) =====
drop trigger if exists trg_news_updated_at on news_posts;
create trigger trg_news_updated_at before update on news_posts
    for each row execute procedure public.update_updated_at_column();

drop trigger if exists trg_courts_updated_at on courts;
create trigger trg_courts_updated_at before update on courts
    for each row execute procedure public.update_updated_at_column();

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at before update on profiles
    for each row execute procedure public.update_updated_at_column();

-- ===== is_admin helper =====
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
select exists (select 1 from profiles p where p.id = uid and p.role = 'admin');
$$;

-- ===== handle_new_user: tạo profile + mã 12 số + init rank =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $$
declare s admin_settings; g gender;
begin
select * into s from admin_settings where id=1;
g := coalesce((new.raw_user_meta_data->>'gender')::gender, 'other');

insert into profiles(id, account_code, full_name, email, phone, gender, rank_score)
values (
           new.id,
           public.generate_account_code(), -- hàm của bạn
           coalesce(new.raw_user_meta_data->>'full_name',''),
           new.email,
           new.phone,
           g,
           case g when 'male' then s.init_rank_male
                  when 'female' then s.init_rank_female
                  else s.init_rank_other end
       )
    on conflict (id) do nothing;

return new;
end;
$$;

drop trigger if exists on_auth_user_added on auth.users;
create trigger on_auth_user_added
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ===== RLS enable =====
alter table if exists match_participants enable row level security;
alter table if exists match_sets         enable row level security;
alter table if exists rank_events        enable row level security;
alter table if exists news_categories    enable row level security;
alter table if exists news_posts         enable row level security;
-- (đã có) profiles, courts, matches, admin_settings: đảm bảo cũng enable RLS
alter table if exists profiles            enable row level security;
alter table if exists courts              enable row level security;
alter table if exists matches             enable row level security;
alter table if exists admin_settings      enable row level security;

-- ===== POLICIES =====
-- PROFILES
drop policy if exists profiles_read_all on profiles;
create policy profiles_read_all on profiles for select using (true);
drop policy if exists profiles_update_self_or_admin on profiles;
create policy profiles_update_self_or_admin on profiles
  for update using (auth.uid() = id or public.is_admin(auth.uid()));

-- COURTS
drop policy if exists courts_read_all on courts;
create policy courts_read_all on courts for select using (true);
drop policy if exists courts_admin_write on courts;
create policy courts_admin_write on courts for all using (public.is_admin(auth.uid()));

-- MATCHES
drop policy if exists matches_read_public on matches;
create policy matches_read_public on matches
  for select using (
                                  status = 'completed'
                                  or exists(select 1 from match_participants mp where mp.match_id = matches.id and mp.profile_id = auth.uid())
                                  or public.is_admin(auth.uid())
                                  );
drop policy if exists matches_insert_auth on matches;
create policy matches_insert_auth on matches
  for insert with check (auth.uid() is not null);
drop policy if exists matches_update_participant_or_admin on matches;
create policy matches_update_participant_or_admin on matches
  for update using (
                                  exists(select 1 from match_participants mp where mp.match_id = matches.id and mp.profile_id = auth.uid())
                                  or public.is_admin(auth.uid())
                                  );

-- PARTICIPANTS
drop policy if exists participants_read_participants on match_participants;
create policy participants_read_participants on match_participants
  for select using (
                      exists(select 1 from match_participants x where x.match_id = match_participants.match_id and x.profile_id = auth.uid())
                      or public.is_admin(auth.uid())
                      );
drop policy if exists participants_write_creator on match_participants;
create policy participants_write_creator on match_participants
  for all using (
    exists(select 1 from matches m where m.id = match_participants.match_id and m.created_by = auth.uid())
    or public.is_admin(auth.uid())
  );

-- SETS
drop policy if exists sets_rw_participants on match_sets;
create policy sets_rw_participants on match_sets
  for all using (
    exists(select 1 from match_participants mp where mp.match_id = match_sets.match_id and mp.profile_id = auth.uid())
    or public.is_admin(auth.uid())
  );

-- RANK EVENTS
drop policy if exists rank_events_read_self_or_admin on rank_events;
create policy rank_events_read_self_or_admin on rank_events
  for select using (profile_id = auth.uid() or public.is_admin(auth.uid()));

-- NEWS
drop policy if exists news_read_public on news_posts;
create policy news_read_public on news_posts
  for select using (status = 'published' or public.is_admin(auth.uid()));
drop policy if exists news_admin_write on news_posts;
create policy news_admin_write on news_posts
  for all using (public.is_admin(auth.uid()));
drop policy if exists cats_read_public on news_categories;
create policy cats_read_public on news_categories for select using (true);
drop policy if exists cats_admin_write on news_categories;
create policy cats_admin_write on news_categories for all using (public.is_admin(auth.uid()));

-- SETTINGS
drop policy if exists settings_read on admin_settings;
create policy settings_read on admin_settings for select using (true);
drop policy if exists settings_admin_write on admin_settings;
create policy settings_admin_write on admin_settings for all using (public.is_admin(auth.uid()));

-- ===== RPC: tính điểm =====
create or replace function public.apply_match_result(p_match_id uuid)
returns void language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
s admin_settings;
  pa uuid[] := '{}'; pb uuid[] := '{}';
  sets_a int; sets_b int; margin_sum int;
  k_win numeric(6,2); k_loss numeric(6,2);
  base_win int; base_loss int;
begin
select * into s from admin_settings where id=1;

select array_agg(profile_id) filter (where team='A'),
    array_agg(profile_id) filter (where team='B')
into pa, pb
from match_participants where match_id = p_match_id;

select sum(case when score_a>score_b then 1 else 0 end),
       sum(case when score_b>score_a then 1 else 0 end),
       sum(abs(score_a-score_b))
into sets_a, sets_b, margin_sum
from match_sets where match_id = p_match_id;

base_win := s.base_points_win; base_loss := s.base_points_loss;
  k_win := s.set_margin_win_factor; k_loss := s.set_margin_lose_factor;

  if coalesce(sets_a,0) > coalesce(sets_b,0) then
update profiles set rank_score = coalesce(rank_score,0) + base_win + (coalesce(margin_sum,0) * k_win)
where id = any(pa);
update profiles set rank_score = coalesce(rank_score,0) - base_loss - (coalesce(margin_sum,0) * k_loss)
where id = any(pb);
insert into rank_events(profile_id, match_id, delta, reason)
select unnest(pa), p_match_id, base_win + (coalesce(margin_sum,0)*k_win), 'win'
union all
select unnest(pb), p_match_id, -base_loss - (coalesce(margin_sum,0)*k_loss), 'loss';
else
update profiles set rank_score = coalesce(rank_score,0) + base_win + (coalesce(margin_sum,0) * k_win)
where id = any(pb);
update profiles set rank_score = coalesce(rank_score,0) - base_loss - (coalesce(margin_sum,0) * k_loss)
where id = any(pa);
insert into rank_events(profile_id, match_id, delta, reason)
select unnest(pb), p_match_id, base_win + (coalesce(margin_sum,0)*k_win), 'win'
union all
select unnest(pa), p_match_id, -base_loss - (coalesce(margin_sum,0)*k_loss), 'loss';
end if;

update matches set status='completed', completed_at=now() where id=p_match_id;
end;
$$;

-- ===== Hết TTL + Walkover =====
create or replace function public.expire_stale_matches()
returns void language plpgsql security definer
set search_path = public, pg_temp
as $$
declare s admin_settings; rec record;
begin
select * into s from admin_settings where id=1;
for rec in (
    select id, created_by from matches
     where status='pending' and expires_at is not null and now() > expires_at
  ) loop
update matches set status='expired' where id = rec.id;

if s.walkover_win_points > 0 then
update profiles set rank_score = coalesce(rank_score,0) + s.walkover_win_points
where id = rec.created_by;
insert into rank_events(profile_id, match_id, delta, reason)
values (rec.created_by, rec.id, s.walkover_win_points, 'walkover');
end if;
end loop;
end;
$$;

-- ===== CRON 5 phút/lần =====
create extension if not exists pg_cron;
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'expire-matches-every-5m') then
    perform cron.schedule('expire-matches-every-5m', '*/5 * * * *', $$select public.expire_stale_matches();$$);
end if;
end$$;
