"use client"

import { useMemo, useState } from "react"
import { RecipeCard } from "@/components/recipe-card"

type LiteRecipe = {
  slug: string
  title: string
  category: string
  image?: string
  ingredients: string[]
  number?: string
  byline?: string
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
      <div className="max-w-md mx-auto mb-10 flex items-center bg-cream border border-rule-soft">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setVisible(PAGE_SIZE)
          }}
          placeholder="Search recipes by name or ingredient…"
          className="w-full py-3 px-5 bg-transparent text-ink placeholder:text-ink-muted focus:outline-none font-serif italic text-[18px]"
          aria-label="Search recipes"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="px-4 font-serif-sc uppercase tracking-[0.18em] text-[10px] text-ink-muted hover:text-lingon-deep"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
        <CategoryButton
          active={activeCategory === null}
          onClick={() => {
            setActiveCategory(null)
            setVisible(PAGE_SIZE)
          }}
        >
          All
        </CategoryButton>
        {categories.map((c) => (
          <CategoryButton
            key={c.slug}
            active={activeCategory === c.name}
            onClick={() => {
              setActiveCategory(c.name)
              setVisible(PAGE_SIZE)
            }}
          >
            {c.name}
          </CategoryButton>
        ))}
      </div>

      <p className="text-center font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-10">
        Showing {shown.length} of {filtered.length}
        {filtered.length !== recipes.length ? ` · filtered from ${recipes.length}` : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="text-center text-ink-muted italic py-16 font-serif text-lg">
          No recipes match. Try a different keyword or category.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shown.map((recipe) => (
            <RecipeCard
              key={recipe.slug}
              slug={recipe.slug}
              title={recipe.title}
              category={recipe.category}
              image={recipe.image}
              number={recipe.number}
              byline={recipe.byline}
            />
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="text-center mt-16">
          <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn btn--ghost">
            Load more recipes
          </button>
        </div>
      )}
    </>
  )
}

function CategoryButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "font-serif-sc uppercase tracking-[0.22em] text-[11px] px-4 py-2 border transition-colors",
        active
          ? "bg-ink text-cream border-ink"
          : "bg-transparent text-ink-soft border-rule hover:border-ink hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  )
}
