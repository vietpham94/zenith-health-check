-- Fix User Personal Information Exposure Security Issue
-- Remove the overly permissive policy that allows all authenticated users 
-- to view all profile data including sensitive personal information

-- Drop the insecure policy that exposes all users' personal data
DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;

-- Keep the secure policy "Users can view own profile only" which properly 
-- restricts users to only see their own profile data

-- Note: For public profile information (like leaderboards), use the 
-- get_public_profile_data() function which returns only non-sensitive data:
-- id, account_code, full_name, gender, avatar_url, current_rank, total_matches, wins, losses