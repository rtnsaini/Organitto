/*
  # Enhance Chat System for Direct and Group Chats

  ## Changes
  1. Update chat_rooms table
    - Modify type constraint to include 'direct' and 'group' types
    - Add is_direct boolean field for easy filtering
    - Add participant_ids array for direct chat lookups
  
  2. Create helper view
    - chat_user_rooms: View to show all rooms for each user with unread counts
  
  3. Create functions
    - create_direct_chat: Function to create or find direct chat between two users
    - get_or_create_direct_chat: Function to get existing or create new direct chat
  
  4. Security
    - Update RLS policies for new room types
*/

-- Drop existing type constraint if exists
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_type_check;

-- Add new fields to chat_rooms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_rooms' AND column_name = 'is_direct'
  ) THEN
    ALTER TABLE chat_rooms ADD COLUMN is_direct boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_rooms' AND column_name = 'participant_ids'
  ) THEN
    ALTER TABLE chat_rooms ADD COLUMN participant_ids uuid[] DEFAULT ARRAY[]::uuid[];
  END IF;
END $$;

-- Add check constraint for room type
ALTER TABLE chat_rooms ADD CONSTRAINT chat_rooms_type_check 
  CHECK (type IN ('direct', 'group', 'team', 'general', 'product'));

-- Create index for fast direct chat lookups
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participant_ids 
  ON chat_rooms USING GIN (participant_ids);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_direct 
  ON chat_rooms (is_direct) WHERE is_direct = true;

-- Function to create or get direct chat between two users
CREATE OR REPLACE FUNCTION get_or_create_direct_chat(
  user1_id uuid,
  user2_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  room_id uuid;
  sorted_ids uuid[];
BEGIN
  -- Sort user IDs for consistent ordering
  sorted_ids := ARRAY[LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id)];
  
  -- Try to find existing direct chat
  SELECT id INTO room_id
  FROM chat_rooms
  WHERE is_direct = true
    AND participant_ids = sorted_ids
    AND archived = false
  LIMIT 1;
  
  -- If not found, create new direct chat
  IF room_id IS NULL THEN
    INSERT INTO chat_rooms (
      name,
      type,
      is_direct,
      participant_ids,
      created_by,
      icon
    ) VALUES (
      'Direct Chat',
      'direct',
      true,
      sorted_ids,
      user1_id,
      '💬'
    )
    RETURNING id INTO room_id;
    
    -- Add both users as members
    INSERT INTO chat_room_members (room_id, user_id, role)
    VALUES 
      (room_id, user1_id, 'member'),
      (room_id, user2_id, 'member');
  END IF;
  
  RETURN room_id;
END;
$$;

-- Create view for user's chat rooms with metadata
CREATE OR REPLACE VIEW chat_user_rooms AS
SELECT 
  crm.user_id,
  cr.id AS room_id,
  cr.name,
  cr.description,
  cr.type,
  cr.is_direct,
  cr.participant_ids,
  cr.icon,
  cr.color,
  cr.archived,
  cr.created_at,
  cr.created_by,
  crm.role AS user_role,
  crm.is_muted,
  crm.is_favorite,
  crm.last_read_at,
  (
    SELECT COUNT(*)
    FROM chat_messages cm
    WHERE cm.room_id = cr.id
      AND cm.created_at > COALESCE(crm.last_read_at, '1970-01-01'::timestamptz)
      AND cm.sender_id != crm.user_id
      AND cm.is_deleted = false
  ) AS unread_count,
  (
    SELECT cm.message_text
    FROM chat_messages cm
    WHERE cm.room_id = cr.id
      AND cm.is_deleted = false
    ORDER BY cm.created_at DESC
    LIMIT 1
  ) AS last_message_text,
  (
    SELECT cm.created_at
    FROM chat_messages cm
    WHERE cm.room_id = cr.id
      AND cm.is_deleted = false
    ORDER BY cm.created_at DESC
    LIMIT 1
  ) AS last_message_at,
  (
    SELECT cm.sender_id
    FROM chat_messages cm
    WHERE cm.room_id = cr.id
      AND cm.is_deleted = false
    ORDER BY cm.created_at DESC
    LIMIT 1
  ) AS last_message_sender_id
FROM chat_room_members crm
JOIN chat_rooms cr ON cr.id = crm.room_id
WHERE cr.archived = false;

-- Grant access to the view
GRANT SELECT ON chat_user_rooms TO authenticated;

-- Update RLS policies for chat_rooms to handle direct chats
DROP POLICY IF EXISTS "Users can view rooms they are members of" ON chat_rooms;
CREATE POLICY "Users can view rooms they are members of"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT room_id FROM chat_room_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create group rooms" ON chat_rooms;
CREATE POLICY "Users can create group rooms"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Room creators and admins can update rooms" ON chat_rooms;
CREATE POLICY "Room creators and admins can update rooms"
  ON chat_rooms FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE room_id = chat_rooms.id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- Add policy for the helper function
CREATE OR REPLACE FUNCTION is_direct_chat_participant(room_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_uuid = ANY(participant_ids)
  FROM chat_rooms
  WHERE id = room_uuid AND is_direct = true;
$$;
