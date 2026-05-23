"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RecipeEditor } from "@/components/recipe-editor"
import { SprigDivider } from "@/components/sprig-divider"
import { supabase } from "@/lib/supabase"
import type { Recipe } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EditRecipePage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const recipeId = params.id as string

  useEffect(() => {
    async function fetchRecipe() {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("recipes").select("*").eq("id", recipeId).single()

        if (error) throw error

        if (!data) {
          toast({
            title: "Recipe not found",
            description: "The recipe you're trying to edit doesn't exist.",
            variant: "destructive",
          })
          router.push("/admin/recipes")
          return
        }

        setRecipe(data as Recipe)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch recipe",
          variant: "destructive",
        })
        router.push("/admin/recipes")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecipe()
  }, [recipeId, user, router, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="eyebrow eyebrow--lingon">Edit recipe</div>
          <h1 className="editorial-h1 mt-3 mb-4 font-normal">
            Fetching the <em className="italic" style={{ color: "var(--lingon-deep)" }}>page</em>…
          </h1>
          <SprigDivider variant="berry" className="!mt-10 !mb-8 max-w-sm mx-auto" />
          <div className="flex items-center justify-center gap-3 font-serif italic text-ink-muted text-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading recipe…</span>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return null
  }

  return <RecipeEditor recipe={recipe} isEditing />
}
