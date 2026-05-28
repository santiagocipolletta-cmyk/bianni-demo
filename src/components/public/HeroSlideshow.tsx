'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { ShinyButton } from '@/components/ui/shiny-button'

/**
 * HeroSlideshow — hero de la home pública BIANNI.
 *
 * Diseño basado en el componente "Slideshow" de la biblioteca (BETWEEN SHADOW
 * AND LIGHT): imagen full-bleed, texto chico abajo a la izquierda, contador
 * 0X / 0Y abajo-centro, flechas ← → a los costados con cuadradito glass.
 *
 * Adaptaciones BIANNI:
 *  - Autoplay 3 seg (el original es 100% manual)
 *  - 2 CTAs ("Quiero ser representante" + "Ingresá a tu cuenta") según plan
 *  - La imagen arranca debajo de la barra superior (offset = alto del nav)
 *
 * Imágenes y textos definitivos los elige Giuliana — acá uso placeholders.
 */

interface Slide {
  image: string
  alt: string
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
/** Alto aproximado del PublicNav (py-6 + logo) — la imagen arranca debajo */
const NAV_OFFSET = '76px'

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function HeroSlideshow() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(nextSlide, AUTOPLAY_INTERVAL)
    return () => clearInterval(t)
  }, [paused, nextSlide])

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
      {/* Imagen: arranca debajo de la barra superior (offset de nav) */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ top: NAV_OFFSET }}
      >
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

        {/* Overlay sutil solo en la parte inferior para legibilidad del texto */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Texto abajo izquierda */}
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

        {/* CTA único: "Quiero ser representante" con efecto shiny.
            El acceso a cuenta vive solo en la barra superior. */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ShinyButton onClick={() => router.push('/sumate')}>
            Quiero ser representante
          </ShinyButton>
        </motion.div>
      </div>

      {/* Flechas ← → a los costados, con cuadradito glass como el original */}
      <button
        onClick={prevSlide}
        aria-label="Slide anterior"
        className="absolute left-4 md:left-8 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 text-2xl font-light leading-none transition-colors select-none"
      >
        ←
      </button>
      <button
        onClick={nextSlide}
        aria-label="Slide siguiente"
        className="absolute right-4 md:right-8 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 text-2xl font-light leading-none transition-colors select-none"
      >
        →
      </button>

      {/* Contador 0X / 0Y — abajo centro, como el original */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-10 text-white/90 text-xs tracking-[0.3em] font-light">
        {pad(current + 1)} <span className="text-white/40">/</span> {pad(SLIDES.length)}
      </div>
    </section>
  )
}
