"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { FileUploader } from "@/components/recipe-extractor/file-uploader"
import { UrlExtractor } from "@/components/recipe-extractor/url-extractor"
import { TextExtractor } from "@/components/recipe-extractor/text-extractor"
import { RecipePreview } from "@/components/recipe-extractor/recipe-preview"
import type { ExtractedRecipe } from "@/lib/recipe-extractor"

export default function ExtractRecipePage() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedRecipe, setExtractedRecipe] = useState<ExtractedRecipe | null>(null)
  const [rawText, setRawText] = useState<string>("")
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleTextExtraction = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "No text to process",
        description: "Please provide some text to extract a recipe from.",
        variant: "destructive",
      })
      return
    }

    setRawText(text)
    setIsExtracting(true)

    try {
      const response = await fetch("/api/extract-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to extract recipe")
      }

      const extractedData = await response.json()
      setExtractedRecipe(extractedData)
    } catch (error) {
      console.error("Error extracting recipe:", error)
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Failed to extract recipe information.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

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

      // Redirect to the recipe page
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
    setRawText("")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {!extractedRecipe ? (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Recipe Extractor</CardTitle>
            <CardDescription>
              Upload an image, paste a URL, or enter text to automatically extract recipe information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
                <TabsTrigger value="text">Paste Text</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-0">
                <FileUploader onRecipeExtracted={setExtractedRecipe} />
              </TabsContent>

              <TabsContent value="url" className="mt-0">
                <UrlExtractor onRecipeExtracted={setExtractedRecipe} />
              </TabsContent>

              <TabsContent value="text" className="mt-0">
                <TextExtractor onRecipeExtracted={setExtractedRecipe} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            {isExtracting && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Extracting recipe information...</span>
              </div>
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto">
          <RecipePreview recipe={extractedRecipe} />
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={resetExtraction} variant="outline">
              Reset
            </Button>
            <Button onClick={() => handleSaveRecipe(extractedRecipe)}>
              Save Recipe
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
