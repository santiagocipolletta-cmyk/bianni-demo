import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Product,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  OrderHistoryEntry,
  Client,
  Seller,
  Stock,
  StockMovement,
  Notification,
  Claim,
  ClaimStatus,
  Asset,
  AssetDownload,
  Lead,
  LeadStatus,
  LeadNote,
  Campaign,
  PriceList,
  ProductPrice,
  DiscountCode,
  Commission,
  AccountMovement,
  RepresentativeRequest,
  SystemSettings,
  OrderWithDetails,
  StockState,
  ProfileCompletionData,
} from '@/types'
import {
  PRODUCTS,
  CATEGORIES,
  ORDERS,
  ORDER_HISTORY,
  CLIENTS,
  SELLERS,
  STOCK,
  STOCK_MOVEMENTS,
  NOTIFICATIONS,
  CLAIMS,
  ASSETS,
  ASSET_DOWNLOADS,
  LEADS,
  CAMPAIGNS,
  PRICE_LISTS,
  PRODUCT_PRICES,
  DISCOUNT_CODES,
  COMMISSIONS,
  ACCOUNT_MOVEMENTS,
  REPRESENTATIVE_REQUESTS,
  SYSTEM_SETTINGS,
} from '@/lib/mock-data'

interface DataState {
  // Data
  products: Product[]
  categories: Category[]
  orders: Order[]
  orderHistory: OrderHistoryEntry[]
  clients: Client[]
  sellers: Seller[]
  stock: Stock[]
  stockMovements: StockMovement[]
  notifications: Notification[]
  claims: Claim[]
  assets: Asset[]
  assetDownloads: AssetDownload[]
  leads: Lead[]
  campaigns: Campaign[]
  priceLists: PriceList[]
  productPrices: ProductPrice[]
  discountCodes: DiscountCode[]
  commissions: Commission[]
  accountMovements: AccountMovement[]
  representativeRequests: RepresentativeRequest[]
  settings: SystemSettings

  // Order mutations
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, changedBy: string, motivo?: string) => void
  updateOrderItems: (orderId: string, items: OrderItem[]) => void
  updateOrderObservaciones: (orderId: string, observaciones: string) => void
  setOrderPicking: (orderId: string, completado: boolean) => void
  togglePickedItem: (orderId: string, productId: string) => void
  addOrder: (order: Order) => void

  // Stock mutations
  decrementStock: (productId: string, cantidad: number, orderId: string, changedBy: string) => void
  freezeStock: (productId: string, cantidad: number, orderId: string, changedBy: string) => void
  releaseStock: (productId: string, cantidad: number, orderId: string, changedBy: string) => void
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void
  updateStock: (productId: string, disponible: number, motivo: string, changedBy: string) => void
  ingresoStock: (productId: string, cantidad: number, changedBy: string, motivo?: string) => void

  // Notification mutations
  markNotificationRead: (notifId: string) => void
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>) => void

  // Claims (vendedor crea, admin gestiona)
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt'>) => void
  updateClaimStatus: (claimId: string, estado: ClaimStatus) => void
  addClaimNote: (claimId: string, nota: string) => void
  resolveClaim: (claimId: string, pedidoIdBonificacion: string) => void

  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'notas'>) => void
  updateLeadStatus: (leadId: string, estado: LeadStatus) => void
  assignLead: (leadId: string, sellerId: string) => void
  addLeadNote: (leadId: string, nota: Omit<LeadNote, 'id' | 'createdAt'>) => void
  convertLead: (leadId: string, clienteId: string) => void

  // Campaigns
  addCampaign: (campaign: Omit<Campaign, 'id'>) => void

  // Assets
  addAsset: (asset: Omit<Asset, 'id'>) => void
  removeAsset: (assetId: string) => void
  incrementAssetDownload: (assetId: string, userId: string) => void

  // Clients
  updateClientStatus: (clientId: string, status: Client['status']) => void
  completeClientProfile: (clientId: string, data: ProfileCompletionData) => void
  toggleClientCtaCteVisibility: (clientId: string) => void
  updateClientPlazoPago: (clientId: string, dias: number) => void
  addClient: (client: Client) => void

  // Representative requests
  addRepresentativeRequest: (req: Omit<RepresentativeRequest, 'id' | 'createdAt' | 'estado'>) => void
  approveRepresentativeRequest: (requestId: string, sellerId: string, resueltaPor: string) => void
  rejectRepresentativeRequest: (requestId: string, motivo: string, resueltaPor: string) => void

  // Discount codes / cupones
  validateCoupon: (codigo: string) => DiscountCode | null

  // Helpers / derived
  getOrderWithDetails: (orderId: string) => OrderWithDetails | null
  getProductPrice: (productId: string, priceListId: string) => number
  getClientPriceList: (clientId: string) => PriceList | null
  getStockState: (productId: string) => StockState
  getStockAvailable: (productId: string) => number
  getProductSubstitutes: (productId: string) => Product[]
  getClientPendingOrders: (clientId: string) => Order[]
  hasOpenClaims: (clientId: string) => boolean
  getClientOpenClaims: (clientId: string) => Claim[]
  getClientBalance: (clientId: string) => number
  getSellerCommissionsMonth: (sellerId: string, monthsAgo?: number) => Commission[]
  getInactiveClients: (daysSinceLastPurchase: number) => Client[]
}

let idCounter = 1000
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${idCounter++}`
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // ── Initial data ──────────────────────────────────────────────────────
      products: PRODUCTS,
      categories: CATEGORIES,
      orders: ORDERS,
      orderHistory: ORDER_HISTORY,
      clients: CLIENTS,
      sellers: SELLERS,
      stock: STOCK,
      stockMovements: STOCK_MOVEMENTS,
      notifications: NOTIFICATIONS,
      claims: CLAIMS,
      assets: ASSETS,
      assetDownloads: ASSET_DOWNLOADS,
      leads: LEADS,
      campaigns: CAMPAIGNS,
      priceLists: PRICE_LISTS,
      productPrices: PRODUCT_PRICES,
      discountCodes: DISCOUNT_CODES,
      commissions: COMMISSIONS,
      accountMovements: ACCOUNT_MOVEMENTS,
      representativeRequests: REPRESENTATIVE_REQUESTS,
      settings: SYSTEM_SETTINGS,

      // ── Order mutations ───────────────────────────────────────────────────
      updateOrderStatus: (orderId, newStatus, changedBy, motivo) => {
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId)
          if (!order) return state
          const historyEntry: OrderHistoryEntry = {
            id: generateId('h'),
            orderId,
            estadoAnterior: order.estado,
            estadoNuevo: newStatus,
            cambiadoPor: changedBy,
            motivo,
            createdAt: new Date().toISOString(),
          }
          return {
            orders: state.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    estado: newStatus,
                    ...(newStatus === 'aceptado' && !o.remitoUrl
                      ? { remitoUrl: `#remito-${o.codigo}`, remitoGeneradoEn: new Date().toISOString() }
                      : {}),
                    ...(newStatus === 'rechazado' && motivo ? { motivoRechazo: motivo } : {}),
                  }
                : o
            ),
            orderHistory: [...state.orderHistory, historyEntry],
          }
        })
      },

      updateOrderItems: (orderId, items) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o
            const subtotal = items.reduce(
              (sum, item) =>
                sum + item.precioUnit * item.cantidad * (1 - item.descuentoAplicado / 100),
              0
            )
            const cuponPct = o.cuponDescuentoPct ?? 0
            const total = Math.round(subtotal * (1 - cuponPct / 100))
            return { ...o, items, subtotal: Math.round(subtotal), total }
          }),
        }))
      },

      updateOrderObservaciones: (orderId, observaciones) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, observaciones } : o)),
        }))
      },

      setOrderPicking: (orderId, completado) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, pickingIniciado: true, pickingCompletado: completado }
              : o
          ),
        }))
      },

      togglePickedItem: (orderId, productId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  pickingIniciado: true,
                  items: o.items.map((it) =>
                    it.productId === productId ? { ...it, picked: !it.picked } : it
                  ),
                }
              : o
          ),
        }))
      },

      addOrder: (order) => {
        set((state) => ({
          orders: [...state.orders, order],
          orderHistory: [
            ...state.orderHistory,
            {
              id: generateId('h'),
              orderId: order.id,
              estadoAnterior: null,
              estadoNuevo: order.estado,
              cambiadoPor: 'Sistema',
              createdAt: new Date().toISOString(),
            },
          ],
        }))
      },

      // ── Stock ────────────────────────────────────────────────────────────
      decrementStock: (productId, cantidad, orderId, changedBy) => {
        set((state) => ({
          stock: state.stock.map((s) =>
            s.productId === productId
              ? { ...s, disponible: Math.max(0, s.disponible - cantidad), reservado: Math.max(0, s.reservado - cantidad) }
              : s
          ),
          stockMovements: [
            ...state.stockMovements,
            {
              id: generateId('sm'),
              productId,
              tipo: 'venta',
              cantidad: -cantidad,
              orderId,
              realizadoPor: changedBy,
              createdAt: new Date().toISOString(),
            },
          ],
        }))
      },

      freezeStock: (productId, cantidad, orderId, changedBy) => {
        set((state) => ({
          stock: state.stock.map((s) =>
            s.productId === productId ? { ...s, reservado: s.reservado + cantidad } : s
          ),
          stockMovements: [
            ...state.stockMovements,
            {
              id: generateId('sm'),
              productId,
              tipo: 'reserva',
              cantidad: -cantidad,
              orderId,
              realizadoPor: changedBy,
              createdAt: new Date().toISOString(),
            },
          ],
        }))
      },

      releaseStock: (productId, cantidad, orderId, changedBy) => {
        set((state) => ({
          stock: state.stock.map((s) =>
            s.productId === productId ? { ...s, reservado: Math.max(0, s.reservado - cantidad) } : s
          ),
          stockMovements: [
            ...state.stockMovements,
            {
              id: generateId('sm'),
              productId,
              tipo: 'liberacion_reserva',
              cantidad,
              orderId,
              realizadoPor: changedBy,
              createdAt: new Date().toISOString(),
            },
          ],
        }))
      },

      addStockMovement: (movement) => {
        set((state) => ({
          stockMovements: [
            ...state.stockMovements,
            { ...movement, id: generateId('sm'), createdAt: new Date().toISOString() },
          ],
        }))
      },

      updateStock: (productId, disponible, motivo, changedBy) => {
        const current = get().stock.find((s) => s.productId === productId)
        const diff = disponible - (current?.disponible ?? 0)
        set((state) => ({
          stock: state.stock.map((s) => (s.productId === productId ? { ...s, disponible } : s)),
          stockMovements: [
            ...state.stockMovements,
            {
              id: generateId('sm'),
              productId,
              tipo: 'ajuste_manual',
              cantidad: diff,
              motivo,
              realizadoPor: changedBy,
              createdAt: new Date().toISOString(),
            },
          ],
        }))
      },

      ingresoStock: (productId, cantidad, changedBy, motivo = 'Ingreso de mercadería') => {
        set((state) => ({
          stock: state.stock.map((s) =>
            s.productId === productId ? { ...s, disponible: s.disponible + cantidad } : s
          ),
          stockMovements: [
            ...state.stockMovements,
            {
              id: generateId('sm'),
              productId,
              tipo: 'ingreso',
              cantidad,
              motivo,
              realizadoPor: changedBy,
              createdAt: new Date().toISOString(),
            },
          ],
        }))
      },

      // ── Notifications ────────────────────────────────────────────────────
      markNotificationRead: (notifId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notifId ? { ...n, leida: true } : n
          ),
        }))
      },

      addNotification: (notif) => {
        const newNotif: Notification = {
          ...notif,
          id: generateId('n'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ notifications: [newNotif, ...state.notifications] }))
      },

      // ── Claims ───────────────────────────────────────────────────────────
      addClaim: (claim) => {
        const newClaim: Claim = {
          ...claim,
          id: generateId('cl'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ claims: [...state.claims, newClaim] }))
      },

      updateClaimStatus: (claimId, estado) => {
        set((state) => ({
          claims: state.claims.map((c) => (c.id === claimId ? { ...c, estado } : c)),
        }))
      },

      addClaimNote: (claimId, nota) => {
        set((state) => ({
          claims: state.claims.map((c) =>
            c.id === claimId ? { ...c, notasInternas: [...c.notasInternas, nota] } : c
          ),
        }))
      },

      resolveClaim: (claimId, pedidoIdBonificacion) => {
        set((state) => ({
          claims: state.claims.map((c) =>
            c.id === claimId
              ? {
                  ...c,
                  estado: 'resuelto' as ClaimStatus,
                  bonificadoEnPedidoId: pedidoIdBonificacion,
                  fechaResolucion: new Date().toISOString(),
                }
              : c
          ),
        }))
      },

      // ── Leads ────────────────────────────────────────────────────────────
      addLead: (lead) => {
        const newLead: Lead = {
          ...lead,
          id: generateId('l'),
          notas: [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ leads: [newLead, ...state.leads] }))
      },

      updateLeadStatus: (leadId, estado) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.id === leadId ? { ...l, estado } : l)),
        }))
      },

      assignLead: (leadId, sellerId) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.id === leadId ? { ...l, asignadoA: sellerId } : l)),
        }))
      },

      addLeadNote: (leadId, nota) => {
        const fullNote: LeadNote = {
          ...nota,
          id: generateId('ln'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === leadId ? { ...l, notas: [...l.notas, fullNote] } : l
          ),
        }))
      },

      convertLead: (leadId, clienteId) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === leadId
              ? { ...l, estado: 'convertido' as LeadStatus, clienteIdConvertido: clienteId }
              : l
          ),
        }))
      },

      // ── Campaigns ────────────────────────────────────────────────────────
      addCampaign: (campaign) => {
        set((state) => ({
          campaigns: [{ ...campaign, id: generateId('cmp') }, ...state.campaigns],
        }))
      },

      // ── Assets ───────────────────────────────────────────────────────────
      addAsset: (asset) => {
        set((state) => ({ assets: [...state.assets, { ...asset, id: generateId('a') }] }))
      },

      removeAsset: (assetId) => {
        set((state) => ({ assets: state.assets.filter((a) => a.id !== assetId) }))
      },

      incrementAssetDownload: (assetId, userId) => {
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === assetId ? { ...a, descargas: a.descargas + 1 } : a
          ),
          assetDownloads: [
            ...state.assetDownloads,
            { id: generateId('ad'), assetId, userId, createdAt: new Date().toISOString() },
          ],
        }))
      },

      // ── Clients ──────────────────────────────────────────────────────────
      updateClientStatus: (clientId, status) => {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === clientId ? { ...c, status } : c)),
        }))
      },

      completeClientProfile: (clientId, data) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  cuit: data.cuit,
                  razonSocial: data.razonSocial,
                  direccion: data.direccion,
                  ciudad: data.ciudad,
                  provincia: data.provincia,
                  codigoPostal: data.codigoPostal,
                  telefono: data.telefono ?? c.telefono,
                  profileCompleto: true,
                  status: 'activa',
                }
              : c
          ),
        }))
      },

      toggleClientCtaCteVisibility: (clientId) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId ? { ...c, verCuentaCorriente: !c.verCuentaCorriente } : c
          ),
        }))
      },

      updateClientPlazoPago: (clientId, dias) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId ? { ...c, plazoPagoDias: dias } : c
          ),
        }))
      },

      addClient: (client) => {
        set((state) => ({ clients: [...state.clients, client] }))
      },

      // ── Representative requests ──────────────────────────────────────────
      addRepresentativeRequest: (req) => {
        const newReq: RepresentativeRequest = {
          ...req,
          id: generateId('rr'),
          estado: 'pendiente',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          representativeRequests: [newReq, ...state.representativeRequests],
        }))
      },

      approveRepresentativeRequest: (requestId, sellerId, resueltaPor) => {
        set((state) => ({
          representativeRequests: state.representativeRequests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  estado: 'aprobada' as const,
                  sellerIdAsignado: sellerId,
                  resueltaPor,
                  resueltaEn: new Date().toISOString(),
                }
              : r
          ),
        }))
      },

      rejectRepresentativeRequest: (requestId, motivo, resueltaPor) => {
        set((state) => ({
          representativeRequests: state.representativeRequests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  estado: 'rechazada' as const,
                  motivoRechazo: motivo,
                  resueltaPor,
                  resueltaEn: new Date().toISOString(),
                }
              : r
          ),
        }))
      },

      // ── Coupons ──────────────────────────────────────────────────────────
      validateCoupon: (codigo) => {
        const state = get()
        const c = state.discountCodes.find((d) => d.codigo.toLowerCase() === codigo.toLowerCase())
        if (!c) return null
        if (!c.activo) return null
        if (c.usosActual >= c.usosMax) return null
        if (c.fechaVencimiento && new Date(c.fechaVencimiento) < new Date()) return null
        return c
      },

      // ── Helpers / Derived ─────────────────────────────────────────────────
      getOrderWithDetails: (orderId) => {
        const state = get()
        const order = state.orders.find((o) => o.id === orderId)
        if (!order) return null
        const cliente = state.clients.find((c) => c.id === order.clienteId) ?? null
        const seller = order.sellerId
          ? (state.sellers.find((s) => s.id === order.sellerId) ?? null)
          : null
        const history = state.orderHistory
          .filter((h) => h.orderId === orderId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        return { ...order, cliente, seller, history }
      },

      getProductPrice: (productId, priceListId) => {
        const state = get()
        const entry = state.productPrices.find(
          (pp) => pp.productId === productId && pp.priceListId === priceListId
        )
        return entry?.precioArs ?? 0
      },

      getClientPriceList: (clientId) => {
        const state = get()
        const client = state.clients.find((c) => c.id === clientId)
        if (!client) return null
        return state.priceLists.find((pl) => pl.id === client.priceListId) ?? null
      },

      getStockAvailable: (productId) => {
        const state = get()
        const s = state.stock.find((st) => st.productId === productId)
        if (!s) return 0
        return Math.max(0, s.disponible - s.reservado)
      },

      getStockState: (productId) => {
        const state = get()
        const product = state.products.find((p) => p.id === productId)
        const available = get().getStockAvailable(productId)
        if (available <= 0) return 'sin_stock'
        const threshold = product?.stockCriticalThreshold ?? state.settings.stockCriticalDefaultThreshold
        if (available <= threshold) return 'pocas_unidades'
        return 'disponible'
      },

      getProductSubstitutes: (productId) => {
        const state = get()
        const product = state.products.find((p) => p.id === productId)
        if (!product) return []
        const sorted = [...product.substitutes].sort((a, b) => a.preferenceOrder - b.preferenceOrder)
        return sorted
          .map((s) => state.products.find((p) => p.id === s.substituteProductId))
          .filter((p): p is Product => Boolean(p))
      },

      getClientPendingOrders: (clientId) => {
        return get().orders.filter(
          (o) => o.clienteId === clientId && o.estado === 'pendiente_revision'
        )
      },

      hasOpenClaims: (clientId) => {
        return get().claims.some(
          (c) => c.clienteId === clientId && c.estado !== 'resuelto'
        )
      },

      getClientOpenClaims: (clientId) => {
        return get().claims.filter(
          (c) => c.clienteId === clientId && c.estado !== 'resuelto'
        )
      },

      getClientBalance: (clientId) => {
        const movements = get().accountMovements.filter((m) => m.clienteId === clientId)
        return movements.reduce((sum, m) => sum + m.monto, 0)
      },

      getSellerCommissionsMonth: (sellerId, monthsAgo = 0) => {
        const now = new Date()
        const targetMonth = now.getMonth() - monthsAgo
        const targetYear = now.getFullYear() + Math.floor(targetMonth / 12)
        const normalizedMonth = ((targetMonth % 12) + 12) % 12
        return get().commissions.filter((c) => {
          if (c.sellerId !== sellerId) return false
          const d = new Date(c.fechaCalculo)
          return d.getMonth() === normalizedMonth && d.getFullYear() === targetYear
        })
      },

      getInactiveClients: (daysSinceLastPurchase) => {
        const cutoff = Date.now() - daysSinceLastPurchase * 24 * 60 * 60 * 1000
        return get().clients.filter((c) => {
          if (c.status !== 'activa') return false
          if (!c.ultimaCompra) return true
          return new Date(c.ultimaCompra).getTime() < cutoff
        })
      },
    }),
    {
      name: 'bianni-data',
      version: 3,
      merge: (persisted, current) => ({
        ...(persisted as Partial<DataState>),
        ...current,
        // Always re-seed static / config data from mock on version bump
        products: PRODUCTS,
        categories: CATEGORIES,
        priceLists: PRICE_LISTS,
        productPrices: PRODUCT_PRICES,
        sellers: SELLERS,
        assets: ASSETS,
        settings: SYSTEM_SETTINGS,
      }),
    }
  )
)
