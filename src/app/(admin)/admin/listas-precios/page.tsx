'use client'

import { useState } from 'react'
import { useDataStore } from '@/stores/data-store'
import { cn, formatARS } from '@/lib/utils'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp } from 'lucide-react'

function PriceListCard({ priceListId }: { priceListId: string }) {
  const { priceLists, productPrices, products } = useDataStore()
  const [expanded, setExpanded] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  const priceList = priceLists.find((pl) => pl.id === priceListId)
  const prices = productPrices.filter((pp) => pp.priceListId === priceListId)
  const count = prices.length
  const avg = count > 0
    ? prices.reduce((s, p) => s + p.precioArs, 0) / count
    : 0

  function startEdit(productId: string, currentPrice: number) {
    setEditingProductId(productId)
    setEditValue(currentPrice)
  }

  function commitEdit() {
    toast.success('Precio actualizado — demo')
    setEditingProductId(null)
  }

  if (!priceList) return null

  return (
    <div className="bg-[#111] border border-[#2A2A2A]">
      {/* Card header */}
      <div className="p-6">
        <p className="font-display text-2xl text-white tracking-[0.05em] mb-4">{priceList.name}</p>
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">{count} productos</p>
          <p className="text-white text-lg font-light">
            {formatARS(avg)} <span className="text-[#555] text-xs">promedio</span>
          </p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            'mt-4 flex items-center gap-1 border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors'
          )}
        >
          {expanded ? (
            <>
              <ChevronUp size={11} /> Cerrar
            </>
          ) : (
            <>
              <ChevronDown size={11} /> Ver precios
            </>
          )}
        </button>
      </div>

      {/* Expandable product table */}
      {expanded && (
        <div className="border-t border-[#2A2A2A] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
                {['SKU', 'Producto', 'Precio ARS'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prices.map((pp) => {
                const product = products.find((p) => p.id === pp.productId)
                const isEditing = editingProductId === pp.productId
                return (
                  <tr
                    key={pp.productId}
                    className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors"
                  >
                    <td className="px-4 py-2 text-[#555] text-xs font-mono">
                      {product?.sku ?? pp.productId}
                    </td>
                    <td className="px-4 py-2 text-[#A0A0A0] text-xs">
                      {product?.name ?? pp.productId}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editValue}
                          autoFocus
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit()
                            if (e.key === 'Escape') setEditingProductId(null)
                          }}
                          className="w-28 bg-[#1A1A1A] border border-[#444] text-white text-xs px-2 py-1 focus:outline-none focus:border-white"
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(pp.productId, pp.precioArs)}
                          className="text-white text-sm font-light hover:underline cursor-pointer"
                          title="Click para editar"
                        >
                          {formatARS(pp.precioArs)}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AdminListasPreciosPage() {
  const { priceLists } = useDataStore()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">LISTAS DE PRECIOS</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          {priceLists.length} listas activas
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {priceLists.map((pl) => (
          <PriceListCard key={pl.id} priceListId={pl.id} />
        ))}
      </div>
    </div>
  )
}
