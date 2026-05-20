import type {
  DemoUser,
  Category,
  Product,
  PriceList,
  ProductPrice,
  Seller,
  Client,
  Stock,
  StockMovement,
  Order,
  OrderHistoryEntry,
  Notification,
  Claim,
  Asset,
  AssetDownload,
  Lead,
  Campaign,
  DiscountCode,
  Commission,
  AccountMovement,
  RepresentativeRequest,
  SystemSettings,
} from '@/types'

// ─── SYSTEM SETTINGS ──────────────────────────────────────────────────────────

export const SYSTEM_SETTINGS: SystemSettings = {
  plazoPagoEstandarDias: 30,
  whatsappBianni: '5491123456789',
  emailContacto: 'contacto@bianni.com',
  stockCriticalDefaultThreshold: 5,
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export const DEMO_USERS: DemoUser[] = [
  // Distribuidor
  {
    id: 'u1',
    email: 'optica@demo.bianni',
    password: 'demo123',
    name: 'Óptica del Centro',
    role: 'distribuidor',
    clientId: 'c1',
  },
  // Vendedores
  {
    id: 'u2',
    email: 'fernando@demo.bianni',
    password: 'demo123',
    name: 'Fernando García',
    role: 'vendedor',
    sellerId: 's1',
  },
  {
    id: 'u4',
    email: 'paula@demo.bianni',
    password: 'demo123',
    name: 'Paula Méndez',
    role: 'vendedor',
    sellerId: 's3',
  },
  // Admin
  {
    id: 'u3',
    email: 'admin@demo.bianni',
    password: 'demo123',
    name: 'Giuliana Bianni',
    role: 'admin',
  },
  // Marketing (NUEVO ROL)
  {
    id: 'u5',
    email: 'valentina@demo.bianni',
    password: 'demo123',
    name: 'Valentina Ríos',
    role: 'marketing',
  },
]

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  { id: 'cat1', name: 'CLIP-ON', order: 1 },
  { id: 'cat2', name: 'RECETA',  order: 2 },
  { id: 'cat3', name: 'SOL',     order: 3 },
  { id: 'cat4', name: 'TR90',    order: 4 },
  { id: 'cat5', name: 'METAL',   order: 5 },
]

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

const PRODUCT_IMGS = {
  cat1: '/brand/products/clipon.jpg',
  cat2: '/brand/products/receta.jpg',
  cat3: '/brand/products/sol.jpg',
} as const

function photos(url: string) {
  // Múltiples ángulos del mismo producto (en producción serían fotos reales distintas)
  return [
    { url, isPrincipal: true },
    { url, isPrincipal: false },
    { url, isPrincipal: false },
  ]
}

export const PRODUCTS: Product[] = [
  // ── CLIP-ON (cat1) ──
  {
    id: 'p01', sku: 'CL-001', name: 'Classic Clip', categoryId: 'cat1',
    description: 'Clip-on clásico de acetato italiano, perfecto para uso diario.',
    badge: null, imageUrl: PRODUCT_IMGS.cat1, photos: photos(PRODUCT_IMGS.cat1),
    pvr: 89000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p02', preferenceOrder: 1 }, { substituteProductId: 'p06', preferenceOrder: 2 }],
    destacado: true, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p02', sku: 'CL-002', name: 'Sport Clip', categoryId: 'cat1',
    description: 'Clip-on deportivo con marco TR90, ultraliviano y resistente.',
    badge: 'NUEVO', imageUrl: PRODUCT_IMGS.cat1, photos: photos(PRODUCT_IMGS.cat1),
    pvr: 105000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p01', preferenceOrder: 1 }],
    destacado: false, novedad: true, preventa: false, active: true,
  },
  {
    id: 'p03', sku: 'CL-003', name: 'Premium Clip Gold', categoryId: 'cat1',
    description: 'Edición premium con detalles dorados y estuche exclusivo.',
    badge: 'TEMPORADA', imageUrl: PRODUCT_IMGS.cat1, photos: photos(PRODUCT_IMGS.cat1),
    pvr: 149000, stockCriticalThreshold: 3,
    substitutes: [{ substituteProductId: 'p06', preferenceOrder: 1 }],
    destacado: true, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p04', sku: 'CL-004', name: 'Vintage Clip', categoryId: 'cat1',
    description: 'Diseño vintage retro de acetato moteado, estilo años 60.',
    badge: null, imageUrl: PRODUCT_IMGS.cat1, photos: photos(PRODUCT_IMGS.cat1),
    pvr: 82000, stockCriticalThreshold: 5,
    substitutes: [],
    destacado: false, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p05', sku: 'CL-005', name: 'Urban Clip', categoryId: 'cat1',
    description: 'Marco urbano de líneas angulares en acetato negro mate.',
    badge: null, imageUrl: PRODUCT_IMGS.cat1, photos: photos(PRODUCT_IMGS.cat1),
    pvr: 92000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p01', preferenceOrder: 1 }],
    destacado: false, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p06', sku: 'CL-006', name: 'Designer Clip', categoryId: 'cat1',
    description: 'Modelo designer con detalles en metal cepillado.',
    badge: 'NUEVO', imageUrl: PRODUCT_IMGS.cat1, photos: photos(PRODUCT_IMGS.cat1),
    pvr: 118000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p03', preferenceOrder: 1 }],
    destacado: true, novedad: true, preventa: false, active: true,
  },

  // ── RECETA (cat2) ──
  {
    id: 'p07', sku: 'RC-001', name: 'Round Classic', categoryId: 'cat2',
    description: 'Marco redondo clásico, montura ligera de acetato.',
    badge: null, imageUrl: PRODUCT_IMGS.cat2, photos: photos(PRODUCT_IMGS.cat2),
    pvr: 78000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p09', preferenceOrder: 1 }],
    destacado: false, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p08', sku: 'RC-002', name: 'Square Vision', categoryId: 'cat2',
    description: 'Marco cuadrado moderno, ideal para rostros ovalados.',
    badge: 'TEMPORADA', imageUrl: PRODUCT_IMGS.cat2, photos: photos(PRODUCT_IMGS.cat2),
    pvr: 95000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p11', preferenceOrder: 1 }],
    destacado: true, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p09', sku: 'RC-003', name: 'Oval Slim', categoryId: 'cat2',
    description: 'Marco oval delgado, perfecto para uso prolongado.',
    badge: null, imageUrl: PRODUCT_IMGS.cat2, photos: photos(PRODUCT_IMGS.cat2),
    pvr: 88000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p07', preferenceOrder: 1 }],
    destacado: false, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p10', sku: 'RC-004', name: 'Cat Eye', categoryId: 'cat2',
    description: 'Montura cat-eye de acetato italiano con detalles dorados.',
    badge: 'NUEVO', imageUrl: PRODUCT_IMGS.cat2, photos: photos(PRODUCT_IMGS.cat2),
    pvr: 128000, stockCriticalThreshold: 3,
    substitutes: [],
    destacado: true, novedad: true, preventa: false, active: true,
  },
  {
    id: 'p11', sku: 'RC-005', name: 'Rectangle Pro', categoryId: 'cat2',
    description: 'Marco rectangular profesional, apto para lentes progresivos.',
    badge: null, imageUrl: PRODUCT_IMGS.cat2, photos: photos(PRODUCT_IMGS.cat2),
    pvr: 82000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p08', preferenceOrder: 1 }],
    destacado: false, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p12', sku: 'RC-006', name: 'Pilot Frame', categoryId: 'cat2',
    description: 'Montura estilo pilot de doble puente, línea premium.',
    badge: 'TEMPORADA', imageUrl: PRODUCT_IMGS.cat2, photos: photos(PRODUCT_IMGS.cat2),
    pvr: 138000, stockCriticalThreshold: 5,
    substitutes: [],
    destacado: false, novedad: false, preventa: false, active: true,
  },

  // ── SOL (cat3) ──
  {
    id: 'p13', sku: 'SL-001', name: 'Oversize Shield', categoryId: 'cat3',
    description: 'Gafas oversize tipo shield con lente degradé ahumado.',
    badge: 'TEMPORADA', imageUrl: PRODUCT_IMGS.cat3, photos: photos(PRODUCT_IMGS.cat3),
    pvr: 158000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p16', preferenceOrder: 1 }],
    destacado: true, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p14', sku: 'SL-002', name: 'Butterfly Wave', categoryId: 'cat3',
    description: 'Montura butterfly de acetato con lente marrón espejado.',
    badge: 'NUEVO', imageUrl: PRODUCT_IMGS.cat3, photos: photos(PRODUCT_IMGS.cat3),
    pvr: 165000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p13', preferenceOrder: 1 }],
    destacado: false, novedad: true, preventa: false, active: true,
  },
  {
    id: 'p15', sku: 'SL-003', name: 'Aviator Gold', categoryId: 'cat3',
    description: 'Aviador clásico con armazón dorada y lente verde G-15.',
    badge: null, imageUrl: PRODUCT_IMGS.cat3, photos: photos(PRODUCT_IMGS.cat3),
    pvr: 175000, stockCriticalThreshold: 3,
    substitutes: [{ substituteProductId: 'p18', preferenceOrder: 1 }],
    destacado: true, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p16', sku: 'SL-004', name: 'Square Block', categoryId: 'cat3',
    description: 'Gafas cuadradas de acetato grueso, estilo urbano contemporáneo.',
    badge: null, imageUrl: PRODUCT_IMGS.cat3, photos: photos(PRODUCT_IMGS.cat3),
    pvr: 122000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p13', preferenceOrder: 1 }],
    destacado: false, novedad: false, preventa: false, active: true,
  },
  {
    id: 'p17', sku: 'SL-005', name: 'Round Retro', categoryId: 'cat3',
    description: 'Lente redondo retro de pequeño diámetro con puente metálico.',
    badge: 'NUEVO', imageUrl: PRODUCT_IMGS.cat3, photos: photos(PRODUCT_IMGS.cat3),
    pvr: 105000, stockCriticalThreshold: 5,
    substitutes: [],
    destacado: false, novedad: true, preventa: false, active: true,
  },
  {
    id: 'p18', sku: 'SL-006', name: 'Wraparound Sport', categoryId: 'cat3',
    description: 'Gafas wraparound deportivas con lente polarizada y patillas grip.',
    badge: null, imageUrl: PRODUCT_IMGS.cat3, photos: photos(PRODUCT_IMGS.cat3),
    pvr: 135000, stockCriticalThreshold: 5,
    substitutes: [{ substituteProductId: 'p15', preferenceOrder: 1 }],
    destacado: false, novedad: false, preventa: false, active: true,
  },

  // ── PREVENTA — Colección 2026 (cat4 TR90 + cat5 METAL) ──
  {
    id: 'p19', sku: 'TR-001', name: 'Featherlight TR90', categoryId: 'cat4',
    description: 'Marco ultraliviano TR90, diseño ergonómico. Colección Verano 2027 — PREVENTA.',
    badge: 'NUEVO', imageUrl: PRODUCT_IMGS.cat2, photos: photos(PRODUCT_IMGS.cat2),
    pvr: 132000, stockCriticalThreshold: 5,
    substitutes: [],
    destacado: false, novedad: true, preventa: true, active: true,
  },
  {
    id: 'p20', sku: 'TR-002', name: 'Flex Frame Pro', categoryId: 'cat4',
    description: 'TR90 flexible de alta durabilidad. Edición preventa 2027.',
    badge: 'NUEVO', imageUrl: PRODUCT_IMGS.cat1, photos: photos(PRODUCT_IMGS.cat1),
    pvr: 128000, stockCriticalThreshold: 5,
    substitutes: [],
    destacado: false, novedad: true, preventa: true, active: true,
  },
  {
    id: 'p21', sku: 'MT-001', name: 'Metal Wire Round', categoryId: 'cat5',
    description: 'Marco metal hilo redondo, acabado titanio mate. PREVENTA.',
    badge: 'NUEVO', imageUrl: PRODUCT_IMGS.cat3, photos: photos(PRODUCT_IMGS.cat3),
    pvr: 145000, stockCriticalThreshold: 5,
    substitutes: [],
    destacado: false, novedad: true, preventa: true, active: true,
  },
  {
    id: 'p22', sku: 'MT-002', name: 'Steel Square', categoryId: 'cat5',
    description: 'Marco metal cuadrado, acero quirúrgico inoxidable. PREVENTA.',
    badge: 'NUEVO', imageUrl: PRODUCT_IMGS.cat3, photos: photos(PRODUCT_IMGS.cat3),
    pvr: 158000, stockCriticalThreshold: 5,
    substitutes: [],
    destacado: false, novedad: true, preventa: true, active: true,
  },
]

// ─── PRICE LISTS ──────────────────────────────────────────────────────────────

export const PRICE_LISTS: PriceList[] = [
  { id: 'pl1', name: 'Mayorista A' },
  { id: 'pl2', name: 'Mayorista B' },
  { id: 'pl3', name: 'Premium' },
]

const basePricesA: Record<string, number> = {
  p01: 32000, p02: 38000, p03: 55000, p04: 29000, p05: 31000, p06: 41000,
  p07: 28000, p08: 35000, p09: 33000, p10: 48000, p11: 30000, p12: 52000,
  p13: 58000, p14: 62000, p15: 65000, p16: 45000, p17: 39000, p18: 50000,
  p19: 48000, p20: 46000, p21: 54000, p22: 58000,
}

export const PRODUCT_PRICES: ProductPrice[] = PRODUCTS.flatMap((p) => [
  { productId: p.id, priceListId: 'pl1', precioArs: basePricesA[p.id] },
  { productId: p.id, priceListId: 'pl2', precioArs: Math.round(basePricesA[p.id] * 1.10) },
  { productId: p.id, priceListId: 'pl3', precioArs: Math.round(basePricesA[p.id] * 1.20) },
])

// ─── SELLERS ──────────────────────────────────────────────────────────────────

export const SELLERS: Seller[] = [
  { id: 's1', nombre: 'Fernando García',    telefono: '5491155001234', email: 'fernando@bianni.com', ciudad: 'Buenos Aires' },
  { id: 's2', nombre: 'Nicolás Rodríguez',  telefono: '5491133009876', email: 'nicolas@bianni.com',  ciudad: 'Buenos Aires' },
  { id: 's3', nombre: 'Paula Méndez',       telefono: '5491166004477', email: 'paula@bianni.com',    ciudad: 'Buenos Aires', esOnline: true },
]

// ─── CLIENTS (ÓPTICAS) ────────────────────────────────────────────────────────

export const CLIENTS: Client[] = [
  {
    id: 'c1', nombre: 'Óptica del Centro', ciudad: 'Buenos Aires', provincia: 'CABA',
    plazoPagoDias: 30, priceListId: 'pl1', sellerId: 's1',
    telefono: '5491144001111', email: 'contacto@opticacentro.com',
    cuit: '30-71234567-8', direccion: 'Av. Corrientes 1234, Piso 3', codigoPostal: 'C1043',
    razonSocial: 'Óptica del Centro S.A.',
    status: 'activa', profileCompleto: true, verCuentaCorriente: true,
    fechaAlta: '2025-08-15T10:00:00.000Z', origenAlta: 'vendedor', ultimaCompra: '2026-05-10T09:15:00.000Z',
  },
  {
    id: 'c2', nombre: 'Óptica La Visión', ciudad: 'Córdoba', provincia: 'Córdoba',
    plazoPagoDias: 30, priceListId: 'pl1', sellerId: 's1',
    telefono: '5493515002222', email: 'info@opticlavision.com',
    cuit: '30-72345678-9', direccion: 'Av. Colón 567', codigoPostal: 'X5000',
    razonSocial: 'La Visión SRL',
    status: 'activa', profileCompleto: true, verCuentaCorriente: true,
    fechaAlta: '2025-06-20T10:00:00.000Z', origenAlta: 'web', ultimaCompra: '2026-05-11T14:30:00.000Z',
  },
  {
    id: 'c3', nombre: 'Óptica Premium', ciudad: 'Rosario', provincia: 'Santa Fe',
    plazoPagoDias: 45, priceListId: 'pl3', sellerId: 's1',
    telefono: '5493414003333', email: 'ventas@opticapremium.com',
    cuit: '30-73456789-0', direccion: 'Pellegrini 890', codigoPostal: 'S2000',
    razonSocial: 'Premium Óptica S.A.',
    status: 'activa', profileCompleto: true, verCuentaCorriente: true,
    fechaAlta: '2025-04-10T10:00:00.000Z', origenAlta: 'vendedor', ultimaCompra: '2026-05-12T10:00:00.000Z',
  },
  {
    id: 'c4', nombre: 'Óptica del Sur', ciudad: 'Mendoza', provincia: 'Mendoza',
    plazoPagoDias: 30, priceListId: 'pl2', sellerId: 's2',
    telefono: '5492614004444', email: 'contacto@opticadelsur.com',
    cuit: '30-74567890-1', direccion: 'San Martín 2345', codigoPostal: 'M5500',
    razonSocial: 'Óptica del Sur SRL',
    status: 'activa', profileCompleto: true, verCuentaCorriente: false, // deuda en negociación
    fechaAlta: '2025-09-01T10:00:00.000Z', origenAlta: 'vendedor', ultimaCompra: '2026-05-08T11:00:00.000Z',
  },
  {
    id: 'c5', nombre: 'Óptica Norte', ciudad: 'Tucumán', provincia: 'Tucumán',
    plazoPagoDias: 30, priceListId: 'pl2', sellerId: 's2',
    telefono: '5493814005555', email: 'hola@opticanorte.com',
    cuit: '30-75678901-2', direccion: 'Mendoza 678', codigoPostal: 'T4000',
    razonSocial: 'Óptica Norte SA',
    status: 'activa', profileCompleto: true, verCuentaCorriente: true,
    fechaAlta: '2025-11-15T10:00:00.000Z', origenAlta: 'web', ultimaCompra: '2026-05-07T16:45:00.000Z',
  },
  // Cliente inactivo (sin compra reciente)
  {
    id: 'c6', nombre: 'Óptica Litoral', ciudad: 'Resistencia', provincia: 'Chaco',
    plazoPagoDias: 30, priceListId: 'pl2', sellerId: 's2',
    telefono: '5493624006666', email: 'litoral@opticas.com',
    cuit: '30-76789012-3', direccion: 'Av. Sarmiento 1100', codigoPostal: 'H3500',
    razonSocial: 'Litoral Óptica SRL',
    status: 'activa', profileCompleto: true, verCuentaCorriente: true,
    fechaAlta: '2025-01-20T10:00:00.000Z', origenAlta: 'web', ultimaCompra: '2026-01-15T10:00:00.000Z',
  },
  // Óptica nueva que aún no completó datos
  {
    id: 'c7', nombre: 'Óptica Luz Nueva', ciudad: 'Salta', provincia: 'Salta',
    plazoPagoDias: 30, priceListId: 'pl1', sellerId: 's3',
    telefono: '5493874007777', email: 'luznueva@gmail.com',
    status: 'pendiente_datos', profileCompleto: false, verCuentaCorriente: true,
    fechaAlta: '2026-05-12T15:00:00.000Z', origenAlta: 'web',
  },
  // Óptica suspendida
  {
    id: 'c8', nombre: 'Óptica del Lago', ciudad: 'Bariloche', provincia: 'Río Negro',
    plazoPagoDias: 30, priceListId: 'pl2', sellerId: 's2',
    telefono: '5492944008888', email: 'lago@opticas.com',
    cuit: '30-78901234-5', direccion: 'Mitre 456', codigoPostal: 'R8400',
    razonSocial: 'Óptica del Lago SA',
    status: 'suspendida', profileCompleto: true, verCuentaCorriente: false,
    fechaAlta: '2024-12-01T10:00:00.000Z', origenAlta: 'vendedor', ultimaCompra: '2025-09-15T10:00:00.000Z',
  },
]

// ─── STOCK ────────────────────────────────────────────────────────────────────

export const STOCK: Stock[] = [
  { productId: 'p01', disponible: 25, reservado: 2 },
  { productId: 'p02', disponible: 18, reservado: 4 },
  { productId: 'p03', disponible: 12, reservado: 1 },
  { productId: 'p04', disponible: 30, reservado: 0 },
  { productId: 'p05', disponible: 5,  reservado: 2 }, // crítico
  { productId: 'p06', disponible: 20, reservado: 3 },
  { productId: 'p07', disponible: 22, reservado: 1 },
  { productId: 'p08', disponible: 15, reservado: 2 },
  { productId: 'p09', disponible: 28, reservado: 0 },
  { productId: 'p10', disponible: 0,  reservado: 0 }, // SIN STOCK
  { productId: 'p11', disponible: 17, reservado: 1 },
  { productId: 'p12', disponible: 10, reservado: 2 },
  { productId: 'p13', disponible: 24, reservado: 0 },
  { productId: 'p14', disponible: 19, reservado: 4 },
  { productId: 'p15', disponible: 4,  reservado: 1 }, // crítico
  { productId: 'p16', disponible: 30, reservado: 2 },
  { productId: 'p17', disponible: 14, reservado: 0 },
  { productId: 'p18', disponible: 8,  reservado: 3 },
  // Preventa
  { productId: 'p19', disponible: 0,  reservado: 0 },
  { productId: 'p20', disponible: 0,  reservado: 0 },
  { productId: 'p21', disponible: 0,  reservado: 0 },
  { productId: 'p22', disponible: 0,  reservado: 0 },
]

// ─── STOCK MOVEMENTS ──────────────────────────────────────────────────────────

export const STOCK_MOVEMENTS: StockMovement[] = [
  { id: 'sm1', productId: 'p01', tipo: 'ingreso', cantidad: 30, motivo: 'Ingreso lote mayo', realizadoPor: 'Giuliana Bianni', createdAt: '2026-05-01T08:00:00.000Z' },
  { id: 'sm2', productId: 'p01', tipo: 'venta', cantidad: -5, orderId: 'o4', realizadoPor: 'Sistema', createdAt: '2026-05-08T11:30:00.000Z' },
  { id: 'sm3', productId: 'p10', tipo: 'venta', cantidad: -8, orderId: 'o3', realizadoPor: 'Sistema', createdAt: '2026-05-12T10:30:00.000Z' },
  { id: 'sm4', productId: 'p05', tipo: 'ajuste_manual', cantidad: -3, motivo: 'Producto dañado', realizadoPor: 'Giuliana Bianni', createdAt: '2026-05-05T14:00:00.000Z' },
  { id: 'sm5', productId: 'p15', tipo: 'venta', cantidad: -3, orderId: 'o9', realizadoPor: 'Sistema', createdAt: '2026-04-25T10:00:00.000Z' },
  { id: 'sm6', productId: 'p02', tipo: 'reserva', cantidad: -4, orderId: 'o1', realizadoPor: 'Sistema', createdAt: '2026-05-10T09:15:00.000Z' },
  { id: 'sm7', productId: 'p07', tipo: 'ingreso', cantidad: 25, motivo: 'Ingreso por código de barras (pistola)', realizadoPor: 'Giuliana Bianni', createdAt: '2026-04-28T09:00:00.000Z' },
]

// ─── DISCOUNT CODES (CUPONES) ─────────────────────────────────────────────────

export const DISCOUNT_CODES: DiscountCode[] = [
  { id: 'd1', codigo: 'BIANNI10',    sellerId: 's1', porcentaje: 10, activo: true, usosMax: 50, usosActual: 12, descripcion: 'Descuento de Fernando para clientes nuevos' },
  { id: 'd2', codigo: 'INVIERNO15',  sellerId: 's1', porcentaje: 15, activo: true, usosMax: 30, usosActual: 5, descripcion: 'Promo invierno 2026' },
  { id: 'd3', codigo: 'NICO12',      sellerId: 's2', porcentaje: 12, activo: true, usosMax: 40, usosActual: 8, descripcion: 'Descuento de Nicolás' },
  { id: 'd4', codigo: 'PAULA8',      sellerId: 's3', porcentaje: 8,  activo: true, usosMax: 100, usosActual: 22, descripcion: 'Bienvenida de Paula (canal online)' },
  { id: 'd5', codigo: 'LANZAMIENTO', porcentaje: 20, activo: true, usosMax: 25, usosActual: 3, descripcion: 'Promo lanzamiento Colección 2026' },
]

// ─── REPRESENTATIVE REQUESTS (solicitudes web alta de óptica) ─────────────────

export const REPRESENTATIVE_REQUESTS: RepresentativeRequest[] = [
  {
    id: 'rr1', nombreOptica: 'Óptica Buenos Aires Norte', nombreContacto: 'Carolina Suarez',
    email: 'csuarez@opticasban.com', telefono: '5491177889900', ciudad: 'Vicente López', provincia: 'Buenos Aires',
    cuit: '30-71112233-4', experienciaRubro: '5 años', mensaje: 'Quisiera incorporar BIANNI a mi local, somos óptica boutique.',
    estado: 'pendiente', createdAt: '2026-05-13T10:00:00.000Z',
  },
  {
    id: 'rr2', nombreOptica: 'Mar de Plata Óptica', nombreContacto: 'Lucas Bertone',
    email: 'lucas@mdpoptica.com', telefono: '5492234455667', ciudad: 'Mar del Plata', provincia: 'Buenos Aires',
    experienciaRubro: '10 años', mensaje: 'Tengo dos locales en MdP, interesado en línea Sol.',
    estado: 'pendiente', createdAt: '2026-05-12T16:30:00.000Z',
  },
  {
    id: 'rr3', nombreOptica: 'Óptica Patagónica', nombreContacto: 'Sofía Aguirre',
    email: 'sofia@patagonica.com', telefono: '5492944556677', ciudad: 'Neuquén', provincia: 'Neuquén',
    cuit: '30-71223344-5', mensaje: 'Buscamos marca premium para nuestro sector receta.',
    estado: 'aprobada', sellerIdAsignado: 's2', createdAt: '2026-05-05T12:00:00.000Z',
    resueltaPor: 'Giuliana Bianni', resueltaEn: '2026-05-06T10:00:00.000Z',
  },
  {
    id: 'rr4', nombreOptica: 'Óptica Salta Centro', nombreContacto: 'Marcelo Vega',
    email: 'mvega@gmail.com', telefono: '5493874008811', ciudad: 'Salta', provincia: 'Salta',
    mensaje: 'Hola',
    estado: 'rechazada', motivoRechazo: 'Cliente sin local físico verificable',
    createdAt: '2026-04-28T08:00:00.000Z', resueltaPor: 'Giuliana Bianni', resueltaEn: '2026-04-29T10:00:00.000Z',
  },
]

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export const ORDERS: Order[] = [
  // Solicitud pendiente — c1
  {
    id: 'o1', codigo: 'S-0001', clienteId: 'c1', sellerId: 's1', estado: 'pendiente_revision',
    items: [
      { productId: 'p01', cantidad: 4, precioUnit: 32000, descuentoAplicado: 0, picked: false },
      { productId: 'p07', cantidad: 3, precioUnit: 28000, descuentoAplicado: 0, picked: false },
      { productId: 'p13', cantidad: 2, precioUnit: 58000, descuentoAplicado: 0, picked: false },
    ],
    subtotal: 4*32000 + 3*28000 + 2*58000,
    total: 4*32000 + 3*28000 + 2*58000,
    fecha: '2026-05-10T09:15:00.000Z', plazoPagoDias: 30,
    tipoEntrega: 'envio',
    direccionEnvio: {
      direccion: 'Av. Corrientes 1234, Piso 3', ciudad: 'Buenos Aires', provincia: 'CABA',
      codigoPostal: 'C1043', receptor: 'Recepción', telefonoContacto: '5491144001111',
    },
    observaciones: 'Por favor enviar por OCA',
  },
  // Solicitud con cupón
  {
    id: 'o2', codigo: 'S-0002', clienteId: 'c2', sellerId: 's1', estado: 'pendiente_revision',
    items: [
      { productId: 'p08', cantidad: 5, precioUnit: 35000, descuentoAplicado: 0, picked: false },
      { productId: 'p15', cantidad: 3, precioUnit: 65000, descuentoAplicado: 0, picked: false },
    ],
    subtotal: 5*35000 + 3*65000,
    cuponCodigo: 'BIANNI10', cuponDescuentoPct: 10,
    total: Math.round((5*35000 + 3*65000) * 0.90),
    fecha: '2026-05-11T14:30:00.000Z', plazoPagoDias: 30,
    tipoEntrega: 'envio',
    direccionEnvio: { direccion: 'Av. Colón 567', ciudad: 'Córdoba', provincia: 'Córdoba', codigoPostal: 'X5000' },
  },
  // Solicitud con sustitución
  {
    id: 'o3', codigo: 'S-0003', clienteId: 'c3', sellerId: 's1', estado: 'pendiente_revision',
    items: [
      { productId: 'p11', cantidad: 2, precioUnit: 36000, descuentoAplicado: 0, picked: false, esReemplazo: true, productoOriginalId: 'p10' },
      { productId: 'p14', cantidad: 4, precioUnit: 74400, descuentoAplicado: 0, picked: false },
      { productId: 'p12', cantidad: 3, precioUnit: 62400, descuentoAplicado: 0, picked: false },
    ],
    subtotal: 2*36000 + 4*74400 + 3*62400,
    total: 2*36000 + 4*74400 + 3*62400,
    fecha: '2026-05-12T10:00:00.000Z', plazoPagoDias: 45,
    tipoEntrega: 'coordinado_con_vendedor',
    observaciones: 'P10 sin stock — Fernando sugirió p11 como reemplazo (1ª opción de sustituto)',
  },
  // Aceptado / Pedido confirmado
  {
    id: 'o4', codigo: 'P-0004', clienteId: 'c4', sellerId: 's2', estado: 'aceptado',
    items: [
      { productId: 'p02', cantidad: 6, precioUnit: 41800, descuentoAplicado: 0, picked: false },
      { productId: 'p16', cantidad: 4, precioUnit: 49500, descuentoAplicado: 0, picked: false },
    ],
    subtotal: 6*41800 + 4*49500, total: 6*41800 + 4*49500,
    fecha: '2026-05-08T11:00:00.000Z', plazoPagoDias: 30,
    tipoEntrega: 'envio',
    direccionEnvio: { direccion: 'San Martín 2345', ciudad: 'Mendoza', provincia: 'Mendoza', codigoPostal: 'M5500' },
    notasAdmin: 'Priorizar despacho por volumen.',
    remitoUrl: '#remito-P-0004',
    remitoGeneradoEn: '2026-05-08T15:00:00.000Z',
  },
  {
    id: 'o5', codigo: 'P-0005', clienteId: 'c5', sellerId: 's2', estado: 'aceptado',
    items: [
      { productId: 'p03', cantidad: 3, precioUnit: 60500, descuentoAplicado: 0, picked: true },
      { productId: 'p17', cantidad: 5, precioUnit: 42900, descuentoAplicado: 0, picked: true },
    ],
    subtotal: 3*60500 + 5*42900, total: 3*60500 + 5*42900,
    fecha: '2026-05-07T16:45:00.000Z', plazoPagoDias: 30,
    tipoEntrega: 'coordinado_con_vendedor',
    pickingIniciado: true, pickingCompletado: true,
    remitoUrl: '#remito-P-0005', remitoGeneradoEn: '2026-05-07T18:00:00.000Z',
  },
  // Modificado (admin modificó y confirmó directamente)
  {
    id: 'o6', codigo: 'P-0006', clienteId: 'c1', sellerId: 's1', estado: 'modificado',
    items: [
      { productId: 'p04', cantidad: 8, precioUnit: 29000, descuentoAplicado: 10, picked: false },
      { productId: 'p11', cantidad: 4, precioUnit: 30000, descuentoAplicado: 10, picked: false },
    ],
    subtotal: Math.round(8*29000*0.90 + 4*30000*0.90),
    total: Math.round(8*29000*0.90 + 4*30000*0.90),
    fecha: '2026-05-06T09:30:00.000Z', plazoPagoDias: 30,
    tipoEntrega: 'envio',
    direccionEnvio: { direccion: 'Av. Corrientes 1234, Piso 3', ciudad: 'Buenos Aires', provincia: 'CABA', codigoPostal: 'C1043' },
    notasAdmin: 'Reducimos cantidad de p04 de 10 a 8 por falta de stock.',
    remitoUrl: '#remito-P-0006', remitoGeneradoEn: '2026-05-06T11:00:00.000Z',
  },
  // Despachado
  {
    id: 'o7', codigo: 'P-0007', clienteId: 'c2', sellerId: 's1', estado: 'despachado',
    items: [
      { productId: 'p06', cantidad: 4, precioUnit: 41000, descuentoAplicado: 0, picked: true },
      { productId: 'p09', cantidad: 6, precioUnit: 33000, descuentoAplicado: 0, picked: true },
    ],
    subtotal: 4*41000 + 6*33000, total: 4*41000 + 6*33000,
    fecha: '2026-04-30T08:00:00.000Z', plazoPagoDias: 30,
    tipoEntrega: 'envio',
    direccionEnvio: { direccion: 'Av. Colón 567', ciudad: 'Córdoba', provincia: 'Córdoba', codigoPostal: 'X5000' },
    pickingIniciado: true, pickingCompletado: true,
    remitoUrl: '#remito-P-0007', remitoGeneradoEn: '2026-04-30T11:00:00.000Z',
  },
  // Rechazado
  {
    id: 'o8', codigo: 'S-0008', clienteId: 'c3', sellerId: 's1', estado: 'rechazado',
    items: [
      { productId: 'p18', cantidad: 12, precioUnit: 60000, descuentoAplicado: 15, picked: false },
    ],
    subtotal: Math.round(12*60000*0.85), total: Math.round(12*60000*0.85),
    fecha: '2026-05-01T13:00:00.000Z', plazoPagoDias: 45,
    tipoEntrega: 'coordinado_con_vendedor',
    motivoRechazo: 'Descuento solicitado fuera de política comercial vigente.',
  },
  // Entregado
  {
    id: 'o9', codigo: 'P-0009', clienteId: 'c4', sellerId: 's2', estado: 'entregado',
    items: [
      { productId: 'p05', cantidad: 3, precioUnit: 34100, descuentoAplicado: 0, picked: true },
      { productId: 'p13', cantidad: 5, precioUnit: 49500, descuentoAplicado: 0, picked: true },
    ],
    subtotal: 3*34100 + 5*49500, total: 3*34100 + 5*49500,
    fecha: '2026-04-22T10:00:00.000Z', plazoPagoDias: 30,
    tipoEntrega: 'envio',
    direccionEnvio: { direccion: 'San Martín 2345', ciudad: 'Mendoza', provincia: 'Mendoza', codigoPostal: 'M5500' },
    pickingIniciado: true, pickingCompletado: true,
    remitoUrl: '#remito-P-0009', remitoGeneradoEn: '2026-04-22T13:00:00.000Z',
  },
  // Cancelado
  {
    id: 'o10', codigo: 'S-0010', clienteId: 'c5', sellerId: 's2', estado: 'cancelado',
    items: [{ productId: 'p07', cantidad: 5, precioUnit: 42000, descuentoAplicado: 0, picked: false }],
    subtotal: 5*42000, total: 5*42000,
    fecha: '2026-05-05T14:00:00.000Z', plazoPagoDias: 60,
    tipoEntrega: 'envio',
    motivoRechazo: 'Cliente canceló por cambio de presupuesto',
  },
  // Solicitud reciente con bonificación por reclamo
  {
    id: 'o11', codigo: 'S-0011', clienteId: 'c2', sellerId: 's1', estado: 'pendiente_revision',
    items: [
      { productId: 'p08', cantidad: 4, precioUnit: 35000, descuentoAplicado: 0, picked: false },
    ],
    subtotal: 4*35000, total: 4*35000,
    fecha: '2026-05-13T11:00:00.000Z', plazoPagoDias: 30,
    tipoEntrega: 'envio',
    direccionEnvio: { direccion: 'Av. Colón 567', ciudad: 'Córdoba', provincia: 'Córdoba', codigoPostal: 'X5000' },
    observaciones: 'BONIFICACIÓN POR RECLAMO R-001: descontar 1 unidad de p08 sin cargo.',
    bonificacionReclamoId: 'cl1',
  },
]

// ─── ORDER HISTORY ────────────────────────────────────────────────────────────

export const ORDER_HISTORY: OrderHistoryEntry[] = [
  { id: 'h1',  orderId: 'o1', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Óptica del Centro', createdAt: '2026-05-10T09:10:00.000Z' },
  { id: 'h2',  orderId: 'o1', estadoAnterior: 'borrador', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Óptica del Centro', createdAt: '2026-05-10T09:15:00.000Z' },
  { id: 'h3',  orderId: 'o2', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Óptica La Visión', createdAt: '2026-05-11T14:25:00.000Z' },
  { id: 'h4',  orderId: 'o2', estadoAnterior: 'borrador', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Óptica La Visión', createdAt: '2026-05-11T14:30:00.000Z' },
  { id: 'h5',  orderId: 'o3', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Fernando García', createdAt: '2026-05-12T09:55:00.000Z' },
  { id: 'h6',  orderId: 'o3', estadoAnterior: 'borrador', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Fernando García', createdAt: '2026-05-12T10:00:00.000Z' },
  { id: 'h7',  orderId: 'o4', estadoAnterior: null, estadoNuevo: 'pendiente_revision', cambiadoPor: 'Nicolás Rodríguez', createdAt: '2026-05-08T10:30:00.000Z' },
  { id: 'h8',  orderId: 'o4', estadoAnterior: 'pendiente_revision', estadoNuevo: 'aceptado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-05-08T11:00:00.000Z' },
  { id: 'h9',  orderId: 'o5', estadoAnterior: null, estadoNuevo: 'pendiente_revision', cambiadoPor: 'Óptica Norte', createdAt: '2026-05-07T16:30:00.000Z' },
  { id: 'h10', orderId: 'o5', estadoAnterior: 'pendiente_revision', estadoNuevo: 'aceptado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-05-07T16:45:00.000Z' },
  { id: 'h11', orderId: 'o6', estadoAnterior: null, estadoNuevo: 'pendiente_revision', cambiadoPor: 'Óptica del Centro', createdAt: '2026-05-06T09:00:00.000Z' },
  { id: 'h12', orderId: 'o6', estadoAnterior: 'pendiente_revision', estadoNuevo: 'modificado', cambiadoPor: 'Giuliana Bianni', motivo: 'Stock insuficiente en p04', createdAt: '2026-05-06T09:30:00.000Z' },
  { id: 'h13', orderId: 'o7', estadoAnterior: null, estadoNuevo: 'pendiente_revision', cambiadoPor: 'Óptica La Visión', createdAt: '2026-04-30T07:30:00.000Z' },
  { id: 'h14', orderId: 'o7', estadoAnterior: 'pendiente_revision', estadoNuevo: 'aceptado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-04-30T08:00:00.000Z' },
  { id: 'h15', orderId: 'o7', estadoAnterior: 'aceptado', estadoNuevo: 'despachado', cambiadoPor: 'Fernando García', createdAt: '2026-05-02T14:00:00.000Z' },
  { id: 'h16', orderId: 'o8', estadoAnterior: null, estadoNuevo: 'pendiente_revision', cambiadoPor: 'Óptica Premium', createdAt: '2026-05-01T12:30:00.000Z' },
  { id: 'h17', orderId: 'o8', estadoAnterior: 'pendiente_revision', estadoNuevo: 'rechazado', cambiadoPor: 'Giuliana Bianni', motivo: 'Descuento fuera de política', createdAt: '2026-05-01T13:00:00.000Z' },
  { id: 'h18', orderId: 'o9', estadoAnterior: null, estadoNuevo: 'pendiente_revision', cambiadoPor: 'Nicolás Rodríguez', createdAt: '2026-04-22T09:30:00.000Z' },
  { id: 'h19', orderId: 'o9', estadoAnterior: 'pendiente_revision', estadoNuevo: 'aceptado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-04-22T10:00:00.000Z' },
  { id: 'h20', orderId: 'o9', estadoAnterior: 'aceptado', estadoNuevo: 'despachado', cambiadoPor: 'Nicolás Rodríguez', createdAt: '2026-04-24T14:00:00.000Z' },
  { id: 'h21', orderId: 'o9', estadoAnterior: 'despachado', estadoNuevo: 'entregado', cambiadoPor: 'Nicolás Rodríguez', createdAt: '2026-04-26T11:00:00.000Z' },
  { id: 'h22', orderId: 'o11', estadoAnterior: null, estadoNuevo: 'pendiente_revision', cambiadoPor: 'Fernando García', createdAt: '2026-05-13T11:00:00.000Z' },
]

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', orderId: 'o6', tipo: 'estado_pedido', titulo: 'Pedido P-0006 modificado', mensaje: 'Giuliana ajustó tu pedido P-0006. Ya queda confirmado.', leida: false, createdAt: '2026-05-06T09:31:00.000Z' },
  { id: 'n2', userId: 'u1', orderId: 'o1', tipo: 'estado_pedido', titulo: 'Tu solicitud S-0001 está pendiente', mensaje: 'Recibimos tu solicitud S-0001. Te avisaremos cuando se confirme.', leida: false, createdAt: '2026-05-10T09:15:00.000Z' },
  { id: 'n3', userId: 'u3', tipo: 'solicitud_representante', titulo: 'Nueva solicitud de representante', mensaje: 'Óptica Buenos Aires Norte solicitó alta.', leida: false, createdAt: '2026-05-13T10:05:00.000Z' },
  { id: 'n4', userId: 'u3', tipo: 'stock_critico', titulo: 'Stock crítico — Aviator Gold', mensaje: 'Solo quedan 4 unidades de p15 (Aviator Gold). Umbral: 3.', leida: false, createdAt: '2026-05-13T08:00:00.000Z' },
  { id: 'n5', userId: 'u3', tipo: 'lead_nuevo', titulo: 'Nuevo lead — Óptica Buenos Aires Norte', mensaje: 'Carolina Suarez completó el formulario "Quiero ser representante BIANNI".', leida: true, createdAt: '2026-05-13T10:00:00.000Z' },
  { id: 'n6', userId: 'u2', orderId: 'o3', tipo: 'estado_pedido', titulo: 'Solicitud enviada — S-0003', mensaje: 'La solicitud S-0003 de Óptica Premium fue enviada. Pendiente de revisión.', leida: false, createdAt: '2026-05-12T10:00:00.000Z' },
  { id: 'n7', userId: 'u2', tipo: 'reclamo', titulo: 'Reclamo R-001 pendiente de bonificar', mensaje: 'Recordatorio: el próximo pedido de Óptica La Visión debe incluir bonificación.', leida: false, createdAt: '2026-05-13T09:00:00.000Z' },
]

// ─── CLAIMS / RECLAMOS ────────────────────────────────────────────────────────

export const CLAIMS: Claim[] = [
  {
    id: 'cl1', codigo: 'R-001', orderId: 'o7', clienteId: 'c2', sellerId: 's1',
    descripcion: 'La óptica reporta que recibieron 1 unidad de p06 con la patilla rota. La cliente final ya devolvió el producto.',
    productos: [{ productId: 'p06', cantidadAfectada: 1, problema: 'Patilla rota al recibir' }],
    fotosUrls: [],
    estado: 'enviado_a_fabrica',
    notasInternas: [
      'Vendedor cargó: foto adjunta del lente roto, óptica espera reposición o NC.',
      '08/05 — Enviado a fábrica para análisis.',
    ],
    createdAt: '2026-05-03T14:00:00.000Z',
  },
  {
    id: 'cl2', codigo: 'R-002', clienteId: 'c4', sellerId: 's2',
    descripcion: 'Óptica del Sur reporta 2 unidades de p02 con defecto en bisagra (sin vincular a venta específica todavía).',
    productos: [{ productId: 'p02', cantidadAfectada: 2, problema: 'Bisagra defectuosa' }],
    fotosUrls: [],
    estado: 'recibido',
    notasInternas: ['Pendiente confirmar pedido de origen con la óptica.'],
    createdAt: '2026-05-11T10:00:00.000Z',
  },
  {
    id: 'cl3', codigo: 'R-003', orderId: 'o9', clienteId: 'c4', sellerId: 's2',
    descripcion: 'Reclamo por color distinto al solicitado en p13.',
    productos: [{ productId: 'p13', cantidadAfectada: 1, problema: 'Color distinto' }],
    fotosUrls: [],
    estado: 'resuelto',
    notasInternas: ['Bonificación aplicada en pedido P-0009 final.', 'Cliente conforme con resolución.'],
    bonificadoEnPedidoId: 'o9',
    fechaResolucion: '2026-04-28T10:00:00.000Z',
    createdAt: '2026-04-25T11:00:00.000Z',
  },
]

// ─── ASSETS (BIBLIOTECA DE CONTENIDO) ─────────────────────────────────────────

export const ASSETS: Asset[] = [
  // Receta
  { id: 'a1', nombreArchivo: 'pack-receta-temporada-2026.zip', url: '#', miniaturUrl: PRODUCT_IMGS.cat2, tipo: 'zip', categoria: 'receta', descripcion: 'Pack fotos altas Receta — Colección 2026', fechaSubida: '2026-04-15T10:00:00.000Z', subidoPor: 'u5', descargas: 47, tamanioMb: 124, activo: true },
  { id: 'a2', nombreArchivo: 'receta-classic-frontal.jpg', url: '#', miniaturUrl: PRODUCT_IMGS.cat2, tipo: 'foto', categoria: 'receta', descripcion: 'Foto producto Round Classic — vista frontal', fechaSubida: '2026-04-15T10:00:00.000Z', subidoPor: 'u5', descargas: 31, tamanioMb: 2.4, activo: true },
  // Sol
  { id: 'a3', nombreArchivo: 'pack-sol-verano-2026.zip', url: '#', miniaturUrl: PRODUCT_IMGS.cat3, tipo: 'zip', categoria: 'sol', descripcion: 'Pack completo Sol Verano 2026', fechaSubida: '2026-04-20T10:00:00.000Z', subidoPor: 'u5', descargas: 62, tamanioMb: 188, activo: true },
  { id: 'a4', nombreArchivo: 'sol-aviator-gold-lifestyle.jpg', url: '#', miniaturUrl: PRODUCT_IMGS.cat3, tipo: 'foto', categoria: 'sol', descripcion: 'Aviator Gold — foto lifestyle outdoor', fechaSubida: '2026-04-22T10:00:00.000Z', subidoPor: 'u5', descargas: 28, tamanioMb: 3.1, activo: true },
  // Clip-On
  { id: 'a5', nombreArchivo: 'clipon-sport-front.jpg', url: '#', miniaturUrl: PRODUCT_IMGS.cat1, tipo: 'foto', categoria: 'clip_on', descripcion: 'Sport Clip — vista frontal y patillas', fechaSubida: '2026-04-25T10:00:00.000Z', subidoPor: 'u5', descargas: 19, tamanioMb: 2.8, activo: true },
  // Editorial
  { id: 'a6', nombreArchivo: 'editorial-collection-2026.pdf', url: '#', miniaturUrl: '/brand/editorial-main.jpg', tipo: 'pdf', categoria: 'editorial', descripcion: 'Editorial completo Colección 2026 (alta resolución)', fechaSubida: '2026-04-10T10:00:00.000Z', subidoPor: 'u5', descargas: 84, tamanioMb: 45, activo: true },
  { id: 'a7', nombreArchivo: 'editorial-modelo-portada.jpg', url: '#', miniaturUrl: '/brand/editorial-main.jpg', tipo: 'foto', categoria: 'editorial', descripcion: 'Modelo portada para uso en redes', fechaSubida: '2026-04-10T10:00:00.000Z', subidoPor: 'u5', descargas: 56, tamanioMb: 8.2, activo: true },
  // Flyers
  { id: 'a8', nombreArchivo: 'flyer-promo-mayo.pdf', url: '#', miniaturUrl: '/brand/editorial-main.jpg', tipo: 'pdf', categoria: 'flyers', descripcion: 'Flyer promo mayo 2026 — A4 imprimible', fechaSubida: '2026-04-30T10:00:00.000Z', subidoPor: 'u5', descargas: 38, tamanioMb: 1.2, activo: true },
  { id: 'a9', nombreArchivo: 'flyer-temporada-receta.pdf', url: '#', miniaturUrl: PRODUCT_IMGS.cat2, tipo: 'pdf', categoria: 'flyers', descripcion: 'Flyer Receta — temporada 2026', fechaSubida: '2026-04-12T10:00:00.000Z', subidoPor: 'u5', descargas: 22, tamanioMb: 1.5, activo: true },
  // Videos
  { id: 'a10', nombreArchivo: 'reel-novedades-2026.mp4', url: '#', miniaturUrl: '/brand/editorial-main.jpg', tipo: 'video', categoria: 'videos', descripcion: 'Reel novedades 2026 — formato vertical para Instagram', fechaSubida: '2026-04-18T10:00:00.000Z', subidoPor: 'u5', descargas: 73, tamanioMb: 28, activo: true },
  // Videos UGC
  { id: 'a11', nombreArchivo: 'ugc-testimonio-optica-cordoba.mp4', url: '#', miniaturUrl: '/brand/editorial-main.jpg', tipo: 'video', categoria: 'videos_ugc', descripcion: 'Testimonio Óptica La Visión (Córdoba)', fechaSubida: '2026-04-22T10:00:00.000Z', subidoPor: 'u5', descargas: 14, tamanioMb: 35, activo: true },
  { id: 'a12', nombreArchivo: 'ugc-unboxing-rosario.mp4', url: '#', miniaturUrl: '/brand/editorial-main.jpg', tipo: 'video', categoria: 'videos_ugc', descripcion: 'Unboxing Óptica Premium (Rosario)', fechaSubida: '2026-05-01T10:00:00.000Z', subidoPor: 'u5', descargas: 9, tamanioMb: 22, activo: true },
  // Educativo
  { id: 'a13', nombreArchivo: 'guia-medicion-monturas.pdf', url: '#', miniaturUrl: PRODUCT_IMGS.cat2, tipo: 'pdf', categoria: 'educativo', descripcion: 'Guía interna: cómo medir monturas BIANNI correctamente', fechaSubida: '2026-03-15T10:00:00.000Z', subidoPor: 'u5', descargas: 41, tamanioMb: 3.4, activo: true },
  { id: 'a14', nombreArchivo: 'manual-marca-bianni.pdf', url: '#', miniaturUrl: '/brand/editorial-main.jpg', tipo: 'pdf', categoria: 'educativo', descripcion: 'Manual de marca BIANNI — guía oficial', fechaSubida: '2026-03-10T10:00:00.000Z', subidoPor: 'u5', descargas: 52, tamanioMb: 18, activo: true },
]

export const ASSET_DOWNLOADS: AssetDownload[] = [
  { id: 'ad1', assetId: 'a1', userId: 'u1', createdAt: '2026-05-01T10:00:00.000Z' },
  { id: 'ad2', assetId: 'a6', userId: 'u1', createdAt: '2026-04-12T10:00:00.000Z' },
  { id: 'ad3', assetId: 'a3', userId: 'u1', createdAt: '2026-04-25T10:00:00.000Z' },
]

// ─── LEADS (CRM) ──────────────────────────────────────────────────────────────

export const LEADS: Lead[] = [
  {
    id: 'l1', nombre: 'Carolina Suarez', nombreOptica: 'Óptica Buenos Aires Norte',
    email: 'csuarez@opticasban.com', telefono: '5491177889900', ciudad: 'Vicente López',
    mensaje: 'Quisiera incorporar BIANNI a mi local, somos óptica boutique.',
    estado: 'nuevo', origen: 'formulario_web', notas: [],
    createdAt: '2026-05-13T10:00:00.000Z',
  },
  {
    id: 'l2', nombre: 'Lucas Bertone', nombreOptica: 'Mar del Plata Óptica',
    email: 'lucas@mdpoptica.com', telefono: '5492234455667', ciudad: 'Mar del Plata',
    mensaje: 'Tengo dos locales en MdP, interesado en línea Sol.',
    estado: 'contactado', asignadoA: 's3', origen: 'formulario_web',
    notas: [{ id: 'ln1', texto: 'Lo llamé el lunes, mostró interés. Le pasé catálogo Sol.', autor: 'Paula Méndez', createdAt: '2026-05-13T15:00:00.000Z' }],
    createdAt: '2026-05-12T16:30:00.000Z',
  },
  {
    id: 'l3', nombre: 'Mariela Fernández', nombreOptica: 'Óptica Litoral Sur',
    email: 'mariela@litoralsur.com', telefono: '5493418889999', ciudad: 'Santa Fe',
    estado: 'en_negociacion', asignadoA: 's3', origen: 'instagram',
    notas: [
      { id: 'ln2', texto: 'Llegó por DM en IG. Pidió condiciones comerciales.', autor: 'Paula Méndez', createdAt: '2026-05-09T10:00:00.000Z' },
      { id: 'ln3', texto: 'Pasé propuesta de Lista B. Espera definición esta semana.', autor: 'Paula Méndez', createdAt: '2026-05-11T11:00:00.000Z' },
      { id: 'ln4', texto: 'Le creé usuario en el sistema para que vea catálogo: optica_litoralsur', autor: 'Paula Méndez', createdAt: '2026-05-12T10:00:00.000Z' },
    ],
    createdAt: '2026-05-08T14:00:00.000Z',
  },
  {
    id: 'l4', nombre: 'Sofía Aguirre', nombreOptica: 'Óptica Patagónica',
    email: 'sofia@patagonica.com', telefono: '5492944556677', ciudad: 'Neuquén',
    estado: 'convertido', asignadoA: 's2', origen: 'formulario_web',
    notas: [
      { id: 'ln5', texto: 'Aprobada — alta como óptica. Lista Premium asignada.', autor: 'Giuliana Bianni', createdAt: '2026-05-06T10:00:00.000Z' },
    ],
    clienteIdConvertido: 'c3', createdAt: '2026-05-05T12:00:00.000Z',
  },
  {
    id: 'l5', nombre: 'Marcelo Vega', nombreOptica: 'Óptica Salta Centro',
    email: 'mvega@gmail.com', telefono: '5493874008811', ciudad: 'Salta',
    mensaje: 'Hola', estado: 'perdido', origen: 'formulario_web',
    notas: [{ id: 'ln6', texto: 'No tiene local físico verificable. Descartado.', autor: 'Giuliana Bianni', createdAt: '2026-04-29T10:00:00.000Z' }],
    createdAt: '2026-04-28T08:00:00.000Z',
  },
  {
    id: 'l6', nombre: 'Diego Castro', nombreOptica: 'Castro Óptica',
    email: 'diego@castro.com', telefono: '5491198765432', ciudad: 'La Plata',
    estado: 'en_negociacion', asignadoA: 's3', origen: 'referido',
    notas: [{ id: 'ln7', texto: 'Referido por Óptica del Centro. Coordinamos visita la próxima semana.', autor: 'Paula Méndez', createdAt: '2026-05-10T16:00:00.000Z' }],
    createdAt: '2026-05-10T11:00:00.000Z',
  },
]

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp1', nombre: 'Lanzamiento Colección 2026',
    mensaje: '🕶 Llegó la nueva Colección 2026 a BIANNI. Reservá tus modelos preferidos en preventa exclusiva — sin pedido mínimo.',
    segmentoTipo: 'todas', destinatariosCount: 6,
    fechaEnvio: '2026-04-10T10:00:00.000Z', enviadaPor: 'Giuliana Bianni', estado: 'enviada',
  },
  {
    id: 'cmp2', nombre: 'Visita Córdoba próxima semana',
    mensaje: '👁 Fernando va a estar visitando Córdoba esta semana. Coordiná tu pedido con él al 5491155001234.',
    segmentoTipo: 'por_ciudad', segmentoValor: 'Córdoba',
    destinatariosCount: 1, fechaEnvio: '2026-05-05T10:00:00.000Z', enviadaPor: 'Giuliana Bianni', estado: 'enviada',
  },
  {
    id: 'cmp3', nombre: 'Promo Invierno 15% — 48hs',
    mensaje: '⏰ Solo 48hs: 15% en línea Receta con código INVIERNO15. ¡Aprovechá!',
    segmentoTipo: 'todas', destinatariosCount: 6,
    fechaProgramada: '2026-05-20T10:00:00.000Z', enviadaPor: 'Giuliana Bianni', estado: 'programada',
  },
]

// ─── COMMISSIONS ──────────────────────────────────────────────────────────────

export const COMMISSIONS: Commission[] = [
  { id: 'cm1', sellerId: 's2', orderId: 'o4', montoVenta: 448800, porcentaje: 8, monto: 35904, fechaCalculo: '2026-05-08T11:00:00.000Z', estado: 'pendiente' },
  { id: 'cm2', sellerId: 's2', orderId: 'o5', montoVenta: 396000, porcentaje: 8, monto: 31680, fechaCalculo: '2026-05-07T16:45:00.000Z', estado: 'pendiente' },
  { id: 'cm3', sellerId: 's1', orderId: 'o6', montoVenta: 316800, porcentaje: 8, monto: 25344, fechaCalculo: '2026-05-06T09:30:00.000Z', estado: 'pendiente' },
  { id: 'cm4', sellerId: 's1', orderId: 'o7', montoVenta: 362000, porcentaje: 8, monto: 28960, fechaCalculo: '2026-04-30T08:00:00.000Z', estado: 'liquidada' },
  { id: 'cm5', sellerId: 's2', orderId: 'o9', montoVenta: 349800, porcentaje: 8, monto: 27984, fechaCalculo: '2026-04-22T10:00:00.000Z', estado: 'liquidada' },
]

// ─── ACCOUNT MOVEMENTS (CTA CTE) ──────────────────────────────────────────────

export const ACCOUNT_MOVEMENTS: AccountMovement[] = [
  // c1
  { id: 'am1', clienteId: 'c1', tipo: 'cargo_venta', monto: 316800, saldoAcumulado: 316800, fecha: '2026-05-06T09:30:00.000Z', vencimiento: '2026-06-05T00:00:00.000Z', orderId: 'o6', descripcion: 'Venta P-0006 — plazo 30 días', registradoPor: 'ERP' },
  // c2
  { id: 'am2', clienteId: 'c2', tipo: 'cargo_venta', monto: 362000, saldoAcumulado: 362000, fecha: '2026-04-30T08:00:00.000Z', vencimiento: '2026-05-30T00:00:00.000Z', orderId: 'o7', descripcion: 'Venta P-0007 — plazo 30 días', registradoPor: 'ERP' },
  { id: 'am3', clienteId: 'c2', tipo: 'pago', monto: -200000, saldoAcumulado: 162000, fecha: '2026-05-12T10:00:00.000Z', descripcion: 'Pago a cuenta — transferencia', registradoPor: 'ERP' },
  // c4
  { id: 'am4', clienteId: 'c4', tipo: 'cargo_venta', monto: 448800, saldoAcumulado: 448800, fecha: '2026-05-08T11:00:00.000Z', vencimiento: '2026-06-07T00:00:00.000Z', orderId: 'o4', descripcion: 'Venta P-0004 — plazo 30 días', registradoPor: 'ERP' },
  { id: 'am5', clienteId: 'c4', tipo: 'cargo_venta', monto: 349800, saldoAcumulado: 798600, fecha: '2026-04-22T10:00:00.000Z', vencimiento: '2026-05-22T00:00:00.000Z', orderId: 'o9', descripcion: 'Venta P-0009 — plazo 30 días', registradoPor: 'ERP' },
  { id: 'am6', clienteId: 'c4', tipo: 'pago', monto: -349800, saldoAcumulado: 448800, fecha: '2026-05-10T10:00:00.000Z', descripcion: 'Pago P-0009 — cheque al cobro', registradoPor: 'ERP' },
  // c5
  { id: 'am7', clienteId: 'c5', tipo: 'cargo_venta', monto: 396000, saldoAcumulado: 396000, fecha: '2026-05-07T16:45:00.000Z', vencimiento: '2026-06-06T00:00:00.000Z', orderId: 'o5', descripcion: 'Venta P-0005 — plazo 30 días', registradoPor: 'ERP' },
  // c3
  { id: 'am8', clienteId: 'c3', tipo: 'bonificacion', monto: -25000, saldoAcumulado: -25000, fecha: '2026-04-28T10:00:00.000Z', descripcion: 'Bonificación reclamo R-003 (resuelto)', registradoPor: 'ERP' },
]
