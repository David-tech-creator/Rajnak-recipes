"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { RecipePreview } from "./recipe-preview"
import type { ExtractedRecipe } from "@/lib/recipe-extractor"

interface TextExtractorProps {
  onRecipeExtracted: (recipe: ExtractedRecipe) => void
}

export function TextExtractor({ onRecipeExtracted }: TextExtractorProps) {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setRecipe(null)

    try {
      const response = await fetch("/api/extract-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to extract recipe")
      }

      const data = await response.json()
      setRecipe(data)
    } catch (err: any) {
      setError(err.message || "An error occurred while extracting the recipe")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseRecipe = () => {
    if (recipe) {
      onRecipeExtracted(recipe)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2">
            Paste recipe text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="Paste a recipe from anywhere — an email, a webpage, an old PDF…"
            className="w-full bg-parchment-deep/40 border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink min-h-[220px]"
          />
          <p className="mt-2 text-[15px] italic text-ink-muted">
            The extractor will sort the title, ingredients, and steps for you.
          </p>
        </div>

        <div className="text-center">
          <button type="submit" className="btn" disabled={isLoading || !text.trim()}>
            {isLoading ? (
              <span className="inline-flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Extracting…
              </span>
            ) : (
              "Extract recipe"
            )}
          </button>
        </div>

        {error && (
          <div className="bg-lingon-soft/30 border border-lingon text-lingon-deep font-serif italic text-[16px] p-4">
            {error}
          </div>
        )}
      </form>

      {recipe && (
        <div className="space-y-6 pt-4">
          <RecipePreview recipe={recipe} />
          <div className="flex justify-center">
            <button type="button" onClick={handleUseRecipe} className="btn">
              Use this recipe
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
