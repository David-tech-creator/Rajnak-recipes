import Image from "next/image"
import Link from "next/link"
import { getRecipes } from "@/lib/supabase"

export default async function Home() {
  const allRecipes = await getRecipes()
  // Get featured recipes (first 3) and latest recipes (first 6)
  const featuredRecipes = allRecipes.slice(0, 3)
  const latestRecipes = allRecipes.slice(0, 6)

  return (
    <div>
      {/* Hero Section with Logo */}
      <section className="relative h-[70vh] flex items-center justify-center">
        <Image
          src="/images/nordic-dining.png"
          alt="Nordic dining scene with woman setting a table"
          fill
          className="object-cover"
          priority
        />
        <div className="hero-overlay">
          <h1 className="text-4xl md:text-5xl mb-4">Recipe Collection</h1>
          <p className="text-gray-600">A collection of recipes from around the world</p>
        </div>
      </section>

      {/* Category Boxes */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/recipes" className="category-box aspect-square relative block">
              <Image
                src="/placeholder.svg?height=400&width=400&text=Recipes"
                alt="Recipes"
                fill
                className="object-cover"
              />
              <div className="category-box-label">Recipes</div>
            </Link>
            <Link href="/categories" className="category-box aspect-square relative block">
              <Image
                src="/placeholder.svg?height=400&width=400&text=Categories"
                alt="Categories"
                fill
                className="object-cover"
              />
              <div className="category-box-label">Categories</div>
            </Link>
            <Link href="/about" className="category-box aspect-square relative block">
              <Image src="/placeholder.svg?height=400&width=400&text=About" alt="About" fill className="object-cover" />
              <div className="category-box-label">About</div>
            </Link>
            <Link href="/my-recipes" className="category-box aspect-square relative block">
              <Image
                src="/placeholder.svg?height=400&width=400&text=My+Recipes"
                alt="My Recipes"
                fill
                className="object-cover"
              />
              <div className="category-box-label">My Recipes</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      {featuredRecipes.length > 0 && (
        <section className="py-16 bg-[rgb(var(--light-accent))]">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl mb-12">Featured Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRecipes.map((recipe) => (
                <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="recipe-card block">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={recipe.images?.[0] || "/placeholder.svg?height=400&width=600&text=Recipe"}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="recipe-card-title">{recipe.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Recipes */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl mb-12">Latest Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestRecipes.map((recipe) => (
              <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="recipe-card block">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={recipe.images?.[0] || "/placeholder.svg?height=400&width=600&text=Recipe"}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="recipe-card-title">{recipe.title}</h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/recipes"
              className="inline-block border border-gray-300 px-6 py-3 sans-serif text-sm hover:bg-gray-50 transition-colors"
            >
              View All Recipes
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
