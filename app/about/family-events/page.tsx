import { EventsList } from "@/components/family-gallery/events-list"

export const metadata = {
  title: "Family Events & Albums",
  description: "Browse and create family events and photo albums",
}

export default function FamilyEventsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Family Events & Albums</h1>

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

        <EventsList />
      </div>
    </div>
  )
}
