-- Fix security issues detected by the linter

-- Update the function to have proper search_path
CREATE OR REPLACE FUNCTION public.get_public_profile_data(profile_id uuid)
RETURNS TABLE (
  id uuid,
  account_code text,
  full_name text,
  gender gender_type,
  avatar_url text,
  current_rank numeric,
  total_matches integer,
  wins integer,
  losses integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT 
    p.id,
    p.account_code,
    p.full_name,
    p.gender,
    p.avatar_url,
    p.current_rank,
    p.total_matches,
    p.wins,
    p.losses
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;