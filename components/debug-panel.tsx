"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function DebugPanel() {
  const [envData, setEnvData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkEnvironment = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/env-check")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setEnvData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      console.error("Error checking environment:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={checkEnvironment} disabled={loading} className="mb-4">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Environment"
          )}
        </Button>

        {error && <div className="text-red-500 mb-4">Error: {error}</div>}

        {envData && (
          <div className="space-y-2 text-sm">
            <h3 className="font-medium">Environment Variables:</h3>
            <pre className="bg-muted p-2 rounded overflow-x-auto">{JSON.stringify(envData.environment, null, 2)}</pre>

            <h3 className="font-medium">Server Time:</h3>
            <p>{envData.timestamp}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
