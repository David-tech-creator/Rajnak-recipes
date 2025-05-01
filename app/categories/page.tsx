import Link from "next/link"
import Image from "next/image"
import { CATEGORY_GROUPS } from "@/lib/categories"

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl text-center mb-12">Recipe Categories</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORY_GROUPS.map((category) => (
          <Link
            key={category.name}
            href={`/categories/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="category-box block"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={`/placeholder-svg.png?height=400&width=400&text=${encodeURIComponent(category.name)}`}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="category-box-label">{category.name}</div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">{category.description}</p>
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="text-center text-xs text-gray-400 mt-2">{category.subcategories.join(" • ")}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
