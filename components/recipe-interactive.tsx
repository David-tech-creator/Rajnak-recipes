"use client"

import { useEffect, useMemo, useState } from "react"

type Ingredient = { qty: string; item: string; raw: string }

const UNIT_RE = /(g|kg|mg|ml|cl|dl|l|tsp|tbsp|cup|cups|oz|lb|lbs|pint|pints|qt|qts|gal|stick|sticks|stk|st|portions?|servings?|cloves?|slices?|sprigs?|pieces?|bunch|bunches|pinch|pinches|handful|handfuls)/i

const FRACTION_MAP: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
}

const FRACTION_REVERSE: Array<[number, string]> = [
  [0.125, "⅛"],
  [0.25, "¼"],
  [1 / 3, "⅓"],
  [0.375, "⅜"],
  [0.5, "½"],
  [0.625, "⅝"],
  [2 / 3, "⅔"],
  [0.75, "¾"],
  [0.875, "⅞"],
]

function parseLeadingNumber(s: string): { value: number; remainder: string; original: string } | null {
  const trimmed = s.trim()
  // range like "3-4" or "3–4": take first
  const rangeMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)(.*)$/)
  if (rangeMatch) {
    const v = parseFloat(rangeMatch[1].replace(",", "."))
    return { value: v, remainder: rangeMatch[3], original: `${rangeMatch[1]}–${rangeMatch[2]}` }
  }
  // mixed like "1 ½"
  const mixedMatch = trimmed.match(/^(\d+)\s+([½¼¾⅓⅔⅛⅜⅝⅞])(.*)$/)
  if (mixedMatch) {
    const v = parseInt(mixedMatch[1], 10) + (FRACTION_MAP[mixedMatch[2]] ?? 0)
    return { value: v, remainder: mixedMatch[3], original: `${mixedMatch[1]} ${mixedMatch[2]}` }
  }
  // single unicode fraction
  const fracMatch = trimmed.match(/^([½¼¾⅓⅔⅛⅜⅝⅞])(.*)$/)
  if (fracMatch) {
    return { value: FRACTION_MAP[fracMatch[1]], remainder: fracMatch[2], original: fracMatch[1] }
  }
  // ascii fraction like "1/2"
  const asciiFrac = trimmed.match(/^(\d+)\/(\d+)(.*)$/)
  if (asciiFrac) {
    const v = parseInt(asciiFrac[1], 10) / parseInt(asciiFrac[2], 10)
    return { value: v, remainder: asciiFrac[3], original: `${asciiFrac[1]}/${asciiFrac[2]}` }
  }
  // plain number
  const numMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)(.*)$/)
  if (numMatch) {
    return {
      value: parseFloat(numMatch[1].replace(",", ".")),
      remainder: numMatch[2],
      original: numMatch[1],
    }
  }
  return null
}

function formatNumber(n: number): string {
  if (n <= 0) return ""
  if (n >= 10) return String(Math.round(n))
  if (Math.abs(n - Math.round(n)) < 0.05) return String(Math.round(n))
  const whole = Math.floor(n)
  const frac = n - whole
  for (const [v, sym] of FRACTION_REVERSE) {
    if (Math.abs(frac - v) < 0.04) return whole > 0 ? `${whole} ${sym}` : sym
  }
  // one decimal
  return (Math.round(n * 10) / 10).toString()
}

function scaleIngredient(raw: string, factor: number): { qty: string; item: string } {
  const trimmed = raw.trim()
  const parsed = parseLeadingNumber(trimmed)
  if (!parsed) {
    return { qty: "", item: trimmed }
  }
  // After the number there may be a unit token
  const afterNum = parsed.remainder.replace(/^[\s]+/, "")
  const unitMatch = afterNum.match(/^([a-zA-Z]+)(\s|,|$)/)
  let unit = ""
  let rest = afterNum
  if (unitMatch && UNIT_RE.test(unitMatch[1])) {
    unit = unitMatch[1]
    rest = afterNum.slice(unitMatch[1].length).replace(/^[\s]+/, "")
  }
  const scaledNum = parsed.value * factor
  const scaledStr = formatNumber(scaledNum)
  const qty = unit ? `${scaledStr} ${unit}` : scaledStr
  return { qty, item: rest }
}

const SCALES: Array<{ factor: number; label: string }> = [
  { factor: 0.5, label: "½×" },
  { factor: 1, label: "1×" },
  { factor: 2, label: "2×" },
  { factor: 3, label: "3×" },
]

export function RecipeInteractive({
  slug,
  baseServings,
  ingredients,
  instructions,
}: {
  slug: string
  baseServings?: number
  ingredients: string[]
  instructions: string[]
}) {
  const [scaleIndex, setScaleIndex] = useState(1) // 1× by default
  const [doneIngredients, setDoneIngredients] = useState<Set<number>>(new Set())
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set())
  const storageKey = `rajnak:recipe:${slug}`

  // Load checked-state from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed.ingredients)) setDoneIngredients(new Set(parsed.ingredients))
        if (Array.isArray(parsed.steps)) setDoneSteps(new Set(parsed.steps))
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ingredients: Array.from(doneIngredients),
          steps: Array.from(doneSteps),
        }),
      )
    } catch {
      // ignore
    }
  }, [doneIngredients, doneSteps, storageKey])

  const factor = SCALES[scaleIndex].factor

  const scaled = useMemo(
    () =>
      ingredients.map((raw) => {
        const s = scaleIngredient(raw, factor)
        return { ...s, raw }
      }),
    [ingredients, factor],
  )

  const scaledServings = baseServings ? Math.max(1, Math.round(baseServings * factor)) : null

  const toggleIngredient = (i: number) => {
    setDoneIngredients((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const toggleStep = (i: number) => {
    setDoneSteps((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const resetAll = () => {
    setDoneIngredients(new Set())
    setDoneSteps(new Set())
  }

  return (
    <div className="grid md:grid-cols-[5fr_7fr] gap-12 md:gap-16 mt-8 mb-16">
      {/* Ingredients column */}
      {ingredients.length > 0 && (
        <aside className="recipe-ingredients-block">
          <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
            <div className="eyebrow eyebrow--lingon">No. I · Ingredients</div>
            {(doneIngredients.size > 0 || doneSteps.size > 0) && (
              <button
                type="button"
                onClick={resetAll}
                className="font-serif italic text-[14px] text-ink-muted hover:text-lingon-deep print:hidden"
              >
                reset
              </button>
            )}
          </div>
          <h2 className="editorial-h3 mb-4 font-normal">Ingredients</h2>

          {/* Servings scaler */}
          <div className="mb-6 print:hidden">
            <div className="font-serif-sc uppercase tracking-[0.22em] text-[10px] text-ink-muted mb-2">
              {scaledServings ? `Serves ${scaledServings}` : "Quantity"}
            </div>
            <div className="inline-flex border border-rule-soft bg-cream">
              {SCALES.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setScaleIndex(i)}
                  className={[
                    "px-4 py-2 font-serif-sc uppercase tracking-[0.16em] text-[11px] transition-colors",
                    i === scaleIndex
                      ? "bg-ink text-cream"
                      : "text-ink-soft hover:text-lingon-deep",
                  ].join(" ")}
                  aria-pressed={i === scaleIndex}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="ingredients">
            {scaled.map((ing, i) => {
              const isSection =
                !ing.qty &&
                (ing.item.endsWith(":") || /^(for the\b|to (finish|serve|garnish))/i.test(ing.item))
              if (isSection) {
                return (
                  <li
                    key={i}
                    className="!grid-cols-1 !border-b-0 !pb-0 pt-3 first:pt-0"
                    style={{ gridTemplateColumns: "1fr" }}
                  >
                    <div className="font-serif-sc uppercase tracking-[0.18em] text-[11px] text-lingon-deep">
                      {ing.item.replace(/:$/, "")}
                    </div>
                  </li>
                )
              }
              const done = doneIngredients.has(i)
              return (
                <li
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-pressed={done}
                  aria-label={`${done ? "Uncheck" : "Check"} ingredient: ${ing.qty ? ing.qty + " " : ""}${ing.item}`}
                  className={`cursor-pointer select-none transition-opacity ${done ? "opacity-40" : ""}`}
                  onClick={() => toggleIngredient(i)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault()
                      toggleIngredient(i)
                    }
                  }}
                >
                  <span className={`qty num ${done ? "line-through" : ""}`}>{ing.qty || "—"}</span>
                  <span className={`item ${done ? "line-through" : ""}`}>{ing.item}</span>
                </li>
              )
            })}
          </ul>
        </aside>
      )}

      {/* Instructions column */}
      {instructions.length > 0 && (
        <section>
          <div className="eyebrow eyebrow--lingon mb-4">No. II · Method</div>
          <h2 className="editorial-h3 mb-6 font-normal">Instructions</h2>
          <ol className="space-y-6">
            {instructions.map((step, i) => {
              const done = doneSteps.has(i)
              return (
                <li
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-pressed={done}
                  aria-label={`${done ? "Uncheck" : "Check"} step ${i + 1}`}
                  className={`grid grid-cols-[44px_1fr] gap-4 cursor-pointer select-none transition-opacity ${
                    done ? "opacity-40" : ""
                  }`}
                  onClick={() => toggleStep(i)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault()
                      toggleStep(i)
                    }
                  }}
                >
                  <span
                    className={`font-serif num text-2xl leading-none pt-1 ${
                      done ? "text-ink-muted line-through" : "text-lingon"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-[18px] leading-[1.55] ${
                      done ? "text-ink-muted line-through" : "text-ink-soft"
                    }`}
                  >
                    {step}
                  </span>
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </div>
  )
}
