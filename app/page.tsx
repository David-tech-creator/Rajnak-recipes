import Image from "next/image"
import Link from "next/link"
import { getFeaturedPosts, getLatestPosts, getAllPosts } from "@/lib/posts"

export default function Home() {
  const featuredRecipes = getFeaturedPosts(3)
  const latestRecipes = getLatestPosts(9)
  const totalCount = getAllPosts().length

  return (
    <div>
      {/* Hero Section with Logo */}
      <section className="relative h-[70vh] flex items-center justify-center">
        <Image
          src="/images/nordic-dining.png"
          alt="Rajnak family dining"
          fill
          className="object-cover"
          priority
        />
        <div className="hero-overlay">
          <h1 className="text-4xl md:text-5xl mb-4">Rajnax: Dishes We Love</h1>
          <p className="text-gray-600">Family, Friends and Found Recipes &middot; {totalCount} recipes</p>
        </div>
      </section>

      {/* Category Boxes - use actual recipe images */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/recipes" className="category-box aspect-square relative block overflow-hidden">
              <Image
                src="/images/recipes/fillet-of-beef-gorgonzola.jpg"
                alt="All Recipes"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="category-box-label">All Recipes</div>
            </Link>
            <Link href="/categories/family-recipes" className="category-box aspect-square relative block overflow-hidden">
              <Image
                src="/images/recipes/mammas-gulasch-soup.jpg"
                alt="Family Recipes"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="category-box-label">Family Recipes</div>
            </Link>
            <Link href="/categories/christmas-and-easter" className="category-box aspect-square relative block overflow-hidden">
              <Image
                src="/images/recipes/christmas-dinner-1.jpg"
                alt="Christmas & Easter"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="category-box-label">Christmas & Easter</div>
            </Link>
            <Link href="/categories/quick-and-easy" className="category-box aspect-square relative block overflow-hidden">
              <Image
                src="/images/recipes/chicken-vegetable-wok.jpg"
                alt="Quick & Easy"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="category-box-label">Quick & Easy</div>
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
                    src={recipe.image || "/placeholder.svg?height=400&width=600&text=Recipe"}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              View All {totalCount} Recipes
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
