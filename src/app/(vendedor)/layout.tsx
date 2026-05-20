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
  BarChart2,
  Users,
  ShoppingBag,
  Tag,
  LogOut,
  Menu,
  X,
  AlertCircle,
  DollarSign,
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { href: '/clientes', label: 'Mis Clientes', icon: Users },
  { href: '/pedido-nuevo', label: 'Nuevo Pedido', icon: ShoppingBag },
  { href: '/codigos', label: 'Códigos', icon: Tag },
  { href: '/vendedor/reclamos', label: 'Reclamos', icon: AlertCircle },
  { href: '/vendedor/comisiones', label: 'Mis Comisiones', icon: DollarSign },
]

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { sellers } = useDataStore()

  const seller = sellers.find((s) => s.id === user?.sellerId)

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[#2A2A2A] px-6">
        <Logo variant="wordmark" className="h-6" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
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
        {seller && (
          <div className="mb-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-0.5">Vendedor</p>
            <p className="text-sm text-white font-light truncate">{seller.nombre}</p>
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

function VendedorLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          {children}
        </main>
      </div>
    </div>
  )
}

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['vendedor', 'admin']}>
      <VendedorLayoutInner>{children}</VendedorLayoutInner>
    </RoleGuard>
  )
}
