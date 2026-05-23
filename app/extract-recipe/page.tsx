"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { FileUploader } from "@/components/recipe-extractor/file-uploader"
import { UrlExtractor } from "@/components/recipe-extractor/url-extractor"
import { TextExtractor } from "@/components/recipe-extractor/text-extractor"
import { RecipePreview } from "@/components/recipe-extractor/recipe-preview"
import { SprigDivider } from "@/components/sprig-divider"
import type { ExtractedRecipe } from "@/lib/recipe-extractor"

type ExtractionMode = "upload" | "url" | "text"

const MODES: Array<{ id: ExtractionMode; label: string; eyebrow: string }> = [
  { id: "upload", label: "Upload a file", eyebrow: "No. I" },
  { id: "url", label: "From a URL", eyebrow: "No. II" },
  { id: "text", label: "Paste text", eyebrow: "No. III" },
]

export default function ExtractRecipePage() {
  const [activeMode, setActiveMode] = useState<ExtractionMode>("upload")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedRecipe, setExtractedRecipe] = useState<ExtractedRecipe | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSaveRecipe = async (recipe: ExtractedRecipe) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save recipes.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save recipe")
      }

      const data = await response.json()

      toast({
        title: "Recipe saved",
        description: "Your recipe has been saved successfully.",
      })

      router.push(`/recipes/${data.slug}`)
    } catch (error) {
      console.error("Error saving recipe:", error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save recipe.",
        variant: "destructive",
      })
    }
  }

  const resetExtraction = () => {
    setExtractedRecipe(null)
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Extract a recipe</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Lift a recipe from <em className="italic" style={{ color: "var(--lingon-deep)" }}>anywhere</em>.
        </h1>
        <p className="lede">
          Upload a file, paste a link, or drop in text. We&apos;ll sort the title, ingredients,
          and method into the cookbook&apos;s shape.
        </p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      {!extractedRecipe ? (
        <div className="max-w-3xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-12">
          <div className="grid grid-cols-3 gap-0 border-b border-rule-soft mb-10">
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

          {activeMode === "upload" && <FileUploader onRecipeExtracted={setExtractedRecipe} />}
          {activeMode === "url" && <UrlExtractor onRecipeExtracted={setExtractedRecipe} />}
          {activeMode === "text" && <TextExtractor onRecipeExtracted={setExtractedRecipe} />}

          {isExtracting && (
            <div className="flex items-center justify-center gap-2 mt-8 font-serif italic text-ink-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Extracting recipe information…</span>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
          <RecipePreview recipe={extractedRecipe} />
          <div className="flex flex-wrap justify-center gap-6">
            <button type="button" onClick={resetExtraction} className="btn btn--ghost">
              Start over
            </button>
            <button
              type="button"
              onClick={() => handleSaveRecipe(extractedRecipe)}
              className="btn"
            >
              Save recipe
            </button>
            <Link href="/recipes" className="btn btn--link">
              Cancel
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
