"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface PhotoUploaderProps {
  onPhotoUploaded: () => void
  eventId?: string
}

const labelClass =
  "block font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted mb-2"
const inputClass =
  "w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink"

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

      const { error: uploadError } = await supabase.storage
        .from("family-photos")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("family-photos").getPublicUrl(filePath)
      const imageUrl = data.publicUrl

      const { error: dbError } = await supabase.from("family_photos").insert([
        {
          url: imageUrl,
          caption,
          date: new Date().toISOString(),
          event_type: "other",
          created_by: user.id,
          event_id: eventId || null,
        },
      ])

      if (dbError) throw dbError

      toast({
        title: "Photo uploaded",
        description: "Your photo has been uploaded successfully",
      })

      setFile(null)
      setCaption("")

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
    <div className="bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="file" className={labelClass}>
            Select photo
          </label>
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="caption" className={labelClass}>
            Caption
          </label>
          <input
            type="text"
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="A short note about this photograph"
            disabled={uploading}
            className={inputClass}
          />
          <p className="mt-2 text-[15px] italic text-ink-muted">Optional &mdash; a sentence is plenty.</p>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button type="submit" disabled={uploading || !file} className="btn">
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
        </div>
      </form>
    </div>
  )
}
