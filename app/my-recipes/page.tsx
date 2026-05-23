"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import type { Recipe } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { SprigDivider } from "@/components/sprig-divider"

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchUserRecipes() {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setRecipes(data || [])
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch your recipes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRecipes()
  }, [user, router, toast])

  const handleDeleteRecipe = async (id: number) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    try {
      const { error } = await supabase.from("recipes").delete().eq("id", id).eq("user_id", user?.id)

      if (error) throw error

      setRecipes(recipes.filter((recipe) => recipe.id !== id))

      toast({
        title: "Recipe deleted",
        description: "Your recipe has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete recipe",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Your kitchen</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          My <em className="italic" style={{ color: "var(--lingon-deep)" }}>recipes</em>
        </h1>
        <p className="lede">The dishes you&rsquo;ve contributed to the family cookbook.</p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />

        <div className="mt-8">
          <Link href="/recipes/new" className="btn">
            Add a new recipe
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="font-serif italic text-ink-muted text-lg">Loading your recipes…</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="max-w-2xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-12 text-center">
          <p className="font-serif italic text-ink-soft text-lg mb-6">
            You haven&rsquo;t added any recipes yet.
          </p>
          <Link href="/recipes/new" className="btn">
            Create your first recipe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="flex flex-col">
              <Link href={`/recipes/${recipe.slug}`} className="recipe-card block">
                <div className="aspect-[4/5] relative overflow-hidden bg-parchment-deep">
                  <Image
                    src={
                      recipe.images && recipe.images.length > 0
                        ? recipe.images[0]
                        : `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(recipe.title)}`
                    }
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

              <div className="flex justify-center gap-6 pt-3 border-t border-dotted border-rule">
                <Link
                  href={`/recipes/edit/${recipe.id}`}
                  className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink hover:text-lingon-deep underline decoration-1 underline-offset-4"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-lingon hover:text-lingon-deep underline decoration-1 underline-offset-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
