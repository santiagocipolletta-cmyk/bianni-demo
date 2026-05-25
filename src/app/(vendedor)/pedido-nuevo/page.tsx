'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, ShoppingBag, Trash2, Search, AlertTriangle, Info, X } from 'lucide-react'
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
    getClientPendingOrders,
    getClientOpenClaims,
    addOrder,
  } = useDataStore()

  const { items, addItem, removeItem, updateCantidad, clearCart, setClient, getTotalARS } =
    useCartStore()

  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CAT)
  const [clientQuery, setClientQuery] = useState('')

  const sellerId = user?.sellerId
  const myClients = clients.filter((c) => c.sellerId === sellerId)

  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase()
    if (!q) return myClients
    return myClients.filter((c) =>
      c.nombre.toLowerCase().includes(q) ||
      (c.ciudad ?? '').toLowerCase().includes(q) ||
      (c.provincia ?? '').toLowerCase().includes(q)
    )
  }, [myClients, clientQuery])

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

  const activeProducts = products.filter((p) => p.estado === 'activo')
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
      direccionEnvio: (() => {
        const principal = selectedClient.addresses.find((a) => a.esPrincipal) ?? selectedClient.addresses[0]
        if (!principal) return undefined
        return {
          direccion: principal.direccion,
          ciudad: principal.ciudad,
          provincia: principal.provincia,
          codigoPostal: principal.codigoPostal,
          receptor: principal.receptor,
          telefonoContacto: principal.telefonoContacto,
        }
      })(),
      addressId: (selectedClient.addresses.find((a) => a.esPrincipal) ?? selectedClient.addresses[0])?.id,
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

          {/* Mostrar quién está seleccionado y permitir cambiar */}
          {selectedClient && (
            <button
              type="button"
              onClick={() => setSelectedClientId('')}
              className="flex-shrink-0 flex items-center gap-2 border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:border-white hover:text-white transition-colors"
            >
              <X size={11} /> Cambiar cliente
            </button>
          )}
        </div>

        {/* Avisos cuando hay cliente seleccionado */}
        {selectedClient && (() => {
          const pending = getClientPendingOrders(selectedClient.id)
          const openClaims = getClientOpenClaims(selectedClient.id)
          if (pending.length === 0 && openClaims.length === 0) return null
          return (
            <div className="mt-3 space-y-1.5">
              {openClaims.length > 0 && (
                <div className="flex items-start gap-2 border border-yellow-800 bg-yellow-950/40 px-3 py-2 text-xs">
                  <AlertTriangle size={12} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-100">
                    Esta óptica tiene <span className="font-medium text-white">{openClaims.length} reclamo{openClaims.length !== 1 ? 's' : ''} sin resolver</span>. Recordá ofrecer una bonificación o aclararlo en observaciones del pedido.
                  </p>
                </div>
              )}
              {pending.length > 0 && (
                <div className="flex items-start gap-2 border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-xs">
                  <Info size={12} className="text-[#888] mt-0.5 flex-shrink-0" />
                  <p className="text-[#A0A0A0]">
                    Esta óptica ya tiene <span className="font-medium text-white">{pending.length} solicitud{pending.length !== 1 ? 'es' : ''} pendiente{pending.length !== 1 ? 's' : ''}</span> de revisión del admin.
                  </p>
                </div>
              )}
            </div>
          )
        })()}

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
        <div className="px-4 lg:px-8 py-10 max-w-2xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#555] mb-4">
            Elegí una óptica para armar el pedido
          </p>
          {/* Buscador */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              type="text"
              autoFocus
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              placeholder="Buscar por nombre, ciudad o provincia..."
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm pl-11 pr-4 py-3 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
          <p className="text-[10px] text-[#555] uppercase tracking-[0.2em] mb-2">
            {filteredClients.length} óptica{filteredClients.length !== 1 ? 's' : ''}
          </p>
          {/* Lista de clientes */}
          <div className="border border-[#2A2A2A] divide-y divide-[#1A1A1A]">
            {filteredClients.length === 0 ? (
              <p className="text-center text-[#555] text-xs py-6">Sin resultados</p>
            ) : (
              filteredClients.map((c) => {
                const pl = priceLists.find((p) => p.id === c.priceListId)
                const pending = getClientPendingOrders(c.id).length
                const claims = getClientOpenClaims(c.id).length
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClientId(c.id)}
                    className="w-full text-left px-4 py-3.5 hover:bg-[#0A0A0A] transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white font-light truncate">{c.nombre}</p>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-0.5">
                        {c.ciudad}{c.provincia ? ` · ${c.provincia}` : ''} · Lista {pl?.name ?? c.priceListId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {claims > 0 && (
                        <span className="text-[9px] tracking-[0.15em] uppercase bg-yellow-950 text-yellow-400 px-2 py-0.5">
                          {claims} reclamo{claims !== 1 ? 's' : ''}
                        </span>
                      )}
                      {pending > 0 && (
                        <span className="text-[9px] tracking-[0.15em] uppercase bg-[#1A1A1A] text-[#A0A0A0] px-2 py-0.5">
                          {pending} pendiente{pending !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-[#555] group-hover:text-white text-sm">→</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
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
