'use client'

import { useState } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ChevronLeft, ChevronRight, Plus, Check, ShoppingCart, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn, formatARS } from '@/lib/utils'
import { useDataStore } from '@/stores/data-store'
import { useCartStore } from '@/stores/cart-store'
import type { Product } from '@/types'

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onClose: () => void
  priceListId: string
}

export function ProductDetailModal({ product, open, onClose, priceListId }: ProductDetailModalProps) {
  const { categories, getProductPrice, getStockState, getStockAvailable, getProductSubstitutes } = useDataStore()
  const { addItem, items } = useCartStore()
  const [photoIndex, setPhotoIndex] = useState(0)

  if (!product) return null

  const photos = product.photos && product.photos.length > 0
    ? product.photos
    : [{ url: product.imageUrl, isPrincipal: true }]
  const currentPhoto = photos[photoIndex] ?? photos[0]
  const category = categories.find((c) => c.id === product.categoryId)
  const price = getProductPrice(product.id, priceListId)
  const stockState = getStockState(product.id)
  const available = getStockAvailable(product.id)
  const isOutOfStock = stockState === 'sin_stock'
  const substitutes = isOutOfStock ? getProductSubstitutes(product.id) : []
  const inCart = items.some((i) => i.productId === product.id)
  const cartItem = items.find((i) => i.productId === product.id)

  function nextPhoto() { setPhotoIndex((i) => (i + 1) % photos.length) }
  function prevPhoto() { setPhotoIndex((i) => (i - 1 + photos.length) % photos.length) }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) { setPhotoIndex(0); onClose() } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 bg-[#0A0A0A] border border-[#2A2A2A] shadow-2xl max-h-[92vh] overflow-y-auto"
        >
          <Dialog.Title className="sr-only">{product.name}</Dialog.Title>

          {/* Close */}
          <Dialog.Close className="absolute right-4 top-4 z-20 text-[#888] hover:text-white bg-black/50 backdrop-blur-sm p-2 rounded-full transition-colors">
            <X size={16} />
          </Dialog.Close>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Galería */}
            <div className="relative bg-stone-100 aspect-square md:aspect-auto md:min-h-[560px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={photoIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentPhoto.url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={cn('object-cover', isOutOfStock && 'grayscale opacity-80')}
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges sobre la foto */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.badge && (
                  <span className="bg-black text-white text-[9px] tracking-[0.25em] uppercase px-2.5 py-1">
                    {product.badge}
                  </span>
                )}
                {product.destacado && (
                  <span className="bg-white text-black text-[9px] tracking-[0.25em] uppercase px-2.5 py-1">
                    Destacado
                  </span>
                )}
                {product.novedad && !product.badge && (
                  <span className="bg-emerald-500 text-black text-[9px] tracking-[0.25em] uppercase px-2.5 py-1">
                    Novedad
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-red-900 text-red-100 text-[9px] tracking-[0.25em] uppercase px-2.5 py-1">
                    Sin stock
                  </span>
                )}
              </div>

              {/* Carrusel arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    aria-label="Foto anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 backdrop-blur-sm transition-colors z-10"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextPhoto}
                    aria-label="Foto siguiente"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 backdrop-blur-sm transition-colors z-10"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Thumbs */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        aria-label={`Ir a foto ${i + 1}`}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full transition-all',
                          i === photoIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col p-6 md:p-8 min-h-[400px]">
              {/* Header */}
              <div className="border-b border-[#1A1A1A] pb-5 mb-5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#666] mb-2">
                  {category?.name ?? product.categoryId} · SKU {product.sku}
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-white font-light leading-[1.1] mb-1">
                  {product.name}
                </h2>
              </div>

              {/* Descripción */}
              <p className="text-sm text-[#A0A0A0] leading-relaxed mb-6 font-light">
                {product.description}
              </p>

              {/* Precios */}
              <div className="space-y-2 mb-6">
                <div className="flex items-baseline justify-between gap-3 border-b border-[#1A1A1A] pb-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#666]">Precio mayorista</span>
                  <span className="font-display text-2xl text-white font-light">
                    {price > 0 ? formatARS(price) : '—'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#666]">PVR (sugerido)</span>
                  <span className="text-base text-[#A0A0A0]">{formatARS(product.pvr)}</span>
                </div>
              </div>

              {/* Stock info */}
              <div className="mb-6 text-xs">
                {isOutOfStock ? (
                  <div className="flex items-start gap-2 text-red-400">
                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>Sin stock disponible</span>
                  </div>
                ) : stockState === 'pocas_unidades' ? (
                  <p className="text-yellow-400">Quedan solo {available} unidades disponibles</p>
                ) : (
                  <p className="text-emerald-400">{available} unidades disponibles</p>
                )}
              </div>

              {/* Sustitutos */}
              {isOutOfStock && substitutes.length > 0 && (
                <div className="border border-yellow-900 bg-yellow-950/30 p-4 mb-6">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-yellow-400 mb-3">
                    Sustitutos sugeridos
                  </p>
                  <div className="space-y-2">
                    {substitutes.slice(0, 3).map((sub, i) => (
                      <div key={sub.id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-yellow-600 font-mono text-[10px]">{i + 1}ª</span>
                          <span className="text-white truncate">{sub.name}</span>
                        </div>
                        <button
                          onClick={() => addItem(sub.id, getProductPrice(sub.id, priceListId))}
                          className="text-[10px] tracking-[0.1em] uppercase text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
                        >
                          + Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-auto">
                {!isOutOfStock && (
                  <>
                    {inCart ? (
                      <div className="flex items-center justify-between border border-emerald-700 bg-emerald-950 px-4 py-3.5">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Check size={14} />
                          <span className="text-xs tracking-[0.15em] uppercase">En tu pedido · {cartItem?.cantidad} u.</span>
                        </div>
                        <button
                          onClick={() => addItem(product.id, price)}
                          className="text-[10px] tracking-[0.15em] uppercase text-white hover:text-emerald-300"
                        >
                          + 1 más
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(product.id, price)}
                        className="w-full bg-white text-black text-xs tracking-[0.2em] uppercase py-4 font-medium hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={14} />
                        Agregar al pedido
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
