import { getAllPosts, defaultBylineFor } from "@/lib/posts"
import Link from "next/link"
import { SprigDivider } from "@/components/sprig-divider"
import { RecipeCard } from "@/components/recipe-card"

export const metadata = {
  title: "Search",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? "").trim()
  const all = getAllPosts()
  const numberFor = (slug: string) => String(all.findIndex((r) => r.slug === slug) + 1).padStart(2, "0")

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
        <p className="hand text-[26px] md:text-[30px] mt-6">
          What are you in the mood for?
        </p>
        <SprigDivider variant="berry" className="!mt-8 !mb-2 max-w-sm mx-auto" />
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
            <RecipeCard
              key={recipe.slug}
              slug={recipe.slug}
              title={recipe.title}
              category={recipe.category}
              image={recipe.image}
              number={numberFor(recipe.slug)}
              byline={recipe.byline ?? defaultBylineFor(recipe.category)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
