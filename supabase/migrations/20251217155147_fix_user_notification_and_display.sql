/*
  # Fix User Approval Notifications and Display

  1. Changes
    - Create a trigger to notify admin when new users sign up
    - Add function to automatically send notification to admin on new user registration
    - Notify admin (rattansaini111@gmail.com) whenever a new partner registers
  
  2. Security
    - Function runs with security definer to allow notification creation
    - Only triggers on INSERT to users table
*/

-- Function to notify admin on new user signup
CREATE OR REPLACE FUNCTION notify_admin_on_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Only notify if the new user is a partner and needs approval
  IF NEW.role = 'partner' AND NEW.approval_status = 'pending' THEN
    -- Get the admin user ID (rattansaini111@gmail.com)
    SELECT id INTO admin_user_id
    FROM users
    WHERE email = 'rattansaini111@gmail.com' AND role = 'admin'
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
      -- Create notification for admin
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        reference_id,
        reference_type
      ) VALUES (
        admin_user_id,
        'New User Registration',
        format('New user %s (%s) has registered and is waiting for approval', NEW.name, NEW.email),
        'user_approval',
        NEW.id,
        'user'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_admin_on_new_user ON users;

-- Create trigger for new user notifications
CREATE TRIGGER trigger_notify_admin_on_new_user
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_new_user();

-- Create index on notifications for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created 
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type 
  ON notifications(type, created_at DESC);