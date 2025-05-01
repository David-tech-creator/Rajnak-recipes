"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DragDropImageUploader } from "@/components/drag-drop-image-uploader"
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

export default function CreateNewRecipePage() {
  const [activeTab, setActiveTab] = useState("text")
  const [recipeText, setRecipeText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedRecipe, setExtractedRecipe] = useState<ExtractedRecipe | null>(null)
  const [images, setImages] = useState<string[]>([])
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

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
        headers: {
          "Content-Type": "application/json",
        },
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
      
      const { data, error } = await supabase
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
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Recipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Recipe Text</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Paste your recipe text here
                </label>
                <Textarea
                  value={recipeText}
                  onChange={(e) => setRecipeText(e.target.value)}
                  rows={10}
                  placeholder="Paste your recipe text here..."
                  className="resize-none"
                />
              </div>

              <Button
                onClick={extractRecipe}
                disabled={isExtracting || !recipeText.trim()}
                className="w-full bg-black hover:bg-black/90 text-white"
                size="lg"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Extracting Recipe...
                  </>
                ) : (
                  "Extract Recipe"
                )}
              </Button>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <DragDropImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={5}
              />
            </TabsContent>
          </Tabs>

          {extractedRecipe && (
            <div className="space-y-6 mt-8 border-t pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={extractedRecipe.title}
                  onChange={(e) =>
                    setExtractedRecipe({ ...extractedRecipe, title: e.target.value })
                  }
                />
              </div>

              {extractedRecipe.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={extractedRecipe.description}
                    onChange={(e) =>
                      setExtractedRecipe({ ...extractedRecipe, description: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prep Time</label>
                  <Input
                    value={extractedRecipe.prep_time || ""}
                    onChange={(e) =>
                      setExtractedRecipe({ ...extractedRecipe, prep_time: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cook Time</label>
                  <Input
                    value={extractedRecipe.cook_time || ""}
                    onChange={(e) =>
                      setExtractedRecipe({ ...extractedRecipe, cook_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ingredients</label>
                <Textarea
                  value={extractedRecipe.ingredients.join("\n")}
                  onChange={(e) =>
                    setExtractedRecipe({
                      ...extractedRecipe,
                      ingredients: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions</label>
                <Textarea
                  value={extractedRecipe.instructions.join("\n")}
                  onChange={(e) =>
                    setExtractedRecipe({
                      ...extractedRecipe,
                      instructions: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  rows={5}
                />
              </div>

              <Button onClick={saveRecipe} className="w-full">
                Save Recipe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
