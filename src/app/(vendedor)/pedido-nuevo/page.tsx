'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { useCartStore } from '@/stores/cart-store'
import { formatARS, cn } from '@/lib/utils'
import type { Order } from '@/types'

const ALL_CAT = 'all'

function PedidoNuevoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const { user } = useAuthStore()
  const {
    clients,
    products,
    categories,
    orders,
    priceLists,
    getProductPrice,
    getClientPriceList,
    addOrder,
  } = useDataStore()

  const { items, addItem, removeItem, updateCantidad, clearCart, setClient, getTotalARS } =
    useCartStore()

  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CAT)

  const sellerId = user?.sellerId
  const myClients = clients.filter((c) => c.sellerId === sellerId)

  // Pre-fill from URL query param
  useEffect(() => {
    const paramClientId = searchParams.get('clientId')
    if (paramClientId && myClients.some((c) => c.id === paramClientId)) {
      setSelectedClientId(paramClientId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Sync cart client when selectedClientId changes
  useEffect(() => {
    if (!selectedClientId) return
    const client = clients.find((c) => c.id === selectedClientId)
    if (!client) return
    const pl = getClientPriceList(client.id)
    setClient(client.id, pl?.id ?? 'pl1')
    clearCart()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId])

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const priceList = selectedClient ? getClientPriceList(selectedClient.id) : null
  const priceListId = priceList?.id ?? 'pl1'

  const activeProducts = products.filter((p) => p.active)
  const visibleProducts =
    selectedCategory === ALL_CAT
      ? activeProducts
      : activeProducts.filter((p) => p.categoryId === selectedCategory)

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

  function handleConfirm() {
    if (!selectedClient || !user) return
    if (items.length === 0) {
      toast.error('Agregá al menos un producto')
      return
    }

    const solicitudCount = orders.filter((o) => o.codigo.startsWith('S-')).length + 1
    const total = Math.round(getTotalARS())
    const newOrder: Order = {
      id: `o_${Date.now()}`,
      codigo: `S-${String(solicitudCount).padStart(4, '0')}`,
      clienteId: selectedClient.id,
      sellerId: user.sellerId,
      estado: 'pendiente_revision',
      items: items.map((i) => ({
        productId: i.productId,
        cantidad: i.cantidad,
        precioUnit: i.precioUnit,
        descuentoAplicado: i.descuentoAplicado,
        picked: false,
      })),
      subtotal: total,
      total,
      fecha: new Date().toISOString(),
      plazoPagoDias: selectedClient.plazoPagoDias,
      tipoEntrega: 'envio',
      direccionEnvio: selectedClient.direccion
        ? {
            direccion: selectedClient.direccion,
            ciudad: selectedClient.ciudad,
            provincia: selectedClient.provincia,
            codigoPostal: selectedClient.codigoPostal ?? '',
          }
        : undefined,
    }

    addOrder(newOrder)
    clearCart()
    toast.success(`Pedido ${newOrder.codigo} creado correctamente`)
    router.push('/clientes')
  }

  if (myClients.length === 0) {
    return (
      <div className="min-h-full bg-[#000] flex items-center justify-center">
        <p className="text-[#555] text-xs tracking-[0.2em] uppercase">
          No tenés clientes asignados
        </p>
      </div>
    )
  }

  const totalARS = getTotalARS()
  const totalUnidades = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div className="min-h-full bg-[#000]">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-[#2A2A2A] bg-[#000]/95 backdrop-blur-sm px-4 lg:px-8 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
              Nuevo Pedido
            </h1>
            {selectedClient && priceList && (
              <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
                {selectedClient.nombre} — Lista {priceList.name}
              </p>
            )}
          </div>

          {/* Client selector */}
          <div className="flex-shrink-0">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-[#111] border border-[#2A2A2A] text-white text-xs tracking-[0.1em] px-3 py-2 focus:outline-none focus:border-white transition-colors min-w-[200px]"
            >
              <option value="">— Seleccionar cliente —</option>
              {myClients.map((c) => {
                const pl = priceLists.find((p) => p.id === c.priceListId)
                return (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({pl?.name ?? c.priceListId})
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* Category tabs — only show when client is selected */}
        {selectedClientId && (
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
        )}
      </div>

      {!selectedClientId ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-[#555] text-xs tracking-[0.2em] uppercase">
            Seleccioná un cliente para ver el catálogo
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row">
          {/* Product grid */}
          <div className="flex-1 px-4 lg:px-8 py-8">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-px bg-[#2A2A2A]">
              {visibleProducts.map((product) => {
                const price = getProductPrice(product.id, priceListId)
                const inCart = isInCart(product.id)
                const cartItem = getCartItem(product.id)

                return (
                  <div key={product.id} className="bg-[#000] flex flex-col">
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      {product.badge && (
                        <span className="absolute top-3 left-3 z-10 bg-black text-white text-[8px] tracking-[0.2em] uppercase px-2 py-1">
                          {product.badge}
                        </span>
                      )}
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-col flex-1 p-4 border-t border-[#2A2A2A]">
                      <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">
                        {categories.find((c) => c.id === product.categoryId)?.name ??
                          product.categoryId}
                      </p>
                      <h3 className="text-sm text-white font-light mb-1 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-[#555] leading-relaxed mb-4 line-clamp-2 flex-1">
                        {product.description}
                      </p>

                      <div className="flex items-end justify-between gap-2 mt-auto">
                        <div>
                          <p className="text-[8px] tracking-[0.25em] uppercase text-[#555] mb-0.5">
                            Precio mayorista
                          </p>
                          <p className="text-base text-white font-light">
                            {price > 0 ? formatARS(price) : '—'}
                          </p>
                        </div>

                        {inCart ? (
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
                  </div>
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

          {/* Cart summary — sticky right panel */}
          <div className="lg:w-72 xl:w-80 lg:flex-shrink-0 border-t lg:border-t-0 lg:border-l border-[#2A2A2A] bg-[#0A0A0A]">
            <div className="sticky top-[120px] p-6">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingBag size={14} strokeWidth={1.5} className="text-[#555]" />
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">
                  Resumen del pedido
                </p>
              </div>

              {items.length === 0 ? (
                <p className="text-[10px] text-[#555] py-4 text-center">
                  Sin productos agregados
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-5 max-h-[40vh] overflow-y-auto pr-1">
                    {items.map((item) => {
                      const product = products.find((p) => p.id === item.productId)
                      return (
                        <div key={item.productId} className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-light truncate">
                              {product?.name ?? item.productId}
                            </p>
                            <p className="text-[10px] text-[#555]">
                              {formatARS(item.precioUnit)} × {item.cantidad}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() =>
                                updateCantidad(item.productId, item.cantidad - 1)
                              }
                              className="w-5 h-5 flex items-center justify-center border border-[#2A2A2A] text-[#555] hover:text-white hover:border-white transition-colors text-xs"
                            >
                              −
                            </button>
                            <span className="text-xs text-white w-5 text-center">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() =>
                                updateCantidad(item.productId, item.cantidad + 1)
                              }
                              className="w-5 h-5 flex items-center justify-center border border-[#2A2A2A] text-[#555] hover:text-white hover:border-white transition-colors text-xs"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="ml-1 text-[#555] hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={11} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-[#2A2A2A] pt-4 space-y-1 mb-5">
                    <div className="flex justify-between">
                      <p className="text-[10px] text-[#555] uppercase tracking-[0.1em]">
                        Unidades
                      </p>
                      <p className="text-xs text-[#A0A0A0]">{totalUnidades}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-[10px] text-[#555] uppercase tracking-[0.1em]">Total</p>
                      <p className="text-sm text-white font-light">{formatARS(totalARS)}</p>
                    </div>
                    {selectedClient && (
                      <div className="flex justify-between">
                        <p className="text-[10px] text-[#555] uppercase tracking-[0.1em]">
                          Plazo pago
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {selectedClient.plazoPagoDias} días
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleConfirm}
                    className="w-full border border-white text-white text-[10px] tracking-[0.2em] uppercase py-3 hover:bg-white hover:text-black transition-colors"
                  >
                    Confirmar pedido
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PedidoNuevoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <p className="text-[#555] text-xs tracking-[0.2em] uppercase">Cargando...</p>
        </div>
      }
    >
      <PedidoNuevoContent />
    </Suspense>
  )
}
