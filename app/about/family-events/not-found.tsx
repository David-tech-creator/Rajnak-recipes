import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EventNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">Family Events & Albums</h1>

        <div className="prose max-w-none mb-12">
          <p>
            Welcome to our family photo collection! Explore our family's special moments and celebrations organized by
            events and albums. From birthdays and holidays to family reunions and everyday gatherings, this is where we
            collect and share our memories together.
          </p>
          <p>
            Each event creates an album where family members can add their photos, creating a collaborative collection
            of memories from different perspectives. Click on an event to view all its photos or create a new event to
            start a fresh album.
          </p>
        </div>

        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/about/family-events">Back to Events</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 