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
  Notification,
  Claim,
  Asset,
  Lead,
  Campaign,
  PriceList,
  ProductPrice,
  DiscountCode,
  OrderWithDetails,
} from '@/types'
import {
  PRODUCTS,
  CATEGORIES,
  ORDERS,
  ORDER_HISTORY,
  CLIENTS,
  SELLERS,
  STOCK,
  NOTIFICATIONS,
  CLAIMS,
  ASSETS,
  LEADS,
  CAMPAIGNS,
  PRICE_LISTS,
  PRODUCT_PRICES,
  DISCOUNT_CODES,
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
  notifications: Notification[]
  claims: Claim[]
  assets: Asset[]
  leads: Lead[]
  campaigns: Campaign[]
  priceLists: PriceList[]
  productPrices: ProductPrice[]
  discountCodes: DiscountCode[]

  // Order mutations
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    changedBy: string,
    motivo?: string
  ) => void
  updateOrderItems: (orderId: string, items: OrderItem[]) => void
  addOrder: (order: Order) => void

  // Stock mutations
  decrementStock: (productId: string, cantidad: number) => void
  updateStock: (productId: string, disponible: number) => void

  // Notification mutations
  markNotificationRead: (notifId: string) => void
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>) => void

  // Claims
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt'>) => void
  updateClaimStatus: (claimId: string, estado: Claim['estado'], notas?: string) => void

  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void
  updateLeadStatus: (leadId: string, estado: Lead['estado']) => void

  // Campaigns
  addCampaign: (campaign: Omit<Campaign, 'id'>) => void

  // Assets
  addAsset: (asset: Omit<Asset, 'id'>) => void
  removeAsset: (assetId: string) => void

  // Helpers
  getOrderWithDetails: (orderId: string) => OrderWithDetails | null
  getProductPrice: (productId: string, priceListId: string) => number
  getClientPriceList: (clientId: string) => PriceList | null
}

let idCounter = 1000

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${idCounter++}`
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Initial data from mock
      products: PRODUCTS,
      categories: CATEGORIES,
      orders: ORDERS,
      orderHistory: ORDER_HISTORY,
      clients: CLIENTS,
      sellers: SELLERS,
      stock: STOCK,
      notifications: NOTIFICATIONS,
      claims: CLAIMS,
      assets: ASSETS,
      leads: LEADS,
      campaigns: CAMPAIGNS,
      priceLists: PRICE_LISTS,
      productPrices: PRODUCT_PRICES,
      discountCodes: DISCOUNT_CODES,

      // ── Order mutations ────────────────────────────────────────────────────

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
              o.id === orderId ? { ...o, estado: newStatus } : o
            ),
            orderHistory: [...state.orderHistory, historyEntry],
          }
        })
      },

      updateOrderItems: (orderId, items) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o
            const total = items.reduce(
              (sum, item) =>
                sum + item.precioUnit * item.cantidad * (1 - item.descuentoAplicado / 100),
              0
            )
            return { ...o, items, total: Math.round(total) }
          }),
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

      // ── Stock mutations ────────────────────────────────────────────────────

      decrementStock: (productId, cantidad) => {
        set((state) => ({
          stock: state.stock.map((s) =>
            s.productId === productId
              ? { ...s, disponible: Math.max(0, s.disponible - cantidad) }
              : s
          ),
        }))
      },

      updateStock: (productId, disponible) => {
        set((state) => ({
          stock: state.stock.map((s) =>
            s.productId === productId ? { ...s, disponible } : s
          ),
        }))
      },

      // ── Notification mutations ─────────────────────────────────────────────

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
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }))
      },

      // ── Claims ────────────────────────────────────────────────────────────

      addClaim: (claim) => {
        const newClaim: Claim = {
          ...claim,
          id: generateId('cl'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          claims: [...state.claims, newClaim],
        }))
      },

      updateClaimStatus: (claimId, estado, notas) => {
        set((state) => ({
          claims: state.claims.map((c) =>
            c.id === claimId
              ? { ...c, estado, ...(notas !== undefined ? { notasInternas: notas } : {}) }
              : c
          ),
        }))
      },

      // ── Leads ─────────────────────────────────────────────────────────────

      addLead: (lead) => {
        const newLead: Lead = {
          ...lead,
          id: generateId('lead'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          leads: [newLead, ...state.leads],
        }))
      },

      updateLeadStatus: (leadId, estado) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === leadId ? { ...l, estado } : l
          ),
        }))
      },

      // ── Campaigns ─────────────────────────────────────────────────────────

      addCampaign: (campaign) => {
        const newCampaign: Campaign = {
          ...campaign,
          id: generateId('camp'),
        }
        set((state) => ({
          campaigns: [newCampaign, ...state.campaigns],
        }))
      },

      // ── Assets ────────────────────────────────────────────────────────────

      addAsset: (asset) => {
        const newAsset: Asset = {
          ...asset,
          id: generateId('a'),
        }
        set((state) => ({
          assets: [...state.assets, newAsset],
        }))
      },

      removeAsset: (assetId) => {
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== assetId),
        }))
      },

      // ── Helpers ───────────────────────────────────────────────────────────

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
    }),
    {
      name: 'bianni-data',
    }
  )
)
