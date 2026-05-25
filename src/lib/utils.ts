import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Order, OrderStatus, Product } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatear precio ARS
export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Generar código de pedido
export function generateOrderCode(index: number): string {
  return `P-${String(index).padStart(4, '0')}`
}

// Formatear fecha en español
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Formatear fecha + hora
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// WhatsApp URL
export function getWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

// Formatear mensaje de pedido para WhatsApp
export function formatOrderWhatsApp(
  order: Order,
  products: Product[],
  clientName: string
): string {
  const date = new Date(order.fecha)
  const dateStr = date.toLocaleDateString('es-AR')
  const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const items = order.items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return `• ${product?.name ?? item.productId} — Cant: *${item.cantidad}*`
    })
    .join('\n')

  const totalUnidades = order.items.reduce((s, i) => s + i.cantidad, 0)

  return (
    `🔷 *PEDIDO MAYORISTA — Bianni EYEWEAR* 🔷\n` +
    `📅 ${dateStr} 🕐 ${timeStr}\n\n` +
    `*Cliente:* ${clientName}\n` +
    `*Nro. Pedido:* ${order.codigo}\n` +
    `*Detalle del pedido:*\n${items}\n\n` +
    `🔷 *Total: ${totalUnidades} unidades*`
  )
}

// Status labels en español
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  borrador: 'Borrador',
  pendiente_revision: 'Pendiente de revisión',
  aceptado: 'Aceptado',
  modificado: 'Modificado',
  rechazado: 'Rechazado',
  cancelado: 'Cancelado',
  cancelacion_solicitada: 'Cancelación solicitada',
  despachado: 'Despachado',
  entregado: 'Entregado',
  reserva_preventa: 'Reserva preventa',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  borrador: 'bg-zinc-800 text-zinc-400',
  pendiente_revision: 'bg-yellow-950 text-yellow-400',
  aceptado: 'bg-emerald-950 text-emerald-400',
  modificado: 'bg-blue-950 text-blue-400',
  rechazado: 'bg-red-950 text-red-400',
  cancelado: 'bg-zinc-900 text-zinc-500',
  cancelacion_solicitada: 'bg-orange-950 text-orange-400',
  despachado: 'bg-purple-950 text-purple-400',
  entregado: 'bg-teal-950 text-teal-400',
  reserva_preventa: 'bg-indigo-950 text-indigo-400',
}

// Reclamos status labels
export const CLAIM_STATUS_LABELS = {
  recibido: 'Recibido',
  enviado_a_fabrica: 'Enviado a fábrica',
  resuelto: 'Resuelto',
  bonificado: 'Bonificado/Saldado',
} as const

export const CLAIM_STATUS_COLORS = {
  recibido: 'bg-yellow-950 text-yellow-400',
  enviado_a_fabrica: 'bg-blue-950 text-blue-400',
  resuelto: 'bg-emerald-950 text-emerald-400',
  bonificado: 'bg-teal-950 text-teal-400',
} as const

// Product status labels (tri-estado)
export const PRODUCT_STATUS_LABELS = {
  borrador: 'Borrador',
  activo: 'Activo',
  archivado: 'Archivado',
} as const

export const PRODUCT_STATUS_COLORS = {
  borrador: 'bg-zinc-800 text-zinc-400',
  activo: 'bg-emerald-950 text-emerald-400',
  archivado: 'bg-red-950 text-red-400',
} as const

// Lead status labels
export const LEAD_STATUS_LABELS = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  en_negociacion: 'En negociación',
  convertido: 'Convertido',
  perdido: 'Perdido',
} as const

export const LEAD_STATUS_COLORS = {
  nuevo: 'bg-blue-950 text-blue-400',
  contactado: 'bg-yellow-950 text-yellow-400',
  en_negociacion: 'bg-orange-950 text-orange-400',
  convertido: 'bg-emerald-950 text-emerald-400',
  perdido: 'bg-red-950 text-red-400',
} as const

// Asset category labels
export const ASSET_CATEGORY_LABELS = {
  receta: 'Receta',
  sol: 'Sol',
  clip_on: 'Clip-On',
  editorial: 'Editorial',
  flyers: 'Flyers',
  videos: 'Videos',
  videos_ugc: 'Videos UGC',
  educativo: 'Educativo',
} as const

export const ASSET_TYPE_LABELS = {
  foto: 'Foto',
  video: 'Video',
  pdf: 'PDF',
  zip: 'Pack ZIP',
} as const
