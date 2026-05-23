"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Camera, X } from "lucide-react"

type FormState = {
  slug: string
  title: string
  category: string
  prepTime: string
  cookTime: string
  servings: number
  difficulty: string
  ingredients: string[]
  instructions: string[]
  kitchenNote: string
  signoff: string
  story: string
  featured: boolean
}

const CATEGORIES = ["Family Recipes", "Found Recipes", "Quick & Easy", "Christmas & Easter"] as const
const DIFFICULTIES = ["Easy", "Medium", "Showpiece"] as const

const SIGNOFF_OPTIONS = [
  "Smaklig måltid.",
  "Jó étvágyat.",
  "En guete.",
  "Bon appétit.",
  "Buon appetito.",
  "Tuck in.",
]

const label = "block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
const input =
  "w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[17px] text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink"

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

// Down-scale a phone photo to ≤1600px wide JPEG so uploads are fast.
async function compressImage(file: File, maxWidth = 1600, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
  const img = new window.Image()
  img.src = dataUrl
  await new Promise<void>((res, rej) => {
    img.onload = () => res()
    img.onerror = () => rej(new Error("Could not read image"))
  })
  const scale = Math.min(1, maxWidth / img.naturalWidth)
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, w, h)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))),
      "image/jpeg",
      quality,
    )
  })
}

export function AdminRecipeForm({
  initial,
  mode,
}: {
  initial: Partial<FormState> & { slug?: string; image?: string }
  mode: "create" | "update"
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<FormState>({
    slug: initial.slug ?? "",
    title: initial.title ?? "",
    category: initial.category ?? "Family Recipes",
    prepTime: initial.prepTime ?? "",
    cookTime: initial.cookTime ?? "",
    servings: initial.servings ?? 4,
    difficulty: initial.difficulty ?? "Easy",
    ingredients: initial.ingredients?.length ? initial.ingredients : [""],
    instructions: initial.instructions?.length ? initial.instructions : [""],
    kitchenNote: initial.kitchenNote ?? "",
    signoff: initial.signoff ?? "Smaklig måltid.",
    story: initial.story ?? "",
    featured: initial.featured ?? false,
  })

  // Track image state separately — preview URL + the file to upload.
  const [imageFile, setImageFile] = useState<Blob | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initial.image ?? null)
  const [imageBusy, setImageBusy] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Auto-derive the slug from the title only when creating (don't move
  // existing recipe paths).
  useEffect(() => {
    if (mode === "create") {
      setState((s) => ({ ...s, slug: slugify(s.title) }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.title])

  // Free the object URL on unmount.
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }))

  const updateAt = (key: "ingredients" | "instructions", index: number, value: string) =>
    setState((s) => {
      const next = [...s[key]]
      next[index] = value
      return { ...s, [key]: next }
    })

  const addRow = (key: "ingredients" | "instructions") =>
    setState((s) => ({ ...s, [key]: [...s[key], ""] }))

  const removeRow = (key: "ingredients" | "instructions", index: number) =>
    setState((s) => ({ ...s, [key]: s[key].filter((_, i) => i !== index) }))

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageBusy(true)
    setError(null)
    try {
      const blob = await compressImage(file)
      const previewUrl = URL.createObjectURL(blob)
      if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview)
      setImagePreview(previewUrl)
      setImageFile(blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the photo")
    } finally {
      setImageBusy(false)
      // Reset so the same file can be re-picked if needed.
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const clearImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setImageFile(null)
  }

  const canSubmit =
    !!state.title.trim() &&
    state.ingredients.some((i) => i.trim()) &&
    state.instructions.some((i) => i.trim())

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append(
        "data",
        JSON.stringify({
          ...state,
          slug: state.slug || slugify(state.title),
          ingredients: state.ingredients.filter((i) => i.trim()),
          instructions: state.instructions.filter((i) => i.trim()),
          mode,
        }),
      )
      if (imageFile) {
        form.append("image", imageFile, "photo.jpg")
      }
      const res = await fetch("/api/admin/recipes", { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Save failed")
      setSuccess(
        mode === "create"
          ? "Recipe saved. The site will redeploy in ~1 minute and it'll appear."
          : "Updated. The site will redeploy in ~1 minute.",
      )
      if (mode === "create") setTimeout(() => router.push("/admin/recipes"), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSubmitting(false)
    }
  }

  const sectionCard =
    "bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-5 md:p-8 space-y-5"

  return (
    <form onSubmit={onSubmit} className="space-y-4 md:space-y-6 pb-24 md:pb-0">
      {error && (
        <div className="bg-lingon-soft/30 border border-lingon text-lingon-deep font-serif italic p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-sage/10 border border-sage text-forest font-serif italic p-4">
          {success}
        </div>
      )}

      {/* ===== Photo + Title — the first card you see ===== */}
      <section className={sectionCard}>
        <div>
          <div className={label}>The photo</div>
          {imagePreview ? (
            <div className="relative aspect-[4/5] max-w-sm mx-auto bg-parchment-deep border border-rule-soft overflow-hidden">
              {/* Use plain <img> so blob: URLs work */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Recipe photo preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove photo"
                className="absolute top-2 right-2 bg-cream/95 border border-rule-soft p-1.5 hover:text-lingon-deep"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-cream/95 border border-rule-soft px-3 py-1.5 font-serif-sc uppercase tracking-[0.18em] text-[10px] text-ink hover:text-lingon-deep"
              >
                Replace
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/5] max-w-sm mx-auto flex flex-col items-center justify-center gap-3 border-2 border-dotted border-rule bg-parchment-deep/40 hover:bg-parchment-deep/70 transition-colors p-6 text-center"
            >
              <Camera size={36} strokeWidth={1.2} className="text-ink-muted" />
              <span className="font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink">
                Take or upload a photo
              </span>
              <span className="font-serif italic text-[14px] text-ink-muted">
                On a phone, this opens the camera.
              </span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPickImage}
            className="sr-only"
          />
          {imageBusy && (
            <p className="mt-2 text-center font-serif italic text-ink-muted text-[14px]">
              Preparing photo…
            </p>
          )}
        </div>

        <div>
          <label className={label} htmlFor="title">
            Recipe name
          </label>
          <input
            id="title"
            ref={titleRef}
            type="text"
            required
            value={state.title}
            onChange={(e) => set("title", e.target.value)}
            className={input}
            placeholder="e.g. Mamma's gulasch soup"
            autoFocus={mode === "create"}
          />
        </div>
      </section>

      {/* ===== Quick details ===== */}
      <section className={sectionCard}>
        <div className="eyebrow eyebrow--lingon">No. I · Details</div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className={label}>Category</label>
            <select
              value={state.category}
              onChange={(e) => set("category", e.target.value)}
              className={`${input} appearance-none`}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Difficulty</label>
            <select
              value={state.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
              className={`${input} appearance-none`}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className={label}>Prep</label>
            <input
              type="text"
              inputMode="text"
              value={state.prepTime}
              onChange={(e) => set("prepTime", e.target.value)}
              className={input}
              placeholder="20 mins"
            />
          </div>
          <div>
            <label className={label}>Cook</label>
            <input
              type="text"
              inputMode="text"
              value={state.cookTime}
              onChange={(e) => set("cookTime", e.target.value)}
              className={input}
              placeholder="1 h 30 m"
            />
          </div>
          <div>
            <label className={label}>Serves</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={state.servings}
              onChange={(e) => set("servings", Number.parseInt(e.target.value, 10) || 1)}
              className={input}
            />
          </div>
        </div>
      </section>

      {/* ===== Ingredients ===== */}
      <section className={sectionCard}>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="eyebrow eyebrow--lingon">No. II</div>
            <h2 className="editorial-h3 font-normal mt-1">Ingredients</h2>
          </div>
          <span className="font-serif-sc uppercase tracking-[0.2em] text-[10px] text-ink-muted">
            {state.ingredients.filter((i) => i.trim()).length}
          </span>
        </div>

        <div className="space-y-2">
          {state.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={ing}
                onChange={(e) => updateAt("ingredients", i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (i === state.ingredients.length - 1) addRow("ingredients")
                    // Focus next field on next paint
                    requestAnimationFrame(() => {
                      const next = document.querySelector<HTMLInputElement>(
                        `[data-ing-row="${i + 1}"]`,
                      )
                      next?.focus()
                    })
                  }
                }}
                data-ing-row={i}
                className={input}
                placeholder={i === 0 ? "800 g beef chuck, cubed" : "Next ingredient…"}
              />
              {state.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow("ingredients", i)}
                  aria-label="Remove ingredient"
                  className="p-2 text-ink-muted hover:text-lingon-deep"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addRow("ingredients")}
          className="btn btn--ghost w-full justify-center"
        >
          + Add ingredient
        </button>
        <p className="font-serif italic text-[14px] text-ink-muted">
          Tip: press Enter at the end of a row to jump to the next one.
        </p>
      </section>

      {/* ===== Method ===== */}
      <section className={sectionCard}>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="eyebrow eyebrow--lingon">No. III</div>
            <h2 className="editorial-h3 font-normal mt-1">Method</h2>
          </div>
          <span className="font-serif-sc uppercase tracking-[0.2em] text-[10px] text-ink-muted">
            {state.instructions.filter((i) => i.trim()).length}
          </span>
        </div>

        <div className="space-y-3">
          {state.instructions.map((step, i) => (
            <div key={i} className="grid grid-cols-[36px_1fr_36px] items-start gap-2">
              <span className="font-serif text-lingon text-xl num pt-3 text-center">
                {String(i + 1).padStart(2, "0")}
              </span>
              <textarea
                rows={2}
                value={step}
                onChange={(e) => updateAt("instructions", i, e.target.value)}
                onInput={(e) => {
                  // Auto-grow on mobile
                  const el = e.target as HTMLTextAreaElement
                  el.style.height = "auto"
                  el.style.height = el.scrollHeight + "px"
                }}
                className={`${input} min-h-[68px] py-2 resize-none leading-snug`}
                placeholder={i === 0 ? "Heat the oil. Add the onions…" : "Next step…"}
              />
              {state.instructions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeRow("instructions", i)}
                  aria-label="Remove step"
                  className="p-2 text-ink-muted hover:text-lingon-deep mt-1"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addRow("instructions")}
          className="btn btn--ghost w-full justify-center"
        >
          + Add step
        </button>
      </section>

      {/* ===== Family touches (optional) ===== */}
      <section className={sectionCard}>
        <div className="eyebrow eyebrow--lingon">No. IV · Optional</div>
        <h2 className="editorial-h3 font-normal mt-1">Family touches</h2>

        <div>
          <label className={label}>Kitchen note (handwritten line)</label>
          <input
            type="text"
            value={state.kitchenNote}
            onChange={(e) => set("kitchenNote", e.target.value)}
            className={input}
            placeholder="Better the next day."
            maxLength={80}
          />
        </div>

        <div>
          <label className={label}>Signoff</label>
          <select
            value={state.signoff}
            onChange={(e) => set("signoff", e.target.value)}
            className={`${input} appearance-none`}
          >
            {SIGNOFF_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>The story (1–3 short paragraphs)</label>
          <textarea
            value={state.story}
            onChange={(e) => set("story", e.target.value)}
            className={`${input} min-h-[120px] leading-snug`}
            placeholder="Where the dish comes from. When it's served. What makes it work."
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 accent-lingon"
          />
          <span className="font-serif italic text-ink-soft">Feature on the home page</span>
        </label>
      </section>

      {/* ===== Sticky save bar on mobile ===== */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-parchment/95 backdrop-blur-sm border-t border-rule-soft px-4 py-3 md:hidden">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Link
            href="/admin/recipes"
            className="font-serif-sc uppercase tracking-[0.18em] text-[11px] text-ink-soft px-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="btn flex-1 justify-center disabled:opacity-50"
          >
            {submitting ? "Saving…" : mode === "create" ? "Save recipe" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Inline buttons (desktop) */}
      <div className="hidden md:flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="btn disabled:opacity-50"
        >
          {submitting ? "Saving…" : mode === "create" ? "Save recipe" : "Save changes"}
        </button>
        <Link href="/admin/recipes" className="btn btn--link">
          Cancel
        </Link>
      </div>
    </form>
  )
}
