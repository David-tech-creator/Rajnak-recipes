"use client"

import { useState } from "react"

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
    <div className="w-full max-w-3xl mx-auto bg-cream border border-rule-soft shadow-[var(--paper-shadow)] p-8 md:p-10">
      <div className="eyebrow eyebrow--lingon mb-3">From spreadsheet</div>
      <h2 className="editorial-h3 font-normal mb-4">Import recipes from CSV</h2>

      <p className="font-serif italic text-ink-soft mb-6">
        This will import recipes from the provided CSV file into your database. The file contains{" "}
        <span className="num">{importResult?.totalRecipes || "many"}</span> recipes with titles, categories,
        ingredients, and instructions.
      </p>

      {isImporting && (
        <div className="mb-6 space-y-2">
          <div className="h-[2px] bg-rule-soft overflow-hidden">
            <div className="h-full bg-ink animate-pulse w-1/2" />
          </div>
          <p className="font-serif italic text-ink-muted text-center">Importing recipes, please wait…</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-lingon-soft/30 border border-lingon text-lingon-deep p-4">
          <div className="font-serif-sc uppercase tracking-[0.22em] text-[11px] mb-1">Error</div>
          <p className="font-serif italic">{error}</p>
        </div>
      )}

      {importResult && (
        <div
          className={`mb-6 p-5 border ${
            importResult.errorCount > 0
              ? "bg-lingon-soft/30 border-lingon text-lingon-deep"
              : "bg-sage/10 border-sage text-forest"
          }`}
        >
          <div className="font-serif-sc uppercase tracking-[0.22em] text-[11px] mb-3">Import completed</div>
          <ul className="space-y-1 font-serif text-[16px]">
            <li>
              Total recipes: <span className="num">{importResult.totalRecipes}</span>
            </li>
            <li>
              Successfully imported: <span className="num">{importResult.successCount}</span>
            </li>
            <li>
              Failed: <span className="num">{importResult.errorCount}</span>
            </li>
          </ul>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dotted border-rule">
              <p className="font-serif-sc uppercase tracking-[0.22em] text-[10px] mb-2">First few errors</p>
              <ul className="list-disc list-inside font-serif italic text-[15px] space-y-1">
                {importResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting}
          className="btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isImporting ? "Importing…" : "Import recipes from CSV"}
        </button>
      </div>
    </div>
  )
}
