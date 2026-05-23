import { NextResponse } from "next/server"
import { deleteFile } from "@/lib/github"
import { isAllowedAdmin } from "@/lib/admin-allowlist"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

async function getUser() {
  const supabase = await createClient()
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
  if (!isAllowedAdmin(user.email)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 })
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
