import type { Recipe } from "@/lib/supabase"
import { getRecipesByCategory } from "@/lib/supabase"
import { RecipeGrid } from "@/components/recipe-grid"

interface RelatedRecipesProps {
  currentRecipe: Recipe
}

export async function RelatedRecipes({ currentRecipe }: RelatedRecipesProps) {
  const recipes = await getRecipesByCategory(currentRecipe.category)

  // Filter out the current recipe and limit to 3 related recipes
  const relatedRecipes = recipes.filter((recipe) => recipe.id !== currentRecipe.id).slice(0, 3)

  if (relatedRecipes.length === 0) {
    return null
  }

  return <RecipeGrid recipes={relatedRecipes} />
}
