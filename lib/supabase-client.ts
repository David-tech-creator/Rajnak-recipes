import { createBrowserClient } from '@supabase/ssr'

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