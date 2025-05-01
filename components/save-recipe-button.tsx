"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface SaveRecipeButtonProps {
  recipeId: number
}

export function SaveRecipeButton({ recipeId }: SaveRecipeButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  const handleSave = () => {
    setIsSaved(!isSaved)

    toast({
      title: isSaved ? "Recipe removed" : "Recipe saved",
      description: isSaved ? "Recipe removed from your collection" : "Recipe added to your collection",
      duration: 3000,
    })

    // Here you would typically call an API to save the recipe
    // For now, we're just toggling the state
  }

  return (
    <Button variant={isSaved ? "default" : "outline"} size="sm" className="gap-2" onClick={handleSave}>
      <Bookmark size={16} className={isSaved ? "fill-white" : ""} />
      {isSaved ? "Saved" : "Save Recipe"}
    </Button>
  )
}
