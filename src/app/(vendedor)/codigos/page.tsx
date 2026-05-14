'use client'

import { useMemo } from 'react'
import { Copy, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'

export default function CodigosPage() {
  const { user } = useAuthStore()
  const { discountCodes } = useDataStore()

  const sellerId = user?.sellerId

  const myCodes = useMemo(
    () => discountCodes.filter((dc) => dc.sellerId === sellerId),
    [discountCodes, sellerId]
  )

  function handleCopy(codigo: string) {
    navigator.clipboard.writeText(codigo).then(() => {
      toast.success('¡Código copiado!')
    })
  }

  return (
    <div className="min-h-full bg-[#000] px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-3">
        <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
          Códigos de Descuento
        </h1>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
          Compartí estos códigos con tus clientes para desbloquear descuentos especiales
        </p>
      </div>

      {/* Info note */}
      <div className="mb-8 border border-[#2A2A2A] px-4 py-3 bg-[#0A0A0A]">
        <p className="text-[10px] tracking-[0.1em] text-[#555]">
          En producción, el cliente ingresa este código al confirmar su pedido para aplicar el
          descuento automáticamente.
        </p>
      </div>

      {myCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Tag size={24} strokeWidth={1} className="text-[#2A2A2A]" />
          <p className="text-[#555] text-xs tracking-[0.2em] uppercase">
            No tenés códigos asignados
          </p>
        </div>
      ) : (
        <div className="grid gap-px bg-[#2A2A2A] sm:grid-cols-2 lg:grid-cols-3">
          {myCodes.map((dc) => {
            const usagePct = dc.usosMax > 0 ? (dc.usosActual / dc.usosMax) * 100 : 0

            return (
              <div key={dc.id} className="bg-[#0A0A0A] p-6 flex flex-col gap-5">
                {/* Code + status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-2xl text-white tracking-[0.1em]">{dc.codigo}</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mt-1">
                      {dc.porcentaje}% OFF
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-[9px] tracking-[0.2em] uppercase px-2 py-1 flex-shrink-0',
                      dc.activo
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-zinc-900 text-zinc-500'
                    )}
                  >
                    {dc.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Usage meter */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-[9px] tracking-[0.15em] uppercase text-[#555]">Usos</p>
                    <p className="text-[9px] text-[#A0A0A0]">
                      {dc.usosActual} / {dc.usosMax}
                    </p>
                  </div>
                  <div className="h-0.5 bg-[#2A2A2A] w-full">
                    <div
                      className={cn(
                        'h-0.5 transition-all',
                        usagePct >= 90
                          ? 'bg-red-500'
                          : usagePct >= 60
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                      )}
                      style={{ width: `${Math.min(usagePct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(dc.codigo)}
                  disabled={!dc.activo}
                  className={cn(
                    'flex items-center justify-center gap-2 border text-[10px] tracking-[0.2em] uppercase px-3 py-2.5 transition-colors',
                    dc.activo
                      ? 'border-[#2A2A2A] text-[#A0A0A0] hover:border-white hover:text-white'
                      : 'border-[#1A1A1A] text-[#333] cursor-not-allowed'
                  )}
                >
                  <Copy size={12} strokeWidth={1.5} />
                  Copiar código
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
