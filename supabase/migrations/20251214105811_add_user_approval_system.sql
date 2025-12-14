/*
  # Add User Approval System

  1. Changes
    - Add approval_status column to users table (pending/approved/rejected)
    - Add approved_by column to track which admin approved
    - Add approved_at timestamp for approval date
    - Add rejection_reason text for rejection explanations
  
  2. Security
    - Default all new users to 'pending' status
    - Auto-approve first user (admin) and existing users
    - Users can read their own approval status
    - Only admins can update approval status
*/

-- Add approval columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN approved_by UUID REFERENCES users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- Auto-approve all existing users and admins
UPDATE users 
SET approval_status = 'approved', 
    approved_at = NOW() 
WHERE approval_status IS NULL OR approval_status = 'pending';

-- Drop existing policies for clean slate
DROP POLICY IF EXISTS "Users can update own approval status" ON users;
DROP POLICY IF EXISTS "Admins can update any user approval status" ON users;

-- Policy: Admins can update approval status of any user
CREATE POLICY "Admins can update user approval status"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users AS admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
    )
  );