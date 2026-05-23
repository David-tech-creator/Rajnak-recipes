import { notFound } from "next/navigation"
import Link from "next/link"
import { getAllCategories, getPostsByCategory, categoryToSlug, getAllPosts, defaultBylineFor } from "@/lib/posts"
import { SprigDivider } from "@/components/sprig-divider"
import { RecipeCard } from "@/components/recipe-card"

function findCategoryBySlug(slug: string, categories: string[]): string | undefined {
  return categories.find((c) => categoryToSlug(c) === slug)
}

function categoryHandNote(name: string): string {
  switch (name) {
    case "Family Recipes":
      return "The dishes we grew up on."
    case "Found Recipes":
      return "Picked up along the way."
    case "Quick & Easy":
      return "For busy weeknights."
    case "Christmas & Easter":
      return "For the holiday table."
    default:
      return "Smaklig måltid."
  }
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
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <div className="eyebrow eyebrow--lingon">Category</div>
        <h1 className="editorial-h1 mt-3 mb-3 font-normal">{matchedCategory}</h1>
        <p className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted">
          {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
        </p>
        <p className="hand text-[24px] md:text-[28px] mt-5">
          {categoryHandNote(matchedCategory)}
        </p>
        <SprigDivider variant="berry" className="!mt-6 !mb-2 max-w-sm mx-auto" />
      </div>

      {recipes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(() => {
            const all = getAllPosts()
            const numberFor = (slug: string) =>
              String(all.findIndex((r) => r.slug === slug) + 1).padStart(2, "0")
            return recipes.map((recipe) => (
              <RecipeCard
                key={recipe.slug}
                slug={recipe.slug}
                title={recipe.title}
                category={recipe.category}
                image={recipe.image}
                number={numberFor(recipe.slug)}
                byline={recipe.byline ?? defaultBylineFor(recipe.category)}
              />
            ))
          })()}
        </div>
      ) : (
        <p className="text-center py-12 font-serif italic text-ink-muted text-lg">
          No recipes found in this category yet.
        </p>
      )}

      <div className="text-center mt-16">
        <Link href="/categories" className="btn btn--ghost">
          All Categories
        </Link>
      </div>
    </div>
  )
}
