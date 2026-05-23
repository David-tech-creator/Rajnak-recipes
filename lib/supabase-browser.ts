"use client"

import { createBrowserClient } from "@supabase/ssr"

function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  }
  return key
}

export function createBrowserSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, getPublishableKey(), {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

export const supabase = createBrowserSupabaseClient()
