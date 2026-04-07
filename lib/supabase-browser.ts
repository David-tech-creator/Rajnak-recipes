'use client'

import { createBrowserClient } from '@supabase/ssr'

// Create and export the browser client creator function
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true
      }
    }
  )
}

// Also export a default instance for convenience
export const supabase = createBrowserSupabaseClient() 