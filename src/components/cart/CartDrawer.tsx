'use client'

import { useState, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Minus, Plus, MessageCircle, ArrowLeft, CheckCircle, AlertCircle, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useDataStore } from '@/stores/data-store'
import { useAuthStore } from '@/stores/auth-store'
import { formatARS, getWhatsAppUrl } from '@/lib/utils'
import type { Product, TipoEntrega } from '@/types'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  products: Product[]
}

export function CartDrawer({ open, onClose, products }: CartDrawerProps) {
  const { items, removeItem, updateCantidad, clearCart, getTotalUnidades, getTotalARS } = useCartStore()
  const { addOrder, addNotification, freezeStock, clients, sellers, orders, validateCoupon,
          getClientOpenClaims, hasOpenClaims } = useDataStore()
  const { user } = useAuthStore()

  const client = clients.find((c) => c.id === user?.clientId)
  const seller = sellers.find((s) => s.id === client?.sellerId)
  const clientName = client?.nombre ?? user?.name ?? 'Cliente'
  const totalUnidades = getTotalUnidades()
  const subtotalARS = getTotalARS()

  // Confirmation step
  const confirming = useCartStore((s) => s.confirming)
  const setConfirming = useCartStore((s) => s.setConfirming)

  // Form state — checkout
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('envio')
  const [editingDireccion, setEditingDireccion] = useState(false)
  const [direccion, setDireccion] = useState(client?.direccion ?? '')
  const [ciudad, setCiudad] = useState(client?.ciudad ?? '')
  const [provincia, setProvincia] = useState(client?.provincia ?? '')
  const [codigoPostal, setCodigoPostal] = useState(client?.codigoPostal ?? '')
  const [observaciones, setObservaciones] = useState('')
  const [cuponInput, setCuponInput] = useState('')
  const [cuponAplicado, setCuponAplicado] = useState<{ codigo: string; porcentaje: number } | null>(null)
  const [showSolicitudesWarning, setShowSolicitudesWarning] = useState(false)

  // Pedido pendiente warning
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.clienteId === client?.id && o.estado === 'pendiente_revision'),
    [orders, client?.id]
  )
  const hasOpen = useMemo(() => client ? hasOpenClaims(client.id) : false, [client, hasOpenClaims])
  const openClaims = useMemo(() => client ? getClientOpenClaims(client.id) : [], [client, getClientOpenClaims])

  // Totals con cupón
  const totalARS = useMemo(() => {
    if (cuponAplicado) return Math.round(subtotalARS * (1 - cuponAplicado.porcentaje / 100))
    return Math.round(subtotalARS)
  }, [subtotalARS, cuponAplicado])

  const bianiWA = getWhatsAppUrl(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5491112345678',
    'Hola, soy ' + clientName + '. Necesito consultar sobre mi cuenta en BIANNI Eyewear.'
  )
  const sellerWA = seller
    ? getWhatsAppUrl(seller.telefono, 'Hola ' + seller.nombre + ', soy ' + clientName + '. Tengo una consulta sobre mi pedido.')
    : null

  function handleApplyCupon() {
    if (!cuponInput.trim()) return
    const c = validateCoupon(cuponInput.trim())
    if (!c) {
      toast.error('Cupón inválido o expirado')
      return
    }
    setCuponAplicado({ codigo: c.codigo, porcentaje: c.porcentaje })
    toast.success(`Cupón ${c.codigo} aplicado: ${c.porcentaje}% de descuento`)
  }

  function handleStartConfirm() {
    // Aviso si ya tiene solicitudes pendientes (no bloquea — solo avisa)
    if (pendingOrders.length > 0 && !showSolicitudesWarning) {
      setShowSolicitudesWarning(true)
      return
    }
    setConfirming(true)
  }

  function handleConfirm() {
    if (!client) {
      toast.error('Error: no se identificó el cliente')
      return
    }
    if (tipoEntrega === 'envio' && (!direccion || !ciudad || !codigoPostal)) {
      toast.error('Completá los datos de envío')
      return
    }

    const solicitudCount = orders.filter((o) => o.codigo.startsWith('S-')).length + 1
    const nextCode = `S-${String(solicitudCount).padStart(4, '0')}`

    const order = {
      id: `order_${Date.now()}`,
      codigo: nextCode,
      clienteId: client.id,
      sellerId: client.sellerId,
      estado: 'pendiente_revision' as const,
      items: items.map((i) => ({
        productId: i.productId,
        cantidad: i.cantidad,
        precioUnit: i.precioUnit,
        descuentoAplicado: i.descuentoAplicado,
        picked: false,
      })),
      subtotal: Math.round(subtotalARS),
      cuponCodigo: cuponAplicado?.codigo,
      cuponDescuentoPct: cuponAplicado?.porcentaje,
      total: totalARS,
      fecha: new Date().toISOString(),
      plazoPagoDias: client.plazoPagoDias,
      tipoEntrega,
      direccionEnvio: tipoEntrega === 'envio' ? {
        direccion, ciudad, provincia, codigoPostal,
      } : undefined,
      observaciones: observaciones.trim() || undefined,
    }
    addOrder(order)

    // Congelar stock
    items.forEach((it) => {
      freezeStock(it.productId, it.cantidad, order.id, clientName)
    })

    // Notificación al admin
    addNotification({
      userId: 'u3',
      orderId: order.id,
      tipo: 'estado_pedido',
      titulo: `Nueva solicitud ${order.codigo}`,
      mensaje: `${clientName} envió una solicitud con ${totalUnidades} unidades por ${formatARS(totalARS)}.`,
      leida: false,
    })

    // Notificación al cliente
    if (user) {
      addNotification({
        userId: user.id,
        orderId: order.id,
        tipo: 'estado_pedido',
        titulo: `Solicitud ${order.codigo} recibida`,
        mensaje: 'Te avisaremos cuando se confirme. Mientras tanto podés enviarla por WhatsApp a tu vendedor.',
        leida: false,
      })
    }

    clearCart()
    setConfirming(false)
    setShowSolicitudesWarning(false)
    setObservaciones('')
    setCuponAplicado(null)
    setCuponInput('')
    onClose()

    // WhatsApp click-to-chat al vendedor con el pedido
    if (seller) {
      const itemsList = items.map((it) => {
        const p = products.find((pp) => pp.id === it.productId)
        return `• ${p?.name} ×${it.cantidad}`
      }).join('%0A')
      const message = `🔷 *Solicitud ${order.codigo}* — BIANNI%0A%0A${itemsList}%0A%0A*Total:* ${formatARS(totalARS)}%0A*${totalUnidades} unidades*%0A%0AEnviada desde el sistema, ${clientName}.`
      window.open(`https://wa.me/${seller.telefono}?text=${message}`, '_blank')
    }

    toast.success(`Solicitud ${order.codigo} enviada al sistema y a tu vendedor por WhatsApp`)
  }

  function handleClose() {
    setConfirming(false)
    setShowSolicitudesWarning(false)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[#0A0A0A] border-l border-[#2A2A2A] shadow-2xl overflow-hidden">
          <Dialog.Title className="sr-only">Solicitud de pedido</Dialog.Title>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-5 flex-shrink-0">
            <div className="flex items-center gap-3">
              {confirming && (
                <button onClick={() => setConfirming(false)} className="text-[#555] hover:text-white transition-colors">
                  <ArrowLeft size={16} strokeWidth={1.5} />
                </button>
              )}
              <h2 className="text-[11px] tracking-[0.3em] uppercase text-white font-medium">
                {confirming ? 'Confirmar solicitud' : 'Mi pedido'}
              </h2>
            </div>
            <button onClick={handleClose} className="text-[#555] hover:text-white transition-colors">
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {!confirming ? (
              /* ── STEP 1: Lista ─────────────────────────────────────────── */
              <motion.div key="items" className="flex flex-col flex-1 overflow-hidden"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}>

                {/* Aviso reclamos pendientes */}
                {hasOpen && (
                  <div className="bg-blue-950/30 border-b border-blue-900/50 px-6 py-2.5 flex items-center gap-2">
                    <AlertCircle size={12} className="text-blue-400 flex-shrink-0" />
                    <p className="text-[10px] text-blue-200 leading-tight">
                      Tenés {openClaims.length} reclamo{openClaims.length !== 1 ? 's' : ''} sin saldar. Tu vendedor recibirá un aviso para bonificar.
                    </p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-[#555] text-xs tracking-[0.15em] uppercase">Tu pedido está vacío</p>
                    </div>
                  ) : (
                    items.map((item) => {
                      const product = products.find((p) => p.id === item.productId)
                      if (!product) return null
                      return (
                        <div key={item.productId} className="border-b border-[#1A1A1A] pb-4 last:border-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-0.5">{product.categoryId}</p>
                              <p className="text-sm text-white font-light truncate">{product.name}</p>
                            </div>
                            <button onClick={() => removeItem(item.productId)}
                              className="text-[9px] tracking-[0.15em] uppercase text-[#555] hover:text-white transition-colors flex-shrink-0 mt-1">
                              Eliminar
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-0">
                              <button onClick={() => updateCantidad(item.productId, item.cantidad - 1)}
                                className="flex h-7 w-7 items-center justify-center border border-[#2A2A2A] text-[#A0A0A0] hover:border-white hover:text-white">
                                <Minus size={12} />
                              </button>
                              <span className="flex h-7 w-10 items-center justify-center border-y border-[#2A2A2A] text-xs text-white">{item.cantidad}</span>
                              <button onClick={() => updateCantidad(item.productId, item.cantidad + 1)}
                                className="flex h-7 w-7 items-center justify-center border border-[#2A2A2A] text-[#A0A0A0] hover:border-white hover:text-white">
                                <Plus size={12} />
                              </button>
                            </div>
                            <p className="text-xs text-[#A0A0A0]">{formatARS(item.precioUnit * item.cantidad)}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t border-[#2A2A2A] px-6 py-5 space-y-4 flex-shrink-0">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[9px] tracking-[0.25em] uppercase text-[#555]">Total unidades</span>
                        <span className="text-2xl font-light text-white">{totalUnidades}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[9px] tracking-[0.25em] uppercase text-[#555]">Subtotal</span>
                        <span className="text-sm text-[#A0A0A0]">{formatARS(subtotalARS)}</span>
                      </div>
                    </div>

                    {client && !client.profileCompleto ? (
                      <div className="border border-yellow-900 bg-yellow-950/30 p-3 space-y-2">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-yellow-200">Datos de facturación incompletos</p>
                        <a href="/completar-datos" className="block text-center w-full bg-yellow-500 text-black text-[10px] tracking-[0.2em] uppercase py-2.5 font-medium hover:bg-yellow-400">
                          Completar datos
                        </a>
                      </div>
                    ) : (
                      <button onClick={handleStartConfirm}
                        className="w-full bg-white text-black text-[10px] tracking-[0.2em] uppercase py-3.5 font-medium hover:bg-zinc-100 transition-colors">
                        Continuar →
                      </button>
                    )}

                    <div className="pt-2 border-t border-[#1A1A1A]">
                      <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">¿Consultas?</p>
                      <div className="flex flex-col gap-1.5">
                        {sellerWA && seller && (
                          <a href={sellerWA} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[10px] tracking-[0.1em] text-[#A0A0A0] hover:text-[#25D366]">
                            <MessageCircle size={12} strokeWidth={1.5} />
                            Contactar a {seller.nombre}
                          </a>
                        )}
                        <a href={bianiWA} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[10px] tracking-[0.1em] text-[#A0A0A0] hover:text-[#25D366]">
                          <MessageCircle size={12} strokeWidth={1.5} />
                          Contactar a BIANNI
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* ── STEP 2: Confirmación ─────────────────────────────────── */
              <motion.div key="confirm" className="flex flex-col flex-1 overflow-hidden"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  {/* Aviso solicitudes pendientes */}
                  {showSolicitudesWarning && pendingOrders.length > 0 && (
                    <div className="bg-yellow-950/30 border border-yellow-900/50 p-3">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-yellow-200 mb-1">
                        Ya tenés {pendingOrders.length} solicitud{pendingOrders.length !== 1 ? 'es' : ''} pendiente{pendingOrders.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] text-yellow-100/80">No te bloquea seguir — solo te avisamos.</p>
                    </div>
                  )}

                  {/* Resumen items */}
                  <div>
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#555] mb-3">Resumen</p>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const product = products.find((p) => p.id === item.productId)
                        if (!product) return null
                        return (
                          <div key={item.productId} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1A1A1A]">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[#555] font-mono w-7 text-center bg-[#1A1A1A] py-0.5 text-[10px]">×{item.cantidad}</span>
                              <span className="text-white font-light truncate text-[11px]">{product.name}</span>
                            </div>
                            <span className="text-[#A0A0A0] flex-shrink-0 ml-2 text-[11px]">{formatARS(item.precioUnit * item.cantidad)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tipo de entrega */}
                  <div>
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#555] mb-2">Tipo de entrega</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setTipoEntrega('envio')}
                        className={`text-[10px] tracking-[0.1em] uppercase py-2 border ${tipoEntrega === 'envio' ? 'border-white bg-white text-black' : 'border-[#2A2A2A] text-[#A0A0A0]'}`}>
                        Envío
                      </button>
                      <button onClick={() => setTipoEntrega('coordinado_con_vendedor')}
                        className={`text-[10px] tracking-[0.1em] uppercase py-2 border ${tipoEntrega === 'coordinado_con_vendedor' ? 'border-white bg-white text-black' : 'border-[#2A2A2A] text-[#A0A0A0]'}`}>
                        Con vendedor
                      </button>
                    </div>
                  </div>

                  {/* Datos envío precargados */}
                  {tipoEntrega === 'envio' && (
                    <div className="border border-[#2A2A2A] p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] tracking-[0.25em] uppercase text-[#555]">Dirección de envío</p>
                        <button onClick={() => setEditingDireccion(!editingDireccion)} className="text-[9px] text-emerald-400 tracking-[0.1em] uppercase">
                          {editingDireccion ? 'Listo' : 'Editar'}
                        </button>
                      </div>
                      {editingDireccion ? (
                        <div className="space-y-1.5">
                          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección"
                            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5" />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ciudad"
                              className="bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5" />
                            <input value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} placeholder="C.P."
                              className="bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5" />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-white leading-relaxed">
                          {direccion}<br/>
                          <span className="text-[#A0A0A0]">{ciudad}, {provincia} — {codigoPostal}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cupón */}
                  <div>
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#555] mb-2 flex items-center gap-1"><Tag size={10} /> Cupón de descuento</p>
                    {cuponAplicado ? (
                      <div className="flex items-center justify-between border border-emerald-700 bg-emerald-950/30 px-3 py-2">
                        <span className="text-emerald-400 text-xs font-mono">{cuponAplicado.codigo} · -{cuponAplicado.porcentaje}%</span>
                        <button onClick={() => setCuponAplicado(null)} className="text-emerald-400 text-[10px] hover:text-white">Quitar</button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <input value={cuponInput} onChange={(e) => setCuponInput(e.target.value.toUpperCase())} placeholder="Código"
                          className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2 font-mono uppercase" />
                        <button onClick={handleApplyCupon}
                          className="border border-[#2A2A2A] text-white text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:border-white">
                          Aplicar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Observaciones */}
                  <div>
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#555] mb-2">Observaciones</p>
                    <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
                      rows={2} placeholder="Ej: transportadora OCA, pedido urgente, etc."
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5 resize-none placeholder:text-[#555]" />
                  </div>

                  {/* Totales */}
                  <div className="bg-[#111] border border-[#2A2A2A] p-4 space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-[#A0A0A0]">Subtotal</span>
                      <span className="text-white">{formatARS(subtotalARS)}</span>
                    </div>
                    {cuponAplicado && (
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-emerald-400">Cupón ({cuponAplicado.porcentaje}%)</span>
                        <span className="text-emerald-400">-{formatARS(subtotalARS * cuponAplicado.porcentaje / 100)}</span>
                      </div>
                    )}
                    <div className="h-px bg-[#2A2A2A]" />
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-[#555]">Total</span>
                      <span className="text-2xl font-light text-white">{formatARS(totalARS)}</span>
                    </div>
                    <p className="text-[9px] text-[#555] tracking-wide">* Sin IVA — Plazo estándar: {client?.plazoPagoDias ?? 30} días</p>
                  </div>

                  {/* Plazo de pago info */}
                  <div className="flex items-start gap-2 text-xs bg-[#0F0F0F] border border-[#1A1A1A] p-3">
                    <CheckCircle size={12} strokeWidth={1.5} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                    <p className="text-[#A0A0A0] text-[11px] leading-relaxed">
                      El plazo estándar es {client?.plazoPagoDias ?? 30} días, podés coordinar otro con tu vendedor.
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#2A2A2A] px-6 py-4 flex-shrink-0 space-y-2">
                  <button onClick={handleConfirm}
                    className="w-full bg-white text-black text-[10px] tracking-[0.2em] uppercase py-3.5 font-medium hover:bg-zinc-100 transition-colors">
                    Confirmar solicitud + WhatsApp
                  </button>
                  <button onClick={() => setConfirming(false)}
                    className="w-full border border-[#2A2A2A] text-[#555] text-[10px] tracking-[0.2em] uppercase py-2.5 hover:border-[#555] hover:text-white">
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
