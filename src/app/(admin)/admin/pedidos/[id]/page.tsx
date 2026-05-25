'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { useDataStore } from '@/stores/data-store'
import { useAuthStore } from '@/stores/auth-store'
import {
  cn,
  formatARS,
  formatDate,
  formatDateTime,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/lib/utils'
import type { OrderItem } from '@/types'
import { ArrowLeft, Check, Edit2, X, Truck, PackageCheck, CheckCircle2, Circle } from 'lucide-react'
import { toast } from 'sonner'

// clienteId → userId map for notifications (demo)
const CLIENT_USER_MAP: Record<string, string> = {
  c1: 'u1',
}

function getNotifUserId(clienteId: string): string {
  return CLIENT_USER_MAP[clienteId] ?? clienteId
}

interface EditableItem extends OrderItem {
  editCantidad: number
  editDescuento: number
}

export default function AdminPedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)

  const { getOrderWithDetails, updateOrderStatus, updateOrderItems, decrementStock, releaseStock, addNotification, products } =
    useDataStore()
  const { user } = useAuthStore()

  const [editMode, setEditMode] = useState(false)
  const [editableItems, setEditableItems] = useState<EditableItem[]>([])
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [adminNota, setAdminNota] = useState<string | null>(null)

  const order = getOrderWithDetails(id)

  const userName = user?.name ?? 'Admin'

  // Product name lookup
  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.name])),
    [products]
  )

  if (!order) {
    return (
      <div className="p-6">
        <Link
          href="/admin/pedidos"
          className="flex items-center gap-2 text-[#555] hover:text-white text-xs tracking-[0.15em] uppercase mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver a pedidos
        </Link>
        <p className="text-[#555]">Pedido no encontrado.</p>
      </div>
    )
  }

  const notaActual = adminNota !== null ? adminNota : (order.notasAdmin ?? '')

  // Picking counter
  const pickedCount = order.items.filter((i) => i.picked).length
  const totalItems = order.items.length

  // Editable items init
  function startEditMode() {
    setEditableItems(
      order!.items.map((item) => ({
        ...item,
        editCantidad: item.cantidad,
        editDescuento: item.descuentoAplicado,
      }))
    )
    setEditMode(true)
  }

  function cancelEditMode() {
    setEditMode(false)
    setEditableItems([])
  }

  function updateEditItem(productId: string, field: 'editCantidad' | 'editDescuento', value: number) {
    setEditableItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, [field]: Math.max(0, value) } : item
      )
    )
  }

  // Toggle picked on an item
  function togglePicked(productId: string) {
    const updated: OrderItem[] = order!.items.map((item) =>
      item.productId === productId ? { ...item, picked: !item.picked } : item
    )
    updateOrderItems(order!.id, updated)
  }

  // Computed total for edit mode
  const editTotal = editableItems.reduce(
    (sum, i) => sum + i.cantidad * i.precioUnit * (1 - i.editDescuento / 100),
    0
  )

  // ── Actions ──────────────────────────────────────────────────────────────────

  function handleAceptar() {
    updateOrderStatus(order!.id, 'aceptado', userName)
    order!.items.forEach((item) => {
      decrementStock(item.productId, item.cantidad, order!.id, userName)
    })
    addNotification({
      userId: getNotifUserId(order!.clienteId),
      orderId: order!.id,
      tipo: 'estado_pedido',
      titulo: `Pedido ${order!.codigo} aceptado`,
      mensaje: `Tu pedido ${order!.codigo} fue aceptado y está en preparación.`,
      leida: false,
    })
    toast.success(`Pedido ${order!.codigo} aceptado`)
  }

  function handleDespachado() {
    updateOrderStatus(order!.id, 'despachado', userName)
    addNotification({
      userId: getNotifUserId(order!.clienteId),
      orderId: order!.id,
      tipo: 'estado_pedido',
      titulo: `Pedido ${order!.codigo} despachado`,
      mensaje: `Tu pedido ${order!.codigo} fue despachado y está en camino.`,
      leida: false,
    })
    toast.success(`Pedido ${order!.codigo} marcado como despachado`)
  }

  function handleEntregado() {
    updateOrderStatus(order!.id, 'entregado', userName)
    addNotification({
      userId: getNotifUserId(order!.clienteId),
      orderId: order!.id,
      tipo: 'estado_pedido',
      titulo: `Pedido ${order!.codigo} entregado`,
      mensaje: `Tu pedido ${order!.codigo} fue marcado como entregado.`,
      leida: false,
    })
    toast.success(`Pedido ${order!.codigo} marcado como entregado`)
  }

  function handleRechazar() {
    if (!motivoRechazo.trim()) return
    updateOrderStatus(order!.id, 'rechazado', userName, motivoRechazo.trim())
    // Liberar stock congelado al rechazar
    order!.items.forEach((it) => {
      releaseStock(it.productId, it.cantidad, order!.id, userName)
    })
    addNotification({
      userId: getNotifUserId(order!.clienteId),
      orderId: order!.id,
      tipo: 'estado_pedido',
      titulo: `Pedido ${order!.codigo} rechazado`,
      mensaje: `Tu pedido ${order!.codigo} fue rechazado: ${motivoRechazo.trim()}`,
      leida: false,
    })
    setRejectDialogOpen(false)
    setMotivoRechazo('')
    toast.error(`Pedido ${order!.codigo} rechazado`)
  }

  function handleGuardarModificacion() {
    const newItems: OrderItem[] = editableItems.map((item) => ({
      productId: item.productId,
      cantidad: item.editCantidad,
      precioUnit: item.precioUnit,
      descuentoAplicado: item.editDescuento,
      picked: item.picked,
    }))
    updateOrderItems(order!.id, newItems)
    // Admin modifica + confirma directamente (sin re-aprobación de óptica)
    updateOrderStatus(order!.id, 'modificado', userName, 'Admin modificó y confirmó directamente')
    // Descontar stock al confirmar
    newItems.forEach((it) => {
      decrementStock(it.productId, it.cantidad, order!.id, userName)
    })
    addNotification({
      userId: getNotifUserId(order!.clienteId),
      orderId: order!.id,
      tipo: 'estado_pedido',
      titulo: `Pedido ${order!.codigo} modificado y confirmado`,
      mensaje: `Tu pedido ${order!.codigo} fue ajustado por el equipo de Bianni y confirmado. Ya está en preparación.`,
      leida: false,
    })
    setEditMode(false)
    setEditableItems([])
    toast.success(`Pedido ${order!.codigo} modificado`)
  }

  const isActionable =
    order.estado === 'pendiente_revision' || order.estado === 'modificado'

  return (
    <div className="p-6">
      {/* Back */}
      <Link
        href="/admin/pedidos"
        className="flex items-center gap-2 text-[#555] hover:text-white text-xs tracking-[0.15em] uppercase mb-6 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Volver a pedidos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-4xl text-white tracking-[0.05em]">
                {order.codigo}
              </h1>
              <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
                {formatDate(order.fecha)}
              </p>
            </div>
            <span
              className={cn(
                'text-xs px-3 py-1.5 uppercase tracking-[0.15em] self-start',
                ORDER_STATUS_COLORS[order.estado]
              )}
            >
              {ORDER_STATUS_LABELS[order.estado]}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#2A2A2A]">
            {[
              {
                label: 'Cliente',
                value: order.cliente?.nombre ?? order.clienteId,
              },
              {
                label: 'Vendedor',
                value: order.seller?.nombre ?? '—',
              },
              {
                label: 'Total',
                value: formatARS(order.total),
              },
              {
                label: 'Plazo de pago',
                value: `${order.plazoPagoDias} días`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#0A0A0A] px-4 py-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                  {label}
                </p>
                <p className="text-white text-sm font-light">{value}</p>
              </div>
            ))}
          </div>

          {/* Motivo rechazo */}
          {order.motivoRechazo && (
            <div className="border border-red-900 bg-red-950/30 px-4 py-3">
              <p className="text-[10px] tracking-[0.2em] uppercase text-red-500 mb-1">
                Motivo de rechazo
              </p>
              <p className="text-red-300 text-sm">{order.motivoRechazo}</p>
            </div>
          )}

          {/* Notas admin */}
          <div className="border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">
              Notas internas
            </p>
            <textarea
              value={notaActual}
              onChange={(e) => setAdminNota(e.target.value)}
              placeholder="Agregar notas internas del pedido..."
              rows={3}
              className="w-full bg-transparent text-[#A0A0A0] text-sm resize-none placeholder:text-[#333] focus:outline-none focus:text-white transition-colors"
            />
          </div>

          {/* Items table */}
          <div className="border border-[#2A2A2A]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">
                Ítems del pedido
              </p>
              <p className="text-[10px] text-[#555]">
                Picking:{' '}
                <span className={pickedCount === totalItems ? 'text-emerald-400' : 'text-[#A0A0A0]'}>
                  {pickedCount}/{totalItems} completados
                </span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
                    {['Producto', 'Cant.', 'Precio unit.', 'Dto. %', 'Subtotal', '✓'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase text-[#555] font-normal"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {editMode
                    ? editableItems.map((item) => {
                        const subtotal =
                          item.editCantidad *
                          item.precioUnit *
                          (1 - item.editDescuento / 100)
                        return (
                          <tr
                            key={item.productId}
                            className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F]"
                          >
                            <td className="px-4 py-3 text-[#A0A0A0] text-xs">
                              {productMap[item.productId] ?? item.productId}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min={1}
                                value={item.editCantidad}
                                onChange={(e) =>
                                  updateEditItem(item.productId, 'editCantidad', Number(e.target.value))
                                }
                                className="w-16 bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs px-2 py-1 focus:outline-none focus:border-[#444]"
                              />
                            </td>
                            <td className="px-4 py-3 text-[#A0A0A0] text-xs">
                              {formatARS(item.precioUnit)}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={item.editDescuento}
                                onChange={(e) =>
                                  updateEditItem(item.productId, 'editDescuento', Number(e.target.value))
                                }
                                className="w-16 bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs px-2 py-1 focus:outline-none focus:border-[#444]"
                              />
                            </td>
                            <td className="px-4 py-3 text-white text-xs">
                              {formatARS(Math.round(subtotal))}
                            </td>
                            <td className="px-4 py-3 text-[#555] text-xs">—</td>
                          </tr>
                        )
                      })
                    : order.items.map((item) => {
                        const subtotal =
                          item.cantidad *
                          item.precioUnit *
                          (1 - item.descuentoAplicado / 100)
                        return (
                          <tr
                            key={item.productId}
                            className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F]"
                          >
                            <td className="px-4 py-3 text-[#A0A0A0] text-xs">
                              {productMap[item.productId] ?? item.productId}
                            </td>
                            <td className="px-4 py-3 text-white text-xs">{item.cantidad}</td>
                            <td className="px-4 py-3 text-[#A0A0A0] text-xs">
                              {formatARS(item.precioUnit)}
                            </td>
                            <td className="px-4 py-3 text-[#A0A0A0] text-xs">
                              {item.descuentoAplicado > 0 ? `${item.descuentoAplicado}%` : '—'}
                            </td>
                            <td className="px-4 py-3 text-white text-xs">
                              {formatARS(Math.round(subtotal))}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => togglePicked(item.productId)}
                                className={cn(
                                  'w-5 h-5 border flex items-center justify-center transition-colors',
                                  item.picked
                                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                    : 'border-[#2A2A2A] text-[#333] hover:border-[#444]'
                                )}
                              >
                                {item.picked && <Check size={11} strokeWidth={2.5} />}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#2A2A2A] bg-[#0A0A0A]">
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] text-right"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-white font-light">
                      {editMode ? formatARS(Math.round(editTotal)) : formatARS(order.total)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Edit mode action bar */}
            {editMode && (
              <div className="flex items-center gap-3 px-4 py-3 border-t border-[#2A2A2A] bg-[#0A0A0A]">
                <button
                  onClick={handleGuardarModificacion}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs tracking-[0.1em] uppercase px-4 py-2 transition-colors"
                >
                  <Check size={12} />
                  Guardar modificación
                </button>
                <button
                  onClick={cancelEditMode}
                  className="flex items-center gap-2 text-[#555] hover:text-white text-xs tracking-[0.1em] uppercase transition-colors"
                >
                  <X size={12} />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (1/3) ── */}
        <div className="space-y-4">
          {/* Action panel */}
          <div className="border border-[#2A2A2A] bg-[#0A0A0A]">
            <div className="px-4 py-3 border-b border-[#2A2A2A]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">Acciones</p>
            </div>
            <div className="p-4 space-y-3">
              {/* pendiente_revision or modificado */}
              {isActionable && !editMode && (
                <>
                  <button
                    onClick={handleAceptar}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs tracking-[0.15em] uppercase px-4 py-3 transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    Aceptar pedido
                  </button>
                  <button
                    onClick={startEditMode}
                    className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-white text-xs tracking-[0.15em] uppercase px-4 py-3 transition-colors"
                  >
                    <Edit2 size={14} />
                    Modificar ítems
                  </button>
                  <Dialog.Root open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <Dialog.Trigger asChild>
                      <button className="w-full flex items-center justify-center gap-2 bg-red-900 hover:bg-red-800 text-white text-xs tracking-[0.15em] uppercase px-4 py-3 transition-colors">
                        <X size={14} />
                        Rechazar pedido
                      </button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
                      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-[#111] border border-[#2A2A2A] p-6">
                        <Dialog.Title className="text-white font-display text-xl mb-1">
                          Rechazar pedido
                        </Dialog.Title>
                        <Dialog.Description className="text-[#555] text-xs tracking-[0.1em] mb-4">
                          Indicá el motivo del rechazo. El cliente será notificado.
                        </Dialog.Description>
                        <textarea
                          value={motivoRechazo}
                          onChange={(e) => setMotivoRechazo(e.target.value)}
                          placeholder="Motivo del rechazo (requerido)"
                          rows={4}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-3 resize-none placeholder:text-[#333] focus:outline-none focus:border-[#444] mb-4"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleRechazar}
                            disabled={!motivoRechazo.trim()}
                            className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs tracking-[0.15em] uppercase py-2.5 transition-colors"
                          >
                            Confirmar rechazo
                          </button>
                          <Dialog.Close asChild>
                            <button className="flex-1 border border-[#2A2A2A] text-[#A0A0A0] hover:text-white text-xs tracking-[0.15em] uppercase py-2.5 transition-colors">
                              Cancelar
                            </button>
                          </Dialog.Close>
                        </div>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                </>
              )}

              {/* aceptado */}
              {order.estado === 'aceptado' && (
                <button
                  onClick={handleDespachado}
                  className="w-full flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-700 text-white text-xs tracking-[0.15em] uppercase px-4 py-3 transition-colors"
                >
                  <Truck size={14} />
                  Marcar despachado
                </button>
              )}

              {/* despachado */}
              {order.estado === 'despachado' && (
                <button
                  onClick={handleEntregado}
                  className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-700 text-white text-xs tracking-[0.15em] uppercase px-4 py-3 transition-colors"
                >
                  <PackageCheck size={14} />
                  Marcar entregado
                </button>
              )}

              {/* No actions */}
              {!isActionable &&
                order.estado !== 'aceptado' &&
                order.estado !== 'despachado' && (
                  <p className="text-[#555] text-xs text-center py-2">
                    No hay acciones disponibles para este estado.
                  </p>
                )}
            </div>
          </div>

          {/* Timeline */}
          <div className="border border-[#2A2A2A] bg-[#0A0A0A]">
            <div className="px-4 py-3 border-b border-[#2A2A2A]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">Historial</p>
            </div>
            <div className="p-4">
              {order.history.length === 0 ? (
                <p className="text-[#555] text-xs text-center py-4">Sin historial</p>
              ) : (
                <div className="relative">
                  {/* vertical line */}
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-[#2A2A2A]" />
                  <div className="space-y-5">
                    {order.history.map((entry, idx) => {
                      const isCurrent = idx === order.history.length - 1
                      return (
                        <div key={entry.id} className="flex gap-4 relative">
                          {/* Dot */}
                          <div className="flex-shrink-0 mt-0.5">
                            {isCurrent ? (
                              <Circle
                                size={16}
                                className="text-white fill-white"
                              />
                            ) : (
                              <Circle
                                size={16}
                                className="text-[#444]"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'text-xs font-medium',
                                isCurrent ? 'text-white' : 'text-[#A0A0A0]'
                              )}
                            >
                              {ORDER_STATUS_LABELS[entry.estadoNuevo]}
                            </p>
                            <p className="text-[10px] text-[#555] mt-0.5">
                              {entry.cambiadoPor} · {formatDateTime(entry.createdAt)}
                            </p>
                            {entry.motivo && (
                              <p className="text-[10px] text-[#A0A0A0] mt-1 italic">
                                {entry.motivo}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
