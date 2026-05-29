'use client'

import React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * ShinyButton — botón con efecto de brillo animado que recorre el texto y el borde.
 * Adaptado del componente original (magicui) al proyecto BIANNI.
 *
 * tone:
 *  - 'light' (default): texto y brillo BLANCOS — para fondos oscuros (hero).
 *  - 'dark': texto y brillo NEGROS — para fondos claros (secciones blancas).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const animationProps: any = {
  initial: { '--x': '100%', scale: 0.8 },
  animate: { '--x': '-100%', scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: 'loop',
    repeatDelay: 1,
    type: 'spring',
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: 'spring',
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
}

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  tone?: 'light' | 'dark'
}

export function ShinyButton({ children, className, tone = 'light', ...props }: ShinyButtonProps) {
  const isDark = tone === 'dark'
  return (
    <motion.button
      {...animationProps}
      {...(props as object)}
      className={cn(
        'relative rounded-lg px-7 py-3 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out',
        isDark
          ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.05)_0%,transparent_60%)] hover:shadow-[0_0_20px_rgba(0,0,0,0.10)]'
          : 'bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10)_0%,transparent_60%)] hover:shadow-[0_0_20px_rgba(255,255,255,0.10)]',
        className,
      )}
    >
      <span
        className={cn(
          'relative block size-full text-[11px] uppercase tracking-[0.2em] font-light',
          isDark ? 'text-black/80' : 'text-white/90',
        )}
        style={{
          maskImage:
            'linear-gradient(-75deg,rgba(255,255,255,1) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),rgba(255,255,255,1) calc(var(--x) + 100%))',
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box, linear-gradient(rgb(0,0,0), rgb(0,0,0))',
          WebkitMask: 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box, linear-gradient(rgb(0,0,0), rgb(0,0,0))',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
        }}
        className={cn(
          'absolute inset-0 z-10 block rounded-[inherit] p-px',
          isDark
            ? 'bg-[linear-gradient(-75deg,rgba(0,0,0,0.1)_calc(var(--x)+20%),rgba(0,0,0,0.45)_calc(var(--x)+25%),rgba(0,0,0,0.1)_calc(var(--x)+100%))]'
            : 'bg-[linear-gradient(-75deg,rgba(255,255,255,0.1)_calc(var(--x)+20%),rgba(255,255,255,0.5)_calc(var(--x)+25%),rgba(255,255,255,0.1)_calc(var(--x)+100%))]',
        )}
      />
    </motion.button>
  )
}

export default ShinyButton
