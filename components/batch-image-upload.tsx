"use client"

import type React from "react"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, X } from "lucide-react"

export function BatchImageUpload() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
  }

  const clearFiles = () => {
    setFiles(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setProgress(0)
    setUploadedCount(0)
    setTotalCount(files.length)

    try {
      const uploadedUrls: { url: string; filename: string }[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split(".").pop()
        const fileName = `batch-${Date.now()}-${i}.${fileExt}`
        const filePath = `recipe-images/${fileName}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage.from("recipes").upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data } = supabase.storage.from("recipes").getPublicUrl(filePath)

        uploadedUrls.push({
          url: data.publicUrl,
          filename: file.name,
        })

        setUploadedCount(i + 1)
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      toast({
        title: "Images uploaded successfully",
        description: `${uploadedUrls.length} images uploaded to storage`,
      })

      // Clear selected files
      clearFiles()
    } catch (error) {
      console.error("Error uploading images:", error)
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
      <CardHeader>
        <CardTitle>Batch Upload Images</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
        />

        {files && files.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{files.length} files selected</span>
              <Button variant="ghost" size="sm" onClick={clearFiles} disabled={uploading}>
                <X size={16} />
              </Button>
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-gray-500 text-right">
                  {uploadedCount} of {totalCount} uploaded ({progress}%)
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleUpload} disabled={uploading || !files || files.length === 0} className="w-full">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload All Images
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
