"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { supabase, sampleRecipes, type Recipe } from "@/lib/supabase"

export function ClientRecipeGrid() {
  const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const { data, error } = await supabase.from("recipes").select("*").order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching recipes on client:", error)
          return
        }

        if (data && data.length > 0) {
          setRecipes(data as Recipe[])
        }
      } catch (error) {
        console.error("Error in client-side recipe fetch:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  if (loading && recipes.length === 0) {
    return (
      <p className="text-center font-serif italic text-ink-muted py-12">Loading recipes…</p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {recipes.map((recipe) => {
        const mainImage =
          recipe.images && recipe.images.length > 0
            ? recipe.images[0]
            : `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(recipe.title)}`

        return (
          <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="recipe-card block">
            <div className="aspect-[4/5] relative overflow-hidden">
              <Image
                src={mainImage}
                alt={recipe.title}
                fill
                className="object-cover"
                style={{ filter: "saturate(0.92)" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="py-5 text-center">
              <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted mb-1">
                {recipe.category}
              </div>
              <h3 className="recipe-card-title">{recipe.title}</h3>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
