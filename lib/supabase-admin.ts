import { createClient } from "@supabase/supabase-js"

// Use the latest service role key from your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ympkbokirbnndytnfvem.supabase.co"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcGtib2tpcmJubmR5dG5mdmVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDgzMzM1NywiZXhwIjoyMDYwNDA5MzU3fQ.N1-0nPy6kR401I8aCHPLaqtjXnAEfKf1nr2vZhGpVxc"

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})
