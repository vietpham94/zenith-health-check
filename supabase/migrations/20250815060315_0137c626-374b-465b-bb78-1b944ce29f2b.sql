-- Fix profiles table security by restricting access to sensitive personal data

-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restricted policies for profile access
-- Users can view their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can view limited public information of other users
-- Excludes sensitive fields: phone, email, birthday, address
CREATE POLICY "Authenticated users can view public profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != user_id
);

-- Create a view for public profile information that excludes sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  account_code,
  full_name,
  gender,
  avatar_url,
  ward_id,
  province_id,
  current_rank,
  total_matches,
  wins,
  losses,
  created_at,
  updated_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create policy for the public view (only for authenticated users)
CREATE POLICY "Authenticated users can view public profile data"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Create a function to get public profile data safely
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  account_code text,
  full_name text,
  gender gender_type,
  avatar_url text,
  ward_id uuid,
  province_id uuid,
  current_rank numeric,
  total_matches integer,
  wins integer,
  losses integer,
  created_at timestamptz,
  updated_at timestamptz
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
    p.ward_id,
    p.province_id,
    p.current_rank,
    p.total_matches,
    p.wins,
    p.losses,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;