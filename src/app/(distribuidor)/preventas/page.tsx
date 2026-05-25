'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Sparkles, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { useCartStore } from '@/stores/cart-store'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { formatARS, cn } from '@/lib/utils'

export default function PreventasPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const { user } = useAuthStore()
  const { products, clients, getProductPrice, getClientPriceList, categories } = useDataStore()
  const { items, addItem, getTotalUnidades } = useCartStore()

  const client = clients.find((c) => c.id === user?.clientId)
  const priceList = client ? getClientPriceList(client.id) : null
  const priceListId = priceList?.id ?? 'pl1'

  const preventaProducts = products.filter((p) => p.preventa && p.estado === 'activo')
  const cartCount = getTotalUnidades()

  // Bloqueo si profile incompleto
  if (client && !client.profileCompleto) {
    return (
      <div className="min-h-full bg-[#000] p-6 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-yellow-500">Datos incompletos</p>
          <h2 className="text-2xl text-white font-light">Completá tus datos para pedir</h2>
          <Link href="/completar-datos" className="inline-block bg-white text-black text-[10px] tracking-[0.2em] uppercase px-6 py-3 hover:bg-zinc-100 transition-colors">
            Completar datos
          </Link>
        </div>
      </div>
    )
  }

  function isInCart(productId: string) {
    return items.some((i) => i.productId === productId)
  }

  return (
    <div className="min-h-full bg-[#000]">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#0A0A0A] to-[#000] border-b border-[#2A2A2A] px-6 lg:px-10 py-12 lg:py-16">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={20} strokeWidth={1.2} className="text-emerald-400" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-emerald-400">Acceso anticipado</p>
          </div>
          <h1 className="font-display text-4xl lg:text-6xl text-white font-light tracking-[-0.01em] leading-tight mb-4">
            Preventa Colección 2027
          </h1>
          <p className="text-[#A0A0A0] text-base font-light leading-relaxed max-w-xl">
            Reservá tus modelos preferidos antes que el resto. Los productos en preventa se entregan
            apenas llega el stock — sin pedido mínimo, mismo precio mayorista.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 border border-[#2A2A2A] px-4 py-2 text-[#A0A0A0] hover:border-white hover:text-white transition-colors"
            >
              <ShoppingCart size={16} strokeWidth={1.5} />
              {cartCount > 0 && <span className="text-xs text-white font-medium">{cartCount}</span>}
              <span className="text-[10px] tracking-[0.2em] uppercase">Ver pedido</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="px-4 lg:px-10 py-10">
        {preventaProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#555] text-xs tracking-[0.2em] uppercase">No hay productos en preventa actualmente</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-px bg-[#2A2A2A]">
            {preventaProducts.map((product, index) => {
              const price = getProductPrice(product.id, priceListId)
              const inCart = isInCart(product.id)
              const cat = categories.find((c) => c.id === product.categoryId)
              return (
                <motion.div key={product.id} className="bg-[#000] flex flex-col"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}>
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <span className="absolute top-3 left-3 z-10 bg-emerald-500 text-black text-[8px] tracking-[0.2em] uppercase px-2 py-1 font-medium">
                      Preventa
                    </span>
                    <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                  <div className="flex flex-col flex-1 p-4 border-t border-[#2A2A2A]">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-emerald-400 mb-1">{cat?.name ?? '—'}</p>
                    <h3 className="text-sm text-white font-light mb-1 leading-snug">{product.name}</h3>
                    <p className="text-[10px] text-[#555] leading-relaxed mb-4 line-clamp-2 flex-1">{product.description}</p>

                    {/* Cupo de preventa (si está definido) */}
                    {product.cupoPreventa && product.cupoPreventa > 0 && (
                      <div className="mb-3">
                        <p className="text-[8px] tracking-[0.2em] uppercase text-[#666] mb-1">
                          Cupo disponible
                        </p>
                        <div className="h-1 bg-[#1A1A1A] overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: '60%' }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-end justify-between gap-2 mt-auto">
                      <div>
                        <p className="text-[8px] tracking-[0.25em] uppercase text-[#555]">Mayorista</p>
                        <p className="text-base text-white font-light">{formatARS(price)}</p>
                        <p className="text-[9px] text-emerald-400 mt-0.5">PVR: {formatARS(product.pvr)}</p>
                      </div>
                      {inCart ? (
                        <span className="flex items-center gap-1 border border-[#2A2A2A] px-2 py-1 text-[9px] tracking-[0.15em] uppercase text-emerald-400">
                          <Check size={10} /> Reservado
                        </span>
                      ) : (
                        <button onClick={() => addItem(product.id, price)}
                          className="text-[9px] tracking-[0.15em] uppercase border border-emerald-700 text-emerald-400 px-3 py-1.5 hover:bg-emerald-950 transition-colors">
                          Reservar
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} products={products} />
    </div>
  )
}
