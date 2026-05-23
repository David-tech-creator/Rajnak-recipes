"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function ImportStatus() {
  const [isImporting, setIsImporting] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const [recipeCount, setRecipeCount] = useState(0)
  const { toast } = useToast()

  const checkRecipeCount = async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || ''
      const response = await fetch(`${baseUrl}/api/recipe-count`)
      const data = await response.json()
      setRecipeCount(data.count)
    } catch (error) {
      console.error("Error checking recipe count:", error)
    }
  }

  useEffect(() => {
    checkRecipeCount()
  }, [])

  const handleImportClick = async () => {
    setIsImporting(true)

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || ''
      const response = await fetch(`${baseUrl}/api/import-recipes`, { method: "POST" })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Import successful",
          description: `Imported ${data.successCount} recipes successfully.`,
        })
        setImportComplete(true)
        checkRecipeCount()
      } else {
        throw new Error(data.error || "Import failed")
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  let statusBadge: React.ReactNode = null
  if (importComplete) {
    statusBadge = (
      <span className="bg-sage/10 border border-sage text-forest font-serif-sc uppercase tracking-[0.22em] text-[10px] px-2 py-1">
        Complete
      </span>
    )
  } else if (isImporting) {
    statusBadge = (
      <span className="bg-cream border border-rule-soft text-ink-muted font-serif-sc uppercase tracking-[0.22em] text-[10px] px-2 py-1">
        Working…
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <p className="font-serif text-ink">
        Current recipe count:{" "}
        <span className="num font-serif-sc uppercase tracking-[0.1em]">{recipeCount}</span>
      </p>

      {statusBadge && <div>{statusBadge}</div>}

      {importComplete && (
        <div className="bg-sage/10 border border-sage text-forest p-4">
          <div className="font-serif-sc uppercase tracking-[0.22em] text-[11px] mb-1">Done</div>
          <p className="font-serif italic">Recipe import completed successfully.</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleImportClick}
        disabled={isImporting || importComplete}
        className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isImporting ? "Importing…" : importComplete ? "Import complete" : "Import recipes"}
      </button>
    </div>
  )
}
