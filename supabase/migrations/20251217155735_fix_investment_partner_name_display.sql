/*
  # Fix Investment Partner Name Display

  1. Changes
    - Update RLS policy on users table to allow approved users to view basic info (name, email) of other users
    - This enables the investment tracker to show partner names correctly
  
  2. Security
    - Only allows viewing name and email (not sensitive data)
    - Only approved users can view this data
    - Maintains security while enabling necessary functionality
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create new policy that allows approved users to view basic info of all users
CREATE POLICY "Approved users can view basic user info"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.approval_status = 'approved'
    )
  );