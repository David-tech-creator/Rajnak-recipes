import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getAllCategories, getPostsByCategory } from "@/lib/posts"

export function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((category) => ({
    category: encodeURIComponent(category.toLowerCase()),
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)

  return {
    title: `${decodedCategory} Recipes | Rajnax: Dishes We Love`,
    description: `Browse our collection of ${decodedCategory} recipes`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)

  // Find recipes matching this category (case-insensitive)
  const allCategories = getAllCategories()
  const matchedCategory = allCategories.find(
    (c) => c.toLowerCase() === decodedCategory.toLowerCase()
  )

  if (!matchedCategory) {
    notFound()
  }

  const recipes = getPostsByCategory(matchedCategory)

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl text-center mb-4">{matchedCategory}</h1>
      <p className="text-center text-gray-500 mb-12">{recipes.length} recipes</p>

      {recipes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="recipe-card block">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={recipe.image || "/placeholder.svg?height=400&width=600&text=Recipe"}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="recipe-card-title">{recipe.title}</h3>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No recipes found in this category yet.</p>
        </div>
      )}

      <div className="text-center mt-12">
        <Link
          href="/categories"
          className="inline-block border border-gray-300 px-6 py-3 text-sm hover:bg-gray-50 transition-colors"
        >
          All Categories
        </Link>
      </div>
    </div>
  )
}
