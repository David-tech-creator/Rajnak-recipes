import { getPostBySlug, getAllPostSlugs, getPostsByCategory, categoryToSlug, getAllPosts, defaultBylineFor } from "@/lib/posts"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { SprigDivider } from "@/components/sprig-divider"
import { RecipeBody } from "@/components/recipe-body"
import { PrintButton } from "@/components/print-button"
import { RecipeCard } from "@/components/recipe-card"

export function generateStaticParams() {
  const posts = getAllPostSlugs()
  return posts
    .map(({ params: { slug } }) => ({ slug }))
    .filter((p) => p.slug !== "new")
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recipe = getPostBySlug(slug)

  if (!recipe) {
    return {
      title: "Recipe Not Found",
      description: "The requested recipe could not be found",
    }
  }

  return {
    title: `${recipe.title} | Rajnax: Dishes We Love`,
    description: `${recipe.title} — a ${recipe.category} recipe from the Rajnak family collection.`,
  }
}

function getRecipeNumber(slug: string, allSlugs: string[]): string {
  const idx = allSlugs.findIndex((s) => s === slug)
  if (idx < 0) return ""
  return String(idx + 1).padStart(2, "0")
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const reservedSlugs = ["new", "edit", "create"]
  if (reservedSlugs.includes(slug)) {
    notFound()
  }

  const recipe = getPostBySlug(slug)

  if (!recipe) {
    notFound()
  }

  const allPosts = getAllPosts()
  const allSlugs = allPosts.map((p) => p.slug)
  const recipeNumber = getRecipeNumber(slug, allSlugs)

  // Pick 3 related recipes that vary per-recipe. Seed the shuffle on the
  // current slug so server + client agree (no hydration mismatch) and so
  // every recipe shows a different selection instead of always the same 3.
  const seedShuffle = <T,>(arr: T[], seed: string): T[] => {
    let h = 2166136261
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      h = (h * 1664525 + 1013904223) | 0
      const j = Math.abs(h) % (i + 1)
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const relatedRecipes = seedShuffle(
    getPostsByCategory(recipe.category).filter((post) => post.slug !== slug),
    slug,
  ).slice(0, 3)

  const hasNumberedSteps = /^\s*\d+\.\s+/m.test(recipe.content)
  const contentParagraphs = recipe.content
    .split("\n")
    .map((l) => l.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !(hasNumberedSteps && /^\s*\d+\.\s+/.test(line)))
    .filter((line) => !/^\d{1,3}$/.test(line))
    .filter((line) => !/^Inspired by/i.test(line))

  const ingredientLines = recipe.ingredients
    .map((i) => String(i ?? "").trim())
    .filter(
      (i) =>
        i.length > 0 &&
        i.toLowerCase() !== "to be added" &&
        i.toLowerCase() !== "source??" &&
        i !== "????" &&
        i.toLowerCase() !== "blabla",
    )

  return (
    <article>
      <div className="container mx-auto px-6 pt-12 md:pt-16 pb-4">
        {/* Editorial composition: photo at its native ~3:4 next to the title block */}
        <div className="grid md:grid-cols-[5fr_6fr] gap-10 md:gap-14 items-center max-w-6xl mx-auto">
          {recipe.image && (
            <div className="relative aspect-[3/4] bg-cream border border-rule-soft shadow-[var(--paper-shadow)] overflow-hidden">
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover"
                style={{ filter: "saturate(0.94)" }}
                sizes="(max-width: 768px) 100vw, 45vw"
                priority
              />
              {recipeNumber && (
                <div className="absolute bottom-0 right-0 bg-cream px-4 py-2 font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink border-t border-l border-rule">
                  № {recipeNumber}
                </div>
              )}
            </div>
          )}

          <div>
            {recipeNumber && (
              <div className="eyebrow eyebrow--lingon num mb-3">Recipe № {recipeNumber}</div>
            )}

            <h1 className="editorial-h1 font-normal mb-5">{recipe.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-ink-muted">
              <Link
                href={`/categories/${categoryToSlug(recipe.category)}`}
                className="tag hover:text-lingon-deep hover:border-lingon"
              >
                <span className="tag-dot" />
                {recipe.category}
              </Link>
            </div>

            {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
              <div className="meta-row mb-4">
                {recipe.prepTime && (
                  <div>
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                    <div className="leading-none">
                      <div className="k">Prep</div>
                      <div className="v">{recipe.prepTime}</div>
                    </div>
                  </div>
                )}
                {recipe.cookTime && (
                  <div>
                    <svg viewBox="0 0 24 24"><path d="M4 12h16" /><path d="M6 12V8a6 6 0 0 1 12 0v4" /><path d="M5 16h14" /></svg>
                    <div className="leading-none">
                      <div className="k">Cook</div>
                      <div className="v">{recipe.cookTime}</div>
                    </div>
                  </div>
                )}
                {recipe.servings && (
                  <div>
                    <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M15 20c0-2.5 1.8-4.5 4-4.5" /></svg>
                    <div className="leading-none">
                      <div className="k">Serves</div>
                      <div className="v">{recipe.servings}</div>
                    </div>
                  </div>
                )}
                {recipe.difficulty && (
                  <div>
                    <svg viewBox="0 0 24 24"><path d="M4 12h16M4 7h16M4 17h10" /></svg>
                    <div className="leading-none">
                      <div className="k">Difficulty</div>
                      <div className="v">{recipe.difficulty}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {contentParagraphs[0] && !contentParagraphs[0].startsWith("## ") && (
              <p className="lede mt-4">{contentParagraphs[0]}</p>
            )}

            {recipe.kitchenNote && (
              <p className="hand text-[24px] md:text-[28px] mt-6 leading-tight">
                &ldquo;{recipe.kitchenNote}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <a href="#recipe" className="btn">Open the recipe</a>
              {recipe.story && (
                <a href="#story" className="btn btn--link">Read the story</a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto pt-10 pb-4">
          <SprigDivider variant="berry" className="!mt-0 !mb-10" />

          {/* Description / prose (anything that isn't a numbered step).
              The first paragraph already ran as the lede inside the hero. */}
          {contentParagraphs.slice(1).length > 0 && (
            <div className="recipe-prose max-w-2xl mx-auto mb-12 text-[19px]">
              {contentParagraphs.slice(1).map((line, i) => {
                if (line.startsWith("## ")) {
                  return <h2 key={i}>{line.replace("## ", "")}</h2>
                }
                return <p key={i}>{line}</p>
              })}
            </div>
          )}

          <RecipeBody
            slug={slug}
            baseServings={recipe.servings}
            ingredients={ingredientLines}
            instructions={recipe.instructions}
            story={recipe.story}
          />

          {recipe.signoff && (
            <p className="hand text-[34px] md:text-[40px] text-center mt-12 mb-2 leading-tight">
              {recipe.signoff}
            </p>
          )}

          <div className="print:hidden flex flex-wrap gap-3 justify-center mt-6 mb-2">
            <PrintButton />
          </div>

          <SprigDivider variant="leaf" className="!mt-12 !mb-6" />
        </div>

        {/* Related recipes */}
        {relatedRecipes.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16">
            <div className="editorial-head mb-12">
              <div className="eyebrow eyebrow--lingon">More from {recipe.category}</div>
              <h2 className="editorial-h3 mt-3 mb-4 font-normal">You might also like</h2>
              <div className="rule"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedRecipes.map((related) => (
                <RecipeCard
                  key={related.slug}
                  slug={related.slug}
                  title={related.title}
                  category={related.category}
                  image={related.image}
                  number={String(allSlugs.indexOf(related.slug) + 1).padStart(2, "0")}
                  byline={related.byline ?? defaultBylineFor(related.category)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
