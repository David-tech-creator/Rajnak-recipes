import { EventsList } from "@/components/family-gallery/events-list"
import { SprigDivider } from "@/components/sprig-divider"

export const metadata = {
  title: "Family Events & Albums",
  description: "Browse and create family events and photo albums",
}

export default function FamilyEventsPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="eyebrow eyebrow--lingon">No. V · The Gatherings</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          Family <em className="italic" style={{ color: "var(--lingon-deep)" }}>events</em> &amp; albums
        </h1>
        <p className="lede">
          Birthdays, holidays, reunions, ordinary Tuesdays &mdash; the photographs we keep of being together.
        </p>
        <SprigDivider variant="berry" className="!mt-10 !mb-2 max-w-sm mx-auto" />
      </div>

      <div className="max-w-5xl mx-auto">
        <EventsList />
      </div>
    </div>
  )
}
