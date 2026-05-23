import Link from "next/link"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { SprigDivider } from "@/components/sprig-divider"

export default async function ManageRecipesPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/admin/recipes/manage")
  }

  // Fetch recipes
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, slug, category, images, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching recipes:", error)
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">Administration</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Manage the <em className="italic" style={{ color: "var(--lingon-deep)" }}>recipes</em>
        </h1>
        <p className="lede">Edit, photograph, and tend to every dish in the book.</p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />

        <div className="mt-8">
          <Link href="/recipes/new" className="btn">
            Add a new recipe
          </Link>
        </div>
      </div>

      {recipes && recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="flex flex-col">
              <Link href={`/recipes/${recipe.slug}`} className="recipe-card block">
                <div className="aspect-[4/5] relative overflow-hidden bg-parchment-deep">
                  {recipe.images && recipe.images.length > 0 ? (
                    <Image
                      src={recipe.images[0]}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      style={{ filter: "saturate(0.92)" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-serif italic text-ink-muted">No image yet</span>
                    </div>
                  )}
                </div>
                <div className="py-5 text-center">
                  <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted mb-1">
                    {recipe.category}
                  </div>
                  <h3 className="recipe-card-title">{recipe.title}</h3>
                  <p className="mt-2 font-serif italic text-ink-muted text-[15px]">
                    {recipe.images?.length || 0} image{recipe.images?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>

              <div className="flex justify-center gap-6 pt-3 border-t border-dotted border-rule">
                <Link
                  href={`/recipes/edit/${recipe.id}`}
                  className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink hover:text-lingon-deep underline decoration-1 underline-offset-4"
                >
                  Edit
                </Link>
                <Link
                  href={`/recipes/${recipe.slug}`}
                  target="_blank"
                  className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-soft hover:text-lingon-deep underline decoration-1 underline-offset-4"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-12 text-center">
          <p className="font-serif italic text-ink-soft text-lg mb-6">
            No recipes yet. The book is waiting for its first entry.
          </p>
          <Link href="/recipes/new" className="btn">
            Create your first recipe
          </Link>
        </div>
      )}
    </div>
  )
}
