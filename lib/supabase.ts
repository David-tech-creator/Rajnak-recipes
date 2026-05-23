import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url) throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
if (!publishableKey)
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)")

// Browser-safe client used by auth flows and the family photo gallery.
export const supabase: SupabaseClient = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Server-side client used only by API routes (e.g. init-family-photos).
// Falls back to the publishable key when the secret key is absent so the
// build does not crash; routes that require elevated privileges will fail
// loudly at request time instead.
export function createServerSupabaseClient(): SupabaseClient {
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? publishableKey
  return createClient(url!, secretKey!, {
    auth: { persistSession: false },
  })
}
