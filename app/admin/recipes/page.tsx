"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Edit } from "lucide-react"
import { supabase } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"

interface Recipe {
  id: string
  title: string
  created_at: string
  user_id: string
}

export default function ManageRecipesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    async function fetchRecipes() {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setRecipes(data || [])
      } catch (error) {
        console.error('Error fetching recipes:', error)
        toast({
          title: 'Error',
          description: 'Failed to load recipes',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchRecipes()
    }
  }, [user, loading, router, toast])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRecipes(recipes.filter(recipe => recipe.id !== id))
      toast({
        title: 'Success',
        description: 'Recipe deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting recipe:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete recipe',
        variant: 'destructive'
      })
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Recipes</h1>
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{recipe.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(recipe.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(recipe.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
