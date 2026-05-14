import type {
  DemoUser,
  Category,
  Product,
  PriceList,
  ProductPrice,
  Seller,
  Client,
  Stock,
  Order,
  OrderHistoryEntry,
  Notification,
  Claim,
  Asset,
  Lead,
  Campaign,
  DiscountCode,
} from '@/types'

// ─── USERS ────────────────────────────────────────────────────────────────────

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u1',
    email: 'optica@demo.bianni',
    password: 'demo123',
    name: 'Óptica del Centro',
    role: 'distribuidor',
    clientId: 'c1',
  },
  {
    id: 'u2',
    email: 'fernando@demo.bianni',
    password: 'demo123',
    name: 'Fernando García',
    role: 'vendedor',
    sellerId: 's1',
  },
  {
    id: 'u3',
    email: 'admin@demo.bianni',
    password: 'demo123',
    name: 'Giuliana Bianni',
    role: 'admin',
  },
]

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  { id: 'cat1', name: 'CLIP-ON', order: 1 },
  { id: 'cat2', name: 'RECETA', order: 2 },
  { id: 'cat3', name: 'SOL', order: 3 },
]

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

const PRODUCT_IMGS = {
  cat1: '/brand/products/clipon.jpg',
  cat2: '/brand/products/receta.jpg',
  cat3: '/brand/products/sol.jpg',
} as const

export const PRODUCTS: Product[] = [
  // CLIP-ON (cat1)
  {
    id: 'p01',
    sku: 'CL-001',
    name: 'Classic Clip',
    categoryId: 'cat1',
    description: 'Clip-on clásico de acetato italiano, perfecto para uso diario.',
    badge: null,
    imageUrl: PRODUCT_IMGS.cat1,
    active: true,
  },
  {
    id: 'p02',
    sku: 'CL-002',
    name: 'Sport Clip',
    categoryId: 'cat1',
    description: 'Clip-on deportivo con lente polarizada y agarre ultraliviano.',
    badge: 'NUEVO',
    imageUrl: PRODUCT_IMGS.cat1,
    active: true,
  },
  {
    id: 'p03',
    sku: 'CL-003',
    name: 'Titanium Clip',
    categoryId: 'cat1',
    description: 'Montura de titanio de alta resistencia con clip magnético.',
    badge: 'TEMPORADA',
    imageUrl: PRODUCT_IMGS.cat1,
    active: true,
  },
  {
    id: 'p04',
    sku: 'CL-004',
    name: 'Round Clip',
    categoryId: 'cat1',
    description: 'Clip-on redondo de estilo vintage con acabado mate.',
    badge: null,
    imageUrl: PRODUCT_IMGS.cat1,
    active: true,
  },
  {
    id: 'p05',
    sku: 'CL-005',
    name: 'Square Clip',
    categoryId: 'cat1',
    description: 'Clip-on cuadrado de perfil fino, diseño contemporáneo.',
    badge: null,
    imageUrl: PRODUCT_IMGS.cat1,
    active: true,
  },
  {
    id: 'p06',
    sku: 'CL-006',
    name: 'Flex Clip',
    categoryId: 'cat1',
    description: 'Clip-on con bisagra flexible, resistente a torsión.',
    badge: 'NUEVO',
    imageUrl: PRODUCT_IMGS.cat1,
    active: true,
  },
  // RECETA (cat2)
  {
    id: 'p07',
    sku: 'RC-001',
    name: 'Slim Frame',
    categoryId: 'cat2',
    description: 'Montura ultra-delgada de metal, estilo minimalista y elegante.',
    badge: null,
    imageUrl: PRODUCT_IMGS.cat2,
    active: true,
  },
  {
    id: 'p08',
    sku: 'RC-002',
    name: 'Round Classic',
    categoryId: 'cat2',
    description: 'Marco redondo de acetato grueso, inspirado en el estilo años 70.',
    badge: 'TEMPORADA',
    imageUrl: PRODUCT_IMGS.cat2,
    active: true,
  },
  {
    id: 'p09',
    sku: 'RC-003',
    name: 'Wide Oval',
    categoryId: 'cat2',
    description: 'Marco ovalado ancho, ideal para rostros alargados.',
    badge: null,
    imageUrl: PRODUCT_IMGS.cat2,
    active: true,
  },
  {
    id: 'p10',
    sku: 'RC-004',
    name: 'Cat Eye',
    categoryId: 'cat2',
    description: 'Montura cat-eye de acetato italiano con detalles dorados.',
    badge: 'NUEVO',
    imageUrl: PRODUCT_IMGS.cat2,
    active: true,
  },
  {
    id: 'p11',
    sku: 'RC-005',
    name: 'Rectangle Pro',
    categoryId: 'cat2',
    description: 'Marco rectangular profesional, apto para lentes progresivos.',
    badge: null,
    imageUrl: PRODUCT_IMGS.cat2,
    active: true,
  },
  {
    id: 'p12',
    sku: 'RC-006',
    name: 'Pilot Frame',
    categoryId: 'cat2',
    description: 'Montura estilo pilot de doble puente, línea premium.',
    badge: 'TEMPORADA',
    imageUrl: PRODUCT_IMGS.cat2,
    active: true,
  },
  // SOL (cat3)
  {
    id: 'p13',
    sku: 'SL-001',
    name: 'Oversize Shield',
    categoryId: 'cat3',
    description: 'Gafas oversize tipo shield con lente degradé ahumado.',
    badge: 'TEMPORADA',
    imageUrl: PRODUCT_IMGS.cat3,
    active: true,
  },
  {
    id: 'p14',
    sku: 'SL-002',
    name: 'Butterfly Wave',
    categoryId: 'cat3',
    description: 'Montura butterfly de acetato con lente marrón espejado.',
    badge: 'NUEVO',
    imageUrl: PRODUCT_IMGS.cat3,
    active: true,
  },
  {
    id: 'p15',
    sku: 'SL-003',
    name: 'Aviator Gold',
    categoryId: 'cat3',
    description: 'Aviador clásico con armazón dorada y lente verde G-15.',
    badge: null,
    imageUrl: PRODUCT_IMGS.cat3,
    active: true,
  },
  {
    id: 'p16',
    sku: 'SL-004',
    name: 'Square Block',
    categoryId: 'cat3',
    description: 'Gafas cuadradas de acetato grueso, estilo urbano contemporáneo.',
    badge: null,
    imageUrl: PRODUCT_IMGS.cat3,
    active: true,
  },
  {
    id: 'p17',
    sku: 'SL-005',
    name: 'Round Retro',
    categoryId: 'cat3',
    description: 'Lente redondo retro de pequeño diámetro con puente metálico.',
    badge: 'NUEVO',
    imageUrl: PRODUCT_IMGS.cat3,
    active: true,
  },
  {
    id: 'p18',
    sku: 'SL-006',
    name: 'Wraparound Sport',
    categoryId: 'cat3',
    description: 'Gafas wraparound deportivas con lente polarizada y patillas grip.',
    badge: null,
    imageUrl: PRODUCT_IMGS.cat3,
    active: true,
  },
]

// ─── PRICE LISTS ──────────────────────────────────────────────────────────────

export const PRICE_LISTS: PriceList[] = [
  { id: 'pl1', name: 'Mayorista A' },
  { id: 'pl2', name: 'Mayorista B' },
  { id: 'pl3', name: 'Premium' },
]

// Base prices for Mayorista A (ARS)
const basePricesA: Record<string, number> = {
  p01: 32000, p02: 38000, p03: 55000, p04: 29000, p05: 31000, p06: 41000,
  p07: 28000, p08: 35000, p09: 33000, p10: 48000, p11: 30000, p12: 52000,
  p13: 58000, p14: 62000, p15: 65000, p16: 45000, p17: 39000, p18: 50000,
}

export const PRODUCT_PRICES: ProductPrice[] = PRODUCTS.flatMap((p) => [
  { productId: p.id, priceListId: 'pl1', precioArs: basePricesA[p.id] },
  { productId: p.id, priceListId: 'pl2', precioArs: Math.round(basePricesA[p.id] * 1.10) },
  { productId: p.id, priceListId: 'pl3', precioArs: Math.round(basePricesA[p.id] * 1.20) },
])

// ─── SELLERS ──────────────────────────────────────────────────────────────────

export const SELLERS: Seller[] = [
  { id: 's1', nombre: 'Fernando García', telefono: '5491155001234', email: 'fernando@bianni.com' },
  { id: 's2', nombre: 'Nicolás Rodríguez', telefono: '5491133009876', email: 'nicolas@bianni.com' },
]

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

export const CLIENTS: Client[] = [
  {
    id: 'c1',
    nombre: 'Óptica del Centro',
    ciudad: 'Buenos Aires',
    plazoPagoDias: 30,
    priceListId: 'pl1',
    sellerId: 's1',
    telefono: '5491144001111',
    email: 'contacto@opticacentro.com',
  },
  {
    id: 'c2',
    nombre: 'Óptica La Visión',
    ciudad: 'Córdoba',
    plazoPagoDias: 30,
    priceListId: 'pl1',
    sellerId: 's1',
    telefono: '5493515002222',
    email: 'info@opticlavision.com',
  },
  {
    id: 'c3',
    nombre: 'Óptica Premium',
    ciudad: 'Rosario',
    plazoPagoDias: 45,
    priceListId: 'pl3',
    sellerId: 's1',
    telefono: '5493414003333',
    email: 'ventas@opticapremium.com',
  },
  {
    id: 'c4',
    nombre: 'Óptica del Sur',
    ciudad: 'Mendoza',
    plazoPagoDias: 30,
    priceListId: 'pl2',
    sellerId: 's2',
    telefono: '5492614004444',
    email: 'contacto@opticadelsur.com',
  },
  {
    id: 'c5',
    nombre: 'Óptica Norte',
    ciudad: 'Tucumán',
    plazoPagoDias: 30,
    priceListId: 'pl2',
    sellerId: 's2',
    telefono: '5493814005555',
    email: 'hola@opticanorte.com',
  },
]

// ─── STOCK ────────────────────────────────────────────────────────────────────

export const STOCK: Stock[] = [
  { productId: 'p01', disponible: 25, reservado: 2 },
  { productId: 'p02', disponible: 18, reservado: 4 },
  { productId: 'p03', disponible: 12, reservado: 1 },
  { productId: 'p04', disponible: 30, reservado: 0 },
  { productId: 'p05', disponible: 5,  reservado: 2 }, // bajo stock
  { productId: 'p06', disponible: 20, reservado: 3 },
  { productId: 'p07', disponible: 22, reservado: 1 },
  { productId: 'p08', disponible: 15, reservado: 2 },
  { productId: 'p09', disponible: 28, reservado: 0 },
  { productId: 'p10', disponible: 5,  reservado: 3 }, // bajo stock
  { productId: 'p11', disponible: 17, reservado: 1 },
  { productId: 'p12', disponible: 10, reservado: 2 },
  { productId: 'p13', disponible: 24, reservado: 0 },
  { productId: 'p14', disponible: 19, reservado: 4 },
  { productId: 'p15', disponible: 5,  reservado: 1 }, // bajo stock
  { productId: 'p16', disponible: 30, reservado: 2 },
  { productId: 'p17', disponible: 14, reservado: 0 },
  { productId: 'p18', disponible: 8,  reservado: 3 },
]

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export const ORDERS: Order[] = [
  // P-0001: pendiente_revision — c1/s1
  {
    id: 'o1',
    codigo: 'P-0001',
    clienteId: 'c1',
    sellerId: 's1',
    estado: 'pendiente_revision',
    items: [
      { productId: 'p01', cantidad: 4, precioUnit: 32000, descuentoAplicado: 0, picked: false },
      { productId: 'p07', cantidad: 3, precioUnit: 28000, descuentoAplicado: 0, picked: false },
      { productId: 'p13', cantidad: 2, precioUnit: 58000, descuentoAplicado: 0, picked: false },
    ],
    total: 4 * 32000 + 3 * 28000 + 2 * 58000,
    fecha: '2026-05-10T09:15:00.000Z',
    plazoPagoDias: 30,
  },
  // P-0002: pendiente_revision — c2/s1
  {
    id: 'o2',
    codigo: 'P-0002',
    clienteId: 'c2',
    sellerId: 's1',
    estado: 'pendiente_revision',
    items: [
      { productId: 'p08', cantidad: 5, precioUnit: 35000, descuentoAplicado: 5, picked: false },
      { productId: 'p15', cantidad: 3, precioUnit: 65000, descuentoAplicado: 5, picked: false },
    ],
    total: Math.round(5 * 35000 * 0.95 + 3 * 65000 * 0.95),
    fecha: '2026-05-11T14:30:00.000Z',
    plazoPagoDias: 30,
  },
  // P-0003: pendiente_revision — c3/s1
  {
    id: 'o3',
    codigo: 'P-0003',
    clienteId: 'c3',
    sellerId: 's1',
    estado: 'pendiente_revision',
    items: [
      { productId: 'p10', cantidad: 2, precioUnit: 57600, descuentoAplicado: 0, picked: false },
      { productId: 'p14', cantidad: 4, precioUnit: 74400, descuentoAplicado: 0, picked: false },
      { productId: 'p12', cantidad: 3, precioUnit: 62400, descuentoAplicado: 0, picked: false },
    ],
    total: 2 * 57600 + 4 * 74400 + 3 * 62400,
    fecha: '2026-05-12T10:00:00.000Z',
    plazoPagoDias: 45,
  },
  // P-0004: aceptado — c4/s2
  {
    id: 'o4',
    codigo: 'P-0004',
    clienteId: 'c4',
    sellerId: 's2',
    estado: 'aceptado',
    items: [
      { productId: 'p02', cantidad: 6, precioUnit: 41800, descuentoAplicado: 0, picked: false },
      { productId: 'p16', cantidad: 4, precioUnit: 49500, descuentoAplicado: 0, picked: false },
    ],
    total: 6 * 41800 + 4 * 49500,
    fecha: '2026-05-08T11:00:00.000Z',
    plazoPagoDias: 30,
    notasAdmin: 'Priorizar despacho por volumen.',
  },
  // P-0005: aceptado — c5/s2
  {
    id: 'o5',
    codigo: 'P-0005',
    clienteId: 'c5',
    sellerId: 's2',
    estado: 'aceptado',
    items: [
      { productId: 'p03', cantidad: 3, precioUnit: 60500, descuentoAplicado: 0, picked: true },
      { productId: 'p17', cantidad: 5, precioUnit: 42900, descuentoAplicado: 0, picked: true },
    ],
    total: 3 * 60500 + 5 * 42900,
    fecha: '2026-05-07T16:45:00.000Z',
    plazoPagoDias: 30,
  },
  // P-0006: modificado — c1/s1
  {
    id: 'o6',
    codigo: 'P-0006',
    clienteId: 'c1',
    sellerId: 's1',
    estado: 'modificado',
    items: [
      { productId: 'p04', cantidad: 8, precioUnit: 29000, descuentoAplicado: 10, picked: false },
      { productId: 'p11', cantidad: 4, precioUnit: 30000, descuentoAplicado: 10, picked: false },
    ],
    total: Math.round(8 * 29000 * 0.90 + 4 * 30000 * 0.90),
    fecha: '2026-05-06T09:30:00.000Z',
    plazoPagoDias: 30,
    notasAdmin: 'Reducimos cantidad de p04 de 10 a 8 por falta de stock.',
  },
  // P-0007: despachado — c2/s1
  {
    id: 'o7',
    codigo: 'P-0007',
    clienteId: 'c2',
    sellerId: 's1',
    estado: 'despachado',
    items: [
      { productId: 'p06', cantidad: 4, precioUnit: 41000, descuentoAplicado: 0, picked: true },
      { productId: 'p09', cantidad: 6, precioUnit: 33000, descuentoAplicado: 0, picked: true },
    ],
    total: 4 * 41000 + 6 * 33000,
    fecha: '2026-04-30T08:00:00.000Z',
    plazoPagoDias: 30,
  },
  // P-0008: rechazado — c3/s1
  {
    id: 'o8',
    codigo: 'P-0008',
    clienteId: 'c3',
    sellerId: 's1',
    estado: 'rechazado',
    items: [
      { productId: 'p18', cantidad: 12, precioUnit: 60000, descuentoAplicado: 15, picked: false },
    ],
    total: Math.round(12 * 60000 * 0.85),
    fecha: '2026-05-01T13:00:00.000Z',
    plazoPagoDias: 45,
    motivoRechazo: 'Descuento solicitado fuera de política comercial vigente.',
  },
  // P-0009: entregado — c4/s2
  {
    id: 'o9',
    codigo: 'P-0009',
    clienteId: 'c4',
    sellerId: 's2',
    estado: 'entregado',
    items: [
      { productId: 'p05', cantidad: 3, precioUnit: 34100, descuentoAplicado: 0, picked: true },
      { productId: 'p13', cantidad: 5, precioUnit: 49500, descuentoAplicado: 0, picked: true },
    ],
    total: 3 * 34100 + 5 * 49500,
    fecha: '2026-04-22T10:00:00.000Z',
    plazoPagoDias: 30,
  },
  // P-0010: borrador — c1/s1
  {
    id: 'o10',
    codigo: 'P-0010',
    clienteId: 'c1',
    sellerId: 's1',
    estado: 'borrador',
    items: [
      { productId: 'p02', cantidad: 3, precioUnit: 38000, descuentoAplicado: 0, picked: false },
    ],
    total: 3 * 38000,
    fecha: '2026-05-13T08:30:00.000Z',
    plazoPagoDias: 30,
  },
  // o11: enviado_wa — enviado por WhatsApp, aún no entró al sistema
  {
    id: 'o11',
    codigo: 'P-0011',
    clienteId: 'c3',
    sellerId: 's1',
    estado: 'enviado_wa',
    items: [
      { productId: 'p13', cantidad: 4, precioUnit: 72000, descuentoAplicado: 0, picked: false },
      { productId: 'p14', cantidad: 2, precioUnit: 65000, descuentoAplicado: 0, picked: false },
    ],
    total: 4 * 72000 + 2 * 65000,
    fecha: '2026-05-13T11:00:00.000Z',
    plazoPagoDias: 30,
  },
  // o12: cancelado — pedido cancelado
  {
    id: 'o12',
    codigo: 'P-0012',
    clienteId: 'c5',
    sellerId: 's2',
    estado: 'cancelado',
    items: [
      { productId: 'p07', cantidad: 5, precioUnit: 42000, descuentoAplicado: 0, picked: false },
    ],
    total: 5 * 42000,
    fecha: '2026-05-05T14:00:00.000Z',
    plazoPagoDias: 60,
    motivoRechazo: 'Cliente canceló por cambio de presupuesto',
  },
]

// ─── ORDER HISTORY ────────────────────────────────────────────────────────────

export const ORDER_HISTORY: OrderHistoryEntry[] = [
  // o1
  { id: 'h1',  orderId: 'o1', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Fernando García', createdAt: '2026-05-10T09:10:00.000Z' },
  { id: 'h2',  orderId: 'o1', estadoAnterior: 'borrador', estadoNuevo: 'enviado_wa', cambiadoPor: 'Fernando García', createdAt: '2026-05-10T09:15:00.000Z' },
  { id: 'h3',  orderId: 'o1', estadoAnterior: 'enviado_wa', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Sistema', createdAt: '2026-05-10T09:16:00.000Z' },
  // o2
  { id: 'h4',  orderId: 'o2', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Fernando García', createdAt: '2026-05-11T14:25:00.000Z' },
  { id: 'h5',  orderId: 'o2', estadoAnterior: 'borrador', estadoNuevo: 'enviado_wa', cambiadoPor: 'Fernando García', createdAt: '2026-05-11T14:30:00.000Z' },
  { id: 'h6',  orderId: 'o2', estadoAnterior: 'enviado_wa', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Sistema', createdAt: '2026-05-11T14:31:00.000Z' },
  // o3
  { id: 'h7',  orderId: 'o3', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Fernando García', createdAt: '2026-05-12T09:55:00.000Z' },
  { id: 'h8',  orderId: 'o3', estadoAnterior: 'borrador', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Fernando García', createdAt: '2026-05-12T10:00:00.000Z' },
  // o4
  { id: 'h9',  orderId: 'o4', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Nicolás Rodríguez', createdAt: '2026-05-08T10:50:00.000Z' },
  { id: 'h10', orderId: 'o4', estadoAnterior: 'borrador', estadoNuevo: 'enviado_wa', cambiadoPor: 'Nicolás Rodríguez', createdAt: '2026-05-08T11:00:00.000Z' },
  { id: 'h11', orderId: 'o4', estadoAnterior: 'enviado_wa', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Sistema', createdAt: '2026-05-08T11:01:00.000Z' },
  { id: 'h12', orderId: 'o4', estadoAnterior: 'pendiente_revision', estadoNuevo: 'aceptado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-05-08T15:30:00.000Z' },
  // o5
  { id: 'h13', orderId: 'o5', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Nicolás Rodríguez', createdAt: '2026-05-07T16:30:00.000Z' },
  { id: 'h14', orderId: 'o5', estadoAnterior: 'borrador', estadoNuevo: 'enviado_wa', cambiadoPor: 'Nicolás Rodríguez', createdAt: '2026-05-07T16:45:00.000Z' },
  { id: 'h15', orderId: 'o5', estadoAnterior: 'enviado_wa', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Sistema', createdAt: '2026-05-07T16:46:00.000Z' },
  { id: 'h16', orderId: 'o5', estadoAnterior: 'pendiente_revision', estadoNuevo: 'aceptado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-05-08T09:00:00.000Z' },
  // o6
  { id: 'h17', orderId: 'o6', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Fernando García', createdAt: '2026-05-06T09:00:00.000Z' },
  { id: 'h18', orderId: 'o6', estadoAnterior: 'borrador', estadoNuevo: 'enviado_wa', cambiadoPor: 'Fernando García', createdAt: '2026-05-06T09:30:00.000Z' },
  { id: 'h19', orderId: 'o6', estadoAnterior: 'enviado_wa', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Sistema', createdAt: '2026-05-06T09:31:00.000Z' },
  { id: 'h20', orderId: 'o6', estadoAnterior: 'pendiente_revision', estadoNuevo: 'modificado', cambiadoPor: 'Giuliana Bianni', motivo: 'Reducimos cantidad por stock.', createdAt: '2026-05-06T14:00:00.000Z' },
  // o7
  { id: 'h21', orderId: 'o7', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Fernando García', createdAt: '2026-04-30T07:45:00.000Z' },
  { id: 'h22', orderId: 'o7', estadoAnterior: 'borrador', estadoNuevo: 'enviado_wa', cambiadoPor: 'Fernando García', createdAt: '2026-04-30T08:00:00.000Z' },
  { id: 'h23', orderId: 'o7', estadoAnterior: 'enviado_wa', estadoNuevo: 'aceptado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-04-30T10:00:00.000Z' },
  { id: 'h24', orderId: 'o7', estadoAnterior: 'aceptado', estadoNuevo: 'despachado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-05-02T09:00:00.000Z' },
  // o8
  { id: 'h25', orderId: 'o8', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Fernando García', createdAt: '2026-05-01T12:45:00.000Z' },
  { id: 'h26', orderId: 'o8', estadoAnterior: 'borrador', estadoNuevo: 'enviado_wa', cambiadoPor: 'Fernando García', createdAt: '2026-05-01T13:00:00.000Z' },
  { id: 'h27', orderId: 'o8', estadoAnterior: 'enviado_wa', estadoNuevo: 'pendiente_revision', cambiadoPor: 'Sistema', createdAt: '2026-05-01T13:01:00.000Z' },
  { id: 'h28', orderId: 'o8', estadoAnterior: 'pendiente_revision', estadoNuevo: 'rechazado', cambiadoPor: 'Giuliana Bianni', motivo: 'Descuento fuera de política.', createdAt: '2026-05-01T16:00:00.000Z' },
  // o9
  { id: 'h29', orderId: 'o9', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Nicolás Rodríguez', createdAt: '2026-04-22T09:30:00.000Z' },
  { id: 'h30', orderId: 'o9', estadoAnterior: 'borrador', estadoNuevo: 'aceptado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-04-22T10:00:00.000Z' },
  { id: 'h31', orderId: 'o9', estadoAnterior: 'aceptado', estadoNuevo: 'despachado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-04-24T08:00:00.000Z' },
  { id: 'h32', orderId: 'o9', estadoAnterior: 'despachado', estadoNuevo: 'entregado', cambiadoPor: 'Giuliana Bianni', createdAt: '2026-04-26T12:00:00.000Z' },
  // o10
  { id: 'h33', orderId: 'o10', estadoAnterior: null, estadoNuevo: 'borrador', cambiadoPor: 'Fernando García', createdAt: '2026-05-13T08:30:00.000Z' },
]

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const NOTIFICATIONS: Notification[] = [
  // distribuidor u1
  {
    id: 'n1', userId: 'u1', orderId: 'o6',
    tipo: 'estado_pedido',
    titulo: 'Pedido P-0006 modificado',
    mensaje: 'Tu pedido fue modificado. Reducimos la cantidad de Classic Clip de 10 a 8 unidades por falta de stock.',
    leida: false,
    createdAt: '2026-05-06T14:00:00.000Z',
  },
  {
    id: 'n2', userId: 'u1', orderId: 'o8',
    tipo: 'estado_pedido',
    titulo: 'Pedido P-0008 rechazado',
    mensaje: 'Lamentablemente tu pedido fue rechazado. El descuento solicitado está fuera de la política comercial vigente.',
    leida: true,
    createdAt: '2026-05-01T16:00:00.000Z',
  },
  {
    id: 'n3', userId: 'u1',
    tipo: 'campania',
    titulo: 'Nueva colección Temporada Otoño-Invierno',
    mensaje: 'Descubrí los nuevos modelos de la colección OI 2026. Lookbook disponible en el portal.',
    leida: false,
    createdAt: '2026-05-05T10:00:00.000Z',
  },
  // vendedor u2
  {
    id: 'n4', userId: 'u2', orderId: 'o4',
    tipo: 'estado_pedido',
    titulo: 'Pedido P-0004 aceptado',
    mensaje: 'El pedido de Óptica del Sur fue aceptado por administración.',
    leida: false,
    createdAt: '2026-05-08T15:30:00.000Z',
  },
  {
    id: 'n5', userId: 'u2', orderId: 'o8',
    tipo: 'estado_pedido',
    titulo: 'Pedido P-0008 rechazado',
    mensaje: 'El pedido de Óptica Premium fue rechazado. Contactar al cliente.',
    leida: true,
    createdAt: '2026-05-01T16:00:00.000Z',
  },
  // admin u3
  {
    id: 'n6', userId: 'u3',
    tipo: 'reclamo',
    titulo: 'Nuevo reclamo de Óptica del Centro',
    mensaje: 'Óptica del Centro reportó lentes con defecto de fábrica en el pedido P-0007.',
    leida: false,
    createdAt: '2026-05-04T11:00:00.000Z',
  },
  {
    id: 'n7', userId: 'u3', orderId: 'o1',
    tipo: 'estado_pedido',
    titulo: 'Nuevo pedido P-0001 pendiente',
    mensaje: 'Óptica del Centro envió un nuevo pedido que requiere revisión.',
    leida: false,
    createdAt: '2026-05-10T09:16:00.000Z',
  },
]

// ─── CLAIMS ───────────────────────────────────────────────────────────────────

export const CLAIMS: Claim[] = [
  {
    id: 'cl1',
    orderId: 'o7',
    clienteId: 'c1',
    motivo: 'Dos pares de Flex Clip llegaron con la bisagra rota. Imposible venderlos en ese estado.',
    fotosUrls: [
      'https://images.unsplash.com/photo-1508296692431-dc68e977b246?w=400&q=80',
      'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400&q=80',
    ],
    estado: 'a_fabrica',
    notasInternas: 'Enviado a control de calidad en fábrica el 06/05.',
    createdAt: '2026-05-04T11:00:00.000Z',
  },
  {
    id: 'cl2',
    orderId: 'o9',
    clienteId: 'c4',
    motivo: 'Un par de Round Retro vino con rayones en el lente. El embalaje estaba en buen estado.',
    fotosUrls: [
      'https://images.unsplash.com/photo-1523345219135-bec21252627a?w=400&q=80',
    ],
    estado: 'sin_resolver',
    createdAt: '2026-05-08T14:30:00.000Z',
  },
  {
    id: 'cl3',
    orderId: 'o7',
    clienteId: 'c2',
    motivo: 'Faltaron 2 unidades de Wide Oval en el pedido despachado.',
    fotosUrls: [],
    estado: 'cerrado',
    notasInternas: 'Se envió reposición el 05/05. Cerrado con cliente conforme.',
    createdAt: '2026-05-03T09:00:00.000Z',
  },
]

// ─── ASSETS ───────────────────────────────────────────────────────────────────

export const ASSETS: Asset[] = [
  {
    id: 'a1',
    nombreArchivo: 'Classic-Clip-2026.jpg',
    url: 'https://images.unsplash.com/photo-1508296692431-dc68e977b246?w=1200&q=90',
    miniaturUrl: 'https://images.unsplash.com/photo-1508296692431-dc68e977b246?w=400&q=80',
    tipo: 'foto_producto',
    descripcion: 'Foto oficial Classic Clip — temporada 2026',
    fechaSubida: '2026-04-15T10:00:00.000Z',
    activo: true,
  },
  {
    id: 'a2',
    nombreArchivo: 'Aviator-Gold-Studio.jpg',
    url: 'https://images.unsplash.com/photo-1473496169904-ecf1f5b3c1d4?w=1200&q=90',
    miniaturUrl: 'https://images.unsplash.com/photo-1473496169904-ecf1f5b3c1d4?w=400&q=80',
    tipo: 'foto_producto',
    descripcion: 'Aviator Gold — foto de estudio fondo blanco',
    fechaSubida: '2026-04-15T10:05:00.000Z',
    activo: true,
  },
  {
    id: 'a3',
    nombreArchivo: 'Oversize-Shield-Campaign.jpg',
    url: 'https://images.unsplash.com/photo-1542913707-0d1c6b4e76c7?w=1200&q=90',
    miniaturUrl: 'https://images.unsplash.com/photo-1542913707-0d1c6b4e76c7?w=400&q=80',
    tipo: 'foto_producto',
    descripcion: 'Oversize Shield — foto campaña verano',
    fechaSubida: '2026-04-16T09:00:00.000Z',
    activo: true,
  },
  {
    id: 'a4',
    nombreArchivo: 'Round-Classic-Studio.jpg',
    url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=90',
    miniaturUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
    tipo: 'foto_producto',
    descripcion: 'Round Classic — foto producto sobre fondo negro',
    fechaSubida: '2026-04-16T09:10:00.000Z',
    activo: true,
  },
  {
    id: 'a5',
    nombreArchivo: 'Editorial-OI2026-01.jpg',
    url: 'https://images.unsplash.com/photo-1625838144061-e1c66c83f27b?w=1200&q=90',
    miniaturUrl: 'https://images.unsplash.com/photo-1625838144061-e1c66c83f27b?w=400&q=80',
    tipo: 'editorial',
    descripcion: 'Campaña editorial Otoño-Invierno 2026 — shot 1',
    fechaSubida: '2026-05-01T12:00:00.000Z',
    activo: true,
  },
  {
    id: 'a6',
    nombreArchivo: 'Editorial-OI2026-02.jpg',
    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=90',
    miniaturUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80',
    tipo: 'editorial',
    descripcion: 'Campaña editorial Otoño-Invierno 2026 — shot 2',
    fechaSubida: '2026-05-01T12:05:00.000Z',
    activo: true,
  },
  {
    id: 'a7',
    nombreArchivo: 'Lookbook-OI2026.jpg',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=90',
    miniaturUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    tipo: 'editorial',
    descripcion: 'Editorial lifestyle — lifestyle shot ciudad',
    fechaSubida: '2026-05-02T08:00:00.000Z',
    activo: true,
  },
  {
    id: 'a8',
    nombreArchivo: 'Catalogo-BIANNI-2026.pdf',
    url: '/api/placeholder/pdf',
    miniaturUrl: 'https://images.unsplash.com/photo-1508296692431-dc68e977b246?w=400&q=80',
    tipo: 'catalogo_pdf',
    descripcion: 'Catálogo mayorista completo — temporada 2026',
    fechaSubida: '2026-04-20T10:00:00.000Z',
    activo: true,
  },
  {
    id: 'a9',
    nombreArchivo: 'Lista-Precios-Mayo2026.pdf',
    url: '/api/placeholder/pdf',
    miniaturUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
    tipo: 'catalogo_pdf',
    descripcion: 'Lista de precios actualizada — Mayo 2026',
    fechaSubida: '2026-05-01T09:00:00.000Z',
    activo: true,
  },
  {
    id: 'a10',
    nombreArchivo: 'Lookbook-OI2026.pdf',
    url: '/api/placeholder/pdf',
    miniaturUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80',
    tipo: 'lookbook',
    descripcion: 'Lookbook digital Otoño-Invierno 2026',
    fechaSubida: '2026-05-05T10:00:00.000Z',
    activo: true,
  },
]

// ─── LEADS ────────────────────────────────────────────────────────────────────

export const LEADS: Lead[] = [
  {
    id: 'lead1',
    nombre: 'Martina López',
    email: 'mlopez@opticaverde.com',
    telefono: '5491166001234',
    mensaje: 'Tenemos una óptica en Palermo, estamos buscando nuevas marcas para incorporar. ¿Cuáles son las condiciones mayoristas?',
    estado: 'nuevo',
    createdAt: '2026-05-12T10:30:00.000Z',
  },
  {
    id: 'lead2',
    nombre: 'Roberto Méndez',
    email: 'roberto@opticamendez.ar',
    telefono: '5493516007890',
    mensaje: 'Soy dueño de 3 ópticas en Córdoba. Me interesa trabajar con BIANNI para incorporar la línea premium.',
    estado: 'contactado',
    createdAt: '2026-05-10T09:00:00.000Z',
  },
  {
    id: 'lead3',
    nombre: 'Valeria Torres',
    email: 'valeria@eyewearba.com',
    telefono: '5491177002345',
    mensaje: 'Vi sus productos en una feria. ¿Tienen representante en zona norte de GBA?',
    estado: 'convertido',
    createdAt: '2026-04-25T14:00:00.000Z',
  },
  {
    id: 'lead4',
    nombre: 'Diego Fontana',
    email: 'diego@fonoptica.com',
    telefono: '5492614008765',
    mensaje: 'Óptica en Mendoza, actualmente trabajo con otra marca pero me interesa diversificar.',
    estado: 'contactado',
    createdAt: '2026-05-08T11:00:00.000Z',
  },
  {
    id: 'lead5',
    nombre: 'Carolina Ruiz',
    email: 'carolina@opticalux.com',
    telefono: '5493512003456',
    mensaje: 'Consulta sobre mínimo de pedido y condiciones de pago para óptica nueva.',
    estado: 'descartado',
    createdAt: '2026-04-20T10:00:00.000Z',
  },
]

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'camp1',
    nombre: 'Lanzamiento Colección OI 2026',
    mensaje: '🔷 *BIANNI EYEWEAR* 🔷\n\nEstamosd felices de presentarles nuestra nueva colección Otoño-Invierno 2026.\n\nNuevos modelos, nuevos materiales, precios competitivos.\n\n👉 Visitá el portal para ver el catálogo completo.\n\n¿Querés hacer tu pedido? Respondé este mensaje y te asesora tu vendedor asignado.',
    destinatariosCount: 5,
    fechaEnvio: '2026-05-05T10:00:00.000Z',
    enviadaPor: 'Giuliana Bianni',
    estado: 'enviada',
  },
  {
    id: 'camp2',
    nombre: 'Recordatorio de pagos Mayo',
    mensaje: '📋 *BIANNI EYEWEAR — Recordatorio*\n\nTe recordamos que tenés facturas con vencimiento en los próximos días.\n\nPor consultas sobre tu cuenta, respondé este mensaje.',
    destinatariosCount: 3,
    fechaEnvio: '2026-05-15T09:00:00.000Z',
    enviadaPor: 'Giuliana Bianni',
    estado: 'borrador',
  },
  {
    id: 'camp3',
    nombre: 'Oferta Stock Limitado — Temporada',
    mensaje: '⚡ *OFERTA LIMITADA — BIANNI EYEWEAR*\n\nÚltimas unidades de modelos de temporada con hasta 15% OFF.\n\nStock sujeto a disponibilidad. Primera compra tiene prioridad.\n\nRespondé para reservar tu pedido.',
    destinatariosCount: 5,
    fechaEnvio: '2026-04-28T14:00:00.000Z',
    enviadaPor: 'Giuliana Bianni',
    estado: 'enviada',
  },
]

// ─── DISCOUNT CODES ───────────────────────────────────────────────────────────

export const DISCOUNT_CODES: DiscountCode[] = [
  { id: 'dc1', codigo: 'FERN10', sellerId: 's1', porcentaje: 10, activo: true,  usosMax: 20, usosActual: 8  },
  { id: 'dc2', codigo: 'FERN05', sellerId: 's1', porcentaje: 5,  activo: true,  usosMax: 50, usosActual: 31 },
  { id: 'dc3', codigo: 'NICO15', sellerId: 's2', porcentaje: 15, activo: false, usosMax: 10, usosActual: 10 },
  { id: 'dc4', codigo: 'NICO08', sellerId: 's2', porcentaje: 8,  activo: true,  usosMax: 30, usosActual: 12 },
]
