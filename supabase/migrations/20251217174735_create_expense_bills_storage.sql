/*
  # Create Storage Bucket for Expense Bills and Receipts

  1. Storage Setup
    - Creates 'expense-bills' storage bucket
    - Sets bucket to public for easy access to bills
    - Configures file size limits and allowed file types
  
  2. Security Policies
    - Authenticated users can upload bills
    - Authenticated users can view all bills
    - Admins can delete bills
    - Each user uploads to their own folder (user_id/)
  
  3. Notes
    - Files are organized by user_id/filename
    - Maximum file size: 5MB
    - Allowed types: images (JPG, PNG) and PDFs
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'expense-bills',
  'expense-bills',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

CREATE POLICY "Authenticated users can upload bills"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'expense-bills' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can view all bills"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'expense-bills');

CREATE POLICY "Users can update their own bills"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'expense-bills' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'expense-bills' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own bills"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'expense-bills' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can delete any bill"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'expense-bills' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );