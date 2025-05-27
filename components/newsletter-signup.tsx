"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup logic here
    console.log("Signup with email:", email)
    setEmail("")
    alert("Thanks for signing up!")
  }

  return (
    <section className="py-10 border-t border-b">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-lg font-medium tracking-wider mb-4">
          GET NEW POSTS <span className="px-1 py-0.5 text-xs border align-middle">VIA</span> EMAIL:
        </h2>
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="email"
            placeholder="email address"
            className="flex-1 px-4 py-2 border border-r-0 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="rounded-none px-6">
            GO
          </Button>
        </form>
      </div>
    </section>
  )
}
