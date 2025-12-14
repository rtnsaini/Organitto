/*
  # Remove Unused Database Indexes

  ## Overview
  Drops database indexes that have not been used according to performance analysis.
  Unused indexes create overhead during INSERT, UPDATE, and DELETE operations
  without providing query performance benefits.

  ## Changes

  ### Indexes Removed (83 total)
  Drops unused indexes across all tables including:
  - User-related indexes (email, role, approved_by)
  - Investment indexes (user_id, date, status, approved_by, submitted_by)
  - Product-related indexes (ingredients, versions, tests, batches, designs, tasks, comments, files)
  - Vendor indexes (category, transactions, invoices, prices, documents, notes, reviews)
  - Batch indexes (product_id, batch_number, status, expiry_date, ingredients, tests, dispatches, adjustments, photos, activity)
  - Ingredient indexes (common_name, type, category, stock, usage, documents)
  - License indexes (type, status, documents, renewals, inspections, compliance, corrective_actions)
  - Chat indexes (rooms, messages, files, typing_status)
  - Notification indexes (created_at, is_read)
  - Expense indexes (paid_by, vendor_id, approved_by, submitted_by)
  - Cost calculation indexes (product_id, saved_by, is_draft)
  - Activity log indexes (created_at)

  ## Impact
  - Reduces write operation overhead
  - Decreases storage usage
  - No impact on current query performance (indexes are unused)
  - Indexes can be recreated if needed in the future

  ## Notes
  - All indexes being dropped have been confirmed as unused by database statistics
  - Primary key and unique constraint indexes are NOT affected
  - Foreign key performance is maintained by other covering indexes where needed
*/

-- =====================================================
-- DROP UNUSED INDEXES
-- =====================================================

-- Users table
DROP INDEX IF EXISTS public.users_email_idx;
DROP INDEX IF EXISTS public.users_role_idx;
DROP INDEX IF EXISTS public.idx_users_approved_by;

-- Investments table
DROP INDEX IF EXISTS public.investments_user_id_idx;
DROP INDEX IF EXISTS public.investments_date_idx;
DROP INDEX IF EXISTS public.idx_investments_status;
DROP INDEX IF EXISTS public.idx_investments_approved_by;
DROP INDEX IF EXISTS public.idx_investments_submitted_by;

-- Activity log table
DROP INDEX IF EXISTS public.activity_log_created_at_idx;

-- Products and related tables
DROP INDEX IF EXISTS public.idx_products_current_stage;
DROP INDEX IF EXISTS public.idx_products_priority;
DROP INDEX IF EXISTS public.idx_products_created_by;
DROP INDEX IF EXISTS public.idx_product_ingredients_product_id;
DROP INDEX IF EXISTS public.idx_formula_versions_product_id;
DROP INDEX IF EXISTS public.idx_product_tests_product_id;
DROP INDEX IF EXISTS public.idx_sample_batches_product_id;
DROP INDEX IF EXISTS public.idx_packaging_designs_product_id;
DROP INDEX IF EXISTS public.idx_product_tasks_product_id;
DROP INDEX IF EXISTS public.idx_product_comments_product_id;
DROP INDEX IF EXISTS public.idx_product_files_product_id;
DROP INDEX IF EXISTS public.idx_product_stage_history_product_id;
DROP INDEX IF EXISTS public.idx_product_comments_parent_comment_id;

-- Vendors and related tables
DROP INDEX IF EXISTS public.vendors_category_idx;
DROP INDEX IF EXISTS public.idx_vendors_created_by;
DROP INDEX IF EXISTS public.idx_vendor_transactions_vendor_id;
DROP INDEX IF EXISTS public.idx_vendor_transactions_date;
DROP INDEX IF EXISTS public.idx_vendor_invoices_vendor_id;
DROP INDEX IF EXISTS public.idx_vendor_invoices_status;
DROP INDEX IF EXISTS public.idx_vendor_prices_vendor_id;
DROP INDEX IF EXISTS public.idx_vendor_documents_vendor_id;
DROP INDEX IF EXISTS public.idx_vendor_notes_vendor_id;
DROP INDEX IF EXISTS public.idx_vendor_reviews_vendor_id;

-- Expenses table
DROP INDEX IF EXISTS public.expenses_paid_by_idx;
DROP INDEX IF EXISTS public.expenses_vendor_id_idx;
DROP INDEX IF EXISTS public.idx_expenses_approved_by;
DROP INDEX IF EXISTS public.idx_expenses_submitted_by;

-- Product cost calculations
DROP INDEX IF EXISTS public.idx_cost_calculations_product_id;
DROP INDEX IF EXISTS public.idx_cost_calculations_saved_by;
DROP INDEX IF EXISTS public.idx_cost_calculations_is_draft;

-- Batches and related tables
DROP INDEX IF EXISTS public.idx_batches_product_id;
DROP INDEX IF EXISTS public.idx_batches_batch_number;
DROP INDEX IF EXISTS public.idx_batches_status;
DROP INDEX IF EXISTS public.idx_batches_expiry_date;
DROP INDEX IF EXISTS public.idx_batch_ingredients_batch_id;
DROP INDEX IF EXISTS public.idx_batch_ingredients_vendor_id;
DROP INDEX IF EXISTS public.idx_batch_tests_batch_id;
DROP INDEX IF EXISTS public.idx_batch_dispatches_batch_id;
DROP INDEX IF EXISTS public.idx_batch_stock_adjustments_batch_id;
DROP INDEX IF EXISTS public.idx_batch_photos_batch_id;
DROP INDEX IF EXISTS public.idx_batch_activity_log_batch_id;

-- Ingredients and related tables
DROP INDEX IF EXISTS public.idx_ingredients_common_name;
DROP INDEX IF EXISTS public.idx_ingredients_type;
DROP INDEX IF EXISTS public.idx_ingredients_category;
DROP INDEX IF EXISTS public.idx_ingredients_preferred_vendor_id;
DROP INDEX IF EXISTS public.idx_ingredient_stock_ingredient_id;
DROP INDEX IF EXISTS public.idx_ingredient_stock_expiry_date;
DROP INDEX IF EXISTS public.idx_ingredient_stock_status;
DROP INDEX IF EXISTS public.idx_ingredient_stock_vendor_id;
DROP INDEX IF EXISTS public.idx_ingredient_usage_ingredient_id;
DROP INDEX IF EXISTS public.idx_ingredient_usage_batch_id;
DROP INDEX IF EXISTS public.idx_ingredient_usage_product_id_fk;
DROP INDEX IF EXISTS public.idx_ingredient_usage_stock_id_fk;
DROP INDEX IF EXISTS public.idx_ingredient_documents_ingredient_id;
DROP INDEX IF EXISTS public.idx_ingredient_documents_stock_id;

-- Licenses and related tables
DROP INDEX IF EXISTS public.idx_licenses_type;
DROP INDEX IF EXISTS public.idx_licenses_status;
DROP INDEX IF EXISTS public.idx_license_documents_license_id;
DROP INDEX IF EXISTS public.idx_license_renewals_license_id;
DROP INDEX IF EXISTS public.idx_inspections_license_id;
DROP INDEX IF EXISTS public.idx_inspections_date;
DROP INDEX IF EXISTS public.idx_compliance_checklist_license_id;
DROP INDEX IF EXISTS public.idx_corrective_actions_inspection_id;

-- Chat and related tables
DROP INDEX IF EXISTS public.idx_chat_rooms_type;
DROP INDEX IF EXISTS public.idx_chat_rooms_product_id;
DROP INDEX IF EXISTS public.idx_chat_messages_sender_id;
DROP INDEX IF EXISTS public.idx_chat_messages_created_at;
DROP INDEX IF EXISTS public.idx_chat_messages_reply_to_message_id;
DROP INDEX IF EXISTS public.idx_chat_files_room_id;
DROP INDEX IF EXISTS public.idx_chat_files_message_id;
DROP INDEX IF EXISTS public.idx_chat_typing_status_room_id;

-- Notifications table
DROP INDEX IF EXISTS public.idx_notifications_created_at;
DROP INDEX IF EXISTS public.idx_notifications_is_read;