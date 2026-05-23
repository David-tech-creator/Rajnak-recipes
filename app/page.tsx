import Image from "next/image"
import Link from "next/link"
import {
  getFeaturedPosts,
  getLatestPosts,
  getAllPosts,
  categoryToSlug,
  getPostsByCategory,
  defaultBylineFor,
} from "@/lib/posts"
import { SprigDivider } from "@/components/sprig-divider"
import { RecipeCard } from "@/components/recipe-card"

const FEATURED_CATEGORIES: Array<{
  name: string
  image: string
  byline: string
}> = [
  {
    name: "Family Recipes",
    image: "/images/recipes/mammas-gulasch-soup.jpg",
    byline: "from Mormor's drawer",
  },
  {
    name: "Found Recipes",
    image: "/images/recipes/sushi-katsu-tempura.jpg",
    byline: "brought home from somewhere",
  },
  {
    name: "Quick & Easy",
    image: "/images/recipes/chicken-vegetable-wok.jpg",
    byline: "Tuesday-night supper",
  },
  {
    name: "Christmas & Easter",
    image: "/images/recipes/swedish-christmas-ham.jpg",
    byline: "the long-table dishes",
  },
]

export default function Home() {
  const featuredRecipes = getFeaturedPosts(3)
  const latestRecipes = getLatestPosts(6)
  const allRecipes = getAllPosts()
  const totalCount = allRecipes.length
  const numberFor = (slug: string) =>
    String(allRecipes.findIndex((r) => r.slug === slug) + 1).padStart(2, "0")

  // Pick the first featured recipe as the editorial composition hero.
  const composition = featuredRecipes[0]

  return (
    <div>
      {/* ============================================================
          HERO — capped height, dining-table focal point, centered card
          ============================================================ */}
      <section className="relative w-full">
        <div className="relative w-full h-[min(78vh,720px)] sm:h-[min(75vh,760px)] overflow-hidden">
          <Image
            src="/Hero-image.png"
            alt="A long, warmly lit family dining table"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: "saturate(0.96)", objectPosition: "50% 72%" }}
          />

          {/* Parchment vignette around the edges so the card reads */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(244,236,220,0.05) 0%, rgba(244,236,220,0.45) 70%, rgba(244,236,220,0.85) 100%)",
            }}
          />

          {/* Editorial card centered in the hero so it sits above the fold */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="relative bg-cream/95 border border-rule-soft shadow-[var(--paper-shadow)] backdrop-blur-sm px-6 py-7 md:px-12 md:py-10 text-center w-full max-w-xl">
              <div className="caps text-[10px] md:text-[11px] text-ink-muted flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full bg-lingon inline-block" />
                <span>The Rajnak Family</span>
                <span>·</span>
                <span>{totalCount} recipes</span>
              </div>

              <h1 className="editorial-h2 md:editorial-h1 mt-3 md:mt-4 font-normal">
                An heirloom <em className="italic" style={{ color: "var(--lingon-deep)" }}>cookbook</em>.
              </h1>

              <p className="hand text-[22px] md:text-[28px] mt-2 md:mt-3">Hemlagad mat med kärlek.</p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-5 md:mt-7 justify-center items-center">
                <Link href="/recipes" className="btn w-full sm:w-auto justify-center">
                  Open the recipes
                </Link>
                <Link href="/about" className="btn btn--link">
                  Read our story
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute inset-x-0 bottom-3 md:bottom-5 flex justify-center pointer-events-none">
            <div className="font-serif-sc uppercase tracking-[0.3em] text-[10px] text-ink-soft/70">
              scroll
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 pt-10 md:pt-14">
          <p className="lede max-w-2xl mx-auto text-center">
            Generations of recipes — Swedish, Hungarian, Swiss, and everywhere we&apos;ve eaten well —
            gathered into one cookbook.
          </p>
          <SprigDivider variant="berry" className="max-w-md mx-auto !mt-8" />
        </div>
      </section>

      {/* ============================================================
          CATEGORY GRID
          ============================================================ */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="eyebrow eyebrow--lingon">No. I · Browse</div>
          <h2 className="editorial-h2 mt-3 font-normal">By category</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {FEATURED_CATEGORIES.map((cat) => {
            const count = getPostsByCategory(cat.name).length
            if (count === 0) return null
            return (
              <Link
                key={cat.name}
                href={`/categories/${categoryToSlug(cat.name)}`}
                className="recipe-card block group"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ filter: "saturate(0.92)" }}
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <div className="py-5 px-4 text-center">
                  <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted mb-1">
                    {count} {count === 1 ? "recipe" : "recipes"}
                  </div>
                  <h3 className="recipe-card-title">{cat.name}</h3>
                  <p className="hand text-[18px] md:text-[20px] mt-2 leading-tight">
                    &mdash; {cat.byline}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ============================================================
          FEATURED COMPOSITION (single editorial band)
          ============================================================ */}
      {composition && (
        <section className="container mx-auto px-6 py-16">
          <div className="bg-parchment-deep border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-16 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative aspect-[3/4] border border-rule-soft overflow-hidden">
              <Image
                src={composition.image || "/images/recipes/placeholder.svg"}
                alt={composition.title}
                fill
                className="object-cover"
                style={{ filter: "saturate(0.92)" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 right-0 bg-cream px-4 py-2 font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink border-t border-l border-rule">
                Featured
              </div>
            </div>

            <div>
              <div className="eyebrow eyebrow--lingon">Featured this week</div>
              <h3 className="display-2 mt-3 mb-4 font-normal">{composition.title}</h3>
              <p className="lede max-w-[38ch]">
                A dish from the {composition.category.toLowerCase()} drawer — pulled out for the long Sunday lunch.
              </p>

              <div className="meta-row mt-6">
                {composition.prepTime && (
                  <div>
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                    <span className="v">{composition.prepTime}</span>
                  </div>
                )}
                {composition.servings && (
                  <div>
                    <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /></svg>
                    <span className="v">Serves {composition.servings}</span>
                  </div>
                )}
              </div>

              <p className="hand text-[26px] mt-6">&ldquo;A long Sunday afternoon dish.&rdquo;</p>

              <div className="flex flex-wrap items-center gap-6 mt-8">
                <Link href={`/recipes/${composition.slug}`} className="btn">
                  Open the recipe
                </Link>
                <Link href="/recipes" className="btn btn--link">
                  See all featured
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          LATEST RECIPES
          ============================================================ */}
      <section className="container mx-auto px-6 py-16">
        <div className="editorial-head mb-12 max-w-2xl mx-auto">
          <div className="eyebrow eyebrow--lingon">No. III</div>
          <h2 className="editorial-h2 mt-3 mb-3 font-normal">Latest additions</h2>
          <div className="font-serif italic text-ink-soft">Six dishes most recently slipped into the book</div>
          <div className="rule"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestRecipes.map((recipe) => (
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

        <div className="text-center mt-16">
          <Link href="/recipes" className="btn btn--ghost">
            View all {totalCount} recipes
          </Link>
        </div>
      </section>
    </div>
  )
}
