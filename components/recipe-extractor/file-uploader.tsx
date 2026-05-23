"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Loader2 } from "lucide-react"
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
  const inputRef = useRef<HTMLInputElement>(null)

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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dotted border-rule p-12 text-center bg-cream">
          <input
            type="file"
            id="file-upload"
            ref={inputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
          />
          <p className="font-serif italic text-ink-muted text-lg">
            {file ? file.name : "Drop a PDF, text, or document file here"}
          </p>
          <p className="font-serif-sc uppercase tracking-[0.22em] text-[10px] text-ink-muted mt-3">
            PDF · TXT · DOC · DOCX
          </p>
          <button
            type="button"
            className="btn btn--ghost mt-4"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </button>
        </div>

        {file && (
          <div className="text-center">
            <button type="submit" className="btn" disabled={isLoading}>
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
        )}

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
