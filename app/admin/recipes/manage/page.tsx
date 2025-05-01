import Link from "next/link"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, ImageIcon } from "lucide-react"
import { redirect } from "next/navigation"

export default async function ManageRecipesPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/admin/recipes/manage")
  }

  // Fetch recipes
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, slug, category, images, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching recipes:", error)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Recipes</h1>
        <Button asChild>
          <Link href="/recipes/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Recipe
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes && recipes.length > 0 ? (
          recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden flex flex-col">
              <div className="relative aspect-video w-full overflow-hidden">
                {recipe.images && recipe.images.length > 0 ? (
                  <Image
                    src={recipe.images[0] || "/placeholder.svg"}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{recipe.category}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {recipe.images?.length || 0} image{recipe.images?.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/recipes/edit/${recipe.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/recipes/${recipe.slug}`} target="_blank">
                    View
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No recipes found. Create your first recipe to get started.</p>
            <Button asChild>
              <Link href="/recipes/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Recipe
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
