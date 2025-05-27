import { createBrowserClient } from '@supabase/ssr'
import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = 'https://fbuwyojoibwjcugeuvnz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidXd5b2pvaWJ3amN1Z2V1dm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMzgwMjEsImV4cCI6MjA2MDcxNDAyMX0.6dCGTQOPGQ2wG5OeIOGpoHiKFbSjZ5Zm5Ksf5_4ugR4'

// Create a browser client
export const createClient = () => {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
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

// Create a server client
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // Handle cookies in read-only context during SSG
          }
        },
      },
    }
  )
}

// Export a default client instance
export const supabase = createClient() 