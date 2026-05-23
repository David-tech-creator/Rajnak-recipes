"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { PhotoUploader } from "./photo-uploader"
import { PhotoGrid } from "./photo-grid"
import type { FamilyPhoto } from "@/lib/types/family"

interface PhotoGalleryProps {
  eventId?: string | number
}

const FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "holiday", label: "Holidays" },
  { value: "birthday", label: "Birthdays" },
  { value: "dinner", label: "Dinners" },
  { value: "other", label: "Other" },
]

export function PhotoGallery({ eventId }: PhotoGalleryProps = {}) {
  const [photos, setPhotos] = useState<FamilyPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [showUploader, setShowUploader] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Initialize the database tables and storage
  const initializeDatabase = async () => {
    try {
      const response = await fetch("/api/init-family-photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to initialize database")
      }

      return true
    } catch (err) {
      console.error("Error initializing database:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize database")
      return false
    }
  }

  const fetchPhotos = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await initializeDatabase()

      let query = supabase
        .from("family_photos")
        .select("*")
        .order("created_at", { ascending: false })

      if (eventId) {
        query = query.eq("event_id", eventId)
      } else if (activeTab !== "all") {
        query = query.eq("event_type", activeTab)
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) {
        throw supabaseError
      }

      if (!data) {
        throw new Error("No data returned")
      }

      setPhotos(data)
    } catch (err) {
      console.error("Full error object:", err)

      let errorMessage = "Failed to load photos"
      if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      // Only show the destructive toast to logged-in family members.
      // Public visitors should see no error noise; the empty-state card
      // below will read "No photographs yet" naturally.
      if (user) {
        toast({
          title: "Could not load photos",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, eventId])

  const handlePhotoUploaded = () => {
    fetchPhotos()
    setShowUploader(false)
    toast({
      title: "Photo added",
      description: "Your photo has been added to the album.",
    })
  }

  if (error && !user) {
    // Hide the gallery entirely from public visitors when the backend isn't reachable.
    return null
  }

  if (error) {
    return (
      <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 text-center">
        <div className="eyebrow eyebrow--lingon">Photo gallery</div>
        <p className="mt-4 font-serif italic text-ink-muted text-lg">
          The gallery is resting just now. {error}
        </p>
        <button onClick={fetchPhotos} className="btn btn--ghost mt-6">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="eyebrow eyebrow--lingon">The photographs</div>
          <h2 className="editorial-h3 mt-2 font-normal">Family photo gallery</h2>
        </div>
        {user && (
          <button
            onClick={() => setShowUploader((v) => !v)}
            className="btn"
          >
            {showUploader ? "Cancel" : "Add photo"}
          </button>
        )}
      </div>

      {!eventId && (
        <div className="flex flex-wrap gap-2 border-b border-rule-soft pb-4">
          {FILTERS.map((f) => {
            const active = activeTab === f.value
            return (
              <button
                key={f.value}
                onClick={() => setActiveTab(f.value)}
                className={
                  active
                    ? "tag tag--solid"
                    : "tag hover:text-lingon-deep hover:border-lingon"
                }
              >
                {f.label}
              </button>
            )
          })}
        </div>
      )}

      {showUploader && user && (
        <div id="photo-upload-section">
          <PhotoUploader onPhotoUploaded={handlePhotoUploaded} eventId={eventId ? String(eventId) : undefined} />
        </div>
      )}

      {isLoading ? (
        <p className="text-center font-serif italic text-ink-muted text-lg py-12">
          Loading photographs&hellip;
        </p>
      ) : photos.length > 0 ? (
        <PhotoGrid photos={photos} />
      ) : (
        <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-12 text-center">
          <p className="font-serif italic text-ink-muted text-lg">
            {activeTab === "all"
              ? "No photographs yet. Be the first to share a family memory."
              : `No ${activeTab} photographs have been shared yet.`}
          </p>
          {user ? (
            <button
              onClick={() => setShowUploader(true)}
              className="btn btn--ghost mt-6"
            >
              Add the first photo
            </button>
          ) : (
            <p className="mt-4 text-[15px] italic text-ink-muted">Sign in to upload photos.</p>
          )}
        </div>
      )}
    </div>
  )
}
