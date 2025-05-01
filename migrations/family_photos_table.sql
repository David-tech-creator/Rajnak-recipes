-- Create a table for family photos
CREATE TABLE IF NOT EXISTS family_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  caption TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  event_type TEXT NOT NULL DEFAULT 'other',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE family_photos ENABLE ROW LEVEL SECURITY;

-- Policy for viewing photos (anyone can view)
CREATE POLICY "Anyone can view photos" 
  ON family_photos 
  FOR SELECT 
  USING (true);

-- Policy for inserting photos (authenticated users only)
CREATE POLICY "Authenticated users can insert photos" 
  ON family_photos 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating photos (only the creator can update)
CREATE POLICY "Users can update their own photos" 
  ON family_photos 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Policy for deleting photos (only the creator can delete)
CREATE POLICY "Users can delete their own photos" 
  ON family_photos 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Create storage bucket for family photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family', 'family', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view family photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'family');

CREATE POLICY "Authenticated users can upload family photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'family' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own family photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'family' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own family photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'family' AND auth.uid() = owner);
