"use client"

import { useEffect, useState } from "react"
import { supabase, sampleRecipes, type Recipe } from "@/lib/supabase"
import { RecipeCard } from "@/components/recipe-card"

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
