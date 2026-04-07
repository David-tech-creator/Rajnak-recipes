import { getAllPosts, getAllCategories } from "@/lib/posts"
import Image from "next/image"
import Link from "next/link"

export default function RecipesPage() {
  const recipes = getAllPosts()
  const categories = getAllCategories()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl text-center mb-2">All Recipes</h1>
        <p className="text-gray-600 text-center">Rajnak Family, Friends and Found Recipes</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/categories/${category.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-")}`}
            className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
          >
            {category}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe) => (
          <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="recipe-card block">
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src={recipe.image || "/images/recipes/placeholder.svg"}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <h3 className="recipe-card-title">{recipe.title}</h3>
            <p className="text-sm text-gray-500 px-4 pb-4">{recipe.category}</p>
          </Link>
        ))}
      </div>
    </div>
  )
} 