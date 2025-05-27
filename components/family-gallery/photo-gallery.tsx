"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PhotoUploader } from "./photo-uploader"
import { PhotoGrid } from "./photo-grid"
import { Loader2, Upload, Calendar, Users, RefreshCcw } from "lucide-react"
import type { FamilyPhoto } from "@/lib/types/family"

interface PhotoGalleryProps {
  eventId?: string | number
}

export function PhotoGallery({ eventId }: PhotoGalleryProps = {}) {
  const [photos, setPhotos] = useState<FamilyPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
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
    } catch (error) {
      console.error("Error initializing database:", error)
      setError(error instanceof Error ? error.message : "Failed to initialize database")
      return false
    }
  }

  // Fetch photos with improved error handling
  const fetchPhotos = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Ensure database is initialized
      await initializeDatabase()

      // Log the query parameters
      console.log("Fetching photos with filter:", { activeTab })

      let query = supabase
        .from("family_photos")
        .select("*")
        .order("created_at", { ascending: false })

      // If eventId is provided, filter by that specific event
      if (eventId) {
        query = query.eq("event_id", eventId)
      } else if (activeTab !== "all") {
        query = query.eq("event_type", activeTab)
      }

      // Log the query before executing
      console.log("Executing Supabase query...")

      const { data, error: supabaseError } = await query

      // Log the response
      console.log("Supabase response:", { data, error: supabaseError })

      if (supabaseError) {
        throw supabaseError
      }

      if (!data) {
        throw new Error("No data returned from Supabase")
      }

      setPhotos(data)
    } catch (error) {
      // Detailed error logging
      console.error("Full error object:", error)
      
      let errorMessage = "Failed to load photos"
      if (error instanceof Error) {
        errorMessage = error.message
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
      }

      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [activeTab])

  const handlePhotoUploaded = () => {
    fetchPhotos()
    toast({
      title: "Success",
      description: "Photo uploaded successfully",
    })
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Photos</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={fetchPhotos} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Family Photo Gallery</h2>
        {user && (
          <Button
            variant="outline"
            onClick={() => document.getElementById("photo-upload-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Upload className="mr-2 h-4 w-4" />
            Add Photos
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!eventId && (
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="holiday">Holidays</TabsTrigger>
            <TabsTrigger value="birthday">Birthdays</TabsTrigger>
            <TabsTrigger value="dinner">Family Dinners</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : photos.length > 0 ? (
            <PhotoGrid photos={photos} />
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No photos yet</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === "all"
                  ? "Be the first to share a family memory!"
                  : `No ${activeTab} photos have been shared yet.`}
              </p>
              {user ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("photo-upload-section")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Upload Photos
                </Button>
              ) : (
                <p className="text-sm text-gray-500">Sign in to upload photos</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {user && <PhotoUploader onPhotoUploaded={handlePhotoUploaded} />}
    </div>
  )
}
