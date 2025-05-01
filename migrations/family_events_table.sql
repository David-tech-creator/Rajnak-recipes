-- Create family_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.family_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'other',
  location TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cover_image TEXT
);

-- Add RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'family_events' AND policyname = 'Anyone can view events'
  ) THEN
    ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Anyone can view events" 
      ON family_events 
      FOR SELECT 
      USING (true);
      
    CREATE POLICY "Authenticated users can insert events" 
      ON family_events 
      FOR INSERT 
      WITH CHECK (auth.role() = 'authenticated');
      
    CREATE POLICY "Users can update their own events" 
      ON family_events 
      FOR UPDATE 
      USING (auth.uid() = created_by);
      
    CREATE POLICY "Users can delete their own events" 
      ON family_events 
      FOR DELETE 
      USING (auth.uid() = created_by);
  END IF;
END
$$;

-- Add event_id column to family_photos if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'family_photos' AND column_name = 'event_id'
  ) THEN
    ALTER TABLE family_photos 
    ADD COLUMN event_id UUID REFERENCES family_events(id) ON DELETE SET NULL;
  END IF;
END
$$;
