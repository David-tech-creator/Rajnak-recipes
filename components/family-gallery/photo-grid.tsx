"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { FamilyPhoto } from "@/lib/types/family"

interface PhotoGridProps {
  photos: FamilyPhoto[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const showPrev = () =>
    setSelectedIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))
  const showNext = () =>
    setSelectedIndex((i) => (i === null ? i : (i + 1) % photos.length))
  const handleCloseModal = () => setSelectedIndex(null)

  // Keyboard: Escape closes, arrows move between photos.
  useEffect(() => {
    if (selectedIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null)
      else if (e.key === "ArrowLeft") showPrev()
      else if (e.key === "ArrowRight") showNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, photos.length])

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null
    // Horizontal swipe only.
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) showPrev()
      else showNext()
    }
  }

  const handleDeletePhoto = async (photo: FamilyPhoto) => {
    if (!confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      const url = photo.url
      const fileName = url.split("/").pop()
      if (!fileName) {
        console.error("Could not extract filename from URL:", url)
        return
      }
      const filePath = fileName

      const { error: storageError } = await supabase.storage
        .from("family-photos")
        .remove([filePath])

      if (storageError) {
        console.error("Error deleting file from storage:", storageError)
      }

      const { error: dbError } = await supabase
        .from("family_photos")
        .delete()
        .eq("id", photo.id)

      if (dbError) throw dbError

      toast({
        title: "Photo deleted",
        description: "The photo has been removed from the album.",
      })

      setSelectedIndex(null)
      window.location.reload()
    } catch (error) {
      console.error("Error deleting photo:", error)
      toast({
        title: "Error",
        description: "Failed to delete the photo",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownloadPhoto = (photo: FamilyPhoto) => {
    const link = document.createElement("a")
    link.href = photo.url
    link.download = `family-photo-${photo.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(i)}
            className="recipe-card group block text-left w-full"
            aria-label={photo.caption || "View photo"}
          >
            {/* White matte frame around the print. */}
            <div className="bg-white p-1.5 sm:p-2">
              <div className="aspect-[4/5] relative overflow-hidden border border-black/5">
                <Image
                  src={photo.url || "/placeholder.svg"}
                  alt={photo.caption || "Family photo"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ filter: "saturate(0.92)" }}
                />
              </div>
            </div>
            {/* On mobile, thumbnails are clean photos only — caption shows in the
                lightbox. Text returns on tablet/desktop. */}
            {(photo.caption || photo.date) && (
              <div className="hidden sm:block px-2.5 sm:px-3 pb-3 pt-2 text-center">
                {photo.caption && (
                  <p className="font-serif text-[14px] text-ink-soft leading-snug line-clamp-2">
                    {photo.caption}
                  </p>
                )}
                {photo.date && (
                  <div className="font-serif-sc uppercase tracking-[0.2em] text-[10px] text-ink-muted mt-1">
                    {new Date(photo.date).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Photo lightbox — fits the screen, swipe / arrows to move between photos. */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-ink/85 flex items-center justify-center p-3 sm:p-6"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.caption || "Family photograph"}
        >
          <button
            onClick={handleCloseModal}
            aria-label="Close"
            className="fixed right-3 z-20 bg-cream/95 border border-rule-soft h-11 px-4 inline-flex items-center font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink hover:text-lingon-deep"
            style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            Close
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); showPrev() }}
                aria-label="Previous photo"
                className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-cream/95 border border-rule-soft h-12 w-12 inline-flex items-center justify-center text-ink hover:text-lingon-deep"
              >
                <ChevronLeft size={22} strokeWidth={1.5} aria-hidden />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); showNext() }}
                aria-label="Next photo"
                className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-cream/95 border border-rule-soft h-12 w-12 inline-flex items-center justify-center text-ink hover:text-lingon-deep"
              >
                <ChevronRight size={22} strokeWidth={1.5} aria-hidden />
              </button>
            </>
          )}

          <div
            className="w-full max-w-3xl bg-cream border border-rule-soft shadow-[var(--paper-shadow)] max-h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="bg-parchment-deep flex-1 min-h-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.url || "/placeholder.svg"}
                alt={selectedPhoto.caption || "Family photo"}
                className="block max-h-[68vh] w-auto max-w-full object-contain"
              />
            </div>

            <div
              className="px-4 sm:px-5 py-4 border-t border-rule-soft flex flex-wrap items-center justify-between gap-3 flex-shrink-0"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              <div className="min-w-0">
                {selectedPhoto.caption && (
                  <p className="font-serif italic text-[17px] text-ink leading-snug">
                    {selectedPhoto.caption}
                  </p>
                )}
                <div className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mt-1">
                  {selectedIndex !== null && `${selectedIndex + 1} / ${photos.length}`}
                  {selectedPhoto.date && ` · ${new Date(selectedPhoto.date).toLocaleDateString()}`}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={() => handleDownloadPhoto(selectedPhoto)}
                  className="btn btn--ghost"
                >
                  Download
                </button>
                {user && (
                  <button
                    onClick={() => handleDeletePhoto(selectedPhoto)}
                    disabled={isDeleting}
                    className="btn btn--lingon"
                  >
                    {isDeleting ? "Deleting…" : "Delete"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
