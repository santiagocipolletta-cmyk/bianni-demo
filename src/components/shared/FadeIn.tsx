'use client'
import { motion } from 'motion/react'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'none'
}

export function FadeIn({ children, delay = 0, className, direction = 'up' }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: direction === 'up' ? 20 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
