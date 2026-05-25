'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Check, AlertCircle, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { useCartStore } from '@/stores/cart-store'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ProductDetailModal } from '@/components/catalog/ProductDetailModal'
import { formatARS, cn } from '@/lib/utils'
import type { Product } from '@/types'

const ALL_CAT = 'all'

export default function CatalogoPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CAT)
  const [cartOpen, setCartOpen] = useState(false)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)

  const { user } = useAuthStore()
  const { products, categories, clients, getProductPrice, getClientPriceList,
          getStockState, getStockAvailable, getProductSubstitutes } = useDataStore()
  const { items, addItem, getTotalUnidades } = useCartStore()

  const client = clients.find((c) => c.id === user?.clientId)
  const priceList = client ? getClientPriceList(client.id) : null
  const priceListId = priceList?.id ?? 'pl1'

  // Excluir productos en preventa del catálogo regular
  const activeProducts = products.filter((p) => p.estado === 'activo' && !p.preventa)
  const visibleProducts =
    selectedCategory === ALL_CAT
      ? activeProducts
      : activeProducts.filter((p) => p.categoryId === selectedCategory)

  const cartCount = getTotalUnidades()

  const categoryTabs = [
    { id: ALL_CAT, label: 'Todos' },
    ...categories.sort((a, b) => a.order - b.order).map((c) => ({ id: c.id, label: c.name })),
  ]

  function isInCart(productId: string) {
    return items.some((i) => i.productId === productId)
  }

  function getCartItem(productId: string) {
    return items.find((i) => i.productId === productId)
  }

  const profileBlocked = client && !client.profileCompleto

  return (
    <div className="min-h-full bg-[#000]">
      {/* Banner profile incompleto */}
      {profileBlocked && (
        <div className="bg-yellow-950/30 border-b border-yellow-900/50 px-6 lg:px-8 py-3 flex items-center gap-3">
          <AlertCircle size={14} className="text-yellow-500 flex-shrink-0" />
          <p className="text-xs text-yellow-200 flex-1">
            <span className="font-medium">Datos de facturación incompletos.</span>{' '}
            Podés navegar el catálogo pero no podrás enviar pedidos hasta completarlos.
          </p>
          <Link href="/completar-datos" className="flex items-center gap-1 text-yellow-200 hover:text-yellow-50 text-[10px] tracking-[0.15em] uppercase border border-yellow-700 px-3 py-1 hover:bg-yellow-900/30 transition-colors">
            Completar
            <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {/* Page header */}
      <div className="sticky top-0 z-30 border-b border-[#2A2A2A] bg-[#000]/95 backdrop-blur-sm px-4 lg:px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
              Catálogo
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
              {client?.nombre ?? 'Distribuidor'}{priceList ? ` — Lista ${priceList.name}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="hidden sm:inline-flex items-center border border-[#2A2A2A] px-3 py-1 text-[9px] tracking-[0.2em] uppercase text-[#555]">
              Temporada 2026
            </span>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 text-[#A0A0A0] hover:border-white hover:text-white transition-colors"
            >
              <ShoppingCart size={16} strokeWidth={1.5} />
              {cartCount > 0 && (<span className="text-xs text-white font-medium">{cartCount}</span>)}
              {cartCount > 0 && (<span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-white" />)}
            </button>
          </div>
        </div>

        <div className="flex gap-0 mt-4 overflow-x-auto">
          {categoryTabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={cn(
                'flex-shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors',
                selectedCategory === id
                  ? 'border-white bg-white text-black'
                  : 'border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#555]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-8 py-8">
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-px bg-[#2A2A2A]">
          {visibleProducts.map((product, index) => {
            const price = getProductPrice(product.id, priceListId)
            const inCart = isInCart(product.id)
            const cartItem = getCartItem(product.id)
            const stockState = getStockState(product.id)
            const available = getStockAvailable(product.id)
            const isOutOfStock = stockState === 'sin_stock'
            const substitutes = isOutOfStock ? getProductSubstitutes(product.id) : []

            return (
              <motion.div
                key={product.id}
                className={cn('bg-[#000] flex flex-col', isOutOfStock && 'opacity-70')}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: isOutOfStock ? 0.7 : 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}
              >
                {/* Image — clickeable abre detalle */}
                <button
                  type="button"
                  onClick={() => setDetailProduct(product)}
                  className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer block group"
                  aria-label={`Ver detalle de ${product.name}`}
                >
                  {product.badge && (
                    <span className="absolute top-3 left-3 z-10 bg-black text-white text-[8px] tracking-[0.2em] uppercase px-2 py-1">
                      {product.badge}
                    </span>
                  )}
                  {/* Stock badge */}
                  {stockState === 'sin_stock' && (
                    <span className="absolute top-3 right-3 z-10 bg-red-900 text-red-100 text-[8px] tracking-[0.2em] uppercase px-2 py-1">
                      Sin stock
                    </span>
                  )}
                  {stockState === 'pocas_unidades' && (
                    <span className="absolute top-3 right-3 z-10 bg-yellow-900 text-yellow-100 text-[8px] tracking-[0.2em] uppercase px-2 py-1">
                      Últimas {available}
                    </span>
                  )}
                  {/* Hover hint para abrir detalle */}
                  <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-[10px] tracking-[0.25em] uppercase border border-white/60 px-3 py-1.5 bg-black/40 backdrop-blur-sm">
                      Ver detalle
                    </span>
                  </div>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1280px) 50vw, 33vw"
                    className={cn(
                      'object-cover transition-transform duration-500 group-hover:scale-105',
                      isOutOfStock && 'grayscale'
                    )}
                  />
                </button>

                {/* Body */}
                <div className="flex flex-col flex-1 p-4 border-t border-[#2A2A2A]">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">
                    {categories.find((c) => c.id === product.categoryId)?.name ?? product.categoryId}
                  </p>
                  <h3 className="text-sm text-white font-light mb-1 leading-snug">{product.name}</h3>
                  <p className="text-[10px] text-[#555] leading-relaxed mb-3 line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  {/* Sustitutos cuando está sin stock */}
                  {isOutOfStock && substitutes.length > 0 && (
                    <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-2 mb-3">
                      <p className="text-[8px] tracking-[0.2em] uppercase text-yellow-500 mb-1.5">Sustituto sugerido</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-white truncate">{substitutes[0].name}</p>
                        <button
                          onClick={() => addItem(substitutes[0].id, getProductPrice(substitutes[0].id, priceListId))}
                          className="text-[9px] tracking-[0.1em] uppercase text-emerald-400 hover:text-emerald-300"
                        >
                          Agregar →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Precio + Add */}
                  <div className="flex items-end justify-between gap-2 mt-auto">
                    <div>
                      <p className="text-[8px] tracking-[0.25em] uppercase text-[#555] mb-0.5">Mayorista</p>
                      <p className="text-base text-white font-light">
                        {price > 0 ? formatARS(price) : '—'}
                      </p>
                      <p className="text-[9px] text-[#777] mt-0.5">PVR: {formatARS(product.pvr)}</p>
                    </div>

                    {isOutOfStock ? (
                      <span className="border border-[#2A2A2A] px-2 py-1 text-[9px] tracking-[0.15em] uppercase text-[#555]">
                        Sin stock
                      </span>
                    ) : inCart ? (
                      <div className="flex items-center gap-0">
                        <span className="flex items-center gap-1 border border-[#2A2A2A] px-2 py-1 text-[9px] tracking-[0.15em] uppercase text-emerald-400">
                          <Check size={10} />
                          {cartItem?.cantidad ?? 1}
                        </span>
                        <button
                          onClick={() => addItem(product.id, price)}
                          className="border border-l-0 border-[#2A2A2A] px-2 py-1 text-[9px] text-[#A0A0A0] hover:text-white hover:border-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(product.id, price)}
                        disabled={price === 0}
                        className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {visibleProducts.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <p className="text-[#555] text-xs tracking-[0.2em] uppercase">
              Sin productos en esta categoría
            </p>
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} products={products} />

      {/* Modal detalle de producto */}
      <ProductDetailModal
        product={detailProduct}
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        priceListId={priceListId}
      />
    </div>
  )
}
