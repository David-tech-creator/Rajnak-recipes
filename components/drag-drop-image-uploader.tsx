"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface DragDropImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function DragDropImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
}: DragDropImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        toast({
          title: "Too many images",
          description: `You can only upload up to ${maxImages} images`,
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      try {
        const newImages: string[] = []

        for (const file of acceptedFiles) {
          const fileExt = file.name.split(".").pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("recipe-images")
            .upload(filePath, file)

          if (uploadError) {
            throw uploadError
          }

          const { data: urlData } = supabase.storage
            .from("recipe-images")
            .getPublicUrl(filePath)

          if (urlData) {
            newImages.push(urlData.publicUrl)
          }
        }

        onImagesChange([...images, ...newImages])
        toast({
          title: "Success",
          description: "Images uploaded successfully",
        })
      } catch (error) {
        console.error("Error uploading images:", error)
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload images",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    },
    [images, maxImages, onImagesChange, toast]
  )

  const removeImage = async (urlToRemove: string) => {
    // Extract file name from URL
    const fileName = urlToRemove.split("/").pop()
    if (!fileName) return

    try {
      const { error } = await supabase.storage
        .from("recipe-images")
        .remove([fileName])

      if (error) throw error

      onImagesChange(images.filter((url) => url !== urlToRemove))
      toast({
        title: "Success",
        description: "Image removed successfully",
      })
    } catch (error) {
      console.error("Error removing image:", error)
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          {isUploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : isDragActive ? (
            <span>Drop the files here...</span>
          ) : (
            <>
              <span>Drag & drop images here, or click to select files</span>
              <span className="text-sm text-gray-500">
                (Up to {maxImages} images, max 5MB each)
              </span>
            </>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt={`Uploaded image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(url)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
