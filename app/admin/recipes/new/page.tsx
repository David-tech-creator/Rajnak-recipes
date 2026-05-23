import { AdminRecipeForm } from "@/components/admin-recipe-form"
import { SprigDivider } from "@/components/sprig-divider"

export const metadata = {
  title: "Add a recipe",
}

export default function NewRecipePage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <div className="eyebrow eyebrow--lingon">Administration</div>
        <h1 className="editorial-h1 mt-3 mb-3 font-normal">
          A new <em className="italic" style={{ color: "var(--lingon-deep)" }}>page</em> in the book.
        </h1>
        <p className="lede">
          Fill in the details — the recipe commits to the family book the moment you save.
        </p>
        <SprigDivider variant="berry" className="!mt-8 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-3xl mx-auto">
        <AdminRecipeForm initial={{}} mode="create" />
      </div>
    </div>
  )
}
