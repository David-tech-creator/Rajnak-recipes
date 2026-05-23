"use client"

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn--ghost print:hidden"
      aria-label="Print this recipe"
    >
      Print recipe
    </button>
  )
}
