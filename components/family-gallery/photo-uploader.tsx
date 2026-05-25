"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"
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
  "w-full bg-cream border border-rule-soft px-4 py-3 font-serif text-[18px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink"

export function PhotoUploader({ onPhotoUploaded, eventId }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Free the preview object URL when it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const selectFile = (next: File) => {
    if (!next.type.startsWith("image/")) {
      toast({
        title: "Not an image",
        description: "Please choose a photo file (JPEG, PNG, GIF, or WebP).",
        variant: "destructive",
      })
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) selectFile(picked)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (uploading) return
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) selectFile(dropped)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!uploading) setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
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

      // No upsert: per-owner storage RLS means upsert against another user's
      // file would silently fail (or worse). Date.now() makes collisions
      // virtually impossible anyway.
      const { error: uploadError } = await supabase.storage
        .from("family-photos")
        .upload(filePath, file, {
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

      clearFile()
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
          <span className={labelClass}>Photo</span>

          {preview ? (
            <div className="relative aspect-[4/3] max-w-md bg-parchment-deep border border-rule-soft overflow-hidden">
              {/* Plain <img> so blob: preview URLs work without Next loader. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Selected photo preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearFile}
                disabled={uploading}
                aria-label="Remove photo"
                className="absolute top-2 right-2 bg-cream/95 border border-rule-soft h-11 w-11 inline-flex items-center justify-center hover:text-lingon-deep disabled:opacity-50"
              >
                <X size={16} strokeWidth={1.5} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-2 right-2 bg-cream/95 border border-rule-soft px-3 py-1.5 font-serif-sc uppercase tracking-[0.18em] text-[10px] text-ink hover:text-lingon-deep disabled:opacity-50"
              >
                Replace
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              disabled={uploading}
              aria-label="Add a photo — drag and drop, or click to browse"
              className={`w-full aspect-[4/3] max-w-md flex flex-col items-center justify-center gap-3 border-2 border-dotted p-6 text-center transition-colors disabled:opacity-50 ${
                dragActive
                  ? "border-lingon bg-lingon-soft/15"
                  : "border-rule bg-parchment-deep/40 hover:border-lingon"
              }`}
            >
              <ImagePlus size={36} strokeWidth={1.2} className="text-ink-muted" aria-hidden />
              <span className="font-serif-sc uppercase tracking-[0.22em] text-[12px] text-ink">
                {dragActive ? "Drop the photo" : "Drag a photo here"}
              </span>
              <span className="font-serif italic text-[14px] text-ink-muted">
                or click to choose one from your device.
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
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
