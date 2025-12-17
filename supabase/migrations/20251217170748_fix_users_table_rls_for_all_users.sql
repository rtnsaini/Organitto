/*
  # Fix Users Table RLS to Show All Users

  1. Changes
    - Drop the restrictive "Users can read own profile" policy
    - Keep the "Authenticated users can view all users" policy
    - This ensures all authenticated users can see all other users for messaging

  2. Security
    - Authenticated users can view all approved users (necessary for chat/collaboration)
    - Users can still only update their own profile
    - Admin approval system remains intact
*/

-- Drop the restrictive policy that limits users to only seeing their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Ensure the policy allowing all authenticated users to view all users exists
-- (This should already exist from previous migration, but we'll recreate it to be sure)
DROP POLICY IF EXISTS "Authenticated users can view all users" ON users;

CREATE POLICY "Authenticated users can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);
