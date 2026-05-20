'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { cn, formatARS, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import type { OrderStatus } from '@/types'

type FilterKey = 'todos' | 'pendientes' | 'aceptados' | 'despachados' | 'entregados' | 'rechazados'

const FILTER_STATUSES: Record<FilterKey, OrderStatus[]> = {
  todos: [],
  pendientes: ['borrador', 'pendiente_revision', 'modificado'],
  aceptados: ['aceptado'],
  despachados: ['despachado'],
  entregados: ['entregado'],
  rechazados: ['rechazado', 'cancelado'],
}

const FILTER_LABELS: Record<FilterKey, string> = {
  todos: 'Todos',
  pendientes: 'Pendientes',
  aceptados: 'Aceptados',
  despachados: 'Despachados',
  entregados: 'Entregados',
  rechazados: 'Rechazados',
}

export default function PedidosPage() {
  const [filter, setFilter] = useState<FilterKey>('todos')
  const { user } = useAuthStore()
  const { orders } = useDataStore()

  const myOrders = orders
    .filter((o) => o.clienteId === user?.clientId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const visibleOrders =
    filter === 'todos'
      ? myOrders
      : myOrders.filter((o) => FILTER_STATUSES[filter].includes(o.estado))

  return (
    <div className="min-h-full bg-[#000]">
      {/* Page header */}
      <div className="sticky top-0 z-30 border-b border-[#2A2A2A] bg-[#000]/95 backdrop-blur-sm px-4 lg:px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
              Mis Pedidos
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
              {myOrders.length} pedido{myOrders.length !== 1 ? 's' : ''} en total
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 mt-4 overflow-x-auto">
          {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'flex-shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors',
                filter === key
                  ? 'border-white bg-white text-black'
                  : 'border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#555]'
              )}
            >
              {FILTER_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="px-4 lg:px-8 py-8">
        {visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-[#555] text-xs tracking-[0.2em] uppercase">
              Sin pedidos en esta categoría
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-px bg-[#2A2A2A]">
            {visibleOrders.map((order) => {
              const totalItems = order.items.reduce((s, i) => s + i.cantidad, 0)
              return (
                <Link
                  key={order.id}
                  href={`/pedidos/${order.id}`}
                  className="bg-[#000] flex items-center gap-4 px-5 py-4 hover:bg-[#0A0A0A] transition-colors group"
                >
                  {/* Code */}
                  <div className="flex-shrink-0 w-24">
                    <p className="text-white text-sm font-light tracking-[0.1em]">{order.codigo}</p>
                    <p className="text-[#555] text-[10px] tracking-[0.1em] mt-0.5">
                      {formatDate(order.fecha)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 text-[9px] tracking-[0.15em] uppercase',
                        ORDER_STATUS_COLORS[order.estado]
                      )}
                    >
                      {ORDER_STATUS_LABELS[order.estado]}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <p className="text-[#A0A0A0] text-[10px] tracking-[0.1em] uppercase">
                      {totalItems} unidad{totalItems !== 1 ? 'es' : ''} · {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-white text-sm font-light">{formatARS(order.total)}</p>
                    <p className="text-[#555] text-[9px] tracking-[0.1em] uppercase mt-0.5">
                      {order.plazoPagoDias}d plazo
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={14}
                    className="flex-shrink-0 text-[#555] group-hover:text-white transition-colors"
                  />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
