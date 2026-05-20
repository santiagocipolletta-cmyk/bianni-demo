'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X, Minus, Plus, MessageCircle, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useDataStore } from '@/stores/data-store'
import { useAuthStore } from '@/stores/auth-store'
import { formatARS, getWhatsAppUrl } from '@/lib/utils'
import type { Product } from '@/types'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  products: Product[]
}

export function CartDrawer({ open, onClose, products }: CartDrawerProps) {
  const { items, removeItem, updateCantidad, clearCart, getTotalUnidades, getTotalARS } = useCartStore()
  const { addOrder, addNotification, clients, sellers, orders } = useDataStore()
  const { user } = useAuthStore()

  const client = clients.find((c) => c.id === user?.clientId)
  const seller = sellers.find((s) => s.id === client?.sellerId)
  const clientName = client?.nombre ?? user?.name ?? 'Cliente'
  const totalUnidades = getTotalUnidades()
  const totalARS = getTotalARS()

  // ── Confirmation step state ──────────────────────────────────────
  const confirming = useCartStore((s) => s.confirming)
  const setConfirming = useCartStore((s) => s.setConfirming)

  const bianiWA = getWhatsAppUrl(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5491112345678',
    'Hola, soy ' + clientName + '. Necesito consultar sobre mi cuenta en BIANNI Eyewear.'
  )
  const sellerWA = seller
    ? getWhatsAppUrl(seller.telefono, 'Hola ' + seller.nombre + ', soy ' + clientName + '. Tengo una consulta sobre mi pedido.')
    : null

  function handleConfirm() {
    const solicitudCount = orders.filter((o) => o.codigo.startsWith('S-')).length + 1
    const nextCode = `S-${String(solicitudCount).padStart(4, '0')}`
    const order = {
      id: `order_${Date.now()}`,
      codigo: nextCode,
      clienteId: user?.clientId ?? '',
      sellerId: client?.sellerId,
      estado: 'pendiente_revision' as const,
      items: items.map((i) => ({
        productId: i.productId,
        cantidad: i.cantidad,
        precioUnit: i.precioUnit,
        descuentoAplicado: i.descuentoAplicado,
        picked: false,
      })),
      subtotal: Math.round(totalARS),
      total: Math.round(totalARS),
      fecha: new Date().toISOString(),
      plazoPagoDias: client?.plazoPagoDias ?? 30,
      tipoEntrega: 'envio' as const,
      direccionEnvio: client?.direccion
        ? {
            direccion: client.direccion,
            ciudad: client.ciudad,
            provincia: client.provincia,
            codigoPostal: client.codigoPostal ?? '',
          }
        : undefined,
    }
    addOrder(order)
    if (user) {
      addNotification({
        userId: 'u3',
        orderId: order.id,
        tipo: 'estado_pedido',
        titulo: `Nuevo pedido ${order.codigo} pendiente de revisión`,
        mensaje: `${clientName} confirmó un pedido en el sistema con ${totalUnidades} unidades.`,
        leida: false,
      })
    }
    clearCart()
    setConfirming(false)
    onClose()
    toast.success('¡Pedido confirmado! Recibirás novedades pronto.')
  }

  function handleClose() {
    setConfirming(false)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[#0A0A0A] border-l border-[#2A2A2A] shadow-2xl overflow-hidden">
          <Dialog.Title className="sr-only">Pedido</Dialog.Title>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-5 flex-shrink-0">
            <div className="flex items-center gap-3">
              {confirming && (
                <button
                  onClick={() => setConfirming(false)}
                  className="text-[#555] hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} strokeWidth={1.5} />
                </button>
              )}
              <h2 className="text-[11px] tracking-[0.3em] uppercase text-white font-medium">
                {confirming ? 'Confirmar pedido' : 'Pedido'}
              </h2>
            </div>
            <button onClick={handleClose} className="text-[#555] hover:text-white transition-colors">
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {!confirming ? (
              /* ── STEP 1: Item list ─────────────────────────────────── */
              <motion.div
                key="items"
                className="flex flex-col flex-1 overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-[#555] text-xs tracking-[0.15em] uppercase">
                        Tu pedido está vacío
                      </p>
                    </div>
                  ) : (
                    items.map((item) => {
                      const product = products.find((p) => p.id === item.productId)
                      if (!product) return null
                      return (
                        <div key={item.productId} className="border-b border-[#1A1A1A] pb-4 last:border-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-0.5">
                                {product.categoryId}
                              </p>
                              <p className="text-sm text-white font-light truncate">{product.name}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-[9px] tracking-[0.15em] uppercase text-[#555] hover:text-white transition-colors flex-shrink-0 mt-1"
                            >
                              Eliminar
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-0">
                              <button
                                onClick={() => updateCantidad(item.productId, item.cantidad - 1)}
                                className="flex h-7 w-7 items-center justify-center border border-[#2A2A2A] text-[#A0A0A0] hover:border-white hover:text-white transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="flex h-7 w-10 items-center justify-center border-y border-[#2A2A2A] text-xs text-white">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => updateCantidad(item.productId, item.cantidad + 1)}
                                className="flex h-7 w-7 items-center justify-center border border-[#2A2A2A] text-[#A0A0A0] hover:border-white hover:text-white transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <p className="text-xs text-[#A0A0A0]">
                              {formatARS(item.precioUnit * item.cantidad)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                  <div className="border-t border-[#2A2A2A] px-6 py-5 space-y-4 flex-shrink-0">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[9px] tracking-[0.25em] uppercase text-[#555]">Total unidades</span>
                        <span className="text-2xl font-light text-white">{totalUnidades}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[9px] tracking-[0.25em] uppercase text-[#555]">Total</span>
                        <span className="text-sm text-[#A0A0A0]">{formatARS(totalARS)}</span>
                      </div>
                    </div>

                    {/* Go to confirmation */}
                    <button
                      onClick={() => setConfirming(true)}
                      className="w-full bg-white text-black text-[10px] tracking-[0.2em] uppercase py-3.5 font-medium hover:bg-zinc-100 transition-colors"
                    >
                      Continuar con el pedido →
                    </button>

                    {/* WhatsApp contact links */}
                    <div className="pt-2 border-t border-[#1A1A1A]">
                      <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">¿Consultas?</p>
                      <div className="flex flex-col gap-1.5">
                        {sellerWA && seller && (
                          <a href={sellerWA} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[10px] tracking-[0.1em] text-[#A0A0A0] hover:text-[#25D366] transition-colors">
                            <MessageCircle size={12} strokeWidth={1.5} />
                            Contactar a {seller.nombre}
                          </a>
                        )}
                        <a href={bianiWA} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[10px] tracking-[0.1em] text-[#A0A0A0] hover:text-[#25D366] transition-colors">
                          <MessageCircle size={12} strokeWidth={1.5} />
                          Contactar a BIANNI
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* ── STEP 2: Confirmation summary ─────────────────────── */
              <motion.div
                key="confirm"
                className="flex flex-col flex-1 overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {/* Order summary */}
                  <div>
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#555] mb-4">
                      Resumen del pedido
                    </p>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const product = products.find((p) => p.id === item.productId)
                        if (!product) return null
                        return (
                          <div key={item.productId} className="flex items-center justify-between text-xs py-2 border-b border-[#1A1A1A]">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[#555] font-mono flex-shrink-0 w-8 text-center bg-[#1A1A1A] py-0.5 rounded text-[10px]">
                                ×{item.cantidad}
                              </span>
                              <span className="text-white font-light truncate">{product.name}</span>
                            </div>
                            <span className="text-[#A0A0A0] flex-shrink-0 ml-2">
                              {formatARS(item.precioUnit * item.cantidad)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Totals — big and prominent */}
                  <div className="bg-[#111] border border-[#2A2A2A] p-5 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9px] tracking-[0.25em] uppercase text-[#555]">
                        Unidades totales
                      </span>
                      <span className="text-3xl font-light text-white">{totalUnidades}</span>
                    </div>
                    <div className="h-px bg-[#2A2A2A]" />
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9px] tracking-[0.25em] uppercase text-[#555]">
                        Monto total
                      </span>
                      <span className="text-2xl font-light text-white">{formatARS(totalARS)}</span>
                    </div>
                    <p className="text-[9px] text-[#555] tracking-wide">
                      * Precios sin IVA. El IVA se aplica si solicitás factura.
                    </p>
                  </div>

                  {/* Payment info */}
                  <div className="flex items-start gap-3 text-xs text-[#A0A0A0] bg-[#0F0F0F] border border-[#1A1A1A] p-4">
                    <CheckCircle size={14} strokeWidth={1.5} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                    <div>
                      <p className="text-white text-[11px] mb-1">Plazo de pago: {client?.plazoPagoDias ?? 30} días</p>
                      <p className="text-[10px] leading-relaxed">
                        Tu vendedor confirmará el plazo y las condiciones. El pedido queda en revisión hasta entonces.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirm CTA */}
                <div className="border-t border-[#2A2A2A] px-6 py-5 flex-shrink-0 space-y-3">
                  <button
                    onClick={handleConfirm}
                    className="w-full bg-white text-black text-[10px] tracking-[0.2em] uppercase py-4 font-medium hover:bg-zinc-100 transition-colors"
                  >
                    Confirmar pedido
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="w-full border border-[#2A2A2A] text-[#555] text-[10px] tracking-[0.2em] uppercase py-3 hover:border-[#555] hover:text-white transition-colors"
                  >
                    Volver a editar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
