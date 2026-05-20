// ─── USERS & ROLES ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'vendedor' | 'distribuidor' | 'marketing'

export interface DemoUser {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  clientId?: string  // para distribuidores
  sellerId?: string  // para vendedores
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string // CLIP-ON | RECETA | SOL | TR90 | METAL
  order: number
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export interface ProductPhoto {
  url: string
  isPrincipal: boolean
}

export interface ProductSubstitute {
  substituteProductId: string
  preferenceOrder: number   // 1 = primera opción, 2 = segunda, etc.
}

export interface Product {
  id: string
  sku: string
  name: string
  categoryId: string
  description: string
  badge: 'NUEVO' | 'TEMPORADA' | null
  imageUrl: string                          // Foto principal (compat)
  photos: ProductPhoto[]                    // Múltiples fotos por producto
  pvr: number                               // Precio de venta sugerido (al consumidor final)
  stockCriticalThreshold: number            // Umbral para alerta de stock bajo
  substitutes: ProductSubstitute[]          // Lentes sustitutos por orden de preferencia
  destacado: boolean                        // Marcar para lookbook público
  novedad: boolean                          // Marcar para lookbook público
  preventa: boolean                         // Producto en preventa (catálogo aparte)
  active: boolean
}

// ─── PRICE LISTS ──────────────────────────────────────────────────────────────

export interface PriceList {
  id: string
  name: string // 'Mayorista A' | 'Mayorista B' | 'Premium'
}

export interface ProductPrice {
  productId: string
  priceListId: string
  precioArs: number      // Precio mayorista (lo que paga la óptica)
}

// ─── DISCOUNTS & COUPONS ──────────────────────────────────────────────────────

export interface DiscountCode {
  id: string
  codigo: string
  sellerId?: string                          // Cupones de vendedor (opcional)
  porcentaje: number
  activo: boolean
  usosMax: number
  usosActual: number
  fechaVencimiento?: string                  // ISO date opcional
  descripcion?: string
}

// ─── STOCK ────────────────────────────────────────────────────────────────────

export interface Stock {
  productId: string
  disponible: number                         // Stock real disponible
  reservado: number                          // Stock congelado por solicitudes pendientes
  // Stock visible = disponible - reservado
}

export type StockState = 'disponible' | 'pocas_unidades' | 'sin_stock'

export interface StockMovement {
  id: string
  productId: string
  tipo: 'ingreso' | 'venta' | 'ajuste_manual' | 'reserva' | 'liberacion_reserva'
  cantidad: number                           // Positivo = entrada, negativo = salida
  motivo?: string                            // Descripción del movimiento
  orderId?: string                           // Si proviene de un pedido
  realizadoPor: string                       // Quién hizo el movimiento
  createdAt: string
}

// ─── CLIENTS (ÓPTICAS) ────────────────────────────────────────────────────────

export type ClientStatus = 'activa' | 'suspendida' | 'pendiente_datos'

export interface Client {
  id: string
  nombre: string
  ciudad: string
  provincia: string
  plazoPagoDias: number
  priceListId: string
  sellerId: string
  telefono: string
  email: string
  // Datos de facturación / completar tras primer login
  cuit?: string
  direccion?: string
  codigoPostal?: string
  razonSocial?: string
  // Estado de la óptica
  status: ClientStatus
  profileCompleto: boolean
  // Visibilidad de cuenta corriente (admin controla)
  verCuentaCorriente: boolean
  // Tracking
  fechaAlta: string
  origenAlta: 'web' | 'vendedor'             // Web = aprobación admin, vendedor = directo
  ultimaCompra?: string                      // Para detectar clientes inactivos
}

// ─── SELLERS ──────────────────────────────────────────────────────────────────

export interface Seller {
  id: string
  nombre: string
  telefono: string
  email: string
  ciudad?: string
  esOnline?: boolean                         // Paula es vendedor online
}

// ─── REPRESENTATIVE REQUESTS (alta web — aprobación admin) ────────────────────

export interface RepresentativeRequest {
  id: string
  nombreOptica: string
  nombreContacto: string
  email: string
  telefono: string
  ciudad: string
  provincia: string
  cuit?: string
  experienciaRubro?: string
  mensaje?: string
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  sellerIdAsignado?: string                  // Lo asigna el admin al aprobar
  motivoRechazo?: string
  createdAt: string
  resueltaPor?: string
  resueltaEn?: string
}

// ─── ORDERS / SOLICITUDES DE PEDIDO ───────────────────────────────────────────

export type OrderStatus =
  | 'borrador'
  | 'pendiente_revision'                     // = Solicitud, esperando admin
  | 'modificado'                             // Admin modificó, ya confirmado
  | 'aceptado'                               // = Pedido confirmado
  | 'rechazado'
  | 'cancelado'
  | 'despachado'
  | 'entregado'

export type TipoEntrega = 'envio' | 'coordinado_con_vendedor'

export interface ShippingAddress {
  direccion: string
  ciudad: string
  provincia: string
  codigoPostal: string
  receptor?: string
  telefonoContacto?: string
}

export interface OrderItem {
  productId: string
  cantidad: number
  precioUnit: number
  descuentoAplicado: number
  picked: boolean
  esReemplazo?: boolean                      // Item proviene de un sustituto
  productoOriginalId?: string                // El producto que se reemplazó (si aplica)
}

export interface Order {
  id: string
  codigo: string                             // 'S-0001' = Solicitud, 'P-0001' = Pedido confirmado
  clienteId: string
  sellerId?: string
  estado: OrderStatus
  items: OrderItem[]
  subtotal: number                           // Suma sin descuentos generales
  cuponCodigo?: string                       // Cupón aplicado
  cuponDescuentoPct?: number
  total: number
  fecha: string
  plazoPagoDias: number
  // Entrega
  tipoEntrega: TipoEntrega
  direccionEnvio?: ShippingAddress           // Solo si tipoEntrega = 'envio'
  // Observaciones (transportadora, pedidos especiales, bonificaciones)
  observaciones?: string
  motivoRechazo?: string
  notasAdmin?: string                        // No visibles al cliente
  // Picking / verificación de armado
  pickingIniciado?: boolean
  pickingCompletado?: boolean
  // Remito
  remitoUrl?: string                         // URL al PDF cuando se confirma
  remitoGeneradoEn?: string
  // Notas del vendedor (bonificación por reclamo, etc.)
  bonificacionReclamoId?: string             // Vinculación con reclamo abierto
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

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'estado_pedido'
  | 'reclamo'
  | 'campania'
  | 'solicitud_representante'
  | 'stock_critico'
  | 'lead_nuevo'
  | 'alta_optica'

export interface Notification {
  id: string
  userId: string
  orderId?: string
  tipo: NotificationType
  titulo: string
  mensaje: string
  leida: boolean
  createdAt: string
}

// ─── CLAIMS / RECLAMOS ────────────────────────────────────────────────────────

export type ClaimStatus = 'recibido' | 'enviado_a_fabrica' | 'resuelto'

export interface ClaimProduct {
  productId: string
  cantidadAfectada: number
  problema: string
}

export interface Claim {
  id: string
  codigo: string                             // 'R-001'
  orderId?: string                           // Vinculación OPCIONAL a venta
  clienteId: string
  sellerId: string                           // Vendedor que cargó el reclamo
  descripcion: string
  productos: ClaimProduct[]
  fotosUrls: string[]
  estado: ClaimStatus
  notasInternas: string[]                    // Array de notas timestamped
  // Resolución (bonificación)
  bonificadoEnPedidoId?: string              // Pedido donde se bonificó
  fechaResolucion?: string
  createdAt: string
}

// ─── ASSETS (BIBLIOTECA DE CONTENIDO) ─────────────────────────────────────────

export type AssetCategory =
  | 'receta'
  | 'sol'
  | 'clip_on'
  | 'editorial'
  | 'flyers'
  | 'videos'
  | 'videos_ugc'
  | 'educativo'

export type AssetType = 'foto' | 'video' | 'pdf' | 'zip'

export interface Asset {
  id: string
  nombreArchivo: string
  url: string
  miniaturUrl: string
  tipo: AssetType
  categoria: AssetCategory
  descripcion: string
  fechaSubida: string
  subidoPor: string                          // Marketing user id
  descargas: number
  tamanioMb: number
  activo: boolean
}

export interface AssetDownload {
  id: string
  assetId: string
  userId: string
  createdAt: string
}

// ─── LEADS (CRM) ──────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'en_negociacion'
  | 'convertido'
  | 'perdido'

export interface LeadNote {
  id: string
  texto: string
  autor: string
  createdAt: string
}

export interface Lead {
  id: string
  nombre: string
  nombreOptica?: string
  email: string
  telefono: string
  ciudad?: string
  mensaje?: string
  estado: LeadStatus
  asignadoA?: string                         // sellerId
  origen: 'formulario_web' | 'instagram' | 'referido' | 'feria' | 'otro'
  notas: LeadNote[]
  clienteIdConvertido?: string               // Si se convirtió, qué óptica resultó
  createdAt: string
}

// ─── CAMPAIGNS (WhatsApp masivo — FASE 2) ─────────────────────────────────────

export type CampaignSegment = 'todas' | 'por_ciudad' | 'por_provincia' | 'por_vendedor' | 'por_categoria_compra'

export interface Campaign {
  id: string
  nombre: string
  mensaje: string
  segmentoTipo: CampaignSegment
  segmentoValor?: string                     // Valor del segmento (ej: "Córdoba")
  destinatariosCount: number
  fechaProgramada?: string
  fechaEnvio?: string
  enviadaPor: string
  estado: 'borrador' | 'programada' | 'enviada' | 'fallida'
}

// ─── COMMISSIONS ──────────────────────────────────────────────────────────────

export interface Commission {
  id: string
  sellerId: string
  orderId: string
  montoVenta: number
  porcentaje: number
  monto: number
  fechaCalculo: string
  estado: 'pendiente' | 'liquidada'
}

// ─── CTA CTE — MOVIMIENTOS DE CUENTA CORRIENTE ────────────────────────────────

export type AccountMovementType = 'cargo_venta' | 'pago' | 'bonificacion' | 'ajuste' | 'nota_credito'

export interface AccountMovement {
  id: string
  clienteId: string
  tipo: AccountMovementType
  monto: number                              // Positivo = cargo, negativo = pago
  saldoAcumulado: number                     // Saldo después del movimiento
  fecha: string
  vencimiento?: string                       // Para cargos
  orderId?: string                           // Si proviene de venta
  descripcion: string
  registradoPor: string                      // 'ERP' generalmente
}

// ─── PROFILE COMPLETION ───────────────────────────────────────────────────────

export interface ProfileCompletionData {
  cuit: string
  razonSocial: string
  direccion: string
  ciudad: string
  provincia: string
  codigoPostal: string
  telefono?: string
}

// ─── SETTINGS (CONFIG GLOBAL DEL SISTEMA) ─────────────────────────────────────

export interface SystemSettings {
  plazoPagoEstandarDias: number              // Default 30
  whatsappBianni: string                     // Número oficial BIANNI
  emailContacto: string
  stockCriticalDefaultThreshold: number      // Default 5
}

// ─── COMPUTED/EXTENDED TYPES FOR UI ───────────────────────────────────────────

export interface OrderWithDetails extends Order {
  cliente: Client | null
  seller: Seller | null
  history: OrderHistoryEntry[]
}
