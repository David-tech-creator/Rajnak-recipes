"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DragDropImageUploader } from "@/components/drag-drop-image-uploader"
import { Loader2, Plus, Trash2, Save } from "lucide-react"
import slugify from "slugify"
import type { Recipe } from "@/lib/supabase"
import type { ExtractedRecipe } from "@/lib/recipe-extractor"
import { CATEGORY_GROUPS } from "@/lib/categories"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RecipeEditorProps {
  recipe?: Recipe
  initialRecipe?: ExtractedRecipe | null
  isEditing?: boolean
}

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
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Generate slug from title
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

  // Ingredient management
  const addIngredient = () => {
    setIngredients([...ingredients, ""])
  }

  const removeIngredient = (index: number) => {
    const newIngredients = [...ingredients]
    newIngredients.splice(index, 1)
    setIngredients(newIngredients)
  }

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
  }

  // Instruction management
  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const removeInstruction = (index: number) => {
    const newInstructions = [...instructions]
    newInstructions.splice(index, 1)
    setInstructions(newInstructions)
  }

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions]
    newInstructions[index] = value
    setInstructions(newInstructions)
  }

  // Image management
  const handleImagesUploaded = (newImageUrls: string[]) => {
    setImages([...images, ...newImageUrls])
  }

  const handleImageRemove = async (urlToRemove: string) => {
    // Remove from state
    setImages(images.filter((url) => url !== urlToRemove))

    // Optional: Remove from storage
    // This would require extracting the file path from the URL
    // and using supabase.storage.from('recipes').remove([filePath])
  }

  const updateRecipe = (key: string, value: string) => {
    switch (key) {
      case "title":
        setTitle(value)
        break
      case "description":
        setDescription(value)
        break
      case "category":
        setCategory(value)
        break
      case "prep_time":
        setPrepTime(value)
        break
      case "cook_time":
        setCookTime(value)
        break
      case "servings":
        setServings(value)
        break
      default:
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
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
        // Update existing recipe
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
        // Create new recipe
        const { data, error } = await supabase
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

        // Set submitted state to show success message
        setIsSubmitted(true)

        // Redirect to the new recipe page after a short delay
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

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-8 w-8 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Recipe Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your recipe has been saved. You will be redirected to view it momentarily.
            </p>
            <Button onClick={() => router.push(`/recipes/${slug}`)}>View Recipe Now</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{isEditing ? "Edit Recipe" : "Create New Recipe"}</h1>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Saving Recipe..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Recipe" : "Save Recipe"}
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Recipe Background & History</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share the story behind this recipe, its history, family connections, or any special memories associated with it."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(value) => updateRecipe("category", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_GROUPS.map((group) => {
                        // Only show subcategories that aren't already main categories
                        const filteredSubcategories = group.subcategories?.filter(
                          (subcat) => !CATEGORY_GROUPS.some((g) => g.name === subcat),
                        )

                        return (
                          <SelectGroup key={group.name}>
                            <SelectLabel>{group.name}</SelectLabel>
                            <SelectItem value={group.name}>{group.name}</SelectItem>
                            {filteredSubcategories?.map((subcat) => (
                              <SelectItem key={subcat} value={subcat} className="pl-6">
                                {subcat}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time</Label>
                    <Input
                      id="prepTime"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      placeholder="e.g. 30 mins"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cookTime">Cook Time</Label>
                    <Input
                      id="cookTime"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      placeholder="e.g. 45 mins"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ingredients</CardTitle>
                <Button type="button" onClick={addIngredient} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        placeholder={`Ingredient ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                        disabled={ingredients.length === 1}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructions Tab */}
          <TabsContent value="instructions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Instructions</CardTitle>
                <Button type="button" onClick={addInstruction} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Step
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-none pt-3 font-serif text-xl text-gray-400">{index + 1}.</div>
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Step ${index + 1}`}
                        className="flex-grow min-h-[100px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInstruction(index)}
                        disabled={instructions.length === 1}
                        className="flex-none mt-2 text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Recipe Images</CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropImageUploader
                  recipeId={recipe?.id}
                  slug={slug}
                  existingImages={images}
                  onImagesUploaded={handleImagesUploaded}
                  onImageRemove={handleImageRemove}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
