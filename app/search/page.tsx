import { getAllPosts, categoryToSlug } from "@/lib/posts"
import Image from "next/image"
import Link from "next/link"
import { SprigDivider } from "@/components/sprig-divider"

export const metadata = {
  title: "Search | Rajnax: Dishes We Love",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? "").trim()
  const all = getAllPosts()

  const results = query
    ? all.filter((r) => {
        const hay = [r.title, r.category, ...(r.ingredients ?? []), r.content].join(" ").toLowerCase()
        return query
          .toLowerCase()
          .split(/\s+/)
          .every((term) => hay.includes(term))
      })
    : []

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Find a recipe</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Search the <em className="italic" style={{ color: "var(--lingon-deep)" }}>collection</em>
        </h1>
        {query ? (
          <p className="lede">
            {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <p className="lede">Type a recipe name, an ingredient, or a category.</p>
        )}
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <form action="/search" method="get" className="max-w-md mx-auto mb-16 flex items-center bg-cream border border-rule-soft">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search recipes…"
          className="w-full py-3 px-5 bg-transparent text-ink placeholder:text-ink-muted/70 focus:outline-none font-serif italic text-[18px]"
          autoFocus
        />
        <button type="submit" className="px-5 font-serif-sc uppercase tracking-[0.22em] text-[10px] text-ink-muted hover:text-lingon-deep">
          Search
        </button>
      </form>

      {query && results.length === 0 && (
        <p className="text-center font-serif italic text-ink-muted text-lg py-12">
          No recipes match.{" "}
          <Link href="/recipes" className="text-lingon-deep underline decoration-1 underline-offset-4">
            Browse all recipes
          </Link>{" "}
          instead.
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((recipe) => (
            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="recipe-card block">
              <div className="aspect-[4/5] relative overflow-hidden">
                <Image
                  src={recipe.image || "/images/recipes/placeholder.svg"}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  style={{ filter: "saturate(0.92)" }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="py-5 text-center">
                <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted mb-1">
                  <Link
                    href={`/categories/${categoryToSlug(recipe.category)}`}
                    className="hover:text-lingon-deep"
                  >
                    {recipe.category}
                  </Link>
                </div>
                <h3 className="recipe-card-title">{recipe.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
