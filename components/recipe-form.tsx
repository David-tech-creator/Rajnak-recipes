"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Recipe } from "@/lib/supabase"
import { CATEGORY_GROUPS } from "@/lib/categories"

interface RecipeFormProps {
  recipe?: Recipe
  isEditing?: boolean
}

export function RecipeForm({ recipe, isEditing = false }: RecipeFormProps) {
  const [title, setTitle] = useState(recipe?.title || "")
  const [slug, setSlug] = useState(recipe?.slug || "")
  const [category, setCategory] = useState(recipe?.category || "")
  const [prepTime, setPrepTime] = useState(recipe?.prep_time || "")
  const [cookTime, setCookTime] = useState(recipe?.cook_time || "")
  const [servings, setServings] = useState(recipe?.servings?.toString() || "")
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients || [""])
  const [instructions, setInstructions] = useState<string[]>(recipe?.instructions || [""])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
      )
    }
  }, [title, isEditing])

  const addIngredient = () => setIngredients([...ingredients, ""])
  const removeIngredient = (index: number) => {
    const next = [...ingredients]
    next.splice(index, 1)
    setIngredients(next)
  }
  const updateIngredient = (index: number, value: string) => {
    const next = [...ingredients]
    next[index] = value
    setIngredients(next)
  }

  const addInstruction = () => setInstructions([...instructions, ""])
  const removeInstruction = (index: number) => {
    const next = [...instructions]
    next.splice(index, 1)
    setInstructions(next)
  }
  const updateInstruction = (index: number, value: string) => {
    const next = [...instructions]
    next[index] = value
    setInstructions(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to save recipes.",
        variant: "destructive",
      })
      return
    }

    if (!title || !category || ingredients.some((i) => !i) || instructions.some((i) => !i)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const recipeData = {
        title,
        slug,
        category,
        prep_time: prepTime || null,
        cook_time: cookTime || null,
        servings: servings ? Number.parseInt(servings) : null,
        ingredients: ingredients.filter((i) => i.trim()),
        instructions: instructions.filter((i) => i.trim()),
        user_id: user.id,
        images: recipe?.images || [],
      }

      if (isEditing && recipe) {
        const { error } = await supabase.from("recipes").update(recipeData).eq("id", recipe.id).eq("user_id", user.id)
        if (error) throw error
        toast({ title: "Recipe updated", description: "Your recipe has been updated successfully." })
      } else {
        const { error } = await supabase
          .from("recipes")
          .insert([{ ...recipeData, created_at: new Date().toISOString() }])
        if (error) throw error
        toast({ title: "Recipe created", description: "Your recipe has been created successfully." })
      }

      router.push("/my-recipes")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fieldClass =
    "w-full bg-parchment-deep/40 border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"
  const labelClass =
    "block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Section I — Basic Information */}
      <section>
        <div className="eyebrow eyebrow--lingon mb-2">No. I</div>
        <h2 className="editorial-h3 font-normal mb-6">Basic information</h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className={labelClass}>
              Recipe title *
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Mormor's gulasch soup"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              disabled={!isEditing}
              className={`${fieldClass} disabled:opacity-70`}
            />
            <p className="mt-2 text-[15px] italic text-ink-muted">
              Used in the URL — auto-generated from the title.
            </p>
          </div>

          <div>
            <label htmlFor="category" className={labelClass}>
              Category *
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className={`${fieldClass} appearance-none pr-10`}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORY_GROUPS.map((group) => (
                  <optgroup key={group.name} label={group.name}>
                    <option value={group.name}>{group.name}</option>
                    {group.subcategories?.map((subcat) => (
                      <option key={subcat} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted font-serif text-lg">
                ▾
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="prepTime" className={labelClass}>
                Prep time
              </label>
              <input
                id="prepTime"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="30 mins"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="cookTime" className={labelClass}>
                Cook time
              </label>
              <input
                id="cookTime"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="45 mins"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="servings" className={labelClass}>
                Servings
              </label>
              <input
                id="servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="0"
                placeholder="4"
                className={fieldClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section II — Ingredients */}
      <section className="border-t border-rule-soft pt-8">
        <div className="eyebrow eyebrow--lingon mb-2">No. II</div>
        <h2 className="editorial-h3 font-normal mb-6">Ingredients *</h2>

        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="font-serif num text-lg text-ink-muted w-8 text-right">
                {String(index + 1).padStart(2, "0")}
              </span>
              <input
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                required
                className={fieldClass}
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
                className="text-lingon hover:text-lingon-deep text-sm font-serif italic disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addIngredient} className="btn btn--ghost mt-6">
          + Add another
        </button>
      </section>

      {/* Section III — Instructions */}
      <section className="border-t border-rule-soft pt-8">
        <div className="eyebrow eyebrow--lingon mb-2">No. III</div>
        <h2 className="editorial-h3 font-normal mb-6">Instructions *</h2>

        <div className="space-y-6">
          {instructions.map((instruction, index) => (
            <div key={index} className="grid grid-cols-[44px_1fr_auto] gap-3 items-start">
              <span className="font-serif num text-2xl text-lingon leading-none pt-3">
                {String(index + 1).padStart(2, "0")}
              </span>
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                required
                className={`${fieldClass} min-h-32`}
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                disabled={instructions.length === 1}
                className="text-lingon hover:text-lingon-deep text-sm font-serif italic disabled:opacity-40 disabled:cursor-not-allowed pt-3"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addInstruction} className="btn btn--ghost mt-6">
          + Add another step
        </button>
      </section>

      {/* Actions */}
      <div className="border-t border-rule-soft pt-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/recipes" className="btn btn--ghost">
          Cancel
        </Link>
        <button type="submit" disabled={isLoading} className="btn">
          {isLoading ? (
            <span className="inline-flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {isEditing ? "Updating…" : "Saving…"}
            </span>
          ) : (
            <>{isEditing ? "Update recipe" : "Save recipe"}</>
          )}
        </button>
      </div>
    </form>
  )
}
