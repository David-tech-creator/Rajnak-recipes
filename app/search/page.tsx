import { getAllPosts, categoryToSlug } from "@/lib/posts"
import Image from "next/image"
import Link from "next/link"

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
        const hay = [
          r.title,
          r.category,
          ...(r.ingredients ?? []),
          r.content,
        ]
          .join(" ")
          .toLowerCase()
        return query
          .toLowerCase()
          .split(/\s+/)
          .every((term) => hay.includes(term))
      })
    : []

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl text-center mb-2">Search Recipes</h1>
      {query ? (
        <p className="text-gray-600 text-center mb-10">
          {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <p className="text-gray-600 text-center mb-10">Type a recipe name, ingredient, or category in the search box.</p>
      )}

      <form action="/search" method="get" className="max-w-md mx-auto mb-12 flex border border-gray-300">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search recipes…"
          className="w-full py-2 px-4 focus:outline-none"
          autoFocus
        />
        <button type="submit" className="px-4 bg-gray-100 hover:bg-gray-200 text-sm">
          Search
        </button>
      </form>

      {query && results.length === 0 && (
        <p className="text-center text-gray-500">
          No recipes match. Try a different keyword or browse{" "}
          <Link href="/recipes" className="underline">
            all recipes
          </Link>
          .
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((recipe) => (
            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="recipe-card block">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={recipe.image || "/images/recipes/placeholder.svg"}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <h3 className="recipe-card-title">{recipe.title}</h3>
              <p className="text-sm text-gray-500 px-4 pb-4">
                <Link href={`/categories/${categoryToSlug(recipe.category)}`} className="hover:underline">
                  {recipe.category}
                </Link>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
