import { notFound } from "next/navigation"
import { getPostBySlug } from "@/lib/posts"
import { AdminRecipeForm } from "@/components/admin-recipe-form"
import { SprigDivider } from "@/components/sprig-divider"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Edit recipe",
}

export default async function EditRecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recipe = getPostBySlug(slug)
  if (!recipe) notFound()

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <div className="eyebrow eyebrow--lingon">Administration</div>
        <h1 className="editorial-h1 mt-3 mb-3 font-normal">Edit recipe</h1>
        <p className="lede">{recipe.title}</p>
        <SprigDivider variant="berry" className="!mt-8 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-3xl mx-auto">
        <AdminRecipeForm
          mode="update"
          initial={{
            slug: recipe.slug,
            title: recipe.title,
            category: recipe.category,
            image: recipe.image,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            kitchenNote: recipe.kitchenNote,
            signoff: recipe.signoff,
            story: recipe.story,
            featured: recipe.featured,
          }}
        />
      </div>
    </div>
  )
}
