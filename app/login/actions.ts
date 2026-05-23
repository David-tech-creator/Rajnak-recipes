"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function safeRedirect(raw: string | null | undefined): string {
  if (!raw) return "/"
  try {
    const decoded = decodeURIComponent(raw)
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded
  } catch {
    /* fall through */
  }
  return "/"
}

function loginUrl(error: string, redirectTo?: string): string {
  const params = new URLSearchParams({ error })
  if (redirectTo && redirectTo !== "/") params.set("redirectTo", redirectTo)
  return `/login?${params.toString()}`
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const redirectTo = safeRedirect(String(formData.get("redirectTo") ?? ""))

  if (!email || !password) {
    redirect(loginUrl("missing", redirectTo))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(loginUrl("invalid", redirectTo))
  }

  redirect(redirectTo)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
