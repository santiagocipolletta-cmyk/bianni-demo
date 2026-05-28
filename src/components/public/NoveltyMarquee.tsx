'use client'

import Image from 'next/image'
import { useDataStore } from '@/stores/data-store'

/**
 * NoveltyMarquee — franja de scroll horizontal continuo con los productos
 * marcados como "novedad" en el catálogo (Módulo 1 / Módulo 6 del plan).
 *
 * - Se alimenta automáticamente: products con estado 'activo' && novedad.
 * - Desktop: al hover sobre una tarjeta aparece overlay con nombre + descripción.
 * - Mobile (touch): el nombre va siempre visible debajo de la imagen.
 * - Scroll infinito por CSS (duplicamos el set y animamos translateX).
 * - Pausa en hover.
 * - Si no hay novedades, no renderiza nada.
 */
export function NoveltyMarquee() {
  const { products, categories } = useDataStore()

  const novedades = products.filter((p) => p.estado === 'activo' && p.novedad)
  if (novedades.length === 0) return null

  // Duplicamos para loop continuo sin salto
  const loop = [...novedades, ...novedades]

  function catName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? ''
  }

  return (
    <section className="bg-black border-y border-[#1A1A1A] py-12 overflow-hidden">
      <div className="px-6 md:px-10 lg:px-14 mb-8">
        <p className="text-[10px] tracking-[0.4em] uppercase text-emerald-400">Nuevos ingresos</p>
        <h2 className="font-display text-2xl md:text-3xl text-white font-light tracking-[0.05em] mt-1">
          Últimas novedades
        </h2>
      </div>

      {/* Marquee */}
      <div className="group relative w-full overflow-hidden">
        <div className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((product, i) => (
            <article
              key={`${product.id}-${i}`}
              className="relative flex-shrink-0 w-[240px] md:w-[280px]"
            >
              <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                {/* Overlay con nombre + descripción — visible en hover (desktop) */}
                <div className="hidden md:flex absolute inset-0 flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-emerald-400 mb-1">
                    {catName(product.categoryId)}
                  </p>
                  <p className="text-white text-sm font-light leading-snug">{product.name}</p>
                  <p className="text-[#A0A0A0] text-[11px] leading-snug mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>
              {/* Nombre siempre visible — clave en mobile (no hay hover) */}
              <div className="md:hidden pt-2 px-1">
                <p className="text-[8px] tracking-[0.2em] uppercase text-emerald-400">
                  {catName(product.categoryId)}
                </p>
                <p className="text-white text-xs font-light leading-snug">{product.name}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
