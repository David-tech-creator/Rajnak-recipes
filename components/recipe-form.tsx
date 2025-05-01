"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Recipe } from "@/lib/supabase"
import { CATEGORY_GROUPS } from "@/lib/categories"

interface RecipeFormProps {
  recipe?: Recipe
  isEditing?: boolean
}

export function RecipeForm({ recipe, isEditing = false }: RecipeFormProps) {
  const [title, setTitle] = useState(recipe?.title || "")
  const [slug, setSlug] = useState(recipe?.slug || "")
  const [category, setCategory] = useState(recipe?.category || "")
  const [prepTime, setPrepTime] = useState(recipe?.prep_time || "")
  const [cookTime, setCookTime] = useState(recipe?.cook_time || "")
  const [servings, setServings] = useState(recipe?.servings?.toString() || "")
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients || [""])
  const [instructions, setInstructions] = useState<string[]>(recipe?.instructions || [""])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
      )
    }
  }, [title, isEditing])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to save recipes.",
        variant: "destructive",
      })
      return
    }

    // Validate form
    if (!title || !category || ingredients.some((i) => !i) || instructions.some((i) => !i)) {
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
        category,
        prep_time: prepTime || null,
        cook_time: cookTime || null,
        servings: servings ? Number.parseInt(servings) : null,
        ingredients: ingredients.filter((i) => i.trim()),
        instructions: instructions.filter((i) => i.trim()),
        user_id: user.id,
        images: recipe?.images || [],
      }

      if (isEditing && recipe) {
        // Update existing recipe
        const { error } = await supabase.from("recipes").update(recipeData).eq("id", recipe.id).eq("user_id", user.id)

        if (error) throw error

        toast({
          title: "Recipe updated",
          description: "Your recipe has been updated successfully.",
        })
      } else {
        // Create new recipe
        const { error } = await supabase
          .from("recipes")
          .insert([{ ...recipeData, created_at: new Date().toISOString() }])

        if (error) throw error

        toast({
          title: "Recipe created",
          description: "Your recipe has been created successfully.",
        })
      }

      router.push("/my-recipes")
      router.refresh()
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

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl text-center mb-12">{isEditing ? "Edit Recipe" : "Create New Recipe"}</h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl mb-4">Basic Information</h2>

            <div className="space-y-2">
              <Label htmlFor="title" className="sans-serif text-xs">
                Recipe Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border-gray-300 focus:border-gray-500 focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="sans-serif text-xs">
                Slug
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={!isEditing}
                className="border-gray-300 focus:border-gray-500 focus:ring-0"
              />
              <p className="text-xs text-gray-500">This will be used in the URL. Auto-generated from title.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="sans-serif text-xs">
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_GROUPS.map((group) => (
                    <SelectGroup key={group.name}>
                      <SelectLabel>{group.name}</SelectLabel>
                      <SelectItem value={group.name}>{group.name}</SelectItem>
                      {group.subcategories?.map((subcat) => (
                        <SelectItem key={subcat} value={subcat} className="pl-6">
                          {subcat}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="prepTime" className="sans-serif text-xs">
                  Prep Time
                </Label>
                <Input
                  id="prepTime"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="e.g. 30 mins"
                  className="border-gray-300 focus:border-gray-500 focus:ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookTime" className="sans-serif text-xs">
                  Cook Time
                </Label>
                <Input
                  id="cookTime"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  placeholder="e.g. 45 mins"
                  className="border-gray-300 focus:border-gray-500 focus:ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings" className="sans-serif text-xs">
                  Servings
                </Label>
                <Input
                  id="servings"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  min="0"
                  className="border-gray-300 focus:border-gray-500 focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl">Ingredients *</h2>
              <Button
                type="button"
                onClick={addIngredient}
                className="bg-transparent text-gray-600 hover:text-gray-900 hover:bg-transparent p-0"
              >
                <Plus className="h-5 w-5 mr-1" />
                Add Ingredient
              </Button>
            </div>

            <div className="space-y-4 bg-[rgb(var(--light-accent))] p-6">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    required
                    className="border-gray-300 focus:border-gray-500 focus:ring-0 bg-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl">Instructions *</h2>
              <Button
                type="button"
                onClick={addInstruction}
                className="bg-transparent text-gray-600 hover:text-gray-900 hover:bg-transparent p-0"
              >
                <Plus className="h-5 w-5 mr-1" />
                Add Step
              </Button>
            </div>

            <div className="space-y-6">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-none pt-3 font-serif text-xl text-gray-400">{index + 1}.</div>
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    required
                    className="flex-grow border-gray-300 focus:border-gray-500 focus:ring-0 min-h-[100px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    disabled={instructions.length === 1}
                    className="flex-none mt-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 hover:bg-transparent hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gray-900 hover:bg-gray-800 sans-serif text-xs py-6 px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Recipe" : "Create Recipe"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
