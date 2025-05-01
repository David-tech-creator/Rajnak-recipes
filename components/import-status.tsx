"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
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

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Recipe Import</CardTitle>
        <CardDescription>Import recipes from the CSV file</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Current recipe count: <strong>{recipeCount}</strong>
        </p>

        {importComplete ? (
          <div className="bg-green-50 p-4 rounded-md text-green-800">
            <p>Recipe import completed successfully!</p>
          </div>
        ) : (
          <p>Click the button below to import recipes from the CSV file.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleImportClick} disabled={isImporting || importComplete} className="w-full">
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : importComplete ? (
            "Import Complete"
          ) : (
            "Import Recipes"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
