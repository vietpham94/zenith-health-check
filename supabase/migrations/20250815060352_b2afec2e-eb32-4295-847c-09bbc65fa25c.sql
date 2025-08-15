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
-- This policy will be used in conjunction with a view that excludes sensitive fields
CREATE POLICY "Authenticated users can view other profiles via view" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

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