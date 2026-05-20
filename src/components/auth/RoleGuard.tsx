'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types'

const ROLE_DEFAULTS: Record<UserRole, string> = {
  distribuidor: '/catalogo',
  vendedor: '/dashboard',
  admin: '/admin/pedidos',
  marketing: '/marketing/biblioteca',
}

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()

  useEffect(() => {
    // Wait until Zustand has rehydrated from localStorage before deciding
    if (!_hasHydrated) return

    if (!isAuthenticated || !user) {
      router.replace('/')
      return
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(ROLE_DEFAULTS[user.role])
    }
  }, [isAuthenticated, user, allowedRoles, router, _hasHydrated])

  // While hydrating, render nothing (no flicker, no premature redirect)
  if (!_hasHydrated) return null

  if (!isAuthenticated || !user) return null
  if (!allowedRoles.includes(user.role)) return null

  return <>{children}</>
}
