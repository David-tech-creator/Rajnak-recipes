import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { serializeRecipe, slugify, validateDraft, type RecipeDraft } from "@/lib/recipe-mdx"
import { commitFile, commitBuffer } from "@/lib/github"
import { isAllowedAdmin } from "@/lib/admin-allowlist"

export const runtime = "nodejs"
// Recipe uploads can include a 1–2 MB image; bump body limit.
export const maxDuration = 30

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
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  if (!isAllowedAdmin(user.email))
    return NextResponse.json({ error: "Not authorised" }, { status: 403 })

  const contentType = req.headers.get("content-type") ?? ""

  let payload: Partial<RecipeDraft> & { mode?: "create" | "update" }
  let imageFile: File | null = null

  try {
    if (contentType.startsWith("multipart/form-data")) {
      const form = await req.formData()
      const json = form.get("data")
      if (typeof json !== "string") {
        return NextResponse.json({ error: "Missing recipe payload" }, { status: 400 })
      }
      payload = JSON.parse(json)
      const f = form.get("image")
      if (f && f instanceof File && f.size > 0) imageFile = f
    } else {
      payload = await req.json()
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const validationError = validateDraft(payload)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const slug = payload.slug?.trim() || slugify(payload.title ?? "")
  if (!slug) {
    return NextResponse.json({ error: "Could not derive a slug from the title" }, { status: 400 })
  }
  // Reject anything that could break out of content/recipes/ — slugify
  // already normalises but a client-supplied slug bypasses it.
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  const committer = {
    name: user.email ?? "Family admin",
    email: user.email ?? "family@rajnak.com",
  }

  // 1. Commit the image (if one was uploaded) so the MDX references a real file.
  let imagePath = payload.image
  if (imageFile) {
    const ext = imageFile.type === "image/png" ? "png" : "jpg"
    imagePath = `/images/recipes/${slug}.${ext}`
    const buf = Buffer.from(await imageFile.arrayBuffer())
    try {
      await commitBuffer({
        path: `public${imagePath}`,
        buffer: buf,
        message: `Add photo for ${payload.title}`,
        author: committer,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload photo"
      return NextResponse.json({ error: `Photo upload failed: ${msg}` }, { status: 500 })
    }
  }

  const draft: RecipeDraft = {
    slug,
    title: payload.title!.trim(),
    category: payload.category!,
    image: imagePath,
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
  const verb = payload.mode === "update" ? "Update" : "Add"

  try {
    await commitFile({
      path: `content/recipes/${slug}.mdx`,
      content,
      message: `${verb} recipe: ${draft.title}`,
      author: committer,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save recipe"
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ ok: true, slug })
}
