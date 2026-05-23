"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DragDropImageUploader } from "@/components/drag-drop-image-uploader"
import { SprigDivider } from "@/components/sprig-divider"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-browser"
import slugify from "slugify"

interface ExtractedRecipe {
  title: string
  description?: string
  category?: string
  prep_time?: string
  cook_time?: string
  servings?: number
  ingredients: string[]
  instructions: string[]
  images?: string[]
}

type Mode = "text" | "images"

const MODES: Array<{ id: Mode; label: string; eyebrow: string }> = [
  { id: "text", label: "Paste text", eyebrow: "No. I" },
  { id: "images", label: "Photographs", eyebrow: "No. II" },
]

export default function CreateNewRecipePage() {
  const [activeMode, setActiveMode] = useState<Mode>("text")
  const [recipeText, setRecipeText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedRecipe, setExtractedRecipe] = useState<ExtractedRecipe | null>(null)
  const [images, setImages] = useState<string[]>([])
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const fieldClass =
    "w-full bg-parchment-deep/40 border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"
  const labelClass =
    "block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"

  const extractRecipe = async () => {
    if (!recipeText.trim()) {
      toast({
        title: "Empty recipe",
        description: "Please paste your recipe text first",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    try {
      const response = await fetch("/api/extract-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: recipeText }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to extract recipe")
      }

      const data = await response.json()
      setExtractedRecipe(data)
      toast({
        title: "Recipe extracted",
        description: "Your recipe has been successfully extracted",
      })
    } catch (error) {
      console.error("Error extracting recipe:", error)
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Failed to extract recipe",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const saveRecipe = async () => {
    if (!extractedRecipe || !user) {
      toast({
        title: "Cannot save recipe",
        description: "Please extract a recipe first and make sure you're logged in",
        variant: "destructive",
      })
      return
    }

    try {
      const slug = slugify(extractedRecipe.title, { lower: true, strict: true })

      const { error } = await supabase
        .from("recipes")
        .insert({
          ...extractedRecipe,
          slug,
          images,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Recipe saved",
        description: "Your recipe has been saved successfully",
      })

      router.push(`/recipes/${slug}`)
    } catch (error) {
      console.error("Error saving recipe:", error)
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Add a recipe</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          A new <em className="italic" style={{ color: "var(--lingon-deep)" }}>page</em> in the book.
        </h1>
        <p className="lede">
          Paste your recipe text below, or upload photographs. The extractor will sort it
          into the cookbook&apos;s shape.
        </p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-3xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-12">
        <div className="grid grid-cols-2 gap-0 border-b border-rule-soft mb-10">
          {MODES.map((mode) => {
            const isActive = activeMode === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className={`text-center pb-4 font-serif-sc uppercase tracking-[0.22em] text-[11px] transition-colors ${
                  isActive
                    ? "text-lingon-deep border-b-2 border-lingon -mb-px"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <div className="text-[10px] opacity-70 mb-1">{mode.eyebrow}</div>
                {mode.label}
              </button>
            )
          })}
        </div>

        {activeMode === "text" && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Paste your recipe text</label>
              <textarea
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
                placeholder="Paste a recipe from anywhere — an email, a webpage, an old PDF…"
                className={`${fieldClass} min-h-[240px]`}
              />
              <p className="mt-2 text-[15px] italic text-ink-muted">
                The extractor will sort the title, ingredients, and steps for you.
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={extractRecipe}
                disabled={isExtracting || !recipeText.trim()}
                className="btn"
              >
                {isExtracting ? (
                  <span className="inline-flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting…
                  </span>
                ) : (
                  "Extract recipe"
                )}
              </button>
            </div>
          </div>
        )}

        {activeMode === "images" && (
          <div>
            <h2 className="editorial-h3 font-normal mb-6">Photographs</h2>
            <DragDropImageUploader images={images} onImagesChange={setImages} maxImages={5} />
          </div>
        )}

        {extractedRecipe && (
          <div className="border-t border-rule-soft pt-8 mt-10 space-y-6">
            <div className="eyebrow eyebrow--lingon mb-2">No. III</div>
            <h2 className="editorial-h3 font-normal mb-4">Review &amp; edit</h2>

            <div>
              <label className={labelClass}>Title</label>
              <input
                value={extractedRecipe.title}
                onChange={(e) =>
                  setExtractedRecipe({ ...extractedRecipe, title: e.target.value })
                }
                className={fieldClass}
              />
            </div>

            {extractedRecipe.description !== undefined && (
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={extractedRecipe.description || ""}
                  onChange={(e) =>
                    setExtractedRecipe({ ...extractedRecipe, description: e.target.value })
                  }
                  className={`${fieldClass} min-h-32`}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Prep time</label>
                <input
                  value={extractedRecipe.prep_time || ""}
                  onChange={(e) =>
                    setExtractedRecipe({ ...extractedRecipe, prep_time: e.target.value })
                  }
                  placeholder="30 mins"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>Cook time</label>
                <input
                  value={extractedRecipe.cook_time || ""}
                  onChange={(e) =>
                    setExtractedRecipe({ ...extractedRecipe, cook_time: e.target.value })
                  }
                  placeholder="45 mins"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Ingredients · one per line</label>
              <textarea
                value={extractedRecipe.ingredients.join("\n")}
                onChange={(e) =>
                  setExtractedRecipe({
                    ...extractedRecipe,
                    ingredients: e.target.value.split("\n").filter(Boolean),
                  })
                }
                className={`${fieldClass} min-h-[160px]`}
              />
            </div>

            <div>
              <label className={labelClass}>Instructions · one step per line</label>
              <textarea
                value={extractedRecipe.instructions.join("\n")}
                onChange={(e) =>
                  setExtractedRecipe({
                    ...extractedRecipe,
                    instructions: e.target.value.split("\n").filter(Boolean),
                  })
                }
                className={`${fieldClass} min-h-[160px]`}
              />
            </div>

            <div className="border-t border-rule-soft pt-8 flex flex-wrap items-center justify-between gap-4">
              <Link href="/recipes" className="btn btn--ghost">
                Cancel
              </Link>
              <button type="button" onClick={saveRecipe} className="btn">
                Save recipe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
