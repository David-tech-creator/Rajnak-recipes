"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExtractedRecipe } from "@/lib/recipe-extractor"

interface RecipePreviewProps {
  recipe: ExtractedRecipe
}

export function RecipePreview({ recipe }: RecipePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Extracted Recipe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Title</h3>
          <p>{recipe.title || "No title extracted"}</p>
        </div>

        {recipe.description && (
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm">{recipe.description}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {recipe.prep_time && (
            <div>
              <h3 className="font-medium mb-1 text-sm">Prep Time</h3>
              <p className="text-sm">{recipe.prep_time}</p>
            </div>
          )}

          {recipe.cook_time && (
            <div>
              <h3 className="font-medium mb-1 text-sm">Cook Time</h3>
              <p className="text-sm">{recipe.cook_time}</p>
            </div>
          )}

          {recipe.servings && (
            <div>
              <h3 className="font-medium mb-1 text-sm">Servings</h3>
              <p className="text-sm">{recipe.servings}</p>
            </div>
          )}
        </div>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Instructions</h3>
            <ol className="list-decimal pl-5 space-y-2">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-sm">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        )}

        {recipe.category && (
          <div>
            <h3 className="font-medium mb-1">Category</h3>
            <p className="text-sm">{recipe.category}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
