import type { Recipe } from "@/lib/supabase"
import { RecipeCard } from "./recipe-card"

interface RecipeGridProps {
  recipes: Recipe[]
  title?: string
}

export function RecipeGrid({ recipes, title }: RecipeGridProps) {
  return (
    <div className="py-6">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
