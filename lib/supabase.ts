import { createBrowserClient } from "@supabase/ssr"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url) throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
if (!publishableKey)
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)")

// Browser client that stores the session in cookies (not localStorage) so
// the Next.js middleware can read it on every request.
export const supabase = createBrowserClient(url, publishableKey)
