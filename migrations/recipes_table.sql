-- Create recipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  prep_time TEXT,
  cook_time TEXT,
  servings INTEGER,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Anyone can view recipes'
  ) THEN
    ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Anyone can view recipes" 
      ON recipes 
      FOR SELECT 
      USING (true);
      
    CREATE POLICY "Authenticated users can insert recipes" 
      ON recipes 
      FOR INSERT 
      WITH CHECK (auth.role() = 'authenticated');
      
    CREATE POLICY "Users can update their own recipes" 
      ON recipes 
      FOR UPDATE 
      USING (auth.uid() = created_by);
      
    CREATE POLICY "Users can delete their own recipes" 
      ON recipes 
      FOR DELETE 
      USING (auth.uid() = created_by);
  END IF;
END
$$;

-- Create storage bucket for recipe images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recipes', 'recipes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for recipe images
CREATE POLICY "Anyone can view recipe images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipes');

CREATE POLICY "Authenticated users can upload recipe images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recipes' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own recipe images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'recipes' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own recipe images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recipes' AND auth.uid() = owner);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 