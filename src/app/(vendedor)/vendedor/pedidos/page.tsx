'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import {
  X, Search, ClipboardList, Copy, MessageSquare, Calendar, MapPin, Package,
  ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import {
  cn,
  formatARS,
  formatDate,
  formatDateTime,
  normalizeText,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

type Tab = 'todos' | 'pendientes' | 'aceptados' | 'despacho' | 'entregados' | 'rechazados' | 'cancel'

const TAB_FILTERS: Record<Tab, OrderStatus[] | null> = {
  todos: null,
  pendientes: ['pendiente_revision', 'modificado'],
  aceptados: ['aceptado'],
  despacho: ['despachado'],
  entregados: ['entregado'],
  rechazados: ['rechazado', 'cancelado'],
  cancel: ['cancelacion_solicitada'],
}

const TAB_LABELS: Record<Tab, string> = {
  todos: 'Todos',
  pendientes: 'Pendientes',
  aceptados: 'Aceptados',
  despacho: 'Despacho',
  entregados: 'Entregados',
  rechazados: 'Rechazados',
  cancel: 'Cancelación pedida',
}

export default function VendedorPedidosPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    clients,
    products,
    orderHistory,
    getOrdersForSeller,
    addOrderInternalNote,
    duplicateOrder,
  } = useDataStore()

  const [tab, setTab] = useState<Tab>('todos')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const sellerId = user?.sellerId ?? ''
  const myOrders = useMemo(() => getOrdersForSeller(sellerId), [getOrdersForSeller, sellerId])

  // KPIs (mes actual)
  const kpis = useMemo(() => {
    const now = new Date()
    const thisMonth = (d: string) => {
      const dt = new Date(d)
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()
    }
    return {
      total: myOrders.filter((o) => thisMonth(o.fecha)).length,
      pendientes: myOrders.filter((o) => ['pendiente_revision', 'modificado'].includes(o.estado)).length,
      aceptados: myOrders.filter((o) => o.estado === 'aceptado').length,
      despachados: myOrders.filter((o) => o.estado === 'despachado').length,
      entregados: myOrders.filter((o) => o.estado === 'entregado' && thisMonth(o.fecha)).length,
    }
  }, [myOrders])

  // Filtrado por tab + búsqueda
  const filtered = useMemo(() => {
    let result = myOrders
    const statesFilter = TAB_FILTERS[tab]
    if (statesFilter) {
      result = result.filter((o) => statesFilter.includes(o.estado))
    }
    const q = normalizeText(search.trim())
    if (q) {
      result = result.filter((o) => {
        const client = clients.find((c) => c.id === o.clienteId)
        return (
          normalizeText(o.codigo).includes(q) ||
          normalizeText(client?.nombre).includes(q)
        )
      })
    }
    return [...result].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [myOrders, tab, search, clients])

  const opened = openId ? myOrders.find((o) => o.id === openId) ?? null : null
  const openedClient = opened ? clients.find((c) => c.id === opened.clienteId) : null
  const openedHistory = opened
    ? orderHistory.filter((h) => h.orderId === opened.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : []

  function closeDrawer() {
    setOpenId(null)
    setNoteText('')
  }

  function handleAddNote() {
    if (!opened || !noteText.trim()) return
    addOrderInternalNote(opened.id, {
      texto: noteText.trim(),
      autorNombre: user?.name ?? 'Vendedor',
      autorRol: 'vendedor',
    })
    setNoteText('')
    toast.success('Nota interna agregada')
  }

  function handleDuplicate() {
    if (!opened) return
    const newId = duplicateOrder(opened.id, user?.name ?? 'Vendedor')
    if (!newId) {
      toast.error('No se pudo duplicar el pedido')
      return
    }
    toast.success(`Pedido duplicado · queda como pendiente de revisión`)
    closeDrawer()
    // Reabrir el nuevo pedido recién creado para que el vendedor lo vea
    setTimeout(() => setOpenId(newId), 250)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em] uppercase">Mis Pedidos</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          Pipeline de pedidos de las ópticas asignadas a vos · {myOrders.length} en total
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Este mes" value={kpis.total} accent="text-white" />
        <KpiCard label="Pendientes admin" value={kpis.pendientes} accent="text-yellow-400" />
        <KpiCard label="Aceptados" value={kpis.aceptados} accent="text-emerald-400" />
        <KpiCard label="En despacho" value={kpis.despachados} accent="text-purple-400" />
        <KpiCard label="Entregados (mes)" value={kpis.entregados} accent="text-teal-400" />
      </div>

      {/* Search + tabs */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar código o cliente..."
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs pl-8 pr-3 py-2 focus:outline-none focus:border-[#555] placeholder:text-[#444]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-[#2A2A2A] overflow-x-auto">
        {(Object.keys(TAB_FILTERS) as Tab[]).map((key) => {
          const count = key === 'todos'
            ? myOrders.length
            : myOrders.filter((o) => TAB_FILTERS[key]!.includes(o.estado)).length
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex-shrink-0 px-4 py-2 text-[10px] tracking-[0.15em] uppercase border-r border-[#2A2A2A] last:border-r-0 whitespace-nowrap transition-colors',
                tab === key
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#555] hover:text-[#A0A0A0]'
              )}
            >
              {TAB_LABELS[key]} <span className="text-[#666]">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Tabla */}
      <div className="border border-[#2A2A2A] overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-[#555] text-xs py-16 tracking-[0.15em] uppercase">
            Sin pedidos en esta categoría
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
                {['Código', 'Cliente', 'Fecha', 'Items', 'Total', 'Estado', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const client = clients.find((c) => c.id === order.clienteId)
                const itemsCount = order.items.reduce((s, i) => s + i.cantidad, 0)
                const notasCount = order.notasInternas?.length ?? 0
                return (
                  <tr
                    key={order.id}
                    onClick={() => setOpenId(order.id)}
                    className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-white text-xs font-mono whitespace-nowrap">{order.codigo}</td>
                    <td className="px-4 py-3 text-white text-xs">
                      <p className="font-light">{client?.nombre ?? '—'}</p>
                      <p className="text-[10px] text-[#555]">{client?.ciudad ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-[#A0A0A0] text-[11px] whitespace-nowrap">{formatDate(order.fecha)}</td>
                    <td className="px-4 py-3 text-[#A0A0A0] text-xs">{itemsCount}</td>
                    <td className="px-4 py-3 text-white text-xs font-light whitespace-nowrap">{formatARS(order.total)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]', ORDER_STATUS_COLORS[order.estado])}>
                        {ORDER_STATUS_LABELS[order.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[#555] text-[10px]">
                        {notasCount > 0 && (
                          <span title={`${notasCount} nota${notasCount !== 1 ? 's' : ''} interna${notasCount !== 1 ? 's' : ''}`} className="flex items-center gap-0.5 text-orange-400">
                            <MessageSquare size={10} /> {notasCount}
                          </span>
                        )}
                        <ArrowRight size={11} strokeWidth={2} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer detalle */}
      <AnimatePresence>
        {opened && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70"
              onClick={closeDrawer}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0A0A0A] border-l border-[#2A2A2A] overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-5 sticky top-0 bg-[#0A0A0A] z-10">
                <div className="flex items-center gap-3">
                  <ClipboardList size={16} strokeWidth={1.5} className="text-[#666]" />
                  <div>
                    <p className="text-white text-sm font-mono">{opened.codigo}</p>
                    <p className="text-[10px] text-[#555] tracking-[0.15em] uppercase">{openedClient?.nombre ?? '—'}</p>
                  </div>
                </div>
                <button onClick={closeDrawer} className="text-[#555] hover:text-white transition-colors">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Estado + resumen */}
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('text-[10px] px-3 py-1 uppercase tracking-[0.15em]', ORDER_STATUS_COLORS[opened.estado])}>
                    {ORDER_STATUS_LABELS[opened.estado]}
                  </span>
                  <span className="text-[10px] text-[#555] flex items-center gap-1">
                    <Calendar size={11} /> {formatDate(opened.fecha)}
                  </span>
                </div>

                {/* Bloque resumen */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <DetailItem label="Total" value={formatARS(opened.total)} />
                  <DetailItem label="Plazo de pago" value={`${opened.plazoPagoDias} días`} />
                  <DetailItem label="Tipo entrega" value={opened.tipoEntrega === 'envio' ? 'Envío' : 'Coordinado'} />
                  {opened.remitoNumero && <DetailItem label="Remito N°" value={String(opened.remitoNumero).padStart(8, '0')} />}
                </div>

                {opened.tipoEntrega === 'envio' && opened.direccionEnvio && (
                  <div className="border border-[#1A1A1A] bg-[#111] p-3">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1 flex items-center gap-1.5">
                      <MapPin size={10} /> Dirección de envío
                    </p>
                    <p className="text-xs text-white">{opened.direccionEnvio.direccion}</p>
                    <p className="text-[11px] text-[#A0A0A0]">
                      {opened.direccionEnvio.ciudad}, {opened.direccionEnvio.provincia}
                      {opened.direccionEnvio.codigoPostal ? ` — CP ${opened.direccionEnvio.codigoPostal}` : ''}
                    </p>
                  </div>
                )}

                {opened.observaciones && (
                  <div className="border-l-2 border-[#2A2A2A] pl-3">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">Observaciones del cliente</p>
                    <p className="text-xs text-[#A0A0A0] italic">{opened.observaciones}</p>
                  </div>
                )}

                {opened.motivoRechazo && (
                  <div className="border border-red-900/50 bg-red-950/20 p-3">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-red-400 mb-1">Motivo de rechazo</p>
                    <p className="text-xs text-red-200">{opened.motivoRechazo}</p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2 flex items-center gap-1.5">
                    <Package size={11} /> Items ({opened.items.length})
                  </p>
                  <div className="border border-[#1A1A1A] divide-y divide-[#1A1A1A]">
                    {opened.items.map((it) => {
                      const product = products.find((p) => p.id === it.productId)
                      const subtotal = it.cantidad * it.precioUnit
                      return (
                        <div key={it.productId} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-light truncate">{product?.name ?? it.productId}</p>
                            <p className="text-[10px] text-[#555]">
                              {it.cantidad} × {formatARS(it.precioUnit)}
                              {it.esReemplazo && <span className="text-yellow-400 ml-2">· Reemplazo</span>}
                            </p>
                          </div>
                          <p className="text-white text-xs font-light whitespace-nowrap">{formatARS(subtotal)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Timeline */}
                {openedHistory.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Historial</p>
                    <div className="space-y-2">
                      {openedHistory.map((h) => (
                        <div key={h.id} className="flex items-start gap-2 text-xs border-l-2 border-[#2A2A2A] pl-3 py-0.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-white">
                              {h.estadoAnterior ? `${ORDER_STATUS_LABELS[h.estadoAnterior]} → ` : ''}
                              <span className="font-medium">{ORDER_STATUS_LABELS[h.estadoNuevo]}</span>
                            </p>
                            {h.motivo && <p className="text-[10px] text-[#A0A0A0] italic">{h.motivo}</p>}
                            <p className="text-[10px] text-[#555]">{h.cambiadoPor} · {formatDateTime(h.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas internas */}
                <div className="border-t border-[#1A1A1A] pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={12} className="text-orange-400" />
                    <p className="text-[10px] tracking-[0.2em] uppercase text-orange-400">
                      Notas internas (admin + vendedor)
                    </p>
                  </div>

                  {(opened.notasInternas?.length ?? 0) === 0 ? (
                    <p className="text-[11px] text-[#555] italic mb-3">Todavía no hay notas internas en este pedido.</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {opened.notasInternas!.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            'border p-3 text-xs',
                            n.autorRol === 'admin'
                              ? 'border-blue-900/40 bg-blue-950/20'
                              : 'border-orange-900/40 bg-orange-950/10'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className={cn(
                              'text-[9px] tracking-[0.15em] uppercase font-medium',
                              n.autorRol === 'admin' ? 'text-blue-400' : 'text-orange-400'
                            )}>
                              {n.autorNombre} · {n.autorRol}
                            </p>
                            <p className="text-[9px] text-[#555]">{formatDateTime(n.createdAt)}</p>
                          </div>
                          <p className="text-white text-xs leading-relaxed">{n.texto}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    placeholder="Agregar nota interna (solo visible para admin y vendedor)..."
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555] resize-none placeholder:text-[#444]"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className="mt-2 w-full border border-orange-700 text-orange-400 bg-orange-950/30 text-[10px] tracking-[0.15em] uppercase py-2 hover:bg-orange-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Agregar nota
                  </button>
                </div>

                {/* Acciones */}
                <div className="border-t border-[#1A1A1A] pt-5 flex gap-2">
                  <button
                    onClick={closeDrawer}
                    className="flex-1 border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase py-2.5 hover:bg-[#1A1A1A] transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="flex-1 border border-white text-white text-[10px] tracking-[0.15em] uppercase py-2.5 hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Copy size={11} /> Repetir pedido
                  </button>
                </div>

                <p className="text-[10px] text-[#555] leading-relaxed border-t border-[#1A1A1A] pt-3">
                  <span className="text-[#777]">Vista de solo lectura.</span>{' '}
                  Para cambiar estado, aceptar o rechazar el pedido, debe hacerlo el admin.
                  Si necesitás coordinar algo con él, dejá una nota interna acá arriba.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── helpers internos ────────────────────────────────────────────────────────

function KpiCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-4">
      <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">{label}</p>
      <p className={cn('font-display text-2xl font-light', accent)}>{value}</p>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-0.5">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  )
}
