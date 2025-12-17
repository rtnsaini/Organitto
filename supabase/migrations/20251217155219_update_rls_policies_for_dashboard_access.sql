/*
  # Update RLS Policies for Dashboard Access
  
  1. Changes
    - Update RLS policies to allow both admin and approved partners to view all data
    - Admins can see everything
    - Approved partners can see aggregated data for dashboard
  
  2. Security
    - Only authenticated and approved users can access data
    - Maintains data security while allowing proper dashboard functionality
*/

-- Drop and recreate investments SELECT policy to allow all approved users to view
DROP POLICY IF EXISTS "All authenticated users can view investments" ON investments;
CREATE POLICY "All authenticated users can view investments"
  ON investments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.approval_status = 'approved'
    )
  );

-- Drop and recreate expenses SELECT policy to allow all approved users to view
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "All authenticated users can view expenses" ON expenses;
CREATE POLICY "All authenticated users can view expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.approval_status = 'approved'
    )
  );

-- Drop and recreate products SELECT policy to allow all approved users to view
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "All authenticated users can view products" ON products;
CREATE POLICY "All authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.approval_status = 'approved'
    )
  );

-- Drop and recreate activity_log SELECT policy to allow all approved users to view
DROP POLICY IF EXISTS "Users can view own activity log" ON activity_log;
DROP POLICY IF EXISTS "All authenticated users can view activity_log" ON activity_log;
CREATE POLICY "All authenticated users can view activity_log"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.approval_status = 'approved'
    )
  );