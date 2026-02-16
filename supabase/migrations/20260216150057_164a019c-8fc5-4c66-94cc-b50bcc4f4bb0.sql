
-- Drop overly permissive policies
DROP POLICY "Users can upload partner logos" ON storage.objects;
DROP POLICY "Users can manage their partner assets" ON storage.objects;

-- Scoped INSERT: users can only upload to their own folder
CREATE POLICY "Users can upload partner logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'partner-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Scoped DELETE: users can only delete from their own folder
CREATE POLICY "Users can manage their partner assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'partner-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
