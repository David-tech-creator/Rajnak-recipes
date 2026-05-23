import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { deleteFile } from "@/lib/github"

export const runtime = "nodejs"

async function getUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !publishableKey) return null

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        /* no-op */
      },
    },
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function DELETE(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { slug } = await ctx.params
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  try {
    await deleteFile({
      path: `content/recipes/${slug}.mdx`,
      message: `Remove recipe: ${slug}\n\nDeleted via the family admin by ${user.email}.`,
      author: { name: user.email ?? "Family admin", email: user.email ?? "family@rajnak.com" },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete recipe"
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
