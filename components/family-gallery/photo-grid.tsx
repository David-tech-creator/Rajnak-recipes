"use client"

import { useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { FamilyPhoto } from "@/lib/types/family"

interface PhotoGridProps {
  photos: FamilyPhoto[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<FamilyPhoto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handlePhotoClick = (photo: FamilyPhoto) => {
    setSelectedPhoto(photo)
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
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

      setSelectedPhoto(null)
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => handlePhotoClick(photo)}
            className="recipe-card block text-left w-full"
            aria-label={photo.caption || "View photo"}
          >
            <div className="aspect-[4/5] relative overflow-hidden">
              <Image
                src={photo.url || "/placeholder.svg"}
                alt={photo.caption || "Family photo"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
                style={{ filter: "saturate(0.92)" }}
              />
            </div>
            {(photo.caption || photo.date) && (
              <div className="py-4 px-3 text-center">
                {photo.caption && (
                  <h3 className="recipe-card-title text-[18px]">{photo.caption}</h3>
                )}
                {photo.date && (
                  <div className="font-serif-sc uppercase tracking-[0.26em] text-[10px] text-ink-muted mt-1">
                    {new Date(photo.date).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Photo modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-ink/80 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-cream border border-rule-soft shadow-[var(--paper-shadow)] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-rule-soft">
              <h3 className="font-serif italic text-[20px] text-ink">
                {selectedPhoto.caption || "Family photograph"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted hover:text-lingon-deep"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <div className="relative flex-grow overflow-auto bg-parchment-deep">
              <div className="relative h-[60vh]">
                <Image
                  src={selectedPhoto.url || "/placeholder.svg"}
                  alt={selectedPhoto.caption || "Family photo"}
                  fill
                  sizes="(max-width: 1280px) 90vw, 1200px"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="p-5 border-t border-rule-soft flex justify-between items-center">
              <div className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted">
                {selectedPhoto.date
                  ? new Date(selectedPhoto.date).toLocaleDateString()
                  : ""}
              </div>
              <div className="flex items-center gap-3">
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
