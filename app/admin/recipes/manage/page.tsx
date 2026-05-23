"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import { SprigDivider } from "@/components/sprig-divider"

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
    if (!confirm("Are you sure you want to delete this recipe?")) return

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
      <div className="container mx-auto px-6 py-24 text-center">
        <p className="font-serif italic text-ink-muted text-lg">Loading…</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Administration</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Recipe <em className="italic" style={{ color: "var(--lingon-deep)" }}>ledger</em>
        </h1>
        <p className="lede">Every recipe in the book, in the order they were added.</p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      {recipes.length === 0 ? (
        <div className="max-w-2xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-12 text-center">
          <p className="font-serif italic text-ink-soft text-lg">No recipes yet.</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink">
                <th className="text-left py-3 font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted font-normal">
                  Title
                </th>
                <th className="text-left py-3 font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted font-normal hidden sm:table-cell">
                  Added
                </th>
                <th className="text-right py-3 font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted font-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-dotted border-rule text-ink-soft">
                  <td className="py-4 font-serif text-ink text-[18px]">{recipe.title}</td>
                  <td className="py-4 font-serif italic text-ink-muted text-[15px] hidden sm:table-cell num">
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-5">
                      <button
                        onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                        className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink hover:text-lingon-deep underline decoration-1 underline-offset-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-lingon hover:text-lingon-deep underline decoration-1 underline-offset-4"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
