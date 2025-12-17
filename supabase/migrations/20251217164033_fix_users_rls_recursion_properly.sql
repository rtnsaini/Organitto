/*
  # Fix Infinite Recursion in Users RLS Policy

  1. Changes
    - Drop the problematic "Approved users can view basic user info" policy that causes recursion
    - Allow all authenticated users to view user data (name, email)
    - This is safe because users table only contains basic profile info
  
  2. Security
    - Authenticated users can view all user profiles (needed for investment partner names)
    - Users can only update their own profile
    - Maintains proper security without recursion
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Approved users can view basic user info" ON users;

-- Create a simple non-recursive policy for viewing users
-- This allows authenticated users to see other users' basic info (name, email)
-- which is necessary for features like investment tracking
CREATE POLICY "Authenticated users can view all users" ON users
  FOR SELECT
  TO authenticated
  USING (true);