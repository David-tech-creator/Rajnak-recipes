"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Paste recipe text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="min-h-[200px]"
        />
        <Button type="submit" variant="outline" className="w-full" disabled={isLoading || !text.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Extract Recipe
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>

      {recipe && (
        <div className="space-y-4">
          <RecipePreview recipe={recipe} />
          <div className="flex justify-center mt-6">
            <Button onClick={handleUseRecipe} variant="outline">
              Use This Recipe
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
