import { createClient } from "@supabase/supabase-js"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supabase configuration
const SUPABASE_URL = "https://gsfxgnhsdozktiimdggm.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZnhnbmhzZG96a3RpaW1kZ2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjExNTUyMywiZXhwIjoyMDU3NjkxNTIzfQ.3VF2J4Ay0FmAm5gzg78_BNI0pWBIdkzxUWIJn1HZM0w"

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Function to clean up image filenames to create potential recipe slugs
function createSlugFromFilename(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.\w+$/, "")

  // Remove numbers at the end (like _1, _2)
  const nameWithoutNumbers = nameWithoutExt.replace(/_\d+$/, "")

  // Replace underscores with spaces
  const nameWithSpaces = nameWithoutNumbers.replace(/_/g, " ")

  // Create slug - lowercase, replace spaces with hyphens
  const slug = nameWithSpaces.trim().toLowerCase().replace(/\s+/g, "-")

  return slug
}

// Function to normalize text for comparison
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // Remove all non-alphanumeric characters
    .trim()
}

// Function to get all image files from the directory
async function getImageFiles(directory) {
  try {
    const files = await fs.readdir(directory)
    return files.filter((file) => file.endsWith(".jpeg") || file.endsWith(".jpg") || file.endsWith(".png"))
  } catch (error) {
    console.error("Error reading directory:", error)
    return []
  }
}

// Function to ensure directory exists
async function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath)
  try {
    await fs.access(dir)
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  }
}

// Function to update recipe images in Supabase
async function updateRecipeImages(imageFiles, publicPath) {
  console.log(`Processing ${imageFiles.length} image files...`)

  // Get all recipes from Supabase
  const { data: recipes, error } = await supabase.from("recipes").select("id, title, slug")

  if (error) {
    console.error("Error fetching recipes:", error)
    return
  }

  console.log(`Found ${recipes.length} recipes in database`)

  // Create a mapping of normalized image names
  const imageMap = {}

  imageFiles.forEach((file) => {
    // Create multiple variations of the filename for matching
    const filenameWithoutExt = file.replace(/\.\w+$/, "")
    const normalizedName = normalizeText(filenameWithoutExt)

    if (!imageMap[normalizedName]) {
      imageMap[normalizedName] = []
    }
    imageMap[normalizedName].push(file)

    // Also add without the numbers at the end
    const nameWithoutNumbers = filenameWithoutExt.replace(/_\d+$/, "")
    const normalizedNameNoNumbers = normalizeText(nameWithoutNumbers)

    if (normalizedNameNoNumbers !== normalizedName) {
      if (!imageMap[normalizedNameNoNumbers]) {
        imageMap[normalizedNameNoNumbers] = []
      }
      imageMap[normalizedNameNoNumbers].push(file)
    }
  })

  // Track matches and misses
  let matchCount = 0
  let missCount = 0

  // Update each recipe with matching images
  for (const recipe of recipes) {
    const slug = recipe.slug
    const title = recipe.title

    // Normalize the title and slug for comparison
    const normalizedTitle = normalizeText(title)
    const normalizedSlug = normalizeText(slug)

    // Try to find images that match this recipe
    let matchedImages = []

    // Check for direct matches
    if (imageMap[normalizedTitle]) {
      matchedImages = [...matchedImages, ...imageMap[normalizedTitle]]
    }

    if (imageMap[normalizedSlug]) {
      matchedImages = [...matchedImages, ...imageMap[normalizedSlug]]
    }

    // If no direct match, try to find partial matches
    if (matchedImages.length === 0) {
      // Try matching with parts of the title
      const titleWords = title
        .split(" ")
        .filter((word) => word.length > 3)
        .map((word) => normalizeText(word))

      for (const word of titleWords) {
        for (const [imgName, files] of Object.entries(imageMap)) {
          if (imgName.includes(word) || word.includes(imgName)) {
            matchedImages = [...matchedImages, ...files]
          }
        }
      }

      // Try fuzzy matching by checking if any image name contains parts of the recipe title
      if (matchedImages.length === 0) {
        for (const [imgName, files] of Object.entries(imageMap)) {
          // Check if at least 60% of the characters in the image name are in the title
          // or vice versa
          const overlap = [...imgName].filter((char) => normalizedTitle.includes(char)).length
          const overlapRatio = overlap / imgName.length

          if (overlapRatio > 0.6 || normalizedTitle.includes(imgName) || imgName.includes(normalizedTitle)) {
            matchedImages = [...matchedImages, ...files]
          }
        }
      }
    }

    // Remove duplicates
    matchedImages = [...new Set(matchedImages)]

    if (matchedImages.length > 0) {
      // Create full URLs for the images
      const imageUrls = matchedImages.map((file) => `/recipe-images/${file}`)

      // Update the recipe in Supabase
      const { error: updateError } = await supabase.from("recipes").update({ images: imageUrls }).eq("id", recipe.id)

      if (updateError) {
        console.error(`Error updating recipe ${recipe.title}:`, updateError)
      } else {
        console.log(`✅ Updated recipe "${recipe.title}" with ${imageUrls.length} images`)
        matchCount++
      }
    } else {
      console.log(`❌ No matching images found for recipe "${recipe.title}" (slug: ${recipe.slug})`)
      missCount++
    }
  }

  console.log(`\nSummary:`)
  console.log(`- ${matchCount} recipes updated with images`)
  console.log(`- ${missCount} recipes without matching images`)
}

// Generate a JavaScript file with image mappings for frontend use
async function generateImageMappingFile(imageFiles, outputPath) {
  // Ensure the directory exists
  await ensureDirectoryExists(outputPath)

  const mappings = {}

  imageFiles.forEach((file) => {
    const slug = createSlugFromFilename(file)
    if (!mappings[slug]) {
      mappings[slug] = []
    }
    mappings[slug].push(`/recipe-images/${file}`)
  })

  const fileContent = `// Auto-generated recipe image mappings
export const recipeImages = ${JSON.stringify(mappings, null, 2)};

export function getRecipeImages(slug) {
  return recipeImages[slug] || ['/placeholder.svg?height=400&width=600'];
}
`

  await fs.writeFile(outputPath, fileContent)
  console.log(`Image mapping file generated at ${outputPath}`)
}

// Main function
async function main() {
  try {
    // Path to your recipe images directory - use absolute path
    const imageDirectory = path.resolve(process.cwd(), "public/recipe-images")
    console.log(`Looking for images in: ${imageDirectory}`)

    // Get all image files
    const imageFiles = await getImageFiles(imageDirectory)
    console.log(`Found ${imageFiles.length} image files`)

    // Update recipe images in Supabase
    await updateRecipeImages(imageFiles, "/recipe-images")

    // Generate image mapping file for frontend use - use absolute path
    const outputPath = path.resolve(process.cwd(), "lib/recipe-images.js")
    await generateImageMappingFile(imageFiles, outputPath)

    console.log("Process completed successfully!")
  } catch (error) {
    console.error("Error in main process:", error)
  }
}

// Run the main function
main()
