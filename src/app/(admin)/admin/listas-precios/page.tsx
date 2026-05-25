'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useDataStore } from '@/stores/data-store'
import { cn, formatARS } from '@/lib/utils'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, TrendingUp, X } from 'lucide-react'

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

function BulkPriceUpdateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { priceLists, categories, bulkUpdatePrices } = useDataStore()
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [pct, setPct] = useState<number>(10)

  function handleSubmit() {
    bulkUpdatePrices(
      {
        categoryId: selectedCategoryId || undefined,
        priceListId: selectedListId || undefined,
      },
      pct
    )
    const listName = selectedListId ? priceLists.find((pl) => pl.id === selectedListId)?.name : 'todas las listas'
    const catName = selectedCategoryId ? categories.find((c) => c.id === selectedCategoryId)?.name : 'todas las categorías'
    toast.success(`Precios ${pct > 0 ? 'aumentados' : 'reducidos'} ${Math.abs(pct)}% — ${catName} · ${listName}`)
    onClose()
    setPct(10)
    setSelectedListId('')
    setSelectedCategoryId('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-[#111] border border-[#2A2A2A] p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="font-display text-xl text-white tracking-[0.05em]">
                ACTUALIZACIÓN MASIVA
              </Dialog.Title>
              <Dialog.Description className="text-[#555] text-xs tracking-[0.1em] mt-1">
                Aumento/reducción por porcentaje
              </Dialog.Description>
            </div>
            <Dialog.Close className="text-[#555] hover:text-white"><X size={18} /></Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Lista de precios (opcional)</label>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              >
                <option value="">Todas las listas</option>
                {priceLists.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Categoría (opcional)</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Porcentaje de cambio</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={pct}
                  onChange={(e) => setPct(Number(e.target.value))}
                  className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-2xl font-light px-3 py-3 focus:outline-none focus:border-[#444]"
                />
                <span className="text-[#555] text-2xl">%</span>
              </div>
              <p className="text-[10px] text-[#555] mt-1">
                Positivo: aumento. Negativo: descuento. Ej: <code className="text-emerald-400">15</code> sube 15%, <code className="text-red-400">-10</code> baja 10%.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="flex-1 border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase py-2.5 hover:bg-[#1A1A1A]">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="flex-1 border border-white bg-white text-black text-[10px] tracking-[0.15em] uppercase py-2.5 hover:bg-zinc-200 font-medium">
                Aplicar
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default function AdminListasPreciosPage() {
  const { priceLists } = useDataStore()
  const [bulkOpen, setBulkOpen] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">LISTAS DE PRECIOS</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            {priceLists.length} listas activas
          </p>
        </div>
        <button
          onClick={() => setBulkOpen(true)}
          className="flex items-center gap-2 border border-white text-white text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 hover:bg-white hover:text-black transition-colors"
        >
          <TrendingUp size={12} /> Actualización masiva
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {priceLists.map((pl) => (
          <PriceListCard key={pl.id} priceListId={pl.id} />
        ))}
      </div>

      <BulkPriceUpdateDialog open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  )
}
