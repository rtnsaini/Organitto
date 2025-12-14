/*
  # Fix Database Performance Issues - Part 1: Indexes and Duplicates

  ## Overview
  Adds missing indexes on foreign key columns for optimal query performance
  and removes duplicate indexes.

  ## Changes

  ### 1. Add Missing Foreign Key Indexes
  Adds indexes on 14 foreign key columns that currently lack covering indexes:
  - batch_ingredients.vendor_id
  - chat_messages.reply_to_message_id
  - expenses.approved_by, submitted_by
  - ingredient_documents.stock_id
  - ingredient_stock.vendor_id
  - ingredient_usage.product_id, stock_id
  - ingredients.preferred_vendor_id
  - investments.approved_by, submitted_by
  - product_comments.parent_comment_id
  - users.approved_by
  - vendors.created_by

  ### 2. Remove Duplicate Indexes
  Drops idx_investments_partner_id (duplicate of investments_user_id_idx)

  ## Performance Impact
  - Significantly improves query performance on foreign key lookups
  - Reduces index maintenance overhead by removing duplicates
  - No data changes, only performance optimizations
*/

-- =====================================================
-- SECTION 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Add index on batch_ingredients.vendor_id
CREATE INDEX IF NOT EXISTS idx_batch_ingredients_vendor_id 
ON public.batch_ingredients(vendor_id);

-- Add index on chat_messages.reply_to_message_id
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_message_id 
ON public.chat_messages(reply_to_message_id);

-- Add index on expenses.approved_by
CREATE INDEX IF NOT EXISTS idx_expenses_approved_by 
ON public.expenses(approved_by);

-- Add index on expenses.submitted_by
CREATE INDEX IF NOT EXISTS idx_expenses_submitted_by 
ON public.expenses(submitted_by);

-- Add index on ingredient_documents.stock_id
CREATE INDEX IF NOT EXISTS idx_ingredient_documents_stock_id 
ON public.ingredient_documents(stock_id);

-- Add index on ingredient_stock.vendor_id
CREATE INDEX IF NOT EXISTS idx_ingredient_stock_vendor_id 
ON public.ingredient_stock(vendor_id);

-- Add index on ingredient_usage.product_id (avoiding name conflict)
CREATE INDEX IF NOT EXISTS idx_ingredient_usage_product_id_fk 
ON public.ingredient_usage(product_id);

-- Add index on ingredient_usage.stock_id (avoiding name conflict)
CREATE INDEX IF NOT EXISTS idx_ingredient_usage_stock_id_fk 
ON public.ingredient_usage(stock_id);

-- Add index on ingredients.preferred_vendor_id
CREATE INDEX IF NOT EXISTS idx_ingredients_preferred_vendor_id 
ON public.ingredients(preferred_vendor_id);

-- Add index on investments.approved_by
CREATE INDEX IF NOT EXISTS idx_investments_approved_by 
ON public.investments(approved_by);

-- Add index on investments.submitted_by
CREATE INDEX IF NOT EXISTS idx_investments_submitted_by 
ON public.investments(submitted_by);

-- Add index on product_comments.parent_comment_id
CREATE INDEX IF NOT EXISTS idx_product_comments_parent_comment_id 
ON public.product_comments(parent_comment_id);

-- Add index on users.approved_by
CREATE INDEX IF NOT EXISTS idx_users_approved_by 
ON public.users(approved_by);

-- Add index on vendors.created_by
CREATE INDEX IF NOT EXISTS idx_vendors_created_by 
ON public.vendors(created_by);

-- =====================================================
-- SECTION 2: REMOVE DUPLICATE INDEXES
-- =====================================================

-- Drop duplicate index (investments_user_id_idx is the primary, idx_investments_partner_id is duplicate)
DROP INDEX IF EXISTS public.idx_investments_partner_id;