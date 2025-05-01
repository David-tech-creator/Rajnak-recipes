"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload } from "lucide-react"
import slugify from "slugify"

interface RecipeData {
  title: string
  content: string
}

export function JsonRecipeImporter() {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importedCount, setImportedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [jsonData, setJsonData] = useState<RecipeData[] | null>(null)
  const { toast } = useToast()

  // Function to extract ingredients and instructions from content
  const extractRecipeDetails = (content: string): { ingredients: string[]; instructions: string[] } => {
    // Default empty arrays
    const ingredients: string[] = []
    const instructions: string[] = []

    if (!content) {
      return { ingredients, instructions }
    }

    // Try to identify ingredients section
    const contentLower = content.toLowerCase()

    // Look for common ingredient section markers
    let ingredientsStart = -1
    const ingredientMarkers = ["ingredients:", "ingredients", "what you need:", "you will need:"]

    for (const marker of ingredientMarkers) {
      const index = contentLower.indexOf(marker)
      if (index !== -1) {
        ingredientsStart = index + marker.length
        break
      }
    }

    // Look for common instruction section markers
    let instructionsStart = -1
    const instructionMarkers = [
      "instructions:",
      "instructions",
      "directions:",
      "directions",
      "method:",
      "method",
      "preparation:",
      "preparation",
      "steps:",
      "do this:",
      "how it's made:",
    ]

    for (const marker of instructionMarkers) {
      const index = contentLower.indexOf(marker)
      if (index !== -1) {
        instructionsStart = index + marker.length
        break
      }
    }

    // If we found both sections
    if (ingredientsStart !== -1 && instructionsStart !== -1) {
      // Determine which comes first
      if (ingredientsStart < instructionsStart) {
        // Ingredients then instructions
        const ingredientsText = content.substring(ingredientsStart, instructionsStart).trim()
        const instructionsText = content.substring(instructionsStart).trim()

        // Split ingredients by line breaks or bullet points
        ingredients.push(
          ...ingredientsText
            .split(/\n|•|▪|□|∙/)
            .map((i) => i.trim())
            .filter((i) => i.length > 0 && !i.includes("Source") && !i.includes("Inspired by")),
        )

        // Split instructions by line breaks or numbered points
        instructions.push(
          ...instructionsText
            .split(/\n|\d+\./)
            .map((i) => i.trim())
            .filter((i) => i.length > 0 && !i.includes("Source") && !i.includes("Inspired by")),
        )
      } else {
        // Instructions then ingredients
        const instructionsText = content.substring(instructionsStart, ingredientsStart).trim()
        const ingredientsText = content.substring(ingredientsStart).trim()

        ingredients.push(
          ...ingredientsText
            .split(/\n|•|▪|□|∙/)
            .map((i) => i.trim())
            .filter((i) => i.length > 0 && !i.includes("Source") && !i.includes("Inspired by")),
        )
        instructions.push(
          ...instructionsText
            .split(/\n|\d+\./)
            .map((i) => i.trim())
            .filter((i) => i.length > 0 && !i.includes("Source") && !i.includes("Inspired by")),
        )
      }
    } else if (ingredientsStart !== -1) {
      // Only ingredients section found
      const ingredientsText = content.substring(ingredientsStart).trim()
      ingredients.push(
        ...ingredientsText
          .split(/\n|•|▪|□|∙/)
          .map((i) => i.trim())
          .filter((i) => i.length > 0 && !i.includes("Source") && !i.includes("Inspired by")),
      )
    } else if (instructionsStart !== -1) {
      // Only instructions section found
      const instructionsText = content.substring(instructionsStart).trim()
      instructions.push(
        ...instructionsText
          .split(/\n|\d+\./)
          .map((i) => i.trim())
          .filter((i) => i.length > 0 && !i.includes("Source") && !i.includes("Inspired by")),
      )
    } else {
      // No clear sections, try to make a best guess
      // Split content by line breaks
      const lines = content
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.includes("Source") && !line.includes("Inspired by"))

      // Look for lines that might be ingredients (contain measurements or food items)
      const ingredientLines = lines.filter(
        (line) =>
          /\d+\s*(g|kg|ml|dl|cl|tbsp|tsp|cup|cups|piece|pieces|slice|slices)/.test(line) ||
          /^[-•*]\s*/.test(line) ||
          /^▪\s*/.test(line) ||
          /^□\s*/.test(line),
      )

      // If we found potential ingredients, assume the rest are instructions
      if (ingredientLines.length > 0) {
        ingredients.push(...ingredientLines)
        instructions.push(...lines.filter((line) => !ingredientLines.includes(line)))
      } else {
        // Assume first half are ingredients, second half are instructions
        const midpoint = Math.floor(lines.length / 2)
        ingredients.push(...lines.slice(0, midpoint))
        instructions.push(...lines.slice(midpoint))
      }
    }

    // Clean up ingredients and instructions
    return {
      ingredients: ingredients
        .map((i) => i.replace(/^[-•*▪□∙]\s*/, ""))
        .filter((i) => i.length > 0 && !i.includes("Source") && !i.includes("Inspired by")),
      instructions: instructions
        .map((i) => i.replace(/^[-•*▪□∙]\s*/, ""))
        .filter((i) => i.length > 0 && !i.includes("Source") && !i.includes("Inspired by")),
    }
  }

  // Function to generate a random category
  const getRandomCategory = (): string => {
    const categories = [
      // Meal types
      "Breakfast",
      "Lunch",
      "Dinner",
      "Appetizers",
      "Snacks",
      "Desserts",

      // Dish types
      "Soups",
      "Salads",
      "Main Dishes",
      "Side Dishes",
      "Pasta",
      "Rice Dishes",
      "Noodles",
      "Breads",
      "Sandwiches",
      "Stews",
      "Curries",
      "Stir-fries",

      // Dietary preferences
      "Vegetarian",
      "Vegan",
      "Gluten-Free",
      "Dairy-Free",
      "Low-Carb",

      // International cuisines
      "Italian",
      "French",
      "Spanish",
      "Mediterranean",
      "Mexican",
      "Thai",
      "Indian",
      "Chinese",
      "Japanese",
      "Korean",
      "Vietnamese",
      "Middle Eastern",
      "Greek",
      "Moroccan",
      "Ethiopian",
      "Caribbean",
      "Brazilian",
      "American",
      "British",

      // Nordic cuisines
      "Swedish",
      "Norwegian",
      "Danish",
      "Finnish",
      "Icelandic",
    ]
    return categories[Math.floor(Math.random() * categories.length)]
  }

  // Function to generate a random prep time
  const generateRandomPrepTime = (): string => {
    const mins = Math.floor(Math.random() * 30) + 5
    return `${mins} mins`
  }

  // Function to generate a random cook time
  const generateRandomCookTime = (): string => {
    const mins = Math.floor(Math.random() * 60) + 10
    return `${mins} mins`
  }

  // Function to generate a random number of servings
  const generateRandomServings = (): number => {
    return Math.floor(Math.random() * 6) + 2
  }

  // Function to create a slug from a title
  const createSlug = (title: string): string => {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text) as RecipeData[]
      setJsonData(data)
      setTotalCount(data.length)
      toast({
        title: "JSON file loaded",
        description: `Found ${data.length} recipes in the file`,
      })
    } catch (error) {
      console.error("Error parsing JSON:", error)
      toast({
        title: "Error parsing JSON",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    if (!jsonData || jsonData.length === 0) {
      toast({
        title: "No data to import",
        description: "Please load a JSON file first",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setProgress(0)
    setImportedCount(0)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < jsonData.length; i++) {
      try {
        const recipe = jsonData[i]

        // Skip if no title or title is too generic
        if (
          !recipe.title ||
          recipe.title.trim() === "" ||
          ["Ingredients", "Instructions", "Xxxx"].includes(recipe.title.trim())
        ) {
          errorCount++
          continue
        }

        const title = recipe.title.trim()
        const content = recipe.content || ""
        const slug = createSlug(title)

        // Extract ingredients and instructions
        const { ingredients, instructions } = extractRecipeDetails(content)

        // Skip if no ingredients or instructions
        if (ingredients.length === 0 && instructions.length === 0) {
          errorCount++
          continue
        }

        // Generate random recipe details
        const category = getRandomCategory()
        const prep_time = generateRandomPrepTime()
        const cook_time = generateRandomCookTime()
        const servings = generateRandomServings()

        // Check if recipe with this slug already exists
        const { data: existingRecipe } = await supabase.from("recipes").select("id").eq("slug", slug).single()

        if (existingRecipe) {
          // Update existing recipe
          const { error } = await supabase
            .from("recipes")
            .update({
              title,
              category,
              prep_time,
              cook_time,
              servings,
              ingredients,
              instructions,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingRecipe.id)

          if (error) throw error
        } else {
          // Create new recipe
          const { error } = await supabase.from("recipes").insert([
            {
              title,
              slug,
              category,
              prep_time,
              cook_time,
              servings,
              ingredients,
              instructions,
              images: [],
              created_at: new Date().toISOString(),
            },
          ])

          if (error) throw error
        }

        successCount++
      } catch (error) {
        console.error(`Error importing recipe #${i + 1}:`, error)
        errorCount++
      }

      setImportedCount(i + 1)
      setProgress(Math.round(((i + 1) / jsonData.length) * 100))
    }

    setIsImporting(false)

    toast({
      title: "Import completed",
      description: `Successfully imported ${successCount} recipes. Failed: ${errorCount}.`,
      variant: successCount > 0 ? "default" : "destructive",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Recipes from JSON</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="json-file" className="block text-sm font-medium">
            Select JSON File
          </label>
          <input
            id="json-file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={isImporting}
            className="w-full border rounded p-2"
          />
        </div>

        {jsonData && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{jsonData.length} recipes found in file</span>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-gray-500 text-right">
                  {importedCount} of {totalCount} imported ({progress}%)
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={isImporting || !jsonData} className="w-full">
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Recipes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
