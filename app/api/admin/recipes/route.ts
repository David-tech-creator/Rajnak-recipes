import { NextResponse } from "next/server"
import { serializeRecipe, slugify, validateDraft, type RecipeDraft } from "@/lib/recipe-mdx"
import { commitFile, commitBuffer } from "@/lib/github"
import { isAllowedAdmin } from "@/lib/admin-allowlist"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
// Recipe uploads can include a 1–2 MB image; bump body limit.
export const maxDuration = 30

async function getUser() {
  const supabase = await createClient()
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

  const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB

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
      if (f && f instanceof File && f.size > 0) {
        if (!ALLOWED_IMAGE_TYPES.has(f.type)) {
          return NextResponse.json(
            { error: `Unsupported image type: ${f.type || "unknown"} (use JPEG, PNG, or WebP).` },
            { status: 400 },
          )
        }
        if (f.size > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { error: `Image is too large (${Math.round(f.size / 1024 / 1024)} MB). Cap is 10 MB.` },
            { status: 413 },
          )
        }
        imageFile = f
      }
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
