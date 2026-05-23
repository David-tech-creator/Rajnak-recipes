"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export function AdminRecipeRow({
  slug,
  title,
  category,
  image,
  categorySlug,
}: {
  slug: string
  title: string
  category: string
  image?: string
  categorySlug: string
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDelete = async () => {
    if (!confirm(`Delete "${title}"? This commits a removal to the repo.`)) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/recipes/${slug}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Delete failed")
      // Reload so the list refreshes
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
      setDeleting(false)
    }
  }

  return (
    <tr className="border-b border-dotted border-rule last:border-b-0">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          {image && (
            <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden bg-parchment-deep">
              <Image src={image} alt="" fill className="object-cover" sizes="48px" />
            </div>
          )}
          <Link href={`/recipes/${slug}`} className="font-serif text-ink hover:text-lingon-deep">
            {title}
          </Link>
        </div>
      </td>
      <td className="px-5 py-3 hidden sm:table-cell">
        <Link
          href={`/categories/${categorySlug}`}
          className="font-serif-sc uppercase tracking-[0.18em] text-[10px] text-ink-muted hover:text-lingon-deep"
        >
          {category}
        </Link>
      </td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/admin/recipes/${slug}`}
            className="font-serif-sc uppercase tracking-[0.18em] text-[10px] text-ink hover:text-lingon-deep"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="font-serif-sc uppercase tracking-[0.18em] text-[10px] text-lingon hover:text-lingon-deep disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
        {error && (
          <p className="text-[12px] italic text-lingon-deep mt-1">{error}</p>
        )}
      </td>
    </tr>
  )
}
