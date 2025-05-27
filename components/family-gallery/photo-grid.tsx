"use client"

import { useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Trash2, Download, X } from "lucide-react"
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
      // Extract file path from URL
      const url = photo.url
      const fileName = url.split("/").pop()
      if (!fileName) {
        console.error("Could not extract filename from URL:", url)
        return
      }
      const filePath = fileName

      // Delete file from storage
      const { error: storageError } = await supabase.storage.from("family-photos").remove([filePath])

      if (storageError) {
        console.error("Error deleting file from storage:", storageError)
      }

      // Delete record from database
      const { error: dbError } = await supabase.from("family_photos").delete().eq("id", photo.id)

      if (dbError) throw dbError

      toast({
        title: "Photo deleted",
        description: "The photo has been deleted successfully",
      })

      // Close modal and refresh page
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handlePhotoClick(photo)}
          >
            <Image
              src={photo.url || "/placeholder.svg"}
              alt={photo.caption || "Family photo"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">{selectedPhoto.caption || "Family Photo"}</h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="relative flex-grow overflow-auto">
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

            <div className="p-4 border-t flex justify-between items-center">
              <div>
                {selectedPhoto.date && (
                  <p className="text-sm text-gray-500">{new Date(selectedPhoto.date).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadPhoto(selectedPhoto)}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePhoto(selectedPhoto)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
