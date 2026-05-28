'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, ArrowRight, LogIn } from 'lucide-react'

/**
 * HeroSlideshow — hero de la home pública BIANNI.
 *
 * Diseño basado en el componente "Slideshow" de la biblioteca (BETWEEN SHADOW
 * AND LIGHT): imagen full-bleed, texto chico abajo a la izquierda, contador
 * 0X / 0Y abajo derecha, navegación minimalista.
 *
 * Adaptaciones BIANNI:
 *  - Autoplay 3 seg (el original es 100% manual)
 *  - 2 CTAs ("Quiero ser representante" + "Ingresá a tu cuenta") según plan
 *
 * Imágenes y textos definitivos los elige Giuliana — acá uso placeholders.
 */

interface Slide {
  /** Path en /public — fondo del slide */
  image: string
  alt: string
  /** Dos líneas de texto cortas estilo "BETWEEN SHADOW / AND LIGHT" */
  text: [string, string]
}

const SLIDES: Slide[] = [
  {
    image: '/brand/models/model-hero.jpg',
    alt: 'BIANNI Eyewear — colección editorial',
    text: ['TODO COMIENZA', 'CON UNA MIRADA'],
  },
  {
    image: '/brand/models/model-editorial.jpg',
    alt: 'BIANNI Eyewear — temporada nueva',
    text: ['POTENCIAMOS', 'TU ÓPTICA'],
  },
  {
    image: '/brand/models/model-sol.jpg',
    alt: 'BIANNI Eyewear — anteojos de sol',
    text: ['TENDENCIA', 'SIN ESFUERZO'],
  },
  {
    image: '/brand/models/model-receta.jpg',
    alt: 'BIANNI Eyewear — anteojos de receta',
    text: ['PRECISIÓN ÓPTICA', 'DISEÑO PURO'],
  },
]

const AUTOPLAY_INTERVAL = 3000

interface HeroSlideshowProps {
  onLoginClick: () => void
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function HeroSlideshow({ onLoginClick }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  // Autoplay con pausa en hover
  useEffect(() => {
    if (paused) return
    const t = setInterval(nextSlide, AUTOPLAY_INTERVAL)
    return () => clearInterval(t)
  }, [paused, nextSlide])

  // Navegación por teclado
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [nextSlide, prevSlide])

  const slide = SLIDES[current]

  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Presentación destacada de BIANNI Eyewear"
    >
      {/* Slides: crossfade full-bleed */}
      <AnimatePresence>
        <motion.div
          key={slide.image}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={current === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay sutil solo en la parte inferior para legibilidad — no tapa la foto */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-[1]" />

      {/* Texto abajo izquierda — estilo del componente original */}
      <div className="absolute left-6 md:left-10 lg:left-14 bottom-20 md:bottom-24 z-10 max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.text[0]}-${current}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <span className="font-display text-white text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.15em] leading-[1.05]">
              {slide.text[0]}
            </span>
            <span className="font-display text-white text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.15em] leading-[1.05]">
              {slide.text[1]}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* CTAs debajo del texto, compactos */}
        <motion.div
          className="flex flex-col sm:flex-row gap-2 mt-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/sumate"
            className="inline-flex items-center justify-center gap-1.5 bg-white text-black px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-zinc-100 transition-colors"
          >
            Quiero ser representante
            <ArrowRight size={11} strokeWidth={2} />
          </Link>
          <button
            onClick={onLoginClick}
            className="inline-flex items-center justify-center gap-1.5 border border-white/70 text-white px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase hover:bg-white hover:text-black hover:border-white transition-colors"
          >
            <LogIn size={11} strokeWidth={2} />
            Ingresá a tu cuenta
          </button>
        </motion.div>
      </div>

      {/* Contador 0X / 0Y — abajo derecha, estilo del original */}
      <div className="absolute right-6 md:right-10 lg:right-14 bottom-8 z-10 text-white/90 text-xs tracking-[0.25em] font-light">
        {pad(current + 1)} <span className="text-white/40">/</span> {pad(SLIDES.length)}
      </div>

      {/* Navegación ← → estilo minimalista, abajo derecha cerca del contador */}
      <div className="absolute right-6 md:right-10 lg:right-14 bottom-20 z-10 flex items-center gap-3">
        <button
          onClick={prevSlide}
          aria-label="Slide anterior"
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white border border-white/30 hover:border-white transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Slide siguiente"
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white border border-white/30 hover:border-white transition-colors"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  )
}
