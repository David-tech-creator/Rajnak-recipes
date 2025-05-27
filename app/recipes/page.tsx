import { Suspense } from "react"
import { getRecipes } from "@/lib/supabase"
import { RecipeGrid } from "@/components/recipe-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function RecipesPage() {
  const recipes = await getRecipes()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">All Recipes</h1>
          <p className="text-gray-600">Discover delicious recipes from around the world</p>
        </div>
        <Button asChild>
          <Link href="/recipes/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Recipe
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading recipes...</div>}>
        <RecipeGrid recipes={recipes} />
      </Suspense>

      {recipes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No recipes found. Be the first to add one!</p>
          <Button asChild>
            <Link href="/recipes/new">
              <Plus className="mr-2 h-4 w-4" />
              Create First Recipe
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
} 