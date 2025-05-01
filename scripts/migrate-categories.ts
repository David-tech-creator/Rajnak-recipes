import { createClient } from "@supabase/supabase-js"
import { ALL_CATEGORIES } from "../lib/categories"

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || "https://gsfxgnhsdozktiimdggm.supabase.co"
const supabaseKey = process.env.SUPABASE_KEY || "your-service-role-key"

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Map old categories to new ones
const categoryMapping: Record<string, string> = {
  // Add mappings here as needed
  Desserts: "Desserts & Cakes",
  Appetizers: "Family & Found Recipes",
  Sides: "Side Dishes & Sauces",
  "Main Dishes": "Family & Found Recipes",
  Breakfast: "Breakfasts & Porridges",
  Lunch: "Quick & Easy Food",
  Dinner: "Family & Found Recipes",
  Salads: "Vegetarian & Vegan",
  Pasta: "Pasta & Noodle Dishes",
  Soups: "Soups & Stews",
  Italian: "Pasta & Noodle Dishes",
  Mexican: "Family & Found Recipes",
  Asian: "Asian & Fusion",
  Seafood: "Fish & Seafood",
  Vegetarian: "Vegetarian & Vegan",
  Vegan: "Vegetarian & Vegan",
  Chicken: "Chicken Dishes",
  Beef: "Meat Dishes",
  Pork: "Meat Dishes",
  Lamb: "Meat Dishes",
  Sandwiches: "Sandwiches & Brunch Items",
  Brunch: "Sandwiches & Brunch Items",
  Grill: "Grill Dishes & Summer Plates",
  BBQ: "Grill Dishes & Summer Plates",
  Holiday: "Holiday & Celebration Dishes",
  Christmas: "Holiday & Celebration Dishes",
  Easter: "Holiday & Celebration Dishes",
  Swedish: "Family & Found Recipes",
  Quick: "Quick & Easy Food",
  Easy: "Quick & Easy Food",
}

// Function to get the best matching category
function getBestMatchingCategory(oldCategory: string): string {
  // Direct mapping
  if (categoryMapping[oldCategory]) {
    return categoryMapping[oldCategory]
  }

  // Check if it's already a valid category
  if (ALL_CATEGORIES.includes(oldCategory)) {
    return oldCategory
  }

  // Default fallback
  return "Family & Found Recipes"
}

// Main migration function
async function migrateCategories() {
  console.log("Starting category migration...")

  try {
    // Get all recipes
    const { data: recipes, error } = await supabase.from("recipes").select("id, title, category")

    if (error) {
      throw error
    }

    console.log(`Found ${recipes.length} recipes to process`)

    let updatedCount = 0
    let skippedCount = 0

    // Process each recipe
    for (const recipe of recipes) {
      const oldCategory = recipe.category
      const newCategory = getBestMatchingCategory(oldCategory)

      // Skip if category is already valid or unchanged
      if (oldCategory === newCategory) {
        console.log(`Skipping "${recipe.title}" - category "${oldCategory}" is already valid`)
        skippedCount++
        continue
      }

      // Update the recipe with the new category
      const { error: updateError } = await supabase
        .from("recipes")
        .update({ category: newCategory })
        .eq("id", recipe.id)

      if (updateError) {
        console.error(`Error updating recipe ${recipe.id}:`, updateError)
        continue
      }

      console.log(`Updated "${recipe.title}" from "${oldCategory}" to "${newCategory}"`)
      updatedCount++
    }

    console.log(`Migration completed: ${updatedCount} recipes updated, ${skippedCount} recipes skipped`)
  } catch (error) {
    console.error("Error in migration:", error)
  }
}

// Run the migration
migrateCategories()
