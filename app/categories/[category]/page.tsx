import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase"
import { CATEGORY_GROUPS } from "@/lib/categories"

export async function generateStaticParams() {
  // Generate paths for all categories and subcategories
  const paths = CATEGORY_GROUPS.flatMap((category) => {
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, "-")
    const categoryPaths = [{ category: categorySlug }]

    if (category.subcategories) {
      const subcategoryPaths = category.subcategories.map((subcategory) => ({
        category: subcategory.toLowerCase().replace(/\s+/g, "-"),
      }))
      return [...categoryPaths, ...subcategoryPaths]
    }

    return categoryPaths
  })

  return paths
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category).replace(/-/g, " ")

  // Find the category in our defined categories
  const categoryGroup = CATEGORY_GROUPS.find((group) => group.name.toLowerCase() === decodedCategory.toLowerCase())

  // Check if it's a subcategory
  const isSubcat = CATEGORY_GROUPS.some((group) =>
    group.subcategories?.some((sub) => sub.toLowerCase() === decodedCategory.toLowerCase()),
  )

  if (!categoryGroup && !isSubcat) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found",
    }
  }

  // Format the category name with proper capitalization
  const formattedCategory = decodedCategory
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    title: `${formattedCategory} Recipes | Recipe Collection`,
    description: categoryGroup?.description || `Browse our collection of ${formattedCategory} recipes`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const supabase = createServerSupabaseClient()
  const { category } = await params
  const decodedCategory = decodeURIComponent(category).replace(/-/g, " ")

  // Format the category name with proper capitalization
  const formattedCategory = decodedCategory
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  // Find the category in our defined categories
  const categoryGroup = CATEGORY_GROUPS.find((group) => group.name.toLowerCase() === decodedCategory.toLowerCase())

  // Check if it's a subcategory
  const parentCategory = CATEGORY_GROUPS.find((group) =>
    group.subcategories?.some((sub) => sub.toLowerCase() === decodedCategory.toLowerCase()),
  )

  if (!categoryGroup && !parentCategory) {
    notFound()
  }

  // Fetch recipes for this category with error handling
  let recipes = []
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .ilike("category", formattedCategory)
      .order("created_at", { ascending: false })

    if (!error && data) {
      recipes = data
    }
  } catch (error) {
    console.error("Error fetching recipes:", error)
    // Continue with empty recipes array
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[40vh] flex items-center justify-center">
        <Image
          src={`/placeholder-text.png?height=600&width=1200&text=${encodeURIComponent(formattedCategory)}`}
          alt={formattedCategory}
          fill
          className="object-cover"
          priority
        />
        <div className="hero-overlay">
          <h1 className="text-4xl mb-2">{formattedCategory}</h1>
          <p className="text-gray-600">{recipes?.length || 0} recipes</p>
          {parentCategory && (
            <p className="text-sm mt-2">
              Part of{" "}
              <Link
                href={`/categories/${parentCategory.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="underline"
              >
                {parentCategory.name}
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {categoryGroup?.subcategories && categoryGroup.subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl mb-6">Subcategories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryGroup.subcategories.map((subcategory) => (
                <Link
                  key={subcategory}
                  href={`/categories/${subcategory.toLowerCase().replace(/\s+/g, "-")}`}
                  className="bg-[rgb(var(--light-accent))] p-4 text-center hover:bg-[rgb(var(--accent-color))] hover:text-white transition-colors"
                >
                  {subcategory}
                </Link>
              ))}
            </div>
          </div>
        )}

        {recipes && recipes.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="recipe-card block">
                <div className="aspect-[4/3] relative overflow-hidden">
                  {recipe.images && recipe.images.length > 0 ? (
                    <Image
                      src={recipe.images[0] || "/placeholder.svg"}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <Image
                      src={`/placeholder-graphic.png?height=400&width=600&text=${encodeURIComponent(recipe.title)}`}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                </div>
                <h3 className="recipe-card-title">{recipe.title}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[rgb(var(--light-accent))]">
            <p className="mb-4">No recipes found in this category yet.</p>
            <Link
              href="/recipes/new"
              className="inline-block px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Add a Recipe
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
