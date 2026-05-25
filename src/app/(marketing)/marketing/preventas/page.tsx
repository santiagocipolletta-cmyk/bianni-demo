'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useDataStore } from '@/stores/data-store'
import { cn, formatARS } from '@/lib/utils'
import { toast } from 'sonner'
import { Sparkles, Check, X } from 'lucide-react'

export default function MarketingPreventasPage() {
  // Marketing puede marcar/desmarcar productos como preventa y editar el cupo
  const { products, updateProduct, orders } = useDataStore()
  const [filter, setFilter] = useState<'todos' | 'preventa' | 'regulares'>('preventa')

  const filtered = products.filter((p) => {
    if (filter === 'todos') return true
    return filter === 'preventa' ? p.preventa : !p.preventa
  })

  function togglePreventa(productId: string, current: boolean) {
    updateProduct(productId, { preventa: !current })
    toast.success(
      !current ? 'Producto marcado como PREVENTA' : 'Producto quitado de preventa',
      { duration: 1500 }
    )
  }

  function updateCupo(productId: string, cupo: number) {
    updateProduct(productId, { cupoPreventa: cupo > 0 ? cupo : undefined })
  }

  // Cuenta reservas por producto de preventa
  function getReservasCount(productId: string) {
    return orders
      .filter((o) => ['pendiente_revision', 'modificado', 'aceptado', 'reserva_preventa'].includes(o.estado))
      .flatMap((o) => o.items)
      .filter((it) => it.productId === productId)
      .reduce((s, it) => s + it.cantidad, 0)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-400" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-emerald-400">Gestión de preventa</p>
          </div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">PREVENTAS</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            Marcá qué productos están disponibles para reserva anticipada y definí el cupo guía
          </p>
        </div>
      </div>

      <div className="flex gap-0 border border-[#2A2A2A]">
        {(['preventa', 'regulares', 'todos'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn(
            'px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] last:border-r-0',
            filter === f ? 'bg-[#1A1A1A] text-white' : 'text-[#555] hover:text-[#A0A0A0]'
          )}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((product) => {
          const isPreventa = product.preventa
          const reservas = isPreventa ? getReservasCount(product.id) : 0
          const cupo = product.cupoPreventa ?? 0
          const cupoExcedido = cupo > 0 && reservas > cupo
          const pctOcupado = cupo > 0 ? Math.min(100, (reservas / cupo) * 100) : 0
          return (
            <div key={product.id} className={cn(
              'bg-[#111] border overflow-hidden',
              isPreventa ? 'border-emerald-700' : 'border-[#2A2A2A]'
            )}>
              <div className="relative aspect-square bg-stone-100">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                {isPreventa && (
                  <span className="absolute top-2 left-2 bg-emerald-500 text-black text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 font-medium">
                    Preventa
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="text-xs text-white font-light">{product.name}</p>
                <p className="text-[10px] text-[#A0A0A0] font-mono">{product.sku}</p>
                <p className="text-[10px] text-[#666]">PVR {formatARS(product.pvr)}</p>

                {isPreventa && (
                  <>
                    {/* Input cupo + barra */}
                    <div className="space-y-1 pt-1 border-t border-[#1A1A1A]">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[9px] tracking-[0.15em] uppercase text-[#555]">Cupo</label>
                        <input
                          type="number"
                          min={0}
                          value={cupo}
                          onChange={(e) => updateCupo(product.id, Number(e.target.value))}
                          className="w-16 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1 text-right focus:outline-none focus:border-[#444]"
                        />
                      </div>
                      {cupo > 0 && (
                        <>
                          <div className="h-1 bg-[#1A1A1A] overflow-hidden">
                            <div
                              className={cn('h-full transition-all', cupoExcedido ? 'bg-yellow-500' : 'bg-emerald-500')}
                              style={{ width: `${pctOcupado}%` }}
                            />
                          </div>
                          <p className={cn(
                            'text-[9px]',
                            cupoExcedido ? 'text-yellow-400' : 'text-[#666]'
                          )}>
                            {reservas} / {cupo} reservadas {cupoExcedido && '· cupo excedido'}
                          </p>
                        </>
                      )}
                    </div>
                  </>
                )}

                <button onClick={() => togglePreventa(product.id, isPreventa)} className={cn(
                  'w-full flex items-center justify-center gap-1.5 border text-[9px] tracking-[0.15em] uppercase px-2 py-1.5 transition-colors',
                  isPreventa
                    ? 'border-red-700 text-red-400 hover:bg-red-950'
                    : 'border-emerald-700 text-emerald-400 hover:bg-emerald-950'
                )}>
                  {isPreventa ? <><X size={11} /> Quitar de preventa</> : <><Check size={11} /> Marcar preventa</>}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
