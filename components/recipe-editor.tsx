"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { DragDropImageUploader } from "@/components/drag-drop-image-uploader"
import { SprigDivider } from "@/components/sprig-divider"
import { Loader2 } from "lucide-react"
import slugify from "slugify"
import type { Recipe } from "@/lib/supabase"
import type { ExtractedRecipe } from "@/lib/recipe-extractor"
import { CATEGORY_GROUPS } from "@/lib/categories"

interface RecipeEditorProps {
  recipe?: Recipe
  initialRecipe?: ExtractedRecipe | null
  isEditing?: boolean
}

type Section = "basic" | "ingredients" | "instructions" | "images"

const SECTIONS: Array<{ id: Section; label: string; eyebrow: string }> = [
  { id: "basic", label: "Basics", eyebrow: "No. I" },
  { id: "ingredients", label: "Ingredients", eyebrow: "No. II" },
  { id: "instructions", label: "Method", eyebrow: "No. III" },
  { id: "images", label: "Images", eyebrow: "No. IV" },
]

export function RecipeEditor({ recipe, initialRecipe, isEditing = false }: RecipeEditorProps) {
  const [title, setTitle] = useState(recipe?.title || initialRecipe?.title || "")
  const [slug, setSlug] = useState(recipe?.slug || initialRecipe?.slug || "")
  const [description, setDescription] = useState(recipe?.description || initialRecipe?.description || "")
  const [category, setCategory] = useState(recipe?.category || initialRecipe?.category || "")
  const [prepTime, setPrepTime] = useState(recipe?.prep_time || initialRecipe?.prep_time || "")
  const [cookTime, setCookTime] = useState(recipe?.cook_time || initialRecipe?.cook_time || "")
  const [servings, setServings] = useState(recipe?.servings?.toString() || initialRecipe?.servings?.toString() || "")
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients || initialRecipe?.ingredients || [""])
  const [instructions, setInstructions] = useState<string[]>(
    recipe?.instructions || initialRecipe?.instructions || [""],
  )
  const [images, setImages] = useState<string[]>(recipe?.images || initialRecipe?.images || [])
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>("basic")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (title) {
      setSlug(
        slugify(title, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        }),
      )
    }
  }, [title])

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

    if (!title || !category) {
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
        description,
        category,
        prep_time: prepTime || null,
        cook_time: cookTime || null,
        servings: servings ? Number.parseInt(servings) : null,
        ingredients: ingredients.filter((i) => i.trim()),
        instructions: instructions.filter((i) => i.trim()),
        images,
      }

      if (isEditing && recipe) {
        const { error } = await supabase
          .from("recipes")
          .update({
            ...recipeData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", recipe.id)

        if (error) throw error

        toast({
          title: "Recipe updated",
          description: "Your recipe has been updated successfully.",
        })
      } else {
        const { error } = await supabase
          .from("recipes")
          .insert([
            {
              ...recipeData,
              created_at: new Date().toISOString(),
            },
          ])
          .select("id, slug")

        if (error) throw error

        toast({
          title: "Recipe created",
          description: "Your recipe has been created successfully.",
        })

        setIsSubmitted(true)

        setTimeout(() => {
          router.push(`/recipes/${slug}`)
        }, 2000)
      }
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

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-12 text-center">
          <div className="eyebrow eyebrow--lingon">Saved</div>
          <h2 className="editorial-h2 mt-3 mb-4 font-normal">
            A new <em className="italic" style={{ color: "var(--lingon-deep)" }}>page</em> in the book.
          </h2>
          <p className="lede mb-8">
            Your recipe has been saved. You&apos;ll be taken to it in a moment.
          </p>
          <SprigDivider variant="berry" className="!mt-6 !mb-8 max-w-sm mx-auto" />
          <button
            type="button"
            onClick={() => router.push(`/recipes/${slug}`)}
            className="btn"
          >
            View recipe now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">{isEditing ? "Edit a recipe" : "Add a recipe"}</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          {isEditing ? (
            <>
              Revise this <em className="italic" style={{ color: "var(--lingon-deep)" }}>page</em>.
            </>
          ) : (
            <>
              A new <em className="italic" style={{ color: "var(--lingon-deep)" }}>page</em> in the book.
            </>
          )}
        </h1>
        <p className="lede">
          Fill in the details below; the family book will remember.
        </p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-12"
      >
        {/* Section tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-rule-soft mb-10">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`text-center pb-4 font-serif-sc uppercase tracking-[0.22em] text-[11px] transition-colors ${
                  isActive
                    ? "text-lingon-deep border-b-2 border-lingon -mb-px"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <div className="text-[10px] opacity-70 mb-1">{section.eyebrow}</div>
                {section.label}
              </button>
            )
          })}
        </div>

        {activeSection === "basic" && (
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
              <label htmlFor="description" className={labelClass}>
                Background &amp; history
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the story — where it came from, who made it, why it matters."
                className={`${fieldClass} min-h-32`}
              />
              <p className="mt-2 text-[15px] italic text-ink-muted">
                A paragraph or two. The voice of the book.
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
                  {CATEGORY_GROUPS.map((group) => {
                    const filteredSubcategories = group.subcategories?.filter(
                      (subcat) => !CATEGORY_GROUPS.some((g) => g.name === subcat),
                    )
                    return (
                      <optgroup key={group.name} label={group.name}>
                        <option value={group.name}>{group.name}</option>
                        {filteredSubcategories?.map((subcat) => (
                          <option key={subcat} value={subcat}>
                            {subcat}
                          </option>
                        ))}
                      </optgroup>
                    )
                  })}
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
        )}

        {activeSection === "ingredients" && (
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="editorial-h3 font-normal">Ingredients</h2>
              <span className="font-serif italic text-ink-muted text-sm">
                {ingredients.filter((i) => i.trim()).length} listed
              </span>
            </div>

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
          </div>
        )}

        {activeSection === "instructions" && (
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="editorial-h3 font-normal">Method</h2>
              <span className="font-serif italic text-ink-muted text-sm">
                {instructions.filter((i) => i.trim()).length} steps
              </span>
            </div>

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
          </div>
        )}

        {activeSection === "images" && (
          <div>
            <h2 className="editorial-h3 font-normal mb-6">Photographs</h2>
            <DragDropImageUploader images={images} onImagesChange={setImages} />
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-rule-soft pt-8 mt-10 flex flex-wrap items-center justify-between gap-4">
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
    </div>
  )
}
