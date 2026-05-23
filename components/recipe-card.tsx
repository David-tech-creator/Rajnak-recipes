import Image from "next/image"
import Link from "next/link"

export type RecipeCardProps = {
  slug: string
  title: string
  category: string
  image?: string
  /** Optional zero-padded number for the corner badge (e.g. "№ 47"). */
  number?: string
  /** Optional handwritten Caveat byline shown beneath the title. */
  byline?: string
}

export function RecipeCard({ slug, title, category, image, number, byline }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${slug}`} className="recipe-card block group">
      <div className="aspect-[4/5] relative overflow-hidden">
        <Image
          src={image || "/images/recipes/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          style={{ filter: "saturate(0.92)" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {number && (
          <div className="absolute top-3 left-3 bg-cream/95 backdrop-blur-sm border border-ink px-3 py-1 font-serif-sc uppercase tracking-[0.22em] text-[10px] text-ink">
            № {number}
          </div>
        )}
      </div>
      <div className="py-5 px-4 text-center">
        <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted mb-1">
          {category}
        </div>
        <h3 className="recipe-card-title">{title}</h3>
        {byline && (
          <p className="hand text-[18px] md:text-[20px] mt-2 leading-tight">&mdash; {byline}</p>
        )}
      </div>
    </Link>
  )
}
