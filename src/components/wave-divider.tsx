interface WaveDividerProps {
  variant: "navy-to-white" | "white-to-navy" | "navy-to-gold"
}

export function WaveDivider({ variant }: WaveDividerProps) {
  const getColors = () => {
    switch (variant) {
      case "navy-to-white":
        return { from: "#002147", to: "#ffffff" }
      case "white-to-navy":
        return { from: "#ffffff", to: "#002147" }
      case "navy-to-gold":
        return { from: "#002147", to: "#FFD700" }
      default:
        return { from: "#002147", to: "#ffffff" }
    }
  }

  const colors = getColors()

  return (
    <div className="relative h-24 overflow-hidden">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <path
          d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z"
          fill={`url(#gradient-${variant})`}
          className="animate-pulse"
        />
      </svg>
    </div>
  )
}
