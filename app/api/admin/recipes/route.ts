import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { serializeRecipe, slugify, validateDraft, type RecipeDraft } from "@/lib/recipe-mdx"
import { commitFile } from "@/lib/github"
import { isAllowedAdmin } from "@/lib/admin-allowlist"

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
        /* no-op for read */
      },
    },
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  if (!isAllowedAdmin(user.email)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 })
  }

  let payload: Partial<RecipeDraft> & { mode?: "create" | "update" }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const validationError = validateDraft(payload)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const slug = payload.slug?.trim() || slugify(payload.title ?? "")
  if (!slug) {
    return NextResponse.json({ error: "Could not derive a slug from the title" }, { status: 400 })
  }

  const draft: RecipeDraft = {
    slug,
    title: payload.title!.trim(),
    category: payload.category!,
    image: payload.image,
    prepTime: payload.prepTime,
    cookTime: payload.cookTime,
    servings: payload.servings,
    difficulty: payload.difficulty,
    ingredients: (payload.ingredients ?? []).map((s) => s.trim()).filter(Boolean),
    instructions: (payload.instructions ?? []).map((s) => s.trim()).filter(Boolean),
    kitchenNote: payload.kitchenNote?.trim() || undefined,
    signoff: payload.signoff?.trim() || undefined,
    story: payload.story?.trim() || undefined,
    featured: payload.featured ?? false,
    date: payload.date,
  }

  const content = serializeRecipe(draft)
  const path = `content/recipes/${slug}.mdx`
  const verb = payload.mode === "update" ? "Update" : "Add"
  const message = `${verb} recipe: ${draft.title}\n\nAuthored via the family admin by ${user.email}.`

  try {
    await commitFile({
      path,
      content,
      message,
      author: { name: user.email ?? "Family admin", email: user.email ?? "family@rajnak.com" },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to commit recipe"
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ ok: true, slug })
}
