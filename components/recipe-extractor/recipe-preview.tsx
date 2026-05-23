"use client"

import type { ExtractedRecipe } from "@/lib/recipe-extractor"
import { SprigDivider } from "@/components/sprig-divider"

interface RecipePreviewProps {
  recipe: ExtractedRecipe
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

export function RecipePreview({ recipe }: RecipePreviewProps) {
  const ingredients = (recipe.ingredients ?? [])
    .map((i) => splitIngredient(i))
    .filter((i) => i.item.length > 0)

  return (
    <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-12">
      <div className="text-center mb-8">
        <div className="eyebrow eyebrow--lingon">Preview</div>
        <h2 className="editorial-h2 mt-3 mb-3 font-normal">
          {recipe.title || "Untitled recipe"}
        </h2>
        {recipe.category && (
          <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted">
            {recipe.category}
          </div>
        )}
        <SprigDivider variant="berry" className="!mt-6 !mb-0 max-w-sm mx-auto" />
      </div>

      {recipe.description && (
        <p className="lede text-center max-w-2xl mx-auto mb-10">{recipe.description}</p>
      )}

      {(recipe.prep_time || recipe.cook_time || recipe.servings) && (
        <div className="meta-row justify-center mb-10">
          {recipe.prep_time && (
            <div>
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              <div className="leading-none">
                <div className="k">Prep</div>
                <div className="v">{recipe.prep_time}</div>
              </div>
            </div>
          )}
          {recipe.cook_time && (
            <div>
              <svg viewBox="0 0 24 24"><path d="M4 12h16" /><path d="M6 12V8a6 6 0 0 1 12 0v4" /><path d="M5 16h14" /></svg>
              <div className="leading-none">
                <div className="k">Cook</div>
                <div className="v">{recipe.cook_time}</div>
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

      <div className="grid md:grid-cols-[5fr_7fr] gap-12">
        {ingredients.length > 0 && (
          <aside>
            <div className="eyebrow eyebrow--lingon mb-4">No. I · Ingredients</div>
            <h3 className="editorial-h3 mb-6 font-normal">Ingredients</h3>
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

        {recipe.instructions && recipe.instructions.length > 0 && (
          <section>
            <div className="eyebrow eyebrow--lingon mb-4">No. II · Method</div>
            <h3 className="editorial-h3 mb-6 font-normal">Instructions</h3>
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
    </div>
  )
}
