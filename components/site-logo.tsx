import Link from "next/link"
import Image from "next/image"

interface SiteLogoProps {
  className?: string
  showTagline?: boolean
  size?: "small" | "medium" | "large"
  position?: "left" | "center" | "right"
}

export function SiteLogo({ className = "", showTagline = false, size = "small", position = "center" }: SiteLogoProps) {
  // Determine size dimensions
  const dimensions = {
    small: { width: 100, height: 50 },
    medium: { width: 180, height: 90 },
    large: { width: 280, height: 140 },
  }

  const { width, height } = dimensions[size]

  // Determine position classes
  const positionClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }

  return (
    <div className={`flex items-center ${positionClasses[position]} ${className}`}>
      <Link href="/" className="block">
        <Image
          src="/images/rajnak-family-logo-new.png"
          alt="The Rajnak family recipe collection"
          width={width}
          height={height}
          priority
        />
      </Link>
      {showTagline && <span className="ml-2 text-xs text-gray-500 sr-only">Homemade food with love</span>}
    </div>
  )
}
