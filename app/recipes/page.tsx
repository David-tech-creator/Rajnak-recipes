import { getAllPosts, getAllCategories, categoryToSlug } from "@/lib/posts"
import { RecipesGrid } from "./recipes-grid"

export const metadata = {
  title: "All Recipes | Rajnax: Dishes We Love",
}

export default function RecipesPage() {
  const recipes = getAllPosts()
  const categories = getAllCategories()

  // Strip the heavy body content before passing to the client component.
  const lite = recipes.map((r) => ({
    slug: r.slug,
    title: r.title,
    category: r.category,
    image: r.image,
    ingredients: r.ingredients ?? [],
  }))

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl text-center mb-2">All Recipes</h1>
        <p className="text-gray-600 text-center">
          {recipes.length} Rajnak family, friends, and found recipes
        </p>
      </div>

      <RecipesGrid
        recipes={lite}
        categories={categories.map((c) => ({ name: c, slug: categoryToSlug(c) }))}
      />
    </div>
  )
}
