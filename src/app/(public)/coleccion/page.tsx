'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'motion/react'
import { ArrowLeft, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

export default function ColeccionPage() {
  const { products, categories } = useDataStore()
  const [selectedCat, setSelectedCat] = useState<string>('all')
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [photoIdx, setPhotoIdx] = useState(0)

  const featured = useMemo(
    () => products.filter((p) => p.estado === 'activo' && (p.destacado || p.novedad || p.badge === 'NUEVO')),
    [products]
  )

  const visible = useMemo(() => {
    if (selectedCat === 'all') return featured
    return featured.filter((p) => p.categoryId === selectedCat)
  }, [featured, selectedCat])

  const cats = useMemo(() => {
    const present = new Set(featured.map((p) => p.categoryId))
    return categories.filter((c) => present.has(c.id))
  }, [featured, categories])

  function openDetail(product: Product) {
    setDetailProduct(product)
    setPhotoIdx(0)
  }

  const detailPhotos = detailProduct?.photos && detailProduct.photos.length > 0
    ? detailProduct.photos
    : detailProduct ? [{ url: detailProduct.imageUrl, isPrincipal: true }] : []

  return (
    <main className="bg-black min-h-screen">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-30 bg-black/95 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span className="text-[10px] tracking-[0.25em] uppercase">Volver</span>
        </Link>
        <Logo variant="wordmark" className="h-6" />
        <Link
          href="/sumate"
          className="text-white/70 hover:text-white text-[10px] tracking-[0.25em] uppercase transition-colors hidden sm:block"
        >
          Sumate
        </Link>
        <div className="w-16 sm:hidden" />
      </nav>

      {/* Header */}
      <section className="px-6 md:px-12 lg:px-24 pt-16 md:pt-24 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500 mb-4">Colección 2026</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.01em] leading-[1.05] mb-5">
            Lookbook<br/><span className="text-zinc-500">editorial.</span>
          </h1>
          <p className="text-zinc-400 text-base font-light leading-relaxed max-w-xl">
            Las piezas destacadas y novedades de nuestra colección.
            Para acceder al catálogo completo con precios mayoristas, necesitás ser representante.
          </p>
        </motion.div>
      </section>

      {/* Category tabs */}
      <section className="px-6 md:px-12 lg:px-24 pb-8">
        <div className="flex flex-wrap gap-0 max-w-4xl">
          <button
            onClick={() => setSelectedCat('all')}
            className={cn(
              'px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors',
              selectedCat === 'all'
                ? 'border-white bg-white text-black'
                : 'border-zinc-800 text-zinc-400 hover:border-white/40 hover:text-white'
            )}
          >
            Todos ({featured.length})
          </button>
          {cats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={cn(
                'px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors',
                selectedCat === cat.id
                  ? 'border-white bg-white text-black'
                  : 'border-zinc-800 text-zinc-400 hover:border-white/40 hover:text-white'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Grid editorial */}
      <section className="px-6 md:px-12 lg:px-24 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900">
          {visible.map((product, i) => (
            <motion.button
              key={product.id}
              onClick={() => openDetail(product)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
              className="relative bg-black aspect-[4/5] overflow-hidden group block text-left"
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {product.badge && (
                  <span className="bg-black/80 backdrop-blur-sm text-white text-[9px] tracking-[0.25em] uppercase px-2.5 py-1">
                    {product.badge}
                  </span>
                )}
                {product.novedad && !product.badge && (
                  <span className="bg-white/90 text-black text-[9px] tracking-[0.25em] uppercase px-2.5 py-1">
                    Novedad
                  </span>
                )}
              </div>
              {/* Overlay info al hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <p className="text-[9px] tracking-[0.25em] uppercase text-zinc-400 mb-1">
                  {categories.find((c) => c.id === product.categoryId)?.name}
                </p>
                <p className="font-display text-xl text-white font-light">{product.name}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-center text-zinc-500 text-xs py-20 tracking-wider uppercase">
            Sin piezas en esta categoría
          </p>
        )}
      </section>

      {/* CTA flotante a sumate */}
      <Link
        href="/sumate"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-white text-black text-[10px] tracking-[0.2em] uppercase px-5 py-3 hover:bg-zinc-100 transition-colors shadow-2xl group"
      >
        Quiero ser representante
        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Modal detalle */}
      <Dialog.Root open={!!detailProduct} onOpenChange={(v) => { if (!v) setDetailProduct(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 bg-[#0A0A0A] border border-zinc-800 max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            <Dialog.Title className="sr-only">{detailProduct?.name}</Dialog.Title>
            <Dialog.Close className="absolute right-4 top-4 z-20 text-zinc-500 hover:text-white bg-black/50 p-2 rounded-full">
              <X size={16} />
            </Dialog.Close>

            {detailProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Galería */}
                <div className="relative aspect-square md:aspect-auto md:min-h-[500px] bg-stone-100">
                  <Image
                    src={detailPhotos[photoIdx]?.url ?? detailProduct.imageUrl}
                    alt={detailProduct.name}
                    fill
                    sizes="50vw"
                    className="object-cover"
                  />
                  {detailPhotos.length > 1 && (
                    <>
                      <button
                        onClick={() => setPhotoIdx((i) => (i - 1 + detailPhotos.length) % detailPhotos.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setPhotoIdx((i) => (i + 1) % detailPhotos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>

                {/* Info — sin precios */}
                <div className="p-8 md:p-10 flex flex-col">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 mb-3">
                    {categories.find((c) => c.id === detailProduct.categoryId)?.name}
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl text-white font-light leading-[1.1] mb-5">
                    {detailProduct.name}
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed font-light mb-8">
                    {detailProduct.description}
                  </p>

                  <div className="mt-auto pt-6 border-t border-zinc-800">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 mb-3">
                      Para conocer precios mayoristas
                    </p>
                    <Link
                      href="/sumate"
                      className="inline-flex items-center gap-2 bg-white text-black text-[10px] tracking-[0.25em] uppercase px-5 py-3 hover:bg-zinc-100 transition-colors group"
                    >
                      Sumate como representante
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  )
}
