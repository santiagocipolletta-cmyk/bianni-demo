export type UserRole = 'admin' | 'vendedor' | 'distribuidor'

export interface DemoUser {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  clientId?: string  // para distribuidores
  sellerId?: string  // para vendedores
}

export interface Category {
  id: string
  name: string // 'CLIP-ON' | 'RECETA' | 'SOL'
  order: number
}

export interface Product {
  id: string
  sku: string
  name: string
  categoryId: string
  description: string
  badge: 'NUEVO' | 'TEMPORADA' | null
  imageUrl: string
  active: boolean
}

export interface PriceList {
  id: string
  name: string // 'Mayorista A' | 'Mayorista B' | 'Premium'
}

export interface ProductPrice {
  productId: string
  priceListId: string
  precioArs: number
}

export interface DiscountCode {
  id: string
  codigo: string
  sellerId: string
  porcentaje: number
  activo: boolean
  usosMax: number
  usosActual: number
}

export interface Stock {
  productId: string
  disponible: number
  reservado: number
}

export interface Client {
  id: string
  nombre: string
  ciudad: string
  plazoPagoDias: number
  priceListId: string
  sellerId: string
  telefono: string
  email: string
}

export interface Seller {
  id: string
  nombre: string
  telefono: string
  email: string
}

export type OrderStatus =
  | 'borrador'
  | 'enviado_wa'
  | 'pendiente_revision'
  | 'aceptado'
  | 'modificado'
  | 'rechazado'
  | 'cancelado'
  | 'despachado'
  | 'entregado'

export interface OrderItem {
  productId: string
  cantidad: number
  precioUnit: number
  descuentoAplicado: number
  picked: boolean
}

export interface Order {
  id: string
  codigo: string // 'P-0001'
  clienteId: string
  sellerId?: string
  estado: OrderStatus
  items: OrderItem[]
  total: number
  fecha: string
  plazoPagoDias: number
  motivoRechazo?: string
  notasAdmin?: string
}

export interface OrderHistoryEntry {
  id: string
  orderId: string
  estadoAnterior: OrderStatus | null
  estadoNuevo: OrderStatus
  cambiadoPor: string
  motivo?: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  orderId?: string
  tipo: 'estado_pedido' | 'reclamo' | 'campania'
  titulo: string
  mensaje: string
  leida: boolean
  createdAt: string
}

export interface Claim {
  id: string
  orderId: string
  clienteId: string
  motivo: string
  fotosUrls: string[]
  estado: 'sin_resolver' | 'a_fabrica' | 'cerrado'
  notasInternas?: string
  createdAt: string
}

export interface Asset {
  id: string
  nombreArchivo: string
  url: string
  miniaturUrl: string
  tipo: 'foto_producto' | 'editorial' | 'catalogo_pdf' | 'lookbook' | 'video'
  descripcion: string
  fechaSubida: string
  activo: boolean
}

export interface Lead {
  id: string
  nombre: string
  email: string
  telefono: string
  mensaje: string
  estado: 'nuevo' | 'contactado' | 'convertido' | 'descartado'
  createdAt: string
}

export interface Campaign {
  id: string
  nombre: string
  mensaje: string
  destinatariosCount: number
  fechaEnvio: string
  enviadaPor: string
  estado: 'borrador' | 'enviada' | 'fallida'
}

// Computed/extended types for UI
export interface OrderWithDetails extends Order {
  cliente: Client | null
  seller: Seller | null
  history: OrderHistoryEntry[]
}
