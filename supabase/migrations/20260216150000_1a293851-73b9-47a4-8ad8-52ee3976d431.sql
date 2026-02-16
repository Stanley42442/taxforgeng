
-- Create storage bucket for partner logo uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-assets', 'partner-assets', true);

-- Allow authenticated users to upload partner logos
CREATE POLICY "Users can upload partner logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'partner-assets');

-- Allow public read access for logos (needed for embedded iframes)
CREATE POLICY "Public can view partner assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'partner-assets');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Users can manage their partner assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'partner-assets');
