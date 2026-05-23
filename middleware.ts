import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const protectedPaths = ["/account", "/admin"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // If Supabase env vars are missing, skip auth checks rather than crashing
  // every request. The protected pages will surface their own missing-env
  // error in dev.
  if (!supabaseUrl || !supabaseAnonKey) {
    return res
  }

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
    data: { session },
  } = await supabase.auth.getSession()

  const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If already logged in and visiting /login, send back to where they came from
  // (or the home page).
  if (req.nextUrl.pathname === "/login" && session) {
    const redirectTo = req.nextUrl.searchParams.get("redirectTo")
    if (redirectTo) {
      return NextResponse.redirect(new URL(decodeURIComponent(redirectTo), req.url))
    }
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: ["/login", "/account/:path*", "/admin/:path*"],
}
