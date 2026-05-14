import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoProps {
  variant?: "wordmark" | "full"
  className?: string
  /** Use image file instead of SVG text (for OG images, emails, etc.) */
  useImage?: boolean
  /** Color scheme: "light" = white text (default, for dark backgrounds), "dark" = black text */
  color?: "light" | "dark"
}

/**
 * BIANNI Eyewear logo component.
 *
 * variant="wordmark" — just "BIAИNI" text mark (SVG, scales perfectly)
 * variant="full"     — wordmark + "OPTICAL EYEWEAR" subtitle
 */
export function Logo({
  variant = "wordmark",
  className,
  useImage = false,
  color = "light",
}: LogoProps) {
  const fill = color === "light" ? "#FFFFFF" : "#000000"

  if (useImage) {
    const src = color === "light" ? "/brand/logo-white.png" : "/brand/logo-black.png"
    return (
      <Image
        src={src}
        alt="BIANNI Eyewear"
        width={160}
        height={48}
        className={cn("object-contain", className)}
        priority
      />
    )
  }

  if (variant === "wordmark") {
    return (
      <svg
        viewBox="0 0 220 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="BIANNI Eyewear"
        className={cn("h-8 w-auto", className)}
      >
        {/* BIANNI wordmark — thin serif/sans hybrid, the И is mirrored N */}
        <text
          x="0"
          y="32"
          fontFamily="var(--font-display), 'Cormorant Garamond', Georgia, serif"
          fontWeight="300"
          fontSize="34"
          letterSpacing="6"
          fill={fill}
        >
          BIAИNI
        </text>
      </svg>
    )
  }

  // variant="full"
  return (
    <svg
      viewBox="0 0 220 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="BIANNI Optical Eyewear"
      className={cn("h-10 w-auto", className)}
    >
      <text
        x="0"
        y="32"
        fontFamily="var(--font-display), 'Cormorant Garamond', Georgia, serif"
        fontWeight="300"
        fontSize="34"
        letterSpacing="6"
        fill={fill}
      >
        BIAИNI
      </text>
      <text
        x="2"
        y="50"
        fontFamily="var(--font-sans), Inter, system-ui, sans-serif"
        fontWeight="300"
        fontSize="8"
        letterSpacing="8"
        fill={fill}
        opacity="0.7"
      >
        OPTICAL EYEWEAR
      </text>
    </svg>
  )
}
