-- Create storage bucket for skyenergy photos
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'skyenergy-photos',
  'skyenergy-photos',
  true,
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy for bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'skyenergy-photos');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'skyenergy-photos');
