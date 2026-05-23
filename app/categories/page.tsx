import Link from "next/link"
import Image from "next/image"
import { getAllCategories, getPostsByCategory, getAllPosts, categoryToSlug } from "@/lib/posts"
import { SprigDivider } from "@/components/sprig-divider"

export const metadata = {
  title: "Categories | Rajnax: Dishes We Love",
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
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoryData.map((category) => (
          <Link
            key={category.name}
            href={`/categories/${category.slug}`}
            className="recipe-card block group"
          >
            <div className="relative aspect-[4/3] overflow-hidden category-box">
              <Image
                src={category.coverImage || "/images/recipes/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ filter: "saturate(0.9)" }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="category-box-label">{category.name}</div>
            </div>
            <div className="py-4 text-center">
              <p className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted">
                {category.count} recipes
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
