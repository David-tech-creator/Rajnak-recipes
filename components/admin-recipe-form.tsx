"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type FormState = {
  slug: string
  title: string
  category: string
  image: string
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

const CATEGORIES = ["Family Recipes", "Found Recipes", "Quick & Easy", "Christmas & Easter"]
const DIFFICULTIES = ["Easy", "Medium", "Showpiece"]

const labelClass = "block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
const inputClass =
  "w-full bg-parchment-deep/40 border border-rule-soft px-4 py-3 font-serif text-[17px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"

export function AdminRecipeForm({
  initial,
  mode,
}: {
  initial: Partial<FormState> & { slug?: string }
  mode: "create" | "update"
}) {
  const router = useRouter()
  const [state, setState] = useState<FormState>({
    slug: initial.slug ?? "",
    title: initial.title ?? "",
    category: initial.category ?? "Family Recipes",
    image: initial.image ?? "",
    prepTime: initial.prepTime ?? "",
    cookTime: initial.cookTime ?? "",
    servings: initial.servings ?? 4,
    difficulty: initial.difficulty ?? "Easy",
    ingredients: initial.ingredients?.length ? initial.ingredients : [""],
    instructions: initial.instructions?.length ? initial.instructions : [""],
    kitchenNote: initial.kitchenNote ?? "",
    signoff: initial.signoff ?? "",
    story: initial.story ?? "",
    featured: initial.featured ?? false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }))

  const updateAt = (key: "ingredients" | "instructions", index: number, value: string) => {
    setState((s) => {
      const next = [...s[key]]
      next[index] = value
      return { ...s, [key]: next }
    })
  }

  const addRow = (key: "ingredients" | "instructions") =>
    setState((s) => ({ ...s, [key]: [...s[key], ""] }))

  const removeRow = (key: "ingredients" | "instructions", index: number) =>
    setState((s) => ({ ...s, [key]: s[key].filter((_, i) => i !== index) }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          ingredients: state.ingredients.filter((i) => i.trim()),
          instructions: state.instructions.filter((i) => i.trim()),
          mode,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Save failed")
      }
      setSuccess(
        mode === "create"
          ? "Recipe submitted. Vercel will redeploy in ~1 minute, then it will be live."
          : "Recipe updated. Vercel will redeploy in ~1 minute.",
      )
      if (mode === "create") {
        setTimeout(() => router.push(`/admin/recipes`), 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-12 space-y-6">
      {error && (
        <div className="bg-lingon-soft/30 border border-lingon text-lingon-deep font-serif italic p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-sage/10 border border-sage text-forest font-serif italic p-4">{success}</div>
      )}

      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          required
          value={state.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass}
          placeholder="e.g. Mamma's gulasch soup"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={state.category}
            onChange={(e) => set("category", e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Difficulty</label>
          <select
            value={state.difficulty}
            onChange={(e) => set("difficulty", e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className={labelClass}>Prep time</label>
          <input
            type="text"
            value={state.prepTime}
            onChange={(e) => set("prepTime", e.target.value)}
            className={inputClass}
            placeholder="20 mins"
          />
        </div>
        <div>
          <label className={labelClass}>Cook time</label>
          <input
            type="text"
            value={state.cookTime}
            onChange={(e) => set("cookTime", e.target.value)}
            className={inputClass}
            placeholder="1 h 30 m"
          />
        </div>
        <div>
          <label className={labelClass}>Servings</label>
          <input
            type="number"
            min={1}
            value={state.servings}
            onChange={(e) => set("servings", Number.parseInt(e.target.value, 10) || 1)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Image path</label>
        <input
          type="text"
          value={state.image}
          onChange={(e) => set("image", e.target.value)}
          className={inputClass}
          placeholder="/images/recipes/mammas-gulasch-soup.jpg"
        />
        <p className="mt-2 text-[15px] italic text-ink-muted">
          Leave blank to default to /images/recipes/{state.slug || "[slug]"}.jpg. You&apos;ll need to
          upload the actual image file via git separately.
        </p>
      </div>

      <div className="border-t border-rule-soft pt-8">
        <div className="eyebrow eyebrow--lingon mb-2">No. I</div>
        <h2 className="editorial-h3 font-normal mb-6">Ingredients</h2>
        {state.ingredients.map((ing, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <input
              type="text"
              value={ing}
              onChange={(e) => updateAt("ingredients", i, e.target.value)}
              className={inputClass}
              placeholder="800 g beef chuck, cut into 3-cm cubes"
            />
            {state.ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow("ingredients", i)}
                className="text-lingon hover:text-lingon-deep font-serif italic text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addRow("ingredients")} className="btn btn--ghost mt-2">
          + Add ingredient
        </button>
      </div>

      <div className="border-t border-rule-soft pt-8">
        <div className="eyebrow eyebrow--lingon mb-2">No. II</div>
        <h2 className="editorial-h3 font-normal mb-6">Method</h2>
        {state.instructions.map((step, i) => (
          <div key={i} className="flex items-start gap-3 mb-3">
            <span className="font-serif text-lingon text-xl num pt-3 w-8 flex-shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <textarea
              value={step}
              onChange={(e) => updateAt("instructions", i, e.target.value)}
              className={`${inputClass} min-h-[80px]`}
              placeholder="Heat the oil in a heavy pot. Add the onions and cook gently…"
            />
            {state.instructions.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow("instructions", i)}
                className="text-lingon hover:text-lingon-deep font-serif italic text-sm pt-3"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addRow("instructions")} className="btn btn--ghost mt-2">
          + Add step
        </button>
      </div>

      <div className="border-t border-rule-soft pt-8 grid md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Kitchen note (handwritten)</label>
          <input
            type="text"
            value={state.kitchenNote}
            onChange={(e) => set("kitchenNote", e.target.value)}
            className={inputClass}
            placeholder="Better the next day."
          />
        </div>
        <div>
          <label className={labelClass}>Signoff</label>
          <input
            type="text"
            value={state.signoff}
            onChange={(e) => set("signoff", e.target.value)}
            className={inputClass}
            placeholder="Smaklig måltid."
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>The story (optional, 1–3 paragraphs)</label>
        <textarea
          value={state.story}
          onChange={(e) => set("story", e.target.value)}
          className={`${inputClass} min-h-[140px]`}
          placeholder="A short paragraph about where the dish comes from, when it's eaten, what makes it work."
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          id="featured"
          type="checkbox"
          checked={state.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="h-4 w-4 accent-lingon"
        />
        <label htmlFor="featured" className="font-serif italic text-ink-soft">
          Feature on the home page
        </label>
      </div>

      <div className="flex gap-4 pt-4 border-t border-rule-soft">
        <button type="submit" disabled={submitting} className="btn">
          {submitting ? "Saving…" : mode === "create" ? "Save recipe" : "Update recipe"}
        </button>
        <Link href="/admin/recipes" className="btn btn--link">
          Cancel
        </Link>
      </div>
    </form>
  )
}
