"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { RecipePreview } from "./recipe-preview"
import type { ExtractedRecipe } from "@/lib/recipe-extractor"

interface UrlExtractorProps {
  onRecipeExtracted: (recipe: ExtractedRecipe) => void
}

export function UrlExtractor({ onRecipeExtracted }: UrlExtractorProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setRecipe(null)

    try {
      const response = await fetch("/api/extract-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
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
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter recipe URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" variant="outline" disabled={isLoading || !url}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Extract
          </Button>
        </div>
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
