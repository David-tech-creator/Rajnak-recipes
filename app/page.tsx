import Image from "next/image"
import Link from "next/link"
import { getFeaturedPosts, getLatestPosts, getAllPosts, categoryToSlug, getPostsByCategory } from "@/lib/posts"
import { SprigDivider } from "@/components/sprig-divider"

const FEATURED_CATEGORIES: Array<{ name: string; image: string }> = [
  { name: "Family Recipes", image: "/images/recipes/mammas-gulasch-soup.jpg" },
  { name: "Found Recipes", image: "/images/recipes/sushi-katsu-tempura.jpg" },
  { name: "Quick & Easy", image: "/images/recipes/chicken-vegetable-wok.jpg" },
  { name: "Christmas & Easter", image: "/images/recipes/swedish-christmas-ham.jpg" },
]

export default function Home() {
  const featuredRecipes = getFeaturedPosts(3)
  const latestRecipes = getLatestPosts(6)
  const totalCount = getAllPosts().length

  // Pick the first featured recipe as the editorial composition hero.
  const composition = featuredRecipes[0]

  return (
    <div>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="container mx-auto px-6 pt-12 md:pt-16 pb-8">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-end">
          <div>
            <div className="caps text-[12px] text-ink-muted flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-lingon inline-block" />
              <span>Rajnak Family</span>
              <span>·</span>
              <span>{totalCount} recipes</span>
            </div>

            <h1 className="display-1 mt-6">
              An heirloom <em className="italic" style={{ color: "var(--lingon-deep)" }}>cookbook</em>.
            </h1>

            <p className="hand text-[34px] md:text-[38px] mt-4">Hemlagad mat med kärlek.</p>

            <p className="lede max-w-xl mt-6">
              Four generations of recipes — Swedish, Hungarian, and everywhere we&apos;ve eaten well — gathered into one
              cookbook. Family classics, found discoveries, and the dishes that became traditions.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/recipes" className="btn">
                Open the recipes
              </Link>
              <Link href="/about" className="btn btn--link">
                Read our story
              </Link>
            </div>

            <SprigDivider variant="berry" className="mt-12 max-w-[420px]" />
          </div>

          <aside className="relative bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-6 md:p-10">
            <div className="relative aspect-square">
              <Image
                src="/images/rajnak-family-logo-new.png"
                alt="The Rajnak family recipe collection"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 80vw, 400px"
                priority
              />
            </div>
          </aside>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_CATEGORIES.map((cat) => {
            const count = getPostsByCategory(cat.name).length
            if (count === 0) return null
            return (
              <Link
                key={cat.name}
                href={`/categories/${categoryToSlug(cat.name)}`}
                className="category-box aspect-square relative block overflow-hidden bg-cream border border-rule-soft"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                  style={{ filter: "saturate(0.9)" }}
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="category-box-label">{cat.name}</div>
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
                  {recipe.category}
                </div>
                <h3 className="recipe-card-title">{recipe.title}</h3>
              </div>
            </Link>
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
