import { getPostBySlug, getAllPostSlugs, getPostsByCategory } from "@/lib/posts"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MDXRemote } from "next-mdx-remote/rsc"
import { Clock, Users, Printer } from "lucide-react"

// Modify the generateStaticParams function to exclude "new"
export async function generateStaticParams() {
  const posts = getAllPostSlugs()
  // Filter out any slug that might be "new" to avoid conflicts
  return posts.filter((post) => post.params.slug !== "new")
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recipe = getPostBySlug(slug)

  if (!recipe) {
    return {
      title: "Recipe Not Found",
      description: "The requested recipe could not be found",
    }
  }

  return {
    title: `${recipe.title} | Goda Favoriter`,
    description: `${recipe.title} - A delicious ${recipe.category} recipe`,
  }
}

// Modify the page component to check for reserved slugs
export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // List of reserved slugs that should not be treated as recipe slugs
  const reservedSlugs = ["new", "edit", "create"]

  // If the slug is reserved, show a 404 page
  if (reservedSlugs.includes(slug)) {
    notFound()
  }

  const recipe = getPostBySlug(slug)

  if (!recipe) {
    notFound()
  }

  // Get related recipes
  const relatedRecipes = getPostsByCategory(recipe.category)
    .filter((post) => post.slug !== slug)
    .slice(0, 3)

  return (
    <div>
      {/* Hero Image with Logo */}
      <div className="relative h-[50vh]">
        <Image
          src={recipe.image || "/placeholder.svg?height=600&width=1200&text=Recipe"}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          {/* Recipe title */}
          <h1 className="text-4xl text-center mb-4">{recipe.title}</h1>

          {/* Recipe meta */}
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {recipe.prepTime && `Prep: ${recipe.prepTime}`}
                {recipe.cookTime && recipe.prepTime && " | "}
                {recipe.cookTime && `Cook: ${recipe.cookTime}`}
              </span>
            </div>
            {recipe.servings && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>Serves: {recipe.servings}</span>
              </div>
            )}
            <button className="flex items-center hover:text-gray-700">
              <Printer className="h-4 w-4 mr-1" />
              <span>Print</span>
            </button>
          </div>

          {/* Recipe intro */}
          {recipe.content && (
            <div className="prose max-w-none mb-12 text-center">
              <MDXRemote source={recipe.content} />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Ingredients */}
            <div className="bg-[rgb(var(--light-accent))] p-8">
              <h2 className="text-2xl mb-6 text-center">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-2.5 flex-shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-2xl mb-6 text-center">Instructions</h2>
              <ol className="space-y-6">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-serif text-xl text-gray-400">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </article>

        {/* Related recipes */}
        {relatedRecipes.length > 0 && (
          <div className="mt-16 border-t pt-16">
            <h2 className="text-center text-3xl mb-12">You Might Also Like</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedRecipes.map((related) => (
                <Link key={related.slug} href={`/recipes/${related.slug}`} className="recipe-card block">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={related.image || "/placeholder.svg?height=400&width=600&text=Recipe"}
                      alt={related.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <h3 className="recipe-card-title">{related.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
