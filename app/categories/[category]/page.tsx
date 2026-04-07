import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getAllCategories, getPostsByCategory } from "@/lib/posts"

// Convert category name to URL slug: "Christmas & Easter" -> "christmas-and-easter"
function categoryToSlug(name: string): string {
  return name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-")
}

// Find category by matching its slug
function findCategoryBySlug(slug: string, categories: string[]): string | undefined {
  return categories.find((c) => categoryToSlug(c) === slug)
}

export function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((category) => ({
    category: categoryToSlug(category),
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const allCategories = getAllCategories()
  const matched = findCategoryBySlug(category, allCategories)

  return {
    title: `${matched || category} Recipes | Rajnax: Dishes We Love`,
    description: `Browse our collection of ${matched || category} recipes`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params

  const allCategories = getAllCategories()
  const matchedCategory = findCategoryBySlug(category, allCategories)

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
                  src={recipe.image || "/images/recipes/placeholder.svg"}
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
