type Variant = "berry" | "leaf" | "arc"

export function SprigDivider({
  variant = "berry",
  className = "",
}: {
  variant?: Variant
  className?: string
}) {
  return (
    <div className={`sprig ${className}`} aria-hidden>
      <span className="line"></span>
      <Sprig variant={variant} />
      <span className="line"></span>
    </div>
  )
}

function Sprig({ variant }: { variant: Variant }) {
  if (variant === "leaf") {
    return (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d="M12 32 Q32 12 52 32" />
        <path d="M22 24 Q18 16 26 14" />
        <path d="M32 18 Q34 8 42 12" />
        <path d="M42 22 Q50 18 50 26" />
        <circle cx="32" cy="36" r="2.4" fill="currentColor" fillOpacity=".5" />
        <circle cx="28" cy="40" r="1.8" fill="currentColor" fillOpacity=".5" />
        <circle cx="36" cy="40" r="1.8" fill="currentColor" fillOpacity=".5" />
      </svg>
    )
  }

  if (variant === "arc") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="8" cy="14" r="2" />
        <circle cx="14" cy="16" r="2.4" />
        <circle cx="11" cy="11" r="1.6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <path d="M32 8 Q32 32 32 56" />
      <path d="M32 20 Q22 18 18 24 Q26 26 32 24" fill="currentColor" fillOpacity=".15" />
      <path d="M32 24 Q42 22 46 28 Q38 30 32 28" fill="currentColor" fillOpacity=".15" />
      <path d="M32 36 Q22 34 18 40 Q26 42 32 40" fill="currentColor" fillOpacity=".15" />
      <path d="M32 40 Q42 38 46 44 Q38 46 32 44" fill="currentColor" fillOpacity=".15" />
      <circle cx="28" cy="50" r="2.2" fill="currentColor" fillOpacity=".6" />
      <circle cx="34" cy="52" r="2.4" fill="currentColor" fillOpacity=".6" />
      <circle cx="30" cy="55" r="1.8" fill="currentColor" fillOpacity=".6" />
    </svg>
  )
}
