'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useDataStore } from '@/stores/data-store'

/**
 * CategoriesHoverSlider — sección "Nuestras colecciones" de la web pública.
 *
 * Desktop: lista de categorías a la izquierda; al hover sobre una, cambia la
 * imagen grande de la derecha (crossfade).
 * Mobile (táctil): el toque sobre una categoría la activa (cambia imagen).
 * La primera categoría aparece seleccionada por defecto.
 *
 * "Ver categoría →" dispara onSelectCategory para bajar al catálogo filtrado.
 * Las categorías y sus imágenes salen del catálogo (Category.imagenUrl).
 */

const CATEGORY_TAGLINES: Record<string, string> = {
  'CLIP-ON': 'Versatilidad sin compromiso',
  RECETA: 'Precisión óptica, diseño puro',
  SOL: 'Editoriales de carácter',
  TR90: 'Ultralivianos y flexibles',
  METAL: 'Estructura mínima, presencia máxima',
}

interface CategoriesHoverSliderProps {
  /** Baja al catálogo filtrado por el nombre de la categoría */
  onSelectCategory: (categoryName: string) => void
}

export function CategoriesHoverSlider({ onSelectCategory }: CategoriesHoverSliderProps) {
  const { categories } = useDataStore()
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  const [activeIdx, setActiveIdx] = useState(0)

  if (sorted.length === 0) return null

  const active = sorted[activeIdx]

  return (
    <section className="bg-black border-t border-[#1A1A1A]">
      <div className="px-6 md:px-10 lg:px-14 pt-14 pb-8">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#666]">Explorá por estilo</p>
        <h2 className="font-display text-3xl md:text-4xl text-white font-light tracking-[0.05em] mt-1">
          Nuestras colecciones
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#1A1A1A]">
        {/* Lista de categorías */}
        <div className="bg-black flex flex-col">
          {sorted.map((cat, i) => {
            const isActive = i === activeIdx
            return (
              <button
                key={cat.id}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => {
                  // En táctil, el primer toque activa; si ya está activa, navega
                  if (isActive) onSelectCategory(cat.name)
                  else setActiveIdx(i)
                }}
                className={`group relative flex items-center justify-between gap-4 px-6 md:px-10 lg:px-14 py-7 md:py-8 text-left border-b border-[#1A1A1A] transition-colors ${
                  isActive ? 'bg-[#0A0A0A]' : 'hover:bg-[#080808]'
                }`}
              >
                <div className="flex items-baseline gap-4 min-w-0">
                  <span className={`font-mono text-[10px] tabular-nums transition-colors ${isActive ? 'text-emerald-400' : 'text-[#444]'}`}>
                    0{i + 1}
                  </span>
                  <div className="min-w-0">
                    <span
                      className={`font-display text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.06em] uppercase transition-colors ${
                        isActive ? 'text-white' : 'text-[#555] group-hover:text-[#888]'
                      }`}
                    >
                      {cat.name}
                    </span>
                    <span
                      className={`block text-[11px] tracking-[0.1em] mt-1 transition-all ${
                        isActive ? 'text-[#888] opacity-100' : 'text-[#444] opacity-0 lg:opacity-60'
                      }`}
                    >
                      {CATEGORY_TAGLINES[cat.name] ?? ''}
                    </span>
                  </div>
                </div>

                <span
                  className={`flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase whitespace-nowrap transition-all ${
                    isActive ? 'text-emerald-400 opacity-100 translate-x-0' : 'text-[#555] opacity-0 -translate-x-2'
                  }`}
                >
                  Ver categoría
                  <ArrowRight size={11} strokeWidth={1.5} />
                </span>
              </button>
            )
          })}
        </div>

        {/* Imagen grande — cambia con la categoría activa */}
        <div className="relative bg-stone-100 min-h-[320px] lg:min-h-0 aspect-[4/3] lg:aspect-auto overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {active.imagenUrl ? (
                <Image
                  src={active.imagenUrl}
                  alt={active.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                  <span className="text-[#444] text-xs tracking-[0.2em] uppercase">{active.name}</span>
                </div>
              )}
              {/* Botón "Ver categoría" sobre la imagen (útil en mobile) */}
              <button
                onClick={() => onSelectCategory(active.name)}
                className="absolute bottom-5 left-5 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/25 text-white px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase hover:bg-black/60 transition-colors"
              >
                Ver {active.name}
                <ArrowRight size={12} strokeWidth={1.5} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
