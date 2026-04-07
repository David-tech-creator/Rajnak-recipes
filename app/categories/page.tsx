import Link from "next/link"
import Image from "next/image"
import { getAllCategories, getPostsByCategory, getAllPosts } from "@/lib/posts"

export default function CategoriesPage() {
  const categories = getAllCategories()
  const allRecipes = getAllPosts()

  // Get first recipe image for each category as a cover
  const categoryData = categories.map((category) => {
    const recipes = getPostsByCategory(category)
    const coverImage = recipes.find((r) => r.image)?.image
    return {
      name: category,
      count: recipes.length,
      coverImage,
    }
  })

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl text-center mb-4">Recipe Categories</h1>
      <p className="text-center text-gray-500 mb-12">{allRecipes.length} recipes in total</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoryData.map((category) => (
          <Link
            key={category.name}
            href={`/categories/${encodeURIComponent(category.name.toLowerCase())}`}
            className="recipe-card block"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={category.coverImage || "/placeholder.svg?height=400&width=600&text=Recipes"}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="category-box-label">{category.name}</div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">{category.count} recipes</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
