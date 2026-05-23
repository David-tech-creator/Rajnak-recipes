import { getPostBySlug, getAllPostSlugs, getPostsByCategory, categoryToSlug, getAllPosts } from "@/lib/posts"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { SprigDivider } from "@/components/sprig-divider"

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

function splitIngredient(raw: unknown): { qty: string; item: string } {
  const trimmed = String(raw ?? "").trim()
  if (!trimmed) return { qty: "", item: "" }
  const match = trimmed.match(
    /^([\d¼½¾⅓⅔⅛⅜⅝⅞.,/]+(?:\s*[-–]\s*[\d¼½¾⅓⅔⅛⅜⅝⅞.,/]+)?(?:\s+(?:g|kg|ml|cl|dl|l|tsp|tbsp|cup|cups|oz|lb|lbs|st|stk|portions?|servings?))?)\s+(.+)$/i,
  )
  if (match) {
    return { qty: match[1].trim(), item: match[2].trim() }
  }
  return { qty: "", item: trimmed }
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

  const relatedRecipes = getPostsByCategory(recipe.category)
    .filter((post) => post.slug !== slug)
    .slice(0, 3)

  const hasNumberedSteps = /^\s*\d+\.\s+/m.test(recipe.content)
  const contentParagraphs = recipe.content
    .split("\n")
    .map((l) => l.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !(hasNumberedSteps && /^\s*\d+\.\s+/.test(line)))
    .filter((line) => !/^\d{1,3}$/.test(line))
    .filter((line) => !/^Inspired by/i.test(line))

  const ingredients = recipe.ingredients
    .map((i) => String(i ?? "").trim())
    .filter((i) => i.length > 0 && i.toLowerCase() !== "to be added" && i.toLowerCase() !== "source??")
    .map((i) => splitIngredient(i))
    .filter((i) => i.item.length > 0)

  return (
    <article>
      {/* Hero photo */}
      {recipe.image && (
        <div className="relative h-[58vh] min-h-[400px] max-h-[640px] overflow-hidden">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-parchment/80 pointer-events-none" />
        </div>
      )}

      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto -mt-20 relative bg-parchment pt-12 pb-4 px-2 md:px-0">
          {/* Recipe number eyebrow */}
          {recipeNumber && (
            <div className="text-center mb-4">
              <span className="eyebrow eyebrow--lingon num">Recipe № {recipeNumber}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="editorial-h1 text-center mb-4 px-2">{recipe.title}</h1>

          {/* Category + meta band */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8 text-ink-muted">
            <Link
              href={`/categories/${categoryToSlug(recipe.category)}`}
              className="tag hover:text-lingon-deep hover:border-lingon"
            >
              <span className="tag-dot" />
              {recipe.category}
            </Link>
            {(recipe.prepTime || recipe.cookTime) && (
              <div className="meta-row">
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
              </div>
            )}
          </div>

          <SprigDivider variant="berry" className="!mt-4 !mb-10" />

          {/* Description / prose (anything that isn't a numbered step) */}
          {contentParagraphs.length > 0 && (
            <div className="recipe-prose max-w-2xl mx-auto mb-12 text-[19px]">
              {contentParagraphs.map((line, i) => {
                if (line.startsWith("## ")) {
                  return <h2 key={i}>{line.replace("## ", "")}</h2>
                }
                if (i === 0 && !line.startsWith("## ")) {
                  return (
                    <p key={i} className="lede text-center mb-8">
                      {line}
                    </p>
                  )
                }
                return <p key={i}>{line}</p>
              })}
            </div>
          )}

          {/* Ingredients + instructions */}
          {(ingredients.length > 0 || recipe.instructions.length > 0) && (
            <div className="grid md:grid-cols-[5fr_7fr] gap-12 md:gap-16 mt-8 mb-16">
              {ingredients.length > 0 && (
                <aside>
                  <div className="eyebrow eyebrow--lingon mb-4">No. I · Ingredients</div>
                  <h2 className="editorial-h3 mb-6 font-normal">Ingredients</h2>
                  <ul className="ingredients">
                    {ingredients.map((ing, i) => (
                      <li key={i}>
                        <span className="qty num">{ing.qty || "—"}</span>
                        <span className="item">{ing.item}</span>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}

              {recipe.instructions.length > 0 && (
                <section>
                  <div className="eyebrow eyebrow--lingon mb-4">No. II · Method</div>
                  <h2 className="editorial-h3 mb-6 font-normal">Instructions</h2>
                  <ol className="space-y-6">
                    {recipe.instructions.map((step, i) => (
                      <li key={i} className="grid grid-cols-[44px_1fr] gap-4">
                        <span className="font-serif num text-2xl text-lingon leading-none pt-1">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[18px] leading-[1.55] text-ink-soft">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          )}

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
                <Link key={related.slug} href={`/recipes/${related.slug}`} className="recipe-card block">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <Image
                      src={related.image || "/images/recipes/placeholder.svg"}
                      alt={related.title}
                      fill
                      className="object-cover"
                      style={{ filter: "saturate(0.92)" }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="py-5 text-center">
                    <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted mb-1">
                      {related.category}
                    </div>
                    <h3 className="recipe-card-title">{related.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
