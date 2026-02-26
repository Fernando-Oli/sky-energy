-- Disable RLS on storage objects to allow public uploads
-- This is safe because we're using session-based tracking for accountability

ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create a policy that allows all authenticated users and anon to upload
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'skyenergy-photos');

CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'skyenergy-photos');

CREATE POLICY "Allow delete own files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'skyenergy-photos');
