"use client"

import type React from "react"
import { useCallback, useRef } from "react"
import { useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, X, ImagePlus } from "lucide-react"

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
    <div className="space-y-6">
      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Current Images</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`Recipe image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onImageRemove(url)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 rounded-full bg-primary/10">
            <ImagePlus className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drag and drop your images here</p>
            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Select Files
          </Button>
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
          <h3 className="text-sm font-medium">Selected Files ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div className="h-10 w-10 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && (
        <Button type="button" className="w-full" onClick={uploadFiles} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.length} {files.length === 1 ? "Image" : "Images"}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
