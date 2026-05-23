import Link from "next/link"
import Image from "next/image"
import { getAllPosts, categoryToSlug } from "@/lib/posts"
import { SprigDivider } from "@/components/sprig-divider"
import { AdminRecipeRow } from "./recipe-row"

export const metadata = {
  title: "Manage Recipes",
}

export default function AdminRecipesPage() {
  const recipes = getAllPosts()

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <div className="eyebrow eyebrow--lingon">Administration</div>
        <h1 className="editorial-h1 mt-3 mb-3 font-normal">Manage recipes</h1>
        <p className="lede">
          Add a new recipe or open an existing one to make a change. Edits commit straight to the book.
        </p>
        <SprigDivider variant="berry" className="!mt-8 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-4xl mx-auto mb-10 flex justify-center">
        <Link href="/admin/recipes/new" className="btn">
          + Add a new recipe
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink">
              <th className="text-left font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted px-5 py-3">
                Recipe
              </th>
              <th className="text-left font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted px-5 py-3 hidden sm:table-cell">
                Category
              </th>
              <th className="text-right font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted px-5 py-3">
                {recipes.length}
              </th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((r) => (
              <AdminRecipeRow
                key={r.slug}
                slug={r.slug}
                title={r.title}
                category={r.category}
                image={r.image}
                categorySlug={categoryToSlug(r.category)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
