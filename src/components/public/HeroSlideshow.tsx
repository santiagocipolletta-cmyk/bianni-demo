'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, ArrowRight, LogIn } from 'lucide-react'

/**
 * HeroSlideshow — hero de la home pública BIANNI.
 *
 * Plan original: slideshow autoplay 3s con texto rotando y 2 CTAs
 * ("Quiero ser representante" + "Ingresá a tu cuenta").
 *
 * Imágenes y textos finales los elige Giuliana — acá uso placeholders.
 */

interface Slide {
  /** Path en /public */
  image: string
  alt: string
  /** Línea principal del texto */
  title: string
  /** Línea italic / variación al final del título */
  emphasis?: string
}

const SLIDES: Slide[] = [
  {
    image: '/brand/models/model-hero.jpg',
    alt: 'BIANNI Eyewear — colección editorial',
    title: 'Todo comienza con una',
    emphasis: 'mirada.',
  },
  {
    image: '/brand/models/model-editorial.jpg',
    alt: 'BIANNI Eyewear — temporada nueva',
    title: 'Potenciamos tu',
    emphasis: 'óptica.',
  },
  {
    image: '/brand/models/model-sol.jpg',
    alt: 'BIANNI Eyewear — anteojos de sol',
    title: 'Tendencia,',
    emphasis: 'sin esfuerzo.',
  },
  {
    image: '/brand/models/model-receta.jpg',
    alt: 'BIANNI Eyewear — anteojos de receta',
    title: 'Precisión óptica,',
    emphasis: 'diseño puro.',
  },
]

const AUTOPLAY_INTERVAL = 3000  // 3 segundos según plan

interface HeroSlideshowProps {
  /** Abre el LoginModal al click en "Ingresá a tu cuenta" */
  onLoginClick: () => void
}

export function HeroSlideshow({ onLoginClick }: HeroSlideshowProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  // Autoplay con pausa en hover
  useEffect(() => {
    if (paused) return
    const t = setInterval(next, AUTOPLAY_INTERVAL)
    return () => clearInterval(t)
  }, [paused, next])

  // Navegación por teclado
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev])

  const slide = SLIDES[index]

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Presentación destacada de BIANNI Eyewear"
    >
      {/* Slides apilados con crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.image}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover object-top"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradientes para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 z-[1]" />

      {/* Contenido principal */}
      <div className="relative z-10 px-8 md:px-16 lg:px-24 max-w-4xl w-full">
        <motion.p
          className="text-[10px] tracking-[0.35em] uppercase text-white/60 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          BIANNI Eyewear
        </motion.p>

        {/* Título rotante */}
        <div className="min-h-[8.5rem] sm:min-h-[10rem] md:min-h-[14rem] lg:min-h-[20rem] mb-10">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`${slide.title}-${index}`}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-semibold text-white leading-[0.95] uppercase tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {slide.title}<br />
              {slide.emphasis && (
                <span className="italic font-light">{slide.emphasis}</span>
              )}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* CTAs — primario al formulario, secundario al login */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/sumate"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-zinc-100 transition-colors"
          >
            Quiero ser representante
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
          <button
            onClick={onLoginClick}
            className="inline-flex items-center justify-center gap-2 border border-white text-white px-8 py-4 text-[11px] tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-colors"
          >
            <LogIn size={14} strokeWidth={1.5} />
            Ingresá a tu cuenta
          </button>
        </motion.div>
      </div>

      {/* Flechas navegación — visibles en desktop */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white p-3 transition-colors"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>
      <button
        onClick={next}
        aria-label="Slide siguiente"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white p-3 transition-colors"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>

      {/* Indicadores de slide */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Ir al slide ${i + 1}`}
            className={`h-px transition-all duration-300 ${
              i === index ? 'w-12 bg-white' : 'w-6 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
