"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function SupabaseTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const { count, error } = await supabase.from("recipes").select("*", { count: "exact", head: true })

        if (error) {
          setStatus("error")
          setMessage(`Error: ${error.message}`)
          return
        }

        setStatus("success")
        setMessage("Supabase connection successful!")
        setCount(count)
      } catch (error) {
        setStatus("error")
        setMessage(`Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Test</h2>
      <div
        className={`p-2 rounded ${
          status === "loading" ? "bg-gray-100" : status === "success" ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <p>{message}</p>
        {status === "success" && count !== null && <p className="mt-2">Found {count} recipes in the database.</p>}
      </div>
    </div>
  )
}
