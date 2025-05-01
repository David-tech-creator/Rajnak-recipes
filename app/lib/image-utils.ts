// Get optimized image sizes for different breakpoints
export const imageSizes = {
  thumbnail: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  hero: "(max-width: 1024px) 100vw, 1200px",
  gallery: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
}

// Format time strings (e.g., "30 mins" to "30 minutes")
export function formatTimeString(timeStr?: string | null): string {
  if (!timeStr) return ""

  // Replace common abbreviations
  return timeStr.replace("mins", "minutes").replace("min", "minute")
}

// Get the main recipe image URL
export function getMainRecipeImage(recipe: { images: string[] }): string {
  return recipe.images && recipe.images.length > 0 ? recipe.images[0] : "/placeholder.svg?height=400&width=600"
}

// Get all recipe image URLs
export function getRecipeImageUrls(recipe: { images: string[] }): string[] {
  return recipe.images && recipe.images.length > 0 ? recipe.images : ["/placeholder.svg?height=400&width=600"]
}
