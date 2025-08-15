-- Fix profiles table security by updating existing policies

-- Drop all existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profile info" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view other profiles via view" ON public.profiles;

-- Create a single restrictive policy: users can only view their own complete profile
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create a security definer function to get public profile data safely
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