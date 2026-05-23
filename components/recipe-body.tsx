"use client"

import { useEffect, useRef, useState } from "react"
import { RecipeInteractive } from "@/components/recipe-interactive"
import { SprigDivider } from "@/components/sprig-divider"

type Props = {
  slug: string
  baseServings?: number
  ingredients: string[]
  instructions: string[]
  story?: string
}

type View = "recipe" | "story"

function hashView(): View {
  if (typeof window === "undefined") return "recipe"
  return window.location.hash === "#story" ? "story" : "recipe"
}

export function RecipeBody({ slug, baseServings, ingredients, instructions, story }: Props) {
  const [view, setView] = useState<View>("recipe")
  const hasStory = Boolean(story && story.trim())
  const firstRender = useRef(true)

  useEffect(() => {
    setView(hashView())
    const onHash = () => setView(hashView())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  // After view actually flips, scroll to the now-rendered section.
  // We skip this on the very first render so an initial visit (no hash)
  // doesn't auto-scroll past the hero.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (firstRender.current) {
      firstRender.current = false
      // Honor an initial hash by scrolling once on first paint.
      if (window.location.hash === "#story" || window.location.hash === "#recipe") {
        requestAnimationFrame(() => {
          const el = document.getElementById(view === "story" ? "story" : "recipe")
          el?.scrollIntoView({ behavior: "smooth", block: "start" })
        })
      }
      return
    }
    const el = document.getElementById(view === "story" ? "story" : "recipe")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [view])

  const switchTo = (v: View) => {
    setView(v)
    if (typeof window !== "undefined") {
      const newHash = v === "story" ? "#story" : "#recipe"
      // replaceState so we don't pollute browser history with every flip
      history.replaceState(null, "", newHash)
    }
  }

  const activeTab =
    "font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink px-1 py-2 border-b border-ink"
  const idleTab =
    "font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink-muted px-1 py-2 border-b border-transparent hover:text-lingon-deep transition-colors"

  return (
    <>
      {/* Tabs only show when there's a story to switch to */}
      {hasStory && (
        <div className="flex items-center justify-center gap-8 md:gap-12 mb-10 print:hidden">
          <button type="button" onClick={() => switchTo("recipe")} className={view === "recipe" ? activeTab : idleTab}>
            The Recipe
          </button>
          <button type="button" onClick={() => switchTo("story")} className={view === "story" ? activeTab : idleTab}>
            The Story
          </button>
        </div>
      )}

      {view === "recipe" && (ingredients.length > 0 || instructions.length > 0) && (
        <div id="recipe" className="scroll-mt-24">
          <RecipeInteractive
            slug={slug}
            baseServings={baseServings}
            ingredients={ingredients}
            instructions={instructions}
          />
        </div>
      )}

      {view === "story" && hasStory && (
        <section id="story" className="max-w-2xl mx-auto py-4 scroll-mt-24">
          <div className="eyebrow eyebrow--lingon text-center mb-4">The Story</div>
          <div className="recipe-prose text-[19px]">
            {story!
              .split(/\n\n+/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
          <SprigDivider variant="leaf" className="!mt-10 !mb-2 max-w-xs mx-auto" />
          <div className="text-center mt-2 print:hidden">
            <button
              type="button"
              onClick={() => switchTo("recipe")}
              className="btn btn--ghost"
            >
              Back to the recipe
            </button>
          </div>
        </section>
      )}
    </>
  )
}
