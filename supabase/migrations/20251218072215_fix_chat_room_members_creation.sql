/*
  # Fix Chat Room Members Creation

  ## Issue
  The get_or_create_direct_chat function creates direct chat rooms but doesn't add
  users as members to the chat_room_members table. This prevents users from sending
  messages because the RLS policy requires membership.

  ## Changes
  1. Update get_or_create_direct_chat function to:
    - Check for existing membership when finding existing chat
    - Always ensure both users are added as members
    - Handle the case where room exists but members don't
  
  ## Security
  - Function remains SECURITY DEFINER with proper search_path
  - Only creates memberships for the authenticated user and the specified other user
*/

-- Drop and recreate the function with member creation
DROP FUNCTION IF EXISTS public.get_or_create_direct_chat(uuid);

CREATE OR REPLACE FUNCTION public.get_or_create_direct_chat(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid;
  existing_room_id uuid;
  new_room_id uuid;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF current_user_id = other_user_id THEN
    RAISE EXCEPTION 'Cannot create chat with yourself';
  END IF;

  -- Try to find existing direct chat
  SELECT id INTO existing_room_id
  FROM public.chat_rooms
  WHERE is_direct = true
    AND participant_ids @> ARRAY[current_user_id, other_user_id]
    AND participant_ids <@ ARRAY[current_user_id, other_user_id]
  LIMIT 1;

  -- If room exists, ensure both users are members
  IF existing_room_id IS NOT NULL THEN
    -- Add current user as member if not already
    INSERT INTO public.chat_room_members (room_id, user_id, role)
    VALUES (existing_room_id, current_user_id, 'member')
    ON CONFLICT (room_id, user_id) DO NOTHING;
    
    -- Add other user as member if not already
    INSERT INTO public.chat_room_members (room_id, user_id, role)
    VALUES (existing_room_id, other_user_id, 'member')
    ON CONFLICT (room_id, user_id) DO NOTHING;
    
    RETURN existing_room_id;
  END IF;

  -- Create new direct chat
  INSERT INTO public.chat_rooms (
    name,
    type,
    is_direct,
    participant_ids,
    created_by
  ) VALUES (
    '',
    'direct',
    true,
    ARRAY[current_user_id, other_user_id],
    current_user_id
  )
  RETURNING id INTO new_room_id;

  -- Add both users as members
  INSERT INTO public.chat_room_members (room_id, user_id, role)
  VALUES 
    (new_room_id, current_user_id, 'member'),
    (new_room_id, other_user_id, 'member');

  RETURN new_room_id;
END;
$$;
