/*
  # Simplify to Single Team Chat

  1. Changes
    - Creates a single "Team Chat" room for all partners
    - Auto-adds all existing users to this room
    - Creates trigger to auto-add new users when they register
    - Removes multiple room creation ability
    - All partners can see and chat with each other

  2. New Features
    - Function to ensure all users are in the team chat
    - Trigger to auto-add new users
    - Single unified communication channel
*/

-- Drop old default rooms function if exists
DROP FUNCTION IF EXISTS create_default_chat_rooms();

-- Create the main team chat room (delete old ones and create new)
DO $$
DECLARE
  v_room_id uuid;
BEGIN
  -- Archive all existing rooms
  UPDATE chat_rooms SET archived = true, archived_at = now();
  
  -- Delete all existing room memberships
  DELETE FROM chat_room_members;
  
  -- Create the single Team Chat room
  INSERT INTO chat_rooms (id, name, description, type, icon, color, archived)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Team Chat',
    'Common chat for all partners',
    'general',
    '👥',
    '#8B7355',
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET archived = false, 
      name = 'Team Chat',
      description = 'Common chat for all partners',
      type = 'general',
      icon = '👥',
      color = '#8B7355';
  
  v_room_id := '00000000-0000-0000-0000-000000000001';
  
  -- Add all existing users to this room
  INSERT INTO chat_room_members (room_id, user_id, role, joined_at)
  SELECT 
    v_room_id,
    id,
    'member',
    now()
  FROM auth.users
  ON CONFLICT (room_id, user_id) DO NOTHING;
END $$;

-- Function to add user to team chat on registration
CREATE OR REPLACE FUNCTION add_user_to_team_chat()
RETURNS TRIGGER AS $$
BEGIN
  -- Add new user to the team chat room
  INSERT INTO chat_room_members (room_id, user_id, role, joined_at)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    NEW.id,
    'member',
    now()
  )
  ON CONFLICT (room_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-adding users to team chat
DROP TRIGGER IF EXISTS on_auth_user_created_add_to_chat ON auth.users;
CREATE TRIGGER on_auth_user_created_add_to_chat
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION add_user_to_team_chat();

-- Update RLS policies to allow viewing the single team room
DROP POLICY IF EXISTS "Users can create rooms" ON chat_rooms;
CREATE POLICY "Users can view team chat room"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (id = '00000000-0000-0000-0000-000000000001');

-- Prevent creating new rooms
CREATE POLICY "Prevent room creation"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Create view to get all team members with their details
CREATE OR REPLACE VIEW team_chat_members AS
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'role' as role,
  crm.joined_at,
  crm.last_read_at,
  crm.is_muted
FROM auth.users u
LEFT JOIN chat_room_members crm ON u.id = crm.user_id 
WHERE crm.room_id = '00000000-0000-0000-0000-000000000001'
ORDER BY u.created_at;
