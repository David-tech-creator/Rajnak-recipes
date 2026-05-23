import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Match everything except Next internals, static assets, and files with
  // an extension. Files with extensions (.jpg, .png, .woff2, etc.) skip the
  // middleware so images/fonts load without a session round-trip.
  matcher: ["/((?!_next/static|_next/image|.*\\.[^/]+$).*)"],
}
