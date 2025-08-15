-- Fix Security Definer View issue
-- Drop the problematic public_profiles view that bypasses RLS
DROP VIEW IF EXISTS public.public_profiles;

-- The public_profiles view was exposing all profile data without proper RLS enforcement
-- Instead, we'll rely on the existing get_public_profile_data function which properly 
-- enforces security and only returns limited public information

-- Note: Any code using the public_profiles view should be updated to use 
-- the get_public_profile_data function instead, which returns:
-- id, account_code, full_name, gender, avatar_url, current_rank, total_matches, wins, losses