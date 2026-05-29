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
 * Layout fiel al diseño original del HoverSlider:
 *  - Fondo blanco.
 *  - Categorías a la IZQUIERDA, imagen compacta vertical a la DERECHA.
 *  - Ambas columnas centradas verticalmente entre sí (items-center) y
 *    separadas a los extremos (justify-between).
 *  - Nombres con stagger por carácter al hover; imagen cambia con clip-path.
 *
 * Dinámico: categorías + imágenes del catálogo (Category.imagenUrl).
 * Click en un nombre → baja al catálogo filtrado por esa categoría.
 */

interface CategoriesHoverSliderProps {
  onSelectCategory: (categoryName: string) => void
}

export function CategoriesHoverSlider({ onSelectCategory }: CategoriesHoverSliderProps) {
  const { categories } = useDataStore()
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  if (sorted.length === 0) return null

  return (
    <HoverSlider className="bg-white text-black flex flex-col md:flex-row md:items-center justify-between gap-12 md:gap-10 px-6 md:px-12 lg:px-20 py-20 md:py-28">
      {/* Izquierda: nombres con stagger por carácter */}
      <div className="flex flex-col gap-1 md:gap-2">
        {sorted.map((cat, i) => (
          <TextStaggerHover
            key={cat.id}
            text={cat.name}
            index={i}
            onClick={() => onSelectCategory(cat.name)}
            className="cursor-pointer font-display text-4xl md:text-6xl lg:text-7xl font-semibold uppercase tracking-[0.02em] text-black leading-[1.1]"
          />
        ))}
      </div>

      {/* Derecha: imagen compacta vertical con clip-path reveal */}
      <HoverSliderImageWrap className="w-full md:w-[420px] lg:w-[480px] md:flex-shrink-0 aspect-[4/5] bg-stone-100">
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
    </HoverSlider>
  )
}
