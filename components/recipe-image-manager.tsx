"use client"

import type React from "react"
import { useCallback, useRef } from "react"
import { useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface RecipeImageManagerProps {
  recipeId?: number
  slug: string
  existingImages?: string[]
  onImagesUploaded: (urls: string[]) => void
  onImageRemove: (url: string) => void
}

export function RecipeImageManager({
  recipeId,
  slug,
  existingImages = [],
  onImagesUploaded,
  onImageRemove,
}: RecipeImageManagerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

      if (droppedFiles.length === 0) {
        toast({
          title: "Invalid files",
          description: "Please drop image files only",
          variant: "destructive",
        })
        return
      }

      setFiles((prevFiles) => [...prevFiles, ...droppedFiles])
    },
    [toast],
  )

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles])
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }, [])

  const onUploadProgress = useCallback((progress: number) => {
    setUploadProgress(progress)
  }, [])

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const uploadedUrls: string[] = []
    const totalFiles = files.length

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split(".").pop()
        const fileName = `${slug}-${Date.now()}-${i}.${fileExt}`
        const filePath = `recipes/${fileName}`

        const { error: uploadError } = await supabase.storage.from("recipes").upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from("recipes").getPublicUrl(filePath)
        uploadedUrls.push(data.publicUrl)

        // Update progress
        onUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
      }

      // Clear files after successful upload
      setFiles([])
      onImagesUploaded(uploadedUrls)

      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${uploadedUrls.length} images`,
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted">
            Current images
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <div key={index} className="relative group aspect-square overflow-hidden border border-rule-soft bg-parchment-deep">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`Recipe image ${index + 1}`}
                  fill
                  className="object-cover"
                  style={{ filter: "saturate(0.92)" }}
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onImageRemove(url)}
                    className="bg-cream border border-lingon px-3 py-1 font-serif-sc uppercase tracking-[0.22em] text-[10px] text-lingon-deep hover:bg-lingon-soft/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload area */}
      <div
        className={`border-2 border-dotted p-12 text-center transition-colors ${
          isDragging ? "border-ink bg-cream" : "border-rule bg-cream/60"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="font-serif italic text-ink-soft text-[18px]">
            Drag and drop your images here
          </p>
          <p className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted">
            — or —
          </p>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Select files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
            disabled={uploading}
          />
        </div>
      </div>

      {/* Selected files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif-sc uppercase tracking-[0.22em] text-[11px] text-ink-muted">
            Selected files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-rule-soft bg-cream">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="h-12 w-12 relative overflow-hidden bg-parchment-deep flex-shrink-0 border border-rule-soft">
                    <Image
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-serif text-ink truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="font-serif-sc uppercase tracking-[0.22em] text-[10px] text-lingon hover:text-lingon-deep underline decoration-1 underline-offset-4"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between font-serif-sc uppercase tracking-[0.22em] text-[10px] text-ink-muted">
            <span>Uploading…</span>
            <span className="num">{uploadProgress}%</span>
          </div>
          <div className="h-[2px] bg-rule-soft overflow-hidden">
            <div
              className="h-full bg-ink transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && (
        <div className="text-center">
          <button
            type="button"
            className="btn"
            onClick={uploadFiles}
            disabled={uploading}
          >
            {uploading
              ? "Uploading…"
              : `Upload ${files.length} ${files.length === 1 ? "image" : "images"}`}
          </button>
        </div>
      )}
    </div>
  )
}
