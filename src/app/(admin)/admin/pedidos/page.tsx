'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useDataStore } from '@/stores/data-store'
import {
  cn,
  formatARS,
  formatDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { LayoutGrid, Table, Search } from 'lucide-react'

// Kanban columns config
const KANBAN_COLUMNS: {
  status: OrderStatus
  label: string
  headerColor: string
  borderColor: string
  badgeColor: string
}[] = [
  {
    status: 'pendiente_revision',
    label: 'Pendientes',
    headerColor: 'text-yellow-400',
    borderColor: 'border-yellow-500',
    badgeColor: 'bg-yellow-500',
  },
  {
    status: 'modificado',
    label: 'Modificados',
    headerColor: 'text-blue-400',
    borderColor: 'border-blue-500',
    badgeColor: 'bg-blue-500',
  },
  {
    status: 'aceptado',
    label: 'Aceptados',
    headerColor: 'text-emerald-400',
    borderColor: 'border-emerald-500',
    badgeColor: 'bg-emerald-500',
  },
  {
    status: 'despachado',
    label: 'Despachados',
    headerColor: 'text-purple-400',
    borderColor: 'border-purple-500',
    badgeColor: 'bg-purple-500',
  },
  {
    status: 'entregado',
    label: 'Entregados',
    headerColor: 'text-teal-400',
    borderColor: 'border-teal-500',
    badgeColor: 'bg-teal-500',
  },
]

const ALL_STATUSES: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'pendiente_revision', label: ORDER_STATUS_LABELS.pendiente_revision },
  { value: 'modificado', label: ORDER_STATUS_LABELS.modificado },
  { value: 'aceptado', label: ORDER_STATUS_LABELS.aceptado },
  { value: 'despachado', label: ORDER_STATUS_LABELS.despachado },
  { value: 'entregado', label: ORDER_STATUS_LABELS.entregado },
  { value: 'rechazado', label: ORDER_STATUS_LABELS.rechazado },
  { value: 'cancelado', label: ORDER_STATUS_LABELS.cancelado },
  { value: 'borrador', label: ORDER_STATUS_LABELS.borrador },
  { value: 'enviado_wa', label: ORDER_STATUS_LABELS.enviado_wa },
]

interface OrderCardProps {
  order: Order
  clientName: string
  sellerName: string
}

function OrderCard({ order, clientName, sellerName }: OrderCardProps) {
  return (
    <Link href={`/admin/pedidos/${order.id}`}>
      <div className="bg-[#111] border border-[#2A2A2A] p-4 hover:border-[#444] transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <span className="font-bold text-white text-sm font-display tracking-wide">
            {order.codigo}
          </span>
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 uppercase tracking-[0.1em]',
              ORDER_STATUS_COLORS[order.estado]
            )}
          >
            {ORDER_STATUS_LABELS[order.estado]}
          </span>
        </div>
        <p className="text-[#A0A0A0] text-xs mb-0.5 truncate">{clientName}</p>
        <p className="text-[#555] text-xs mb-2 truncate">{sellerName}</p>
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-light">{formatARS(order.total)}</span>
          <span className="text-[#555] text-[10px]">{formatDate(order.fecha)}</span>
        </div>
      </div>
    </Link>
  )
}

export default function AdminPedidosPage() {
  const { orders, clients, sellers } = useDataStore()
  const [view, setView] = useState<'kanban' | 'tabla'>('kanban')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  // Helper lookups
  const clientMap = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.nombre])),
    [clients]
  )
  const sellerMap = useMemo(
    () => Object.fromEntries(sellers.map((s) => [s.id, s.nombre])),
    [sellers]
  )

  // Filter by search (order code or client name)
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim()
    return orders
      .filter((o) => {
        if (!q) return true
        const clientName = (clientMap[o.clienteId] ?? '').toLowerCase()
        return o.codigo.toLowerCase().includes(q) || clientName.includes(q)
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [orders, search, clientMap])

  // Tabla: also filter by status
  const tablaOrders = useMemo(() => {
    if (statusFilter === 'all') return filteredOrders
    return filteredOrders.filter((o) => o.estado === statusFilter)
  }, [filteredOrders, statusFilter])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">PEDIDOS</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            {orders.length} pedidos en total
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código o cliente..."
              className="bg-[#111] border border-[#2A2A2A] text-white text-xs pl-9 pr-4 py-2 w-64 placeholder:text-[#555] focus:outline-none focus:border-[#444]"
            />
          </div>

          {/* View toggle */}
          <div className="flex border border-[#2A2A2A]">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs tracking-[0.1em] uppercase transition-colors',
                view === 'kanban'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#555] hover:text-[#A0A0A0]'
              )}
            >
              <LayoutGrid size={13} />
              Kanban
            </button>
            <button
              onClick={() => setView('tabla')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs tracking-[0.1em] uppercase transition-colors border-l border-[#2A2A2A]',
                view === 'tabla'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#555] hover:text-[#A0A0A0]'
              )}
            >
              <Table size={13} />
              Tabla
            </button>
          </div>
        </div>
      </div>

      {/* ── KANBAN VIEW ── */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
          {KANBAN_COLUMNS.map((col, colIndex) => {
            const colOrders = filteredOrders.filter((o) => o.estado === col.status)
            return (
              <div
                key={col.status}
                className={cn(
                  'flex-shrink-0 w-72 border-t-2 bg-[#0A0A0A] border border-[#2A2A2A]',
                  col.borderColor
                )}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                  <span
                    className={cn(
                      'text-xs font-medium tracking-[0.15em] uppercase',
                      col.headerColor
                    )}
                  >
                    {col.label}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold text-black px-2 py-0.5 min-w-[20px] text-center',
                      col.badgeColor
                    )}
                  >
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <p className="text-center text-[#555] text-xs py-8">Sin pedidos</p>
                  ) : (
                    colOrders.map((order, cardIndex) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: colIndex * 0.05 + cardIndex * 0.03 }}
                      >
                        <OrderCard
                          order={order}
                          clientName={clientMap[order.clienteId] ?? order.clienteId}
                          sellerName={
                            order.sellerId ? (sellerMap[order.sellerId] ?? order.sellerId) : '—'
                          }
                        />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── TABLA VIEW ── */}
      {view === 'tabla' && (
        <div className="space-y-3">
          {/* Status filter */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="bg-[#111] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#444]"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="text-[#555] text-xs">
              {tablaOrders.length} resultado{tablaOrders.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-[#2A2A2A]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
                  {['Código', 'Cliente', 'Vendedor', 'Estado', 'Total', 'Fecha', 'Acciones'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {tablaOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-[#555] py-12 text-xs">
                      No hay pedidos con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  tablaOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-display font-bold text-white text-sm">
                          {order.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#A0A0A0] text-xs">
                        {clientMap[order.clienteId] ?? order.clienteId}
                      </td>
                      <td className="px-4 py-3 text-[#A0A0A0] text-xs">
                        {order.sellerId ? (sellerMap[order.sellerId] ?? order.sellerId) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'text-[10px] px-2 py-1 uppercase tracking-[0.1em]',
                            ORDER_STATUS_COLORS[order.estado]
                          )}
                        >
                          {ORDER_STATUS_LABELS[order.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white text-sm font-light">
                        {formatARS(order.total)}
                      </td>
                      <td className="px-4 py-3 text-[#555] text-xs">
                        {formatDate(order.fecha)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="text-[10px] tracking-[0.1em] uppercase text-[#A0A0A0] hover:text-white border border-[#2A2A2A] hover:border-[#444] px-3 py-1.5 transition-colors"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
