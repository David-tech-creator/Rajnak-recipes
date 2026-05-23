import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url) throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
if (!anonKey) throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")

// Browser-safe client used by the family photo gallery and auth flows.
export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Server-side client used only by API routes (e.g. init-family-photos).
// Uses the service-role key when available and falls back to the anon key
// so the build doesn't crash when the env var is missing.
export function createServerSupabaseClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? anonKey
  return createClient(url!, key, {
    auth: { persistSession: false },
  })
}
