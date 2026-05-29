'use client'

import { useDataStore } from '@/stores/data-store'
import {
  HoverSlider,
  TextStaggerHover,
  HoverSliderImageWrap,
  HoverSliderImage,
} from '@/components/ui/hover-slider'

/**
 * CategoriesHoverSlider — sección "Nuestras colecciones" de la web pública.
 *
 * Usa el componente HoverSlider (fondo blanco):
 *  - Izquierda: nombres de categoría con animación stagger por carácter al hover.
 *  - Derecha: imagen que cambia con clip-path reveal según la categoría activa.
 *
 * Dinámico: las categorías y sus imágenes salen del catálogo (Category.imagenUrl).
 * Click en un nombre → baja al catálogo filtrado por esa categoría.
 */

interface CategoriesHoverSliderProps {
  /** Baja al catálogo filtrado por el nombre de la categoría */
  onSelectCategory: (categoryName: string) => void
}

export function CategoriesHoverSlider({ onSelectCategory }: CategoriesHoverSliderProps) {
  const { categories } = useDataStore()
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  if (sorted.length === 0) return null

  return (
    <HoverSlider className="bg-white text-black px-6 md:px-12 lg:px-16 py-20 lg:py-28">
      {/* Encabezado */}
      <div className="mb-12 lg:mb-16">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400">Explorá por estilo</p>
        <h2 className="font-display text-3xl md:text-4xl text-black font-light tracking-[0.05em] mt-1">
          Nuestras colecciones
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
        {/* Izquierda: nombres con stagger por carácter */}
        <div className="flex flex-col gap-1 md:gap-2 lg:gap-3">
          {sorted.map((cat, i) => (
            <TextStaggerHover
              key={cat.id}
              text={cat.name}
              index={i}
              onClick={() => onSelectCategory(cat.name)}
              className="cursor-pointer font-display text-4xl md:text-6xl lg:text-7xl font-semibold uppercase tracking-[0.02em] text-black leading-[1.05]"
            />
          ))}
        </div>

        {/* Derecha: imágenes apiladas con clip-path reveal */}
        <HoverSliderImageWrap className="w-full lg:w-1/2 aspect-[4/5] lg:aspect-square bg-stone-100">
          {sorted.map((cat, i) => (
            <HoverSliderImage
              key={cat.id}
              index={i}
              imageUrl={cat.imagenUrl ?? ''}
              alt={cat.name}
              className="h-full w-full object-cover"
            />
          ))}
        </HoverSliderImageWrap>
      </div>
    </HoverSlider>
  )
}
