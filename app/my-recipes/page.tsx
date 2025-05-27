"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import type { Recipe } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl">My Recipes</h1>
          <Button asChild>
            <Link href="/recipes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Recipe
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading your recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 bg-[rgb(var(--light-accent))] p-12">
            <p className="mb-6">You haven't created any recipes yet.</p>
                      <Button asChild size="lg">
            <Link href="/recipes/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Recipe
            </Link>
          </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="border border-gray-100 group">
                <div className="relative">
                  <Link href={`/recipes/${recipe.slug}`}>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Image
                        src={
                          recipe.images && recipe.images.length > 0
                            ? recipe.images[0]
                            : `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(recipe.title)}`
                        }
                        alt={recipe.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </Link>
                  <div className="absolute top-0 right-0 p-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      asChild
                      className="bg-white hover:bg-gray-100 text-gray-600"
                    >
                      <Link href={`/recipes/edit/${recipe.id}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="bg-white hover:bg-gray-100 text-gray-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <Link href={`/recipes/${recipe.slug}`}>
                    <h2 className="text-xl mb-2">{recipe.title}</h2>
                  </Link>
                  <p className="text-sm text-gray-500">{recipe.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
