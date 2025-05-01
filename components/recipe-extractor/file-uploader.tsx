"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { RecipePreview } from "./recipe-preview"
import type { ExtractedRecipe } from "@/lib/recipe-extractor"

interface FileUploaderProps {
  onRecipeExtracted: (recipe: ExtractedRecipe) => void
}

export function FileUploader({ onRecipeExtracted }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError(null)
    setRecipe(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      let endpoint = "/api/extract-recipe"
      if (file.type === "application/pdf") {
        endpoint = "/api/extract-pdf"
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">{file ? file.name : "Click to upload or drag and drop"}</p>
            <p className="text-xs text-gray-500">PDF, TXT, DOC, DOCX</p>
          </label>
        </div>

        {file && (
          <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Extract Recipe
          </Button>
        )}

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
