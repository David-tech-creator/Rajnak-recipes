import { supabase } from "./supabase"
import slugify from "slugify"

export interface ExtractedRecipe {
  title: string
  slug?: string
  description?: string
  prep_time?: string
  cook_time?: string
  servings?: number
  ingredients: string[]
  instructions: string[]
  notes?: string
  category?: string
  images?: string[]
}

export async function saveRecipe(recipe: ExtractedRecipe, userId: string): Promise<{ id: number; slug: string }> {
  try {
    // Generate slug if not provided
    if (!recipe.slug) {
      recipe.slug = slugify(recipe.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      })
    }

    // Check if recipe with this slug already exists
    const { data: existingRecipe } = await supabase.from("recipes").select("id, slug").eq("slug", recipe.slug).single()

    if (existingRecipe) {
      // Modify slug to make it unique
      const timestamp = new Date().getTime().toString().slice(-4)
      recipe.slug = `${recipe.slug}-${timestamp}`
    }

    // Insert recipe into database
    const { data, error } = await supabase
      .from("recipes")
      .insert([
        {
          title: recipe.title,
          slug: recipe.slug,
          category: recipe.category || "Uncategorized",
          prep_time: recipe.prep_time || null,
          cook_time: recipe.cook_time || null,
          servings: recipe.servings || null,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          notes: recipe.notes || null,
          images: recipe.images || [],
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select("id, slug")

    if (error) {
      throw error
    }

    return data[0]
  } catch (error) {
    console.error("Error in saveRecipe:", error)
    throw error
  }
}
