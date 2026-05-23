import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getAllCategories, getPostsByCategory, categoryToSlug } from "@/lib/posts"
import { SprigDivider } from "@/components/sprig-divider"

function findCategoryBySlug(slug: string, categories: string[]): string | undefined {
  return categories.find((c) => categoryToSlug(c) === slug)
}

function categoryHandNote(name: string): string {
  switch (name) {
    case "Family Recipes":
      return "From Mormor's drawer."
    case "Found Recipes":
      return "Brought home from somewhere."
    case "Quick & Easy":
      return "Tuesday-night supper."
    case "Christmas & Easter":
      return "The long-table dishes."
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
          {recipes.map((recipe) => (
            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="recipe-card block">
              <div className="aspect-[4/5] relative overflow-hidden">
                <Image
                  src={recipe.image || "/images/recipes/placeholder.svg"}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  style={{ filter: "saturate(0.92)" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="py-5 text-center">
                <h3 className="recipe-card-title">{recipe.title}</h3>
              </div>
            </Link>
          ))}
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
