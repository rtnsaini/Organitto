/*
  # Fix Security Definer Views and Exposed Auth Data

  ## Overview
  Addresses security concerns with views:
  1. Removes SECURITY DEFINER property from views to prevent privilege escalation
  2. Fixes team_chat_members view to use public.users instead of auth.users
  3. Ensures all views respect Row Level Security policies

  ## Changes

  ### 1. Fix team_chat_members View
  - Was exposing auth.users data (email, raw_user_meta_data)
  - Now uses public.users table which has proper RLS policies
  - Changed from SECURITY DEFINER to SECURITY INVOKER
  - Maps full_name from users.name instead of raw_user_meta_data

  ### 2. Remove SECURITY DEFINER from Other Views
  - chat_room_list: Changed to SECURITY INVOKER
  - license_summary: Changed to SECURITY INVOKER
  - ingredient_inventory_summary: Changed to SECURITY INVOKER

  ## Security Impact
  - Eliminates exposure of auth.users data to authenticated roles
  - Views now respect RLS policies properly
  - Prevents potential privilege escalation
  - Maintains same functionality for authorized users

  ## Notes
  - All views will now execute with the permissions of the calling user
  - RLS policies on underlying tables control data access
  - No data loss or functional changes for properly authorized users
*/

-- =====================================================
-- FIX TEAM_CHAT_MEMBERS VIEW
-- =====================================================

-- Drop the existing view that exposes auth.users
DROP VIEW IF EXISTS public.team_chat_members;

-- Recreate using public.users instead of auth.users
CREATE VIEW public.team_chat_members
WITH (security_invoker=true)
AS
SELECT 
  u.id,
  u.email,
  u.name AS full_name,
  u.role,
  crm.joined_at,
  crm.last_read_at,
  crm.is_muted
FROM public.users u
LEFT JOIN public.chat_room_members crm ON u.id = crm.user_id
WHERE crm.room_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY u.created_at;

-- =====================================================
-- RECREATE OTHER VIEWS WITHOUT SECURITY DEFINER
-- =====================================================

-- Recreate chat_room_list view
DROP VIEW IF EXISTS public.chat_room_list;

CREATE VIEW public.chat_room_list
WITH (security_invoker=true)
AS
SELECT 
  cr.id,
  cr.name,
  cr.description,
  cr.type,
  cr.product_id,
  cr.icon,
  cr.color,
  cr.created_by,
  cr.created_at,
  cr.archived,
  crm.user_id,
  crm.is_muted,
  crm.is_favorite,
  crm.last_read_message_id,
  crm.last_read_at,
  (SELECT COUNT(*) FROM chat_room_members WHERE chat_room_members.room_id = cr.id) AS member_count,
  (SELECT message_text FROM chat_messages WHERE room_id = cr.id AND is_deleted = false ORDER BY created_at DESC LIMIT 1) AS last_message,
  (SELECT created_at FROM chat_messages WHERE room_id = cr.id AND is_deleted = false ORDER BY created_at DESC LIMIT 1) AS last_message_time,
  (SELECT COUNT(*) 
   FROM chat_messages cm 
   WHERE cm.room_id = cr.id 
     AND cm.is_deleted = false 
     AND (crm.last_read_message_id IS NULL OR cm.created_at > crm.last_read_at)
     AND cm.sender_id != crm.user_id
  ) AS unread_count
FROM chat_rooms cr
LEFT JOIN chat_room_members crm ON cr.id = crm.room_id;

-- Recreate license_summary view
DROP VIEW IF EXISTS public.license_summary;

CREATE VIEW public.license_summary
WITH (security_invoker=true)
AS
SELECT 
  id,
  license_type,
  license_number,
  issued_to,
  issuing_authority,
  issue_date,
  expiry_date,
  renewal_reminder_days,
  status,
  document_url,
  CASE 
    WHEN expiry_date IS NULL THEN NULL
    ELSE (expiry_date - CURRENT_DATE)
  END AS days_until_expiry,
  CASE 
    WHEN expiry_date IS NULL THEN 'no_expiry'
    WHEN expiry_date < CURRENT_DATE THEN 'expired'
    WHEN expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'critical'
    WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
    WHEN expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'renewal_due'
    ELSE 'active'
  END AS expiry_status,
  (SELECT COUNT(*) FROM compliance_checklist cc WHERE cc.license_id = l.id) AS total_checklist_items,
  (SELECT COUNT(*) FROM compliance_checklist cc WHERE cc.license_id = l.id AND cc.completed = true) AS completed_checklist_items,
  (SELECT COUNT(*) FROM inspections i WHERE i.license_id = l.id) AS inspection_count,
  (SELECT MAX(inspection_date) FROM inspections i WHERE i.license_id = l.id) AS last_inspection_date
FROM licenses l;

-- Recreate ingredient_inventory_summary view
DROP VIEW IF EXISTS public.ingredient_inventory_summary;

CREATE VIEW public.ingredient_inventory_summary
WITH (security_invoker=true)
AS
SELECT 
  i.id AS ingredient_id,
  i.common_name,
  i.botanical_name,
  i.type,
  i.category,
  i.default_unit,
  i.reorder_level,
  i.preferred_vendor_id,
  i.image_url,
  COALESCE(SUM(CASE WHEN s.status = 'active' THEN s.quantity ELSE 0 END), 0) AS total_stock,
  MIN(CASE WHEN s.status = 'active' THEN s.expiry_date ELSE NULL END) AS earliest_expiry,
  MAX(CASE WHEN s.status = 'active' THEN s.expiry_date ELSE NULL END) AS latest_expiry,
  COUNT(CASE WHEN s.status = 'active' THEN 1 ELSE NULL END) AS active_lots,
  AVG(CASE WHEN s.status = 'active' THEN s.cost_per_unit ELSE NULL END) AS avg_cost_per_unit,
  MAX(s.purchase_date) AS last_purchase_date,
  CASE 
    WHEN MIN(CASE WHEN s.status = 'active' THEN s.expiry_date ELSE NULL END) < CURRENT_DATE THEN 'expired'
    WHEN MIN(CASE WHEN s.status = 'active' THEN s.expiry_date ELSE NULL END) <= CURRENT_DATE + INTERVAL '15 days' THEN 'expiring_soon'
    WHEN MIN(CASE WHEN s.status = 'active' THEN s.expiry_date ELSE NULL END) <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_30d'
    WHEN COALESCE(SUM(CASE WHEN s.status = 'active' THEN s.quantity ELSE 0 END), 0) = 0 THEN 'out_of_stock'
    WHEN COALESCE(SUM(CASE WHEN s.status = 'active' THEN s.quantity ELSE 0 END), 0) < i.reorder_level THEN 'low_stock'
    ELSE 'good_stock'
  END AS inventory_status
FROM ingredients i
LEFT JOIN ingredient_stock s ON i.id = s.ingredient_id
GROUP BY i.id, i.common_name, i.botanical_name, i.type, i.category, i.default_unit, i.reorder_level, i.preferred_vendor_id, i.image_url;