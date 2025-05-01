import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { saveRecipe } from "@/lib/recipe-extractor"
import type { ExtractedRecipe } from "@/lib/recipe-extractor"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const recipe: ExtractedRecipe = await request.json()

    // Validate recipe data
    if (!recipe.title) {
      return NextResponse.json({ message: "Recipe title is required" }, { status: 400 })
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return NextResponse.json({ message: "Recipe ingredients are required" }, { status: 400 })
    }

    if (!recipe.instructions || recipe.instructions.length === 0) {
      return NextResponse.json({ message: "Recipe instructions are required" }, { status: 400 })
    }

    // Save recipe to database
    const result = await saveRecipe(recipe, session.user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in recipes API:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
