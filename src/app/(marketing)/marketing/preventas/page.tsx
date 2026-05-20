'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useDataStore } from '@/stores/data-store'
import { cn, formatARS } from '@/lib/utils'
import { toast } from 'sonner'
import { Sparkles, Check, X } from 'lucide-react'

export default function MarketingPreventasPage() {
  // Marketing puede marcar/desmarcar productos como preventa
  const { products } = useDataStore()
  const [filter, setFilter] = useState<'todos' | 'preventa' | 'regulares'>('preventa')
  const [localOverrides, setLocalOverrides] = useState<Record<string, boolean>>({})

  const filtered = products.filter((p) => {
    if (filter === 'todos') return true
    const isPreventa = localOverrides[p.id] !== undefined ? localOverrides[p.id] : p.preventa
    return filter === 'preventa' ? isPreventa : !isPreventa
  })

  function togglePreventa(productId: string, current: boolean) {
    setLocalOverrides({ ...localOverrides, [productId]: !current })
    toast.success(
      !current ? 'Producto marcado como PREVENTA' : 'Producto quitado de preventa',
      { duration: 1500 }
    )
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
            Marcá qué productos están disponibles para reserva anticipada
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
          const isPreventa = localOverrides[product.id] !== undefined ? localOverrides[product.id] : product.preventa
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
