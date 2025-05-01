"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { imageSizes } from "@/lib/image-utils"

interface RecipeGalleryProps {
  images: string[]
  title: string
}

export function RecipeGallery({ images, title }: RecipeGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [zoomView, setZoomView] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
    setImageLoaded(false)
  }

  // Handle navigation
  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setImageLoaded(false)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setImageLoaded(false)
  }

  // Scroll thumbnail into view when active index changes
  const scrollToThumbnail = (index: number) => {
    if (scrollRef.current) {
      const thumbnailWidth = 80 // width + gap
      scrollRef.current.scrollLeft = index * thumbnailWidth - 100
    }
  }

  return (
    <div className="space-y-4">
      {/* Main image container */}
      <div className="relative rounded-xl overflow-hidden bg-black/5">
        <div className="relative aspect-[16/9] w-full">
          {!imageLoaded && <Skeleton className="absolute inset-0 z-10" />}
          <Image
            src={images[activeIndex] || "/placeholder.svg"}
            alt={`${title} - image ${activeIndex + 1}`}
            fill
            sizes={imageSizes.hero}
            className={`object-contain ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
            priority={activeIndex === 0}
            quality={90}
          />

          {/* Zoom button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 z-20 opacity-80 hover:opacity-100"
            onClick={() => setZoomView(true)}
          >
            <ZoomIn size={20} />
          </Button>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 opacity-80 hover:opacity-100"
                onClick={handlePrevious}
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 opacity-80 hover:opacity-100"
                onClick={handleNext}
              >
                <ChevronRight size={24} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
        >
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                handleThumbnailClick(index)
                scrollToThumbnail(index)
              }}
              className={`relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden transition-all ${
                index === activeIndex ? "ring-2 ring-primary scale-105" : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={img || "/placeholder.svg"}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen zoom view */}
      <AnimatePresence>
        {zoomView && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white"
              onClick={() => setZoomView(false)}
            >
              <X size={24} />
            </Button>

            <div className="relative w-full h-full max-w-7xl max-h-screen p-8">
              <Image
                src={images[activeIndex] || "/placeholder.svg"}
                alt={`${title} - image ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                quality={100}
              />

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft size={32} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white"
                    onClick={handleNext}
                  >
                    <ChevronRight size={32} />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
