import Link from "next/link"
import { SprigDivider } from "@/components/sprig-divider"

export default function EventNotFound() {
  return (
    <div className="container mx-auto px-6 py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="eyebrow eyebrow--lingon">Page not found</div>
        <h1 className="editorial-h1 mt-3 mb-4 font-normal">
          We can&apos;t find that page.
        </h1>
        <p className="lede">
          The album you&apos;re looking for may have been removed, or perhaps the link wandered off.
        </p>
        <SprigDivider variant="berry" className="!mt-10 !mb-8 max-w-sm mx-auto" />
        <Link href="/about/family-events" className="btn">
          Back to events
        </Link>
      </div>
    </div>
  )
}
