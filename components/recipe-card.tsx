import Image from "next/image"
import Link from "next/link"
import type { Recipe } from "@/lib/supabase"

interface RecipeCardProps {
  recipe: Recipe
  priority?: boolean
}

export function RecipeCard({ recipe, priority = false }: RecipeCardProps) {
  // Use the first image from the recipe or a placeholder
  const mainImage =
    recipe.images && recipe.images.length > 0
      ? recipe.images[0]
      : `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(recipe.title)}`

  return (
    <Link href={`/recipes/${recipe.slug}`} className="recipe-card block">
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={mainImage || "/placeholder.svg"}
          alt={recipe.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          quality={85}
        />
      </div>
      <div className="text-center mt-4">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{recipe.category}</p>
      </div>
    </Link>
  )
}
