import { create } from 'zustand'

export interface CartItem {
  productId: string
  cantidad: number
  precioUnit: number
  descuentoAplicado: number
}

interface CartState {
  items: CartItem[]
  clientId: string | null
  priceListId: string | null
  confirming: boolean

  addItem: (productId: string, precio: number) => void
  removeItem: (productId: string) => void
  updateCantidad: (productId: string, cantidad: number) => void
  clearCart: () => void
  setClient: (clientId: string, priceListId: string) => void
  setConfirming: (v: boolean) => void

  getTotalUnidades: () => number
  getTotalARS: () => number
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  clientId: null,
  priceListId: null,
  confirming: false,

  addItem: (productId, precio) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === productId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, cantidad: i.cantidad + 1 } : i
          ),
        }
      }
      return {
        items: [
          ...state.items,
          { productId, cantidad: 1, precioUnit: precio, descuentoAplicado: 0 },
        ],
      }
    })
  },

  removeItem: (productId) => {
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }))
  },

  updateCantidad: (productId, cantidad) => {
    if (cantidad <= 0) {
      get().removeItem(productId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, cantidad } : i
      ),
    }))
  },

  clearCart: () => set({ items: [], confirming: false }),
  setConfirming: (v) => set({ confirming: v }),

  setClient: (clientId, priceListId) => set({ clientId, priceListId }),

  getTotalUnidades: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),

  getTotalARS: () =>
    get().items.reduce(
      (sum, i) => sum + i.precioUnit * i.cantidad * (1 - i.descuentoAplicado / 100),
      0
    ),
}))
