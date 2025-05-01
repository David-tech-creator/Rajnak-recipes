"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Clock, Users } from "lucide-react"
import type { Recipe } from "../lib/supabase"
import { formatTimeString, imageSizes } from "../lib/image-utils"
import { Skeleton } from "@/components/ui/skeleton"

interface RecipeCardProps {
  recipe: Recipe
  priority?: boolean
}

export function RecipeCard({ recipe, priority = false }: RecipeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Use the first image from the recipe or a placeholder
  const mainImage =
    recipe.images && recipe.images.length > 0
      ? recipe.images[0]
      : `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(recipe.title)}`

  return (
    <div className="group rounded-xl overflow-hidden bg-card border shadow-sm hover:shadow-md transition-all duration-300">
      <Link href={`/recipes/${recipe.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {!imageLoaded && <Skeleton className="absolute inset-0 z-10" />}
          <Image
            src={mainImage || "/placeholder.svg"}
            alt={recipe.title}
            fill
            sizes={imageSizes.thumbnail}
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
            priority={priority}
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-sm font-medium">Visa Recept</p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {recipe.title}
            </h3>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{recipe.category}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
            {recipe.prep_time && (
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{formatTimeString(recipe.prep_time)}</span>
              </div>
            )}

            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>
                  {recipe.servings} {recipe.servings === 1 ? "portion" : "portioner"}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
