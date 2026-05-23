"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"

type LiteRecipe = {
  slug: string
  title: string
  category: string
  image?: string
  ingredients: string[]
}

type CategoryOption = { name: string; slug: string }

const PAGE_SIZE = 24

export function RecipesGrid({
  recipes,
  categories,
}: {
  recipes: LiteRecipe[]
  categories: CategoryOption[]
}) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const terms = q ? q.split(/\s+/) : []
    return recipes.filter((r) => {
      if (activeCategory && r.category !== activeCategory) return false
      if (terms.length === 0) return true
      const hay = [r.title, r.category, ...(r.ingredients ?? [])].join(" ").toLowerCase()
      return terms.every((t) => hay.includes(t))
    })
  }, [recipes, query, activeCategory])

  const shown = filtered.slice(0, visible)

  return (
    <>
      <div className="max-w-md mx-auto mb-8 flex border border-gray-300">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setVisible(PAGE_SIZE)
          }}
          placeholder="Search recipes by name or ingredient…"
          className="w-full py-2 px-4 focus:outline-none"
          aria-label="Search recipes"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="px-3 text-sm text-gray-500 hover:text-gray-800"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button
          type="button"
          onClick={() => {
            setActiveCategory(null)
            setVisible(PAGE_SIZE)
          }}
          className={`px-4 py-2 border text-sm transition-colors ${
            activeCategory === null
              ? "border-gray-800 bg-gray-800 text-white"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => {
              setActiveCategory(c.name)
              setVisible(PAGE_SIZE)
            }}
            className={`px-4 py-2 border text-sm transition-colors ${
              activeCategory === c.name
                ? "border-gray-800 bg-gray-800 text-white"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500 mb-6">
        Showing {shown.length} of {filtered.length}
        {filtered.length !== recipes.length ? ` (filtered from ${recipes.length})` : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          No recipes match. Try a different search or category.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shown.map((recipe) => (
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
              <p className="text-sm text-gray-500 px-4 pb-4">{recipe.category}</p>
            </Link>
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="text-center mt-12">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-6 py-3 border border-gray-300 text-sm hover:bg-gray-50"
          >
            Load more
          </button>
        </div>
      )}
    </>
  )
}
