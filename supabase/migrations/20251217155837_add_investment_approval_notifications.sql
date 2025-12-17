/*
  # Add Investment Approval Notifications

  1. Changes
    - Create trigger to notify admin when new investments are submitted
    - Admin will receive notification for all pending investments
  
  2. Security
    - Function runs with security definer
    - Only creates notifications for pending investments
*/

-- Function to notify admin on new investment submission
CREATE OR REPLACE FUNCTION notify_admin_on_new_investment()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  admin_user_id uuid;
  partner_name text;
  submitter_name text;
BEGIN
  -- Only notify if the investment is pending approval
  IF NEW.status = 'pending' THEN
    -- Get the admin user ID (rattansaini111@gmail.com)
    SELECT id INTO admin_user_id
    FROM users
    WHERE email = 'rattansaini111@gmail.com' AND role = 'admin'
    LIMIT 1;
    
    -- Get partner name
    SELECT name INTO partner_name
    FROM users
    WHERE id = NEW.partner_id
    LIMIT 1;
    
    -- Get submitter name
    SELECT name INTO submitter_name
    FROM users
    WHERE id = NEW.submitted_by
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
        'New Investment Pending Approval',
        format('New investment of ₹%s for %s submitted by %s is waiting for approval', 
          NEW.amount::text, 
          COALESCE(partner_name, 'Unknown Partner'), 
          COALESCE(submitter_name, 'Unknown User')),
        'investment_approval',
        NEW.id,
        'investment'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_admin_on_new_investment ON investments;

-- Create trigger for new investment notifications
CREATE TRIGGER trigger_notify_admin_on_new_investment
  AFTER INSERT ON investments
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_new_investment();