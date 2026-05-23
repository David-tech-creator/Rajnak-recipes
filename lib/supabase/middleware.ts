import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isAllowedAdmin } from "@/lib/admin-allowlist"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const PUBLIC_PATHS = ["/login", "/auth/callback"]
const isPublic = (p: string) => PUBLIC_PATHS.some((x) => p === x || p.startsWith(x + "/"))

// Only allow same-origin relative paths so ?redirectTo=https://evil.com can't
// turn the login page into a phishing redirector.
function safeRedirect(raw: string | null): string {
  if (!raw) return "/"
  try {
    const decoded = decodeURIComponent(raw)
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded
  } catch {
    /* fall through */
  }
  return "/"
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  if (!url || !publishableKey) return supabaseResponse

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // IMPORTANT: do not run any logic between createServerClient and getUser.
  // A mistake here makes session refresh skip and users sign out at random.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Signed in but not on the family allowlist → kick them out.
  if (user && !isAllowedAdmin(user.email)) {
    await supabase.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = ""
    url.searchParams.set("error", "not-allowed")
    return NextResponse.redirect(url)
  }

  // Signed in and visiting /login → home (or redirectTo target).
  if (user && pathname === "/login") {
    const target = safeRedirect(request.nextUrl.searchParams.get("redirectTo"))
    const url = request.nextUrl.clone()
    url.pathname = target
    url.search = ""
    return NextResponse.redirect(url)
  }

  // Not signed in and not on a public path → bounce to /login with redirectTo.
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = ""
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
