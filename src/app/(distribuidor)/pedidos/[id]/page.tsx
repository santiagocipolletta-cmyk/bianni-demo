'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { useDataStore } from '@/stores/data-store'
import { cn, formatARS, formatDate, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

export default function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { getOrderWithDetails, products } = useDataStore()

  const order = getOrderWithDetails(id)

  if (!order) {
    return (
      <div className="min-h-full bg-[#000] flex flex-col items-center justify-center gap-6 py-24">
        <Package size={32} className="text-[#555]" strokeWidth={1} />
        <p className="text-[#555] text-xs tracking-[0.2em] uppercase">Pedido no encontrado</p>
        <Link
          href="/pedidos"
          className="flex items-center gap-2 text-[9px] tracking-[0.2em] uppercase text-[#A0A0A0] hover:text-white transition-colors border border-[#2A2A2A] px-4 py-2 hover:border-white"
        >
          <ArrowLeft size={12} />
          Volver a pedidos
        </Link>
      </div>
    )
  }

  const totalUnidades = order.items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div className="min-h-full bg-[#000]">
      {/* Page header */}
      <div className="sticky top-0 z-30 border-b border-[#2A2A2A] bg-[#000]/95 backdrop-blur-sm px-4 lg:px-8 py-5">
        <div className="flex items-center gap-4">
          <Link
            href="/pedidos"
            className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase text-[#555] hover:text-white transition-colors"
          >
            <ArrowLeft size={11} />
            Pedidos
          </Link>
          <span className="text-[#2A2A2A]">/</span>
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-display text-2xl lg:text-3xl font-light tracking-[0.2em] uppercase text-white">
              {order.codigo}
            </h1>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 text-[9px] tracking-[0.15em] uppercase flex-shrink-0',
                ORDER_STATUS_COLORS[order.estado]
              )}
            >
              {ORDER_STATUS_LABELS[order.estado]}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: order details */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#2A2A2A]">
              {[
                { label: 'Total', value: formatARS(order.total) },
                { label: 'Unidades', value: String(totalUnidades) },
                { label: 'Plazo de pago', value: `${order.plazoPagoDias} días` },
                { label: 'Vendedor', value: order.seller?.nombre ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#000] px-5 py-4">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">{label}</p>
                  <p className="text-white text-sm font-light">{value}</p>
                </div>
              ))}
            </div>

            {/* Rejection reason */}
            {order.motivoRechazo && (
              <div className="border border-red-900/50 bg-red-950/20 px-5 py-4">
                <p className="text-[9px] tracking-[0.2em] uppercase text-red-500 mb-2">Motivo de rechazo</p>
                <p className="text-red-300 text-sm font-light leading-relaxed">{order.motivoRechazo}</p>
              </div>
            )}

            {/* Admin notes */}
            {order.notasAdmin && (
              <div className="border border-blue-900/50 bg-blue-950/20 px-5 py-4">
                <p className="text-[9px] tracking-[0.2em] uppercase text-blue-400 mb-2">Notas de administración</p>
                <p className="text-blue-200 text-sm font-light leading-relaxed">{order.notasAdmin}</p>
              </div>
            )}

            {/* Items table */}
            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-3">Detalle de productos</p>
              <div className="border border-[#2A2A2A]">
                {/* Header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#2A2A2A] bg-[#0A0A0A]">
                  {['Producto', 'Cant.', 'Precio unit.', 'Dto.', 'Subtotal'].map((h) => (
                    <p key={h} className="text-[9px] tracking-[0.15em] uppercase text-[#555] text-right first:text-left">
                      {h}
                    </p>
                  ))}
                </div>
                {/* Rows */}
                {order.items.map((item) => {
                  const product = products.find((p) => p.id === item.productId)
                  const subtotal = item.precioUnit * item.cantidad * (1 - item.descuentoAplicado / 100)
                  return (
                    <div
                      key={item.productId}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#2A2A2A] last:border-0"
                    >
                      <p className="text-white text-sm font-light truncate">
                        {product?.name ?? item.productId}
                      </p>
                      <p className="text-[#A0A0A0] text-sm text-right">{item.cantidad}</p>
                      <p className="text-[#A0A0A0] text-sm text-right">{formatARS(item.precioUnit)}</p>
                      <p className="text-[#A0A0A0] text-sm text-right">
                        {item.descuentoAplicado > 0 ? `${item.descuentoAplicado}%` : '—'}
                      </p>
                      <p className="text-white text-sm text-right">{formatARS(Math.round(subtotal))}</p>
                    </div>
                  )
                })}
                {/* Total row */}
                <div className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 border-t border-[#2A2A2A] bg-[#0A0A0A]">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#555]">Total</p>
                  <p className="text-white text-sm font-light text-right">{formatARS(order.total)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: timeline */}
          <div className="lg:w-72 flex-shrink-0">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-5">
              Historial del pedido
            </p>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#2A2A2A]" />

              <div className="flex flex-col gap-0">
                {order.history.map((entry, idx) => {
                  const isLast = idx === order.history.length - 1
                  return (
                    <div key={entry.id} className="relative pl-8 pb-6 last:pb-0">
                      {/* Dot */}
                      <div
                        className={cn(
                          'absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center',
                          isLast
                            ? 'border-white bg-white'
                            : 'border-[#555] bg-[#000]'
                        )}
                      />

                      <div>
                        <p
                          className={cn(
                            'text-[10px] tracking-[0.1em] uppercase font-medium',
                            isLast ? 'text-white' : 'text-[#A0A0A0]'
                          )}
                        >
                          {ORDER_STATUS_LABELS[entry.estadoNuevo]}
                        </p>
                        <p className="text-[9px] text-[#555] mt-0.5">{entry.cambiadoPor}</p>
                        <p className="text-[9px] text-[#555] mt-0.5">{formatDateTime(entry.createdAt)}</p>
                        {entry.motivo && (
                          <p className="text-[10px] text-[#A0A0A0] mt-1 italic leading-relaxed">
                            &ldquo;{entry.motivo}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}

                {order.history.length === 0 && (
                  <p className="text-[#555] text-[10px] pl-8">Sin historial disponible</p>
                )}
              </div>
            </div>

            {/* Date summary */}
            <div className="mt-6 border-t border-[#2A2A2A] pt-4">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#555]">Fecha del pedido</p>
              <p className="text-white text-sm font-light mt-1">{formatDate(order.fecha)}</p>
              {order.cliente && (
                <>
                  <p className="text-[9px] tracking-[0.15em] uppercase text-[#555] mt-3">Cliente</p>
                  <p className="text-white text-sm font-light mt-1">{order.cliente.nombre}</p>
                  <p className="text-[#555] text-[10px]">{order.cliente.ciudad}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
