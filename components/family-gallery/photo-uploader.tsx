"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"

interface PhotoUploaderProps {
  onPhotoUploaded: () => void
  eventId?: string
}

export function PhotoUploader({ onPhotoUploaded, eventId }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload photos",
        variant: "destructive",
      })
      return
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `family-${Date.now()}.${fileExt}`
      const filePath = fileName

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("family-photos").upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from("family-photos").getPublicUrl(filePath)
      const imageUrl = data.publicUrl

      // Save photo details to database
      const { error: dbError } = await supabase.from("family_photos").insert([
        {
          url: imageUrl,
          caption,
          date: new Date().toISOString(),
          event_type: "other", // Default event type
          created_by: user.id,
          event_id: eventId || null,
        },
      ])

      if (dbError) throw dbError

      toast({
        title: "Photo uploaded",
        description: "Your photo has been uploaded successfully",
      })

      // Reset form
      setFile(null)
      setCaption("")

      // Trigger refresh
      onPhotoUploaded()
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select Photo</Label>
            <Input type="file" id="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input
              type="text"
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this photo"
              disabled={uploading}
            />
          </div>

          <Button type="submit" disabled={uploading || !file} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
