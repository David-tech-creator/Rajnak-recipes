import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

// Export a default client instance
export const supabase = createClient()

// Helper function to handle Supabase errors
export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    console.error("Supabase error details:", error)
    if (error.message.includes("Failed to fetch")) {
      return "Unable to connect to authentication service. Please check your internet connection and try again."
    }
    if (error.message.includes("JWT")) {
      return "Your session has expired. Please sign in again."
    }
    return error.message
  }
  return "An unexpected error occurred"
} 