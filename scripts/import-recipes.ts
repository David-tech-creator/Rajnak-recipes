import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import slugify from "slugify"
import fetch from "node-fetch"

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || "https://gsfxgnhsdozktiimdggm.supabase.co"
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZnhnbmhzZG96a3RpaW1kZ2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjExNTUyMywiZXhwIjoyMDU3NjkxNTIzfQ.3VF2J4Ay0FmAm5gzg78_BNI0pWBIdkzxUWIJn1HZM0w"

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Recipe categories to randomly assign
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

  // Nordic cuisines (keeping these as part of the broader collection)
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Icelandic",
]

// Function to download the CSV file
async function downloadCSV(url: string, outputPath: string): Promise<void> {
  console.log(`Downloading CSV from ${url}...`)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`)
    }

    const fileStream = fs.createWriteStream(outputPath)

    await new Promise<void>((resolve, reject) => {
      response.body?.pipe(fileStream)
      response.body?.on("error", reject)
      fileStream.on("finish", () => resolve())
    })

    console.log(`CSV downloaded to ${outputPath}`)
  } catch (error) {
    console.error("Error downloading CSV:", error)
    throw error
  }
}

// Function to parse the CSV file
function parseCSV(filePath: string): any[] {
  console.log(`Parsing CSV file: ${filePath}`)

  try {
    const fileContent = fs.readFileSync(filePath, "utf8")
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    })

    console.log(`Parsed ${records.length} records from CSV`)
    return records
  } catch (error) {
    console.error("Error parsing CSV:", error)
    throw error
  }
}

// Function to extract ingredients and instructions from content
function extractRecipeDetails(content: string): { ingredients: string[]; instructions: string[] } {
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
          .split(/\n|•/)
          .map((i) => i.trim())
          .filter((i) => i.length > 0),
      )

      // Split instructions by line breaks or numbered points
      instructions.push(
        ...instructionsText
          .split(/\n|\d+\./)
          .map((i) => i.trim())
          .filter((i) => i.length > 0),
      )
    } else {
      // Instructions then ingredients
      const instructionsText = content.substring(instructionsStart, ingredientsStart).trim()
      const ingredientsText = content.substring(ingredientsStart).trim()

      ingredients.push(
        ...ingredientsText
          .split(/\n|•/)
          .map((i) => i.trim())
          .filter((i) => i.length > 0),
      )
      instructions.push(
        ...instructionsText
          .split(/\n|\d+\./)
          .map((i) => i.trim())
          .filter((i) => i.length > 0),
      )
    }
  } else if (ingredientsStart !== -1) {
    // Only ingredients section found
    const ingredientsText = content.substring(ingredientsStart).trim()
    ingredients.push(
      ...ingredientsText
        .split(/\n|•/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0),
    )
  } else if (instructionsStart !== -1) {
    // Only instructions section found
    const instructionsText = content.substring(instructionsStart).trim()
    instructions.push(
      ...instructionsText
        .split(/\n|\d+\./)
        .map((i) => i.trim())
        .filter((i) => i.length > 0),
    )
  } else {
    // No clear sections, try to make a best guess
    // Split content by line breaks
    const lines = content
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    // Assume first half are ingredients, second half are instructions
    const midpoint = Math.floor(lines.length / 2)
    ingredients.push(...lines.slice(0, midpoint))
    instructions.push(...lines.slice(midpoint))
  }

  // Clean up ingredients and instructions
  return {
    ingredients: ingredients.map((i) => i.replace(/^[-•*]\s*/, "")).filter((i) => i.length > 0),
    instructions: instructions.map((i) => i.replace(/^[-•*]\s*/, "")).filter((i) => i.length > 0),
  }
}

// Function to generate a random prep time
function generateRandomPrepTime(): string {
  const mins = Math.floor(Math.random() * 30) + 5
  return `${mins} mins`
}

// Function to generate a random cook time
function generateRandomCookTime(): string {
  const mins = Math.floor(Math.random() * 60) + 10
  return `${mins} mins`
}

// Function to generate a random number of servings
function generateRandomServings(): number {
  return Math.floor(Math.random() * 6) + 2
}

// Function to generate a random category
function getRandomCategory(): string {
  return categories[Math.floor(Math.random() * categories.length)]
}

// Function to create a slug from a title
function createSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  })
}

// Function to import recipes to Supabase
async function importRecipesToSupabase(recipes: any[]): Promise<void> {
  console.log(`Importing ${recipes.length} recipes to Supabase...`)

  let successCount = 0
  let errorCount = 0

  for (const [index, recipe] of recipes.entries()) {
    try {
      // Skip if no title
      if (!recipe.title || recipe.title.trim() === "") {
        console.log(`Skipping recipe #${index + 1}: No title`)
        errorCount++
        continue
      }

      const title = recipe.title.trim()
      const content = recipe.content || ""
      const slug = createSlug(title)

      // Extract ingredients and instructions
      const { ingredients, instructions } = extractRecipeDetails(content)

      // Generate random recipe details
      const category = getRandomCategory()
      const prep_time = generateRandomPrepTime()
      const cook_time = generateRandomCookTime()
      const servings = generateRandomServings()

      // Check if recipe with this slug already exists
      const { data: existingRecipe } = await supabase.from("recipes").select("id").eq("slug", slug).single()

      if (existingRecipe) {
        console.log(`Recipe "${title}" already exists with slug "${slug}", updating...`)

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

        if (error) {
          throw error
        }
      } else {
        console.log(`Creating new recipe: "${title}" with slug "${slug}"`)

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

        if (error) {
          throw error
        }
      }

      successCount++
      console.log(`Processed ${successCount + errorCount}/${recipes.length} recipes`)
    } catch (error) {
      console.error(`Error importing recipe #${index + 1}:`, error)
      errorCount++
    }
  }

  console.log(`Import completed: ${successCount} successful, ${errorCount} failed`)
}

// Main function
async function main() {
  try {
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fixed_final_recipes-qSgPO1BGgafpkcFhuWt9ciVHX2YH6z.csv"
    const csvPath = path.join(process.cwd(), "tmp", "recipes.csv")

    // Ensure tmp directory exists
    if (!fs.existsSync(path.join(process.cwd(), "tmp"))) {
      fs.mkdirSync(path.join(process.cwd(), "tmp"))
    }

    // Download CSV
    await downloadCSV(csvUrl, csvPath)

    // Parse CSV
    const recipes = parseCSV(csvPath)

    // Import recipes to Supabase
    await importRecipesToSupabase(recipes)

    console.log("Recipe import process completed successfully!")
  } catch (error) {
    console.error("Error in main process:", error)
  }
}

// Run the main function
main()
