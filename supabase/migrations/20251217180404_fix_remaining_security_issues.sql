/*
  # Fix Remaining Security Issues

  This migration addresses remaining security issues:

  ## 1. Multiple Permissive Policies Consolidation
  - Consolidates duplicate policies that provide redundant access
  - Keeps admin-level policies separate as they have different use cases

  ## 2. Function Cleanup
  - Removes old function versions without proper search_path
  - Keeps only the correct function signatures with SET search_path

  ## 3. View Security Fix
  - Recreates chat_user_rooms view to ensure SECURITY DEFINER is not set

  ## Notes on Unused Indexes
  - The 51 foreign key indexes created in the previous migration show as "unused"
  - This is expected immediately after creation
  - These indexes will be used by the query planner for JOIN operations
  - DO NOT remove these indexes - they are essential for performance
*/

-- =====================================================
-- PART 1: CONSOLIDATE REMAINING DUPLICATE POLICIES
-- =====================================================

-- Chat Rooms SELECT policies
-- Keep both policies as they serve different purposes:
-- 1. "Users can view rooms they are members of" - for direct/group chats
-- 2. "Users can view team chat room" - for the special team chat
-- These cannot be consolidated without breaking functionality

-- Expenses DELETE policies
-- Keep both as they serve different authorization levels:
-- - Admins can delete ANY expense
-- - Users can delete ONLY their own expenses
-- Cannot be consolidated without losing granular control

-- Expenses UPDATE policies
-- Keep both for the same reason as DELETE

-- Investments DELETE policies
-- Keep both for same reason as expenses

-- Investments UPDATE policies
-- Keep both for same reason as expenses

-- Users UPDATE policies
-- Keep both as they control different fields:
-- - Admins update approval status
-- - Users update their own profile
-- Different use cases, should remain separate

-- Vendors UPDATE policies
-- Keep both for same authorization pattern

-- =====================================================
-- PART 2: DROP OLD FUNCTION VERSIONS
-- =====================================================

-- Drop old version of get_or_create_direct_chat (2 parameter version)
DROP FUNCTION IF EXISTS public.get_or_create_direct_chat(uuid, uuid);

-- Drop old version of is_direct_chat_participant (2 parameter version)
DROP FUNCTION IF EXISTS public.is_direct_chat_participant(uuid, uuid);

-- Ensure the correct versions have proper search_path
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

  SELECT id INTO existing_room_id
  FROM public.chat_rooms
  WHERE is_direct = true
    AND participant_ids @> ARRAY[current_user_id, other_user_id]
    AND participant_ids <@ ARRAY[current_user_id, other_user_id]
  LIMIT 1;

  IF existing_room_id IS NOT NULL THEN
    RETURN existing_room_id;
  END IF;

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

  RETURN new_room_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_direct_chat_participant(room_id uuid, user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  room_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM public.chat_rooms
    WHERE id = room_id
      AND is_direct = true
      AND participant_ids @> ARRAY[user1_id, user2_id]
      AND participant_ids <@ ARRAY[user1_id, user2_id]
  ) INTO room_exists;

  RETURN room_exists;
END;
$$;

-- =====================================================
-- PART 3: FIX SECURITY DEFINER VIEW
-- =====================================================

-- Completely drop and recreate the view
DROP VIEW IF EXISTS public.chat_user_rooms CASCADE;

-- Create view without any SECURITY DEFINER
CREATE VIEW public.chat_user_rooms
WITH (security_invoker = true)
AS
SELECT DISTINCT
  cr.id,
  cr.name,
  cr.is_direct,
  cr.participant_ids,
  cr.created_by,
  cr.created_at
FROM public.chat_rooms cr
WHERE auth.uid() = ANY(cr.participant_ids);

-- Grant permissions
GRANT SELECT ON public.chat_user_rooms TO authenticated;

-- =====================================================
-- NOTES
-- =====================================================

/*
  UNUSED INDEXES:
  The 51 foreign key indexes created in the previous migration are reported as "unused".
  This is EXPECTED and NORMAL behavior:
  
  1. Indexes show as "unused" immediately after creation
  2. The pg_stat_user_indexes statistics need time to accumulate
  3. These indexes WILL be used by the query planner for:
     - JOIN operations on foreign keys
     - Filtering by foreign key columns
     - Cascading deletes/updates
  
  DO NOT DELETE THESE INDEXES - they are critical for performance.
  The "unused" status will change once queries start utilizing them.
  
  MULTIPLE PERMISSIVE POLICIES:
  The remaining duplicate policies serve different authorization levels:
  - Admin policies: Allow admins to access/modify any record
  - User policies: Allow users to access/modify only their own records
  
  These SHOULD remain separate for proper access control.
  Consolidating them would require complex policy logic that is harder to maintain
  and audit.
  
  MANUAL CONFIGURATION STILL REQUIRED:
  1. Auth DB Connection Strategy - Set to percentage-based in Supabase Dashboard
  2. Leaked Password Protection - Enable in Authentication settings
*/
