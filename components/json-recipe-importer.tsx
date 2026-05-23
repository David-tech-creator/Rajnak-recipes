"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
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
    <div className="space-y-5">
      <div>
        <label
          htmlFor="json-file"
          className="block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
        >
          Select JSON file
        </label>
        <div className="border-2 border-dotted border-rule p-6 text-center bg-cream/60">
          <input
            id="json-file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={isImporting}
            className="block w-full font-serif text-[15px] text-ink-soft file:mr-4 file:border file:border-ink file:bg-cream file:px-4 file:py-2 file:font-serif-sc file:uppercase file:tracking-[0.22em] file:text-[10px] file:text-ink hover:file:bg-ink hover:file:text-cream file:cursor-pointer"
          />
        </div>
      </div>

      {jsonData && (
        <div className="bg-cream border border-rule-soft p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted">
              <span className="num">{jsonData.length}</span> recipes found
            </span>
          </div>

          {isImporting && (
            <div className="space-y-2 mt-3">
              <div className="h-[2px] bg-rule-soft overflow-hidden">
                <div
                  className="h-full bg-ink transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-right font-serif italic text-ink-muted text-[14px]">
                <span className="num">{importedCount}</span> of{" "}
                <span className="num">{totalCount}</span> imported (
                <span className="num">{progress}%</span>)
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleImport}
        disabled={isImporting || !jsonData}
        className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isImporting ? "Importing…" : "Import recipes"}
      </button>
    </div>
  )
}
