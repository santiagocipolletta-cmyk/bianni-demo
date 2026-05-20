'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { Logo } from '@/components/brand/Logo'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { FolderOpen, Sparkles, LogOut, Palette } from 'lucide-react'

const NAV_LINKS = [
  { href: '/marketing/biblioteca', label: 'Biblioteca', icon: FolderOpen },
  { href: '/marketing/preventas', label: 'Preventa', icon: Sparkles },
]

function SidebarContent() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-[#2A2A2A] px-6 gap-2">
        <Logo variant="wordmark" className="h-6" />
        <span className="text-[9px] tracking-[0.2em] uppercase text-[#666] pl-2 border-l border-[#2A2A2A] ml-2">Marketing</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-xs tracking-[0.15em] uppercase transition-colors',
              isActive ? 'bg-[#1A1A1A] text-white' : 'text-[#A0A0A0] hover:bg-[#222] hover:text-white'
            )}>
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[#2A2A2A] px-4 py-4">
        {user && (
          <div className="mb-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-0.5">Marketing</p>
            <p className="text-sm text-white font-light truncate">{user.name}</p>
          </div>
        )}
        <button onClick={logout} className="flex items-center gap-2 text-[#555] hover:text-white transition-colors text-xs tracking-[0.15em] uppercase mt-2">
          <LogOut size={14} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['marketing', 'admin']}>
      <div className="flex h-screen overflow-hidden bg-[#000]">
        <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col border-r border-[#2A2A2A] bg-[#0A0A0A]">
          <SidebarContent />
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#2A2A2A] bg-[#0A0A0A] px-4 lg:px-6">
            <div className="lg:hidden flex items-center gap-2">
              <Logo variant="wordmark" className="h-5" />
              <Palette size={14} className="text-emerald-400" />
            </div>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </RoleGuard>
  )
}
