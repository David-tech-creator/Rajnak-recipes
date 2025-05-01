import { createClient } from "@supabase/supabase-js"

// Use the latest keys from your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ympkbokirbnndytnfvem.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcGtib2tpcmJubmR5dG5mdmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzMzNTcsImV4cCI6MjA2MDQwOTM1N30.FA9IEQ_PV6eegVap-RRAAZ2Zo0uyePJCskWov63BzK8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
