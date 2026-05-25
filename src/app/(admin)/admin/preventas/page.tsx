'use client'

import { useMemo, useState } from 'react'
import { useDataStore } from '@/stores/data-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatARS, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Sparkles, PackageCheck, AlertTriangle } from 'lucide-react'

type FilterTab = 'todos' | 'sin_stock' | 'con_stock'

export default function AdminPreventasPage() {
  const { products, orders, clients, stock, convertReservaToOrder, ingresoStock } = useDataStore()
  const { user } = useAuthStore()
  const [filter, setFilter] = useState<FilterTab>('todos')
  const [ingresoQty, setIngresoQty] = useState<Record<string, number>>({})

  const preventaProducts = useMemo(() => products.filter((p) => p.preventa), [products])

  // Reservas (pedidos relacionados con productos preventa, en estados activos)
  const reservasByProduct = useMemo(() => {
    const map = new Map<string, { qty: number; orderIds: Set<string> }>()
    orders
      .filter((o) => ['pendiente_revision', 'modificado', 'reserva_preventa'].includes(o.estado))
      .forEach((o) => {
        o.items.forEach((it) => {
          const prod = products.find((p) => p.id === it.productId)
          if (!prod || !prod.preventa) return
          const cur = map.get(it.productId) ?? { qty: 0, orderIds: new Set() }
          cur.qty += it.cantidad
          cur.orderIds.add(o.id)
          map.set(it.productId, cur)
        })
      })
    return map
  }, [orders, products])

  const filtered = useMemo(() => {
    return preventaProducts.filter((p) => {
      const s = stock.find((st) => st.productId === p.id)
      const disponible = s?.disponible ?? 0
      if (filter === 'sin_stock') return disponible === 0
      if (filter === 'con_stock') return disponible > 0
      return true
    })
  }, [preventaProducts, stock, filter])

  // Pedidos individuales por producto seleccionado
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  function handleConvertOrder(orderId: string, productName: string) {
    if (!confirm(`Convertir reserva en pedido confirmado? Esto descuenta stock real de ${productName}.`)) return
    convertReservaToOrder(orderId, user?.name ?? 'Admin')
    toast.success('Reserva convertida a pedido. Stock descontado y remito generado.')
  }

  function handleRegistrarStock(productId: string, productName: string) {
    const qty = ingresoQty[productId] ?? 0
    if (qty <= 0) {
      toast.error('Ingresá una cantidad válida')
      return
    }
    ingresoStock(productId, qty, user?.name ?? 'Admin', `Mercadería preventa — ${productName}`)
    setIngresoQty((s) => ({ ...s, [productId]: 0 }))
    toast.success(`${qty} unidades de ${productName} ingresadas al stock`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-blue-400" />
          <p className="text-[10px] tracking-[0.3em] uppercase text-blue-400">Preventas — gestión admin</p>
        </div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">PREVENTAS</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          Gestión de reservas anticipadas y conversión a pedidos al recibir mercadería
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-[#2A2A2A] w-fit">
        {(
          [
            { key: 'todos' as const, label: 'Todos' },
            { key: 'sin_stock' as const, label: 'Sin stock' },
            { key: 'con_stock' as const, label: 'Con stock' },
          ]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              'px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] last:border-r-0',
              filter === t.key ? 'bg-[#1A1A1A] text-white' : 'text-[#555] hover:text-[#A0A0A0]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid de productos preventa */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-[#555] text-xs italic py-8 text-center">Sin productos en preventa</p>
        )}
        {filtered.map((product) => {
          const reservas = reservasByProduct.get(product.id) ?? { qty: 0, orderIds: new Set<string>() }
          const cupo = product.cupoPreventa ?? 0
          const cupoExcedido = cupo > 0 && reservas.qty > cupo
          const pctOcupado = cupo > 0 ? Math.min(100, (reservas.qty / cupo) * 100) : 0
          const stockReal = stock.find((s) => s.productId === product.id)?.disponible ?? 0
          const isExpanded = expandedProduct === product.id

          return (
            <div key={product.id} className="border border-[#2A2A2A] bg-[#0A0A0A]">
              {/* Header de producto */}
              <button
                onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#111] transition-colors text-left"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-light">{product.name}</p>
                    <p className="text-[10px] text-[#555] font-mono">{product.sku}</p>
                  </div>
                </div>

                {/* Métricas inline */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-[#555]">Reservas</p>
                    <p className={cn('text-sm font-medium', cupoExcedido ? 'text-yellow-400' : 'text-white')}>
                      {reservas.qty}{cupo > 0 && <span className="text-[#555] text-xs font-normal"> / {cupo}</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-[#555]">Stock real</p>
                    <p className={cn('text-sm font-medium', stockReal > 0 ? 'text-emerald-400' : 'text-[#555]')}>
                      {stockReal}
                    </p>
                  </div>
                  {cupoExcedido && (
                    <AlertTriangle size={14} className="text-yellow-400" />
                  )}
                </div>
              </button>

              {/* Barra cupo */}
              {cupo > 0 && (
                <div className="px-5 pb-2">
                  <div className="h-1 bg-[#1A1A1A] overflow-hidden">
                    <div
                      className={cn('h-full', cupoExcedido ? 'bg-yellow-500' : 'bg-emerald-500')}
                      style={{ width: `${pctOcupado}%` }}
                    />
                  </div>
                  {cupoExcedido && (
                    <p className="text-[10px] text-yellow-400 mt-1">⚠ Cupo excedido — admin decide si aceptar más reservas</p>
                  )}
                </div>
              )}

              {/* Expanded — gestión */}
              {isExpanded && (
                <div className="border-t border-[#1A1A1A] px-5 py-4 space-y-4 bg-[#0A0A0A]">
                  {/* Ingresar mercadería */}
                  <div className="flex items-end gap-3 pb-4 border-b border-[#1A1A1A]">
                    <div className="flex-1">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Ingresar mercadería al stock</p>
                      <input
                        type="number"
                        min={0}
                        value={ingresoQty[product.id] ?? 0}
                        onChange={(e) => setIngresoQty((s) => ({ ...s, [product.id]: Number(e.target.value) }))}
                        placeholder="Cantidad recibida"
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
                      />
                    </div>
                    <button
                      onClick={() => handleRegistrarStock(product.id, product.name)}
                      className="border border-emerald-700 bg-emerald-950/30 text-emerald-300 text-[10px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-emerald-900/40"
                    >
                      Registrar ingreso
                    </button>
                  </div>

                  {/* Lista de reservas */}
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">
                      Reservas pendientes ({reservas.orderIds.size})
                    </p>
                    {reservas.orderIds.size === 0 ? (
                      <p className="text-[#555] text-xs italic">Sin reservas todavía</p>
                    ) : (
                      <div className="space-y-1.5">
                        {Array.from(reservas.orderIds).map((orderId) => {
                          const o = orders.find((or) => or.id === orderId)
                          if (!o) return null
                          const c = clients.find((cl) => cl.id === o.clienteId)
                          const item = o.items.find((it) => it.productId === product.id)
                          const cantidad = item?.cantidad ?? 0
                          const isConvertible = stockReal >= cantidad
                          return (
                            <div key={orderId} className="flex items-center justify-between gap-3 bg-[#111] border border-[#1A1A1A] px-3 py-2">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="font-mono text-xs text-white">{o.codigo}</span>
                                <span className="text-[#A0A0A0] text-xs truncate">{c?.nombre ?? 'Cliente'}</span>
                                <span className="text-[#555] text-[10px]">{formatDate(o.fecha)}</span>
                                <span className="text-emerald-400 text-xs ml-auto">×{cantidad}</span>
                              </div>
                              <button
                                onClick={() => handleConvertOrder(orderId, product.name)}
                                disabled={!isConvertible}
                                className={cn(
                                  'flex items-center gap-1.5 border text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 transition-colors',
                                  isConvertible
                                    ? 'border-blue-700 bg-blue-950/30 text-blue-300 hover:bg-blue-900/40'
                                    : 'border-[#2A2A2A] text-[#555] cursor-not-allowed opacity-50'
                                )}
                                title={isConvertible ? 'Convertir reserva a pedido confirmado' : `Stock insuficiente: requiere ${cantidad}, hay ${stockReal}`}
                              >
                                <PackageCheck size={11} /> Convertir
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-[#555] leading-relaxed pt-2 border-t border-[#1A1A1A]">
                    Las reservas se convierten manualmente cuando llega la mercadería. El admin decide el orden — las reservas no tienen prioridad automática sobre la venta normal.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="border border-blue-900/40 bg-blue-950/20 p-4 mt-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-blue-400 mb-2">Cómo funciona la preventa</p>
        <ul className="text-xs text-blue-100/80 leading-relaxed space-y-1 list-disc list-inside">
          <li>El admin marca productos como preventa y define el cupo guía (no es tope rígido).</li>
          <li>Las ópticas reservan desde el catálogo de preventa — descuenta del cupo, no del stock.</li>
          <li>Cuando llega la mercadería, ingresá el stock acá. Las reservas se convierten manualmente a pedidos confirmados.</li>
          <li>Si el cupo se excede, el sistema avisa pero no bloquea: el admin decide caso por caso.</li>
        </ul>
      </div>
    </div>
  )
}
