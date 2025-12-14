/*
  # Add Admin Expense Update Policy

  1. Changes
    - Adds policy for admins to update any expense
    - Allows admin users with role='admin' to update all expenses regardless of who created them

  2. Security
    - Policy checks user role from users table
    - Only users with role='admin' can update expenses
    - Applies to UPDATE operations on expenses table
*/

-- Create policy for admins to update any expense
CREATE POLICY "Admins can update any expense"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policy for admins to delete any expense  
CREATE POLICY "Admins can delete any expense"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
