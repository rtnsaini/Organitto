/*
  # Fix Security and Performance Issues

  This migration addresses critical security and performance issues identified in the database audit:

  ## 1. Foreign Key Indexes
  - Adds missing indexes for all foreign key columns to improve query performance
  - Covers 52 unindexed foreign keys across multiple tables

  ## 2. Auth RLS Performance Optimization
  - Fixes policies that re-evaluate auth functions for each row
  - Wraps auth.uid() in SELECT statements for better performance

  ## 3. Unused Index Cleanup
  - Removes indexes that are not being used by the query planner

  ## 4. Multiple Permissive Policies Consolidation
  - Consolidates redundant policies where appropriate
  - Reduces policy evaluation overhead

  ## 5. Security Improvements
  - Fixes security definer views
  - Sets stable search paths for functions

  ## Performance Impact
  - Significantly improves query performance for JOIN operations
  - Reduces RLS policy evaluation overhead
  - Optimizes database connection usage
*/

-- =====================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Batch Activity Log
CREATE INDEX IF NOT EXISTS idx_batch_activity_log_batch_id ON public.batch_activity_log(batch_id);

-- Batch Dispatches
CREATE INDEX IF NOT EXISTS idx_batch_dispatches_batch_id ON public.batch_dispatches(batch_id);

-- Batch Ingredients
CREATE INDEX IF NOT EXISTS idx_batch_ingredients_batch_id ON public.batch_ingredients(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_ingredients_vendor_id ON public.batch_ingredients(vendor_id);

-- Batch Photos
CREATE INDEX IF NOT EXISTS idx_batch_photos_batch_id ON public.batch_photos(batch_id);

-- Batch Stock Adjustments
CREATE INDEX IF NOT EXISTS idx_batch_stock_adjustments_batch_id ON public.batch_stock_adjustments(batch_id);

-- Batch Tests
CREATE INDEX IF NOT EXISTS idx_batch_tests_batch_id ON public.batch_tests(batch_id);

-- Batches
CREATE INDEX IF NOT EXISTS idx_batches_product_id ON public.batches(product_id);

-- Chat Files
CREATE INDEX IF NOT EXISTS idx_chat_files_message_id ON public.chat_files(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_files_room_id ON public.chat_files(room_id);

-- Chat Messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_message_id ON public.chat_messages(reply_to_message_id);

-- Compliance Checklist
CREATE INDEX IF NOT EXISTS idx_compliance_checklist_license_id ON public.compliance_checklist(license_id);

-- Corrective Actions
CREATE INDEX IF NOT EXISTS idx_corrective_actions_inspection_id ON public.corrective_actions(inspection_id);

-- Expenses
CREATE INDEX IF NOT EXISTS idx_expenses_approved_by ON public.expenses(approved_by);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expenses_submitted_by ON public.expenses(submitted_by);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_id ON public.expenses(vendor_id);

-- Formula Versions
CREATE INDEX IF NOT EXISTS idx_formula_versions_product_id ON public.formula_versions(product_id);

-- Ingredient Documents
CREATE INDEX IF NOT EXISTS idx_ingredient_documents_ingredient_id ON public.ingredient_documents(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_documents_stock_id ON public.ingredient_documents(stock_id);

-- Ingredient Stock
CREATE INDEX IF NOT EXISTS idx_ingredient_stock_ingredient_id ON public.ingredient_stock(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_stock_vendor_id ON public.ingredient_stock(vendor_id);

-- Ingredient Usage
CREATE INDEX IF NOT EXISTS idx_ingredient_usage_batch_id ON public.ingredient_usage(batch_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_usage_ingredient_id ON public.ingredient_usage(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_usage_product_id ON public.ingredient_usage(product_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_usage_stock_id ON public.ingredient_usage(stock_id);

-- Ingredients
CREATE INDEX IF NOT EXISTS idx_ingredients_preferred_vendor_id ON public.ingredients(preferred_vendor_id);

-- Inspections
CREATE INDEX IF NOT EXISTS idx_inspections_license_id ON public.inspections(license_id);

-- Investments
CREATE INDEX IF NOT EXISTS idx_investments_approved_by ON public.investments(approved_by);
CREATE INDEX IF NOT EXISTS idx_investments_submitted_by ON public.investments(submitted_by);
CREATE INDEX IF NOT EXISTS idx_investments_partner_id ON public.investments(partner_id);

-- License Documents
CREATE INDEX IF NOT EXISTS idx_license_documents_license_id ON public.license_documents(license_id);

-- License Renewals
CREATE INDEX IF NOT EXISTS idx_license_renewals_license_id ON public.license_renewals(license_id);

-- Packaging Designs
CREATE INDEX IF NOT EXISTS idx_packaging_designs_product_id ON public.packaging_designs(product_id);

-- Product Comments
CREATE INDEX IF NOT EXISTS idx_product_comments_parent_comment_id ON public.product_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_product_id ON public.product_comments(product_id);

-- Product Cost Calculations
CREATE INDEX IF NOT EXISTS idx_product_cost_calculations_product_id ON public.product_cost_calculations(product_id);

-- Product Files
CREATE INDEX IF NOT EXISTS idx_product_files_product_id ON public.product_files(product_id);

-- Product Ingredients
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product_id ON public.product_ingredients(product_id);

-- Product Stage History
CREATE INDEX IF NOT EXISTS idx_product_stage_history_product_id ON public.product_stage_history(product_id);

-- Product Tasks
CREATE INDEX IF NOT EXISTS idx_product_tasks_product_id ON public.product_tasks(product_id);

-- Product Tests
CREATE INDEX IF NOT EXISTS idx_product_tests_product_id ON public.product_tests(product_id);

-- Sample Batches
CREATE INDEX IF NOT EXISTS idx_sample_batches_product_id ON public.sample_batches(product_id);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_approved_by ON public.users(approved_by);

-- Vendor Documents
CREATE INDEX IF NOT EXISTS idx_vendor_documents_vendor_id ON public.vendor_documents(vendor_id);

-- Vendor Invoices
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_vendor_id ON public.vendor_invoices(vendor_id);

-- Vendor Notes
CREATE INDEX IF NOT EXISTS idx_vendor_notes_vendor_id ON public.vendor_notes(vendor_id);

-- Vendor Prices
CREATE INDEX IF NOT EXISTS idx_vendor_prices_vendor_id ON public.vendor_prices(vendor_id);

-- Vendor Reviews
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON public.vendor_reviews(vendor_id);

-- Vendor Transactions
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_vendor_id ON public.vendor_transactions(vendor_id);

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_created_by ON public.vendors(created_by);

-- =====================================================
-- PART 2: REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.idx_notifications_type;
DROP INDEX IF EXISTS public.idx_chat_rooms_participant_ids;
DROP INDEX IF EXISTS public.idx_chat_rooms_is_direct;

-- =====================================================
-- PART 3: FIX AUTH RLS PERFORMANCE ISSUES
-- =====================================================

-- Fix activity_log policy
DROP POLICY IF EXISTS "All authenticated users can view activity_log" ON public.activity_log;
CREATE POLICY "All authenticated users can view activity_log"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Fix expenses policy
DROP POLICY IF EXISTS "All authenticated users can view expenses" ON public.expenses;
CREATE POLICY "All authenticated users can view expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Fix investments policy
DROP POLICY IF EXISTS "All authenticated users can view investments" ON public.investments;
CREATE POLICY "All authenticated users can view investments"
  ON public.investments FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Fix products policy
DROP POLICY IF EXISTS "All authenticated users can view products" ON public.products;
CREATE POLICY "All authenticated users can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Fix chat_rooms policies
DROP POLICY IF EXISTS "Room creators and admins can update rooms" ON public.chat_rooms;
CREATE POLICY "Room creators and admins can update rooms"
  ON public.chat_rooms FOR UPDATE
  TO authenticated
  USING (
    created_by = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can create group rooms" ON public.chat_rooms;
CREATE POLICY "Users can create group rooms"
  ON public.chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'group' AND
    created_by = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Users can view rooms they are members of" ON public.chat_rooms;
CREATE POLICY "Users can view rooms they are members of"
  ON public.chat_rooms FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = ANY(participant_ids)
  );

-- =====================================================
-- PART 4: CONSOLIDATE REDUNDANT POLICIES
-- =====================================================

-- Activity Log - Remove redundant policies
DROP POLICY IF EXISTS "Admins can read all activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users can read own activity" ON public.activity_log;

-- Expenses - Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can read all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can read own expenses" ON public.expenses;

-- Investments - Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can read all investments" ON public.investments;
DROP POLICY IF EXISTS "All users can view all investments" ON public.investments;
DROP POLICY IF EXISTS "Users can read own investments" ON public.investments;

-- Investments - Consolidate redundant INSERT policies
DROP POLICY IF EXISTS "Users can create own investments" ON public.investments;

-- Investments - Consolidate UPDATE policies
DROP POLICY IF EXISTS "Users can update own pending investments" ON public.investments;

-- Products - Remove redundant SELECT policy
DROP POLICY IF EXISTS "Users can view all products" ON public.products;

-- Chat Rooms - Remove conflicting INSERT policy
DROP POLICY IF EXISTS "Prevent room creation" ON public.chat_rooms;

-- =====================================================
-- PART 5: FIX SECURITY DEFINER VIEW
-- =====================================================

-- Drop and recreate chat_user_rooms view without SECURITY DEFINER
DROP VIEW IF EXISTS public.chat_user_rooms;

CREATE VIEW public.chat_user_rooms AS
SELECT DISTINCT
  cr.id,
  cr.name,
  cr.is_direct,
  cr.participant_ids,
  cr.created_by,
  cr.created_at
FROM public.chat_rooms cr
WHERE auth.uid() = ANY(cr.participant_ids);

-- Grant appropriate permissions
GRANT SELECT ON public.chat_user_rooms TO authenticated;

-- =====================================================
-- PART 6: FIX FUNCTION SEARCH PATH
-- =====================================================

-- Fix get_or_create_direct_chat function
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

-- Fix is_direct_chat_participant function
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
