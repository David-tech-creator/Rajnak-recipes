"use client"

import { RecipeInteractive } from "@/components/recipe-interactive"
import { SprigDivider } from "@/components/sprig-divider"

type Props = {
  slug: string
  baseServings?: number
  ingredients: string[]
  instructions: string[]
  story?: string
}

export function RecipeBody({ slug, baseServings, ingredients, instructions, story }: Props) {
  const hasRecipe = ingredients.length > 0 || instructions.length > 0
  const hasStory = Boolean(story && story.trim())

  return (
    <>
      {hasRecipe && (
        <div id="recipe" className="scroll-mt-24">
          <RecipeInteractive
            slug={slug}
            baseServings={baseServings}
            ingredients={ingredients}
            instructions={instructions}
          />
        </div>
      )}

      {hasStory && (
        <section id="story" className="max-w-2xl mx-auto pt-4 pb-6 scroll-mt-24">
          <SprigDivider variant="leaf" className="!mt-2 !mb-8 max-w-xs mx-auto" />
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
        </section>
      )}
    </>
  )
}
