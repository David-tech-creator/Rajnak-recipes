"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function InitStorage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  const initializeStorage = async () => {
    setIsInitializing(true)

    try {
      const response = await fetch("/api/init-storage", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize storage")
      }

      setIsInitialized(true)
      toast({
        title: "Storage initialized",
        description: data.message,
      })
    } catch (error) {
      toast({
        title: "Initialization failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="text-center">
      <Button
        onClick={initializeStorage}
        disabled={isInitializing || isInitialized}
        variant={isInitialized ? "outline" : "default"}
      >
        {isInitializing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Initializing...
          </>
        ) : isInitialized ? (
          "Storage Initialized"
        ) : (
          "Initialize Storage"
        )}
      </Button>
    </div>
  )
}
