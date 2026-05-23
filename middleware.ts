import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isAllowedAdmin } from "@/lib/admin-allowlist"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Paths that must remain public so users can actually sign in / reset.
const PUBLIC_PATHS = ["/login", "/auth/callback"]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Without Supabase env vars there's no way to verify a session — let
  // requests through (dev-only fallback). Production has the vars set.
  if (!supabaseUrl || !supabaseAnonKey) return res

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Logged in but not on the allowlist → sign out + bounce.
  if (user && !isAllowedAdmin(user.email)) {
    await supabase.auth.signOut()
    const url = new URL("/login", req.url)
    url.searchParams.set("error", "not-allowed")
    return NextResponse.redirect(url)
  }

  // 2. Already logged in and visiting /login → send to home (or the
  //    redirectTo target).
  if (user && pathname === "/login") {
    const redirectTo = req.nextUrl.searchParams.get("redirectTo")
    return NextResponse.redirect(new URL(redirectTo ? decodeURIComponent(redirectTo) : "/", req.url))
  }

  // 3. Public auth pages always pass through.
  if (isPublic(pathname)) return res

  // 4. Everything else requires a signed-in family member.
  if (!user) {
    const url = new URL("/login", req.url)
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  // Match everything except Next internals, static assets, and the
  // OG / favicon files. Files with an extension (.jpg, .png, .svg,
  // .woff2, etc.) are skipped so the photo gallery and images keep
  // working for authenticated browsers without needing a session
  // round-trip on each one.
  matcher: ["/((?!_next/static|_next/image|.*\\.[^/]+$).*)"],
}
