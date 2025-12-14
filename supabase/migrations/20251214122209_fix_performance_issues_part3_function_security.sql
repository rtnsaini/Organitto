/*
  # Fix Database Performance Issues - Part 3: Secure Function Search Paths

  ## Overview
  Sets secure search_path on all functions to prevent SQL injection vulnerabilities
  and ensure functions only access intended schemas.

  ## Changes

  ### Function Search Path Security
  Updates 16 functions to use secure search_path = public, pg_temp:
  - update_products_updated_at
  - update_product_comments_updated_at
  - update_cost_calculations_updated_at
  - update_vendor_tables_updated_at
  - update_vendor_rating
  - update_batches_updated_at
  - log_batch_activity
  - update_batch_stock_on_dispatch
  - update_batch_stock_on_adjustment
  - update_ingredients_updated_at
  - update_stock_status_on_expiry
  - update_ingredient_stock_on_usage
  - update_licenses_updated_at
  - update_license_status_on_expiry
  - update_user_chat_settings_updated_at
  - add_user_to_team_chat

  ## Security Impact
  - Prevents SQL injection via search_path manipulation
  - Ensures functions only access public schema objects
  - pg_temp allows temporary tables if needed
  - No functional changes, only security hardening
*/

-- =====================================================
-- SET SECURE SEARCH PATHS ON ALL FUNCTIONS
-- =====================================================

-- Product-related functions
ALTER FUNCTION public.update_products_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_product_comments_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_cost_calculations_updated_at() 
SET search_path = public, pg_temp;

-- Vendor-related functions
ALTER FUNCTION public.update_vendor_tables_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_vendor_rating() 
SET search_path = public, pg_temp;

-- Batch-related functions
ALTER FUNCTION public.update_batches_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.log_batch_activity() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_batch_stock_on_dispatch() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_batch_stock_on_adjustment() 
SET search_path = public, pg_temp;

-- Ingredient-related functions
ALTER FUNCTION public.update_ingredients_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_stock_status_on_expiry() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_ingredient_stock_on_usage() 
SET search_path = public, pg_temp;

-- License-related functions
ALTER FUNCTION public.update_licenses_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_license_status_on_expiry() 
SET search_path = public, pg_temp;

-- Chat-related functions
ALTER FUNCTION public.update_user_chat_settings_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.add_user_to_team_chat() 
SET search_path = public, pg_temp;