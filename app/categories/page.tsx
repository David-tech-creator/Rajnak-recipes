import Link from "next/link"
import Image from "next/image"
import { getAllCategories, getPostsByCategory, getAllPosts, categoryToSlug } from "@/lib/posts"
import { SprigDivider } from "@/components/sprig-divider"

export const metadata = {
  title: "Categories",
}

const CATEGORY_BYLINES: Record<string, string> = {
  "Family Recipes": "the dishes we grew up on",
  "Found Recipes": "picked up along the way",
  "Quick & Easy": "for busy weeknights",
  "Christmas & Easter": "for the holiday table",
}

export default function CategoriesPage() {
  const categories = getAllCategories()
  const allRecipes = getAllPosts()

  const categoryData = categories.map((category) => {
    const recipes = getPostsByCategory(category)
    const coverImage = recipes.find((r) => r.image)?.image
    return {
      name: category,
      slug: categoryToSlug(category),
      count: recipes.length,
      coverImage,
      byline: CATEGORY_BYLINES[category] ?? "gathered along the way",
    }
  })

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">No. II · The Categories</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Recipe <em className="italic" style={{ color: "var(--lingon-deep)" }}>categories</em>
        </h1>
        <p className="lede">{allRecipes.length} recipes, gathered by occasion and origin.</p>
        <p className="hand text-[26px] md:text-[30px] mt-6">
          Open the drawer.
        </p>
        <SprigDivider variant="berry" className="!mt-8 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {categoryData.map((category) => (
          <Link
            key={category.name}
            href={`/categories/${category.slug}`}
            className="recipe-card block group"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={category.coverImage || "/images/recipes/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ filter: "saturate(0.92)" }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="py-5 px-4 text-center">
              <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted mb-1">
                {category.count} {category.count === 1 ? "recipe" : "recipes"}
              </div>
              <h3 className="recipe-card-title">{category.name}</h3>
              <p className="hand text-[18px] md:text-[20px] mt-2 leading-tight">
                &mdash; {category.byline}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
