'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Logo } from '@/components/brand/Logo'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import type { UserRole } from '@/types'
import * as Dialog from '@radix-ui/react-dialog'

const ROLE_REDIRECTS: Record<UserRole, string> = {
  distribuidor: '/catalogo',
  vendedor: '/dashboard',
  admin: '/admin/pedidos',
  marketing: '/marketing/biblioteca',
}

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Small delay for UX feel
    await new Promise((r) => setTimeout(r, 600))

    const result = login(email, password)
    setLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Error al ingresar.')
      return
    }

    // Get role from store after login
    const { user } = useAuthStore.getState()
    if (user) {
      onOpenChange(false)
      router.push(ROLE_REDIRECTS[user.role])
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2 bg-[#0A0A0A] border border-[#2A2A2A] p-10 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Title className="sr-only">Ingresar a tu cuenta</Dialog.Title>

          {/* Close button */}
          <Dialog.Close className="absolute right-5 top-5 text-[#555] hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Dialog.Close>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo variant="full" className="h-12" />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-white text-xl font-light tracking-[0.15em] uppercase mb-2">
              Ingresar a tu cuenta
            </h2>
            <p className="text-[#555] text-xs tracking-wide leading-relaxed">
              Ingresá con tus credenciales para acceder al catálogo exclusivo.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#888] font-medium">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-[#111] border border-[#2A2A2A] text-white placeholder-[#444] px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#888] font-medium">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-[#2A2A2A] text-white placeholder-[#444] px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[#DC2626] text-xs tracking-wide text-center border border-[#DC2626]/20 bg-[#DC2626]/5 py-2 px-4">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-xs font-medium tracking-[0.2em] uppercase py-4 hover:bg-[#e0e0e0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[#444] text-xs mt-8 tracking-wide">
            ¿No tenés acceso aún?{' '}
            <a
              href="mailto:contacto@bianni.com"
              className="text-[#888] hover:text-white transition-colors underline underline-offset-2"
            >
              Contactá a Bianni
            </a>
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
