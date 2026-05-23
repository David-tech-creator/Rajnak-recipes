import Link from "next/link"
import { SprigDivider } from "@/components/sprig-divider"

export default function NotFound() {
  return (
    <div className="container mx-auto px-6 py-32 text-center">
      <div className="max-w-lg mx-auto">
        <div className="eyebrow eyebrow--lingon">404 · Recipe not found</div>
        <h1 className="display-2 mt-4 mb-4 font-normal">
          That page <em className="italic" style={{ color: "var(--lingon-deep)" }}>has gone missing.</em>
        </h1>
        <p className="lede mb-10">Perhaps it was slipped between the pages of another cookbook.</p>
        <SprigDivider variant="berry" className="!mt-2 !mb-10 max-w-sm mx-auto" />
        <Link href="/" className="btn">
          Back to the kitchen
        </Link>
      </div>
    </div>
  )
}
