"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react"

export function CSVRecipeImporter() {
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    totalRecipes: number
    successCount: number
    errorCount: number
    errors?: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setIsImporting(true)
    setError(null)
    setImportResult(null)

    try {
      const response = await fetch("/api/import-csv-recipes", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      setImportResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Recipes from CSV
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          This will import recipes from the provided CSV file into your database. The file contains{" "}
          {importResult?.totalRecipes || "many"} recipes with titles, categories, ingredients, and instructions.
        </div>

        {isImporting && (
          <div className="space-y-2">
            <Progress value={undefined} className="h-2" />
            <p className="text-sm text-center animate-pulse">Importing recipes, please wait...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {importResult && (
          <Alert variant={importResult.errorCount > 0 ? "warning" : "default"}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Import completed</span>
              </div>

              <div className="text-sm space-y-1">
                <p>Total recipes: {importResult.totalRecipes}</p>
                <p>Successfully imported: {importResult.successCount}</p>
                <p>Failed: {importResult.errorCount}</p>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">First few errors:</p>
                  <ul className="text-xs list-disc list-inside mt-1">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleImport} disabled={isImporting} className="w-full">
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Import Recipes from CSV
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
