'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { Logo } from '@/components/brand/Logo'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import {
  Package,
  ShoppingCart,
  CreditCard,
  MessageSquareWarning,
  FolderOpen,
  LogOut,
  Menu,
  X,
  Sparkles,
  AlertTriangle,
  MapPin,
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo', icon: Package },
  { href: '/preventas', label: 'Preventa', icon: Sparkles },
  { href: '/pedidos', label: 'Mis Pedidos', icon: ShoppingCart },
  { href: '/cuenta', label: 'Cuenta Corriente', icon: CreditCard },
  { href: '/cuenta/direcciones', label: 'Mis direcciones', icon: MapPin },
  { href: '/reclamos', label: 'Garantía', icon: MessageSquareWarning },
  { href: '/contenido', label: 'Contenido', icon: FolderOpen },
]

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { clients } = useDataStore()

  const client = clients.find((c) => c.id === user?.clientId)

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[#2A2A2A] px-6">
        <Logo variant="wordmark" className="h-6" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          // /cuenta no debe marcarse activo cuando estamos en /cuenta/direcciones
          const isExact = pathname === href
          const isNested = pathname.startsWith(href + '/')
          const hasMoreSpecific = NAV_LINKS.some((l) => l.href !== href && l.href.startsWith(href + '/'))
          const isActive = isExact || (isNested && !hasMoreSpecific)
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-xs tracking-[0.15em] uppercase transition-colors',
                isActive
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#A0A0A0] hover:bg-[#222] hover:text-white'
              )}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-[#2A2A2A] px-4 py-4">
        {client && (
          <div className="mb-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-0.5">Cliente</p>
            <p className="text-sm text-white font-light truncate">{client.nombre}</p>
          </div>
        )}
        {user && (
          <div className="mb-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-0.5">Rol</p>
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wide">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-[#555] hover:text-white transition-colors text-xs tracking-[0.15em] uppercase mt-2"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function DistribuidorLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthStore()
  const { clients } = useDataStore()
  const client = clients.find((c) => c.id === user?.clientId)
  const showProfileBanner = client?.profileCompleto === false

  return (
    <div className="flex h-screen overflow-hidden bg-[#000]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col border-r border-[#2A2A2A] bg-[#0A0A0A]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-56 flex-col border-r border-[#2A2A2A] bg-[#0A0A0A] transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'flex translate-x-0' : 'flex -translate-x-full'
        )}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 text-[#555] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
        <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#2A2A2A] bg-[#0A0A0A] px-4 lg:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#A0A0A0] hover:text-white transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="lg:hidden">
            <Logo variant="wordmark" className="h-5" />
          </div>
          <div className="hidden lg:block" />

          {/* Right side: bell */}
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {showProfileBanner && (
            <Link
              href="/cuenta/completar"
              className="flex items-center justify-center gap-2 bg-yellow-500 text-black px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-yellow-400 transition-colors"
            >
              <AlertTriangle size={13} strokeWidth={2} />
              Completá tus datos para poder hacer pedidos
              <span aria-hidden="true">→</span>
            </Link>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DistribuidorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['distribuidor', 'admin']}>
      <DistribuidorLayoutInner>{children}</DistribuidorLayoutInner>
    </RoleGuard>
  )
}
