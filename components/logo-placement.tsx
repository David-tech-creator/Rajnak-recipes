import { SiteLogo } from "./site-logo"

interface LogoPlacementProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  size?: "small" | "medium" | "large"
  fixed?: boolean
  showTagline?: boolean
  className?: string
}

export function LogoPlacement({
  position = "top-left",
  size = "small",
  fixed = false,
  showTagline = false,
  className = "",
}: LogoPlacementProps) {
  // Position classes
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  }

  // Determine logo alignment based on position
  const logoPosition = position.includes("right") ? "right" : position.includes("left") ? "left" : "center"

  return (
    <div
      className={`
        ${fixed ? "fixed" : "absolute"} 
        ${positionClasses[position]} 
        z-10
        ${className}
      `}
    >
      <SiteLogo size={size} position={logoPosition as "left" | "center" | "right"} showTagline={showTagline} />
    </div>
  )
}
