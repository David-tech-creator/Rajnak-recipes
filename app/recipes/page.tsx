import { getAllPosts, getAllCategories, categoryToSlug } from "@/lib/posts"
import { RecipesGrid } from "./recipes-grid"
import { SprigDivider } from "@/components/sprig-divider"

export const metadata = {
  title: "All Recipes | Rajnax: Dishes We Love",
}

export default function RecipesPage() {
  const recipes = getAllPosts()
  const categories = getAllCategories()

  const lite = recipes.map((r) => ({
    slug: r.slug,
    title: r.title,
    category: r.category,
    image: r.image,
    ingredients: r.ingredients ?? [],
  }))

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">The complete collection</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          All <em className="not-italic" style={{ color: "var(--lingon-deep)", fontStyle: "italic" }}>recipes</em>
        </h1>
        <p className="lede">
          {recipes.length} dishes from four generations — Rajnak family, friends, and recipes found along the way.
        </p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <RecipesGrid
        recipes={lite}
        categories={categories.map((c) => ({ name: c, slug: categoryToSlug(c) }))}
      />
    </div>
  )
}
