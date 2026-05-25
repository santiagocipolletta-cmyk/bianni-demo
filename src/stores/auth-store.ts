import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DemoUser } from '@/types'
import { DEMO_USERS } from '@/lib/mock-data'
import { useCartStore } from './cart-store'

interface AuthState {
  user: DemoUser | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  setHasHydrated: (v: boolean) => void
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: (email: string, password: string) => {
        const found = DEMO_USERS.find(
          (u) => u.email === email.trim().toLowerCase() && u.password === password
        )

        if (!found) {
          return { success: false, error: 'Email o contraseña incorrectos.' }
        }

        set({ user: found, isAuthenticated: true })

        // Set cookie for middleware
        setCookie('bianni-auth', 'true')
        setCookie('bianni-user-role', found.role)
        setCookie('bianni-user-id', found.id)

        return { success: true }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        deleteCookie('bianni-auth')
        deleteCookie('bianni-user-role')
        deleteCookie('bianni-user-id')
        // Vaciar el carrito al cerrar sesión (carrito NO persistente entre sesiones)
        useCartStore.getState().clearCart()
      },
    }),
    {
      name: 'bianni-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          // Re-sync cookie on hydration if user is authenticated
          if (state.isAuthenticated && state.user) {
            setCookie('bianni-auth', 'true')
            setCookie('bianni-user-role', state.user.role)
            setCookie('bianni-user-id', state.user.id)
          }
          // Mark hydration complete
          state.setHasHydrated(true)
        }
      },
    }
  )
)
