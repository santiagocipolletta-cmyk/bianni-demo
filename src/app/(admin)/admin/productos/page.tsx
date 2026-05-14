'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import type { Product } from '@/types'

interface EditForm {
  name: string
  description: string
  badge: Product['badge']
  active: boolean
}

function EditProductDialog({
  product,
  open,
  onClose,
}: {
  product: Product | null
  open: boolean
  onClose: () => void
}) {
  const { categories } = useDataStore()
  const [form, setForm] = useState<EditForm>({
    name: product?.name ?? '',
    description: product?.description ?? '',
    badge: product?.badge ?? null,
    active: product?.active ?? true,
  })

  // Sync when product changes
  function handleOpen(isOpen: boolean) {
    if (isOpen && product) {
      setForm({
        name: product.name,
        description: product.description,
        badge: product.badge,
        active: product.active,
      })
    }
    if (!isOpen) onClose()
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Cambios guardados — demo')
    onClose()
  }

  if (!product) return null

  const category = categories.find((c) => c.id === product.categoryId)

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#111] border border-[#2A2A2A] p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Dialog.Title className="font-display text-xl text-white tracking-[0.05em]">
                EDITAR PRODUCTO
              </Dialog.Title>
              <p className="text-[#555] text-[10px] tracking-[0.15em] uppercase mt-1">
                {product.sku} · {category?.name}
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="text-[#555] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 resize-none focus:outline-none focus:border-[#444]"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                Badge
              </label>
              <select
                value={form.badge ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  setForm((f) => ({ ...f, badge: val === '' ? null : (val as Product['badge']) }))
                }}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              >
                <option value="">Sin badge</option>
                <option value="NUEVO">NUEVO</option>
                <option value="TEMPORADA">TEMPORADA</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 bg-[#0A0A0A] border border-[#2A2A2A]"
              />
              <label htmlFor="active" className="text-[10px] tracking-[0.2em] uppercase text-[#555] cursor-pointer">
                Activo
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="border border-[#2A2A2A] text-[#A0A0A0] text-[9px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-[#1A1A1A] transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-white hover:text-black transition-colors"
              >
                Guardar
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default function AdminProductosPage() {
  const { products, categories } = useDataStore()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  function categoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? '—'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">PRODUCTOS</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          {products.length} productos en catálogo
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#2A2A2A]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
              {['SKU', 'Nombre', 'Categoría', 'Badge', 'Estado', 'Acciones'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors"
              >
                <td className="px-4 py-3 text-[#555] text-xs font-mono">{product.sku}</td>
                <td className="px-4 py-3 text-white text-xs">{product.name}</td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs">{categoryName(product.categoryId)}</td>
                <td className="px-4 py-3">
                  {product.badge === 'NUEVO' && (
                    <span className="text-[10px] px-2 py-0.5 uppercase tracking-[0.1em] bg-yellow-950 text-yellow-400">
                      NUEVO
                    </span>
                  )}
                  {product.badge === 'TEMPORADA' && (
                    <span className="text-[10px] px-2 py-0.5 uppercase tracking-[0.1em] bg-blue-950 text-blue-400">
                      TEMPORADA
                    </span>
                  )}
                  {!product.badge && <span className="text-[#555] text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  {product.active ? (
                    <span className="text-[10px] px-2 py-0.5 uppercase tracking-[0.1em] bg-emerald-950 text-emerald-400">
                      ACTIVO
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 uppercase tracking-[0.1em] bg-zinc-800 text-zinc-400">
                      INACTIVO
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditProductDialog
        product={editingProduct}
        open={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
      />
    </div>
  )
}
