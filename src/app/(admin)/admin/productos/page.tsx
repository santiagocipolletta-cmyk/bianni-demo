'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { X, ChevronUp, ChevronDown, Trash2, Plus, Star, Tag, Sparkles, Eye, Archive } from 'lucide-react'
import type { Product, ProductStatus, ProductSubstitute } from '@/types'

interface EditForm {
  name: string
  description: string
  badge: Product['badge']
  estado: ProductStatus
  color: string
  material: string
  destacado: boolean
  novedad: boolean
  preventa: boolean
  stockCriticalThreshold: number
  substitutes: ProductSubstitute[]
  photos: { url: string; isPrincipal: boolean }[]
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
  const { categories, products, updateProduct, setProductStatus } = useDataStore()
  const [form, setForm] = useState<EditForm>({
    name: '', description: '', badge: null, estado: 'activo',
    color: '', material: '',
    destacado: false, novedad: false, preventa: false,
    stockCriticalThreshold: 5, substitutes: [], photos: [],
  })
  const [newSubstituteId, setNewSubstituteId] = useState('')
  const [newPhotoUrl, setNewPhotoUrl] = useState('')

  // Sync cuando se abre con product nuevo
  useEffect(() => {
    if (open && product) {
      setForm({
        name: product.name,
        description: product.description,
        badge: product.badge,
        estado: product.estado,
        color: product.color ?? '',
        material: product.material ?? '',
        destacado: product.destacado ?? false,
        novedad: product.novedad ?? false,
        preventa: product.preventa ?? false,
        stockCriticalThreshold: product.stockCriticalThreshold ?? 5,
        substitutes: [...(product.substitutes ?? [])].sort((a, b) => a.preferenceOrder - b.preferenceOrder),
        photos: product.photos && product.photos.length > 0
          ? [...product.photos]
          : [{ url: product.imageUrl, isPrincipal: true }],
      })
      setNewSubstituteId('')
      setNewPhotoUrl('')
    }
  }, [open, product])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    // Determinar principal photo URL
    const principalPhoto = form.photos.find((p) => p.isPrincipal) ?? form.photos[0]
    updateProduct(product.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      badge: form.badge,
      estado: form.estado,
      color: form.color.trim() || undefined,
      material: form.material.trim() || undefined,
      destacado: form.destacado,
      novedad: form.novedad,
      preventa: form.preventa,
      stockCriticalThreshold: form.stockCriticalThreshold,
      substitutes: form.substitutes,
      photos: form.photos,
      imageUrl: principalPhoto?.url ?? product.imageUrl,
    })
    toast.success(`Producto "${form.name}" actualizado`)
    onClose()
  }

  function handleArchive() {
    if (!product) return
    if (!confirm(`¿Archivar "${product.name}"? Sale del catálogo pero conserva su historial de pedidos.`)) return
    setProductStatus(product.id, 'archivado')
    toast.success('Producto archivado')
    onClose()
  }

  function moveSubstituteUp(idx: number) {
    if (idx === 0) return
    setForm((f) => {
      const subs = [...f.substitutes]
      ;[subs[idx - 1], subs[idx]] = [subs[idx], subs[idx - 1]]
      return { ...f, substitutes: subs.map((s, i) => ({ ...s, preferenceOrder: i + 1 })) }
    })
  }
  function moveSubstituteDown(idx: number) {
    setForm((f) => {
      if (idx >= f.substitutes.length - 1) return f
      const subs = [...f.substitutes]
      ;[subs[idx + 1], subs[idx]] = [subs[idx], subs[idx + 1]]
      return { ...f, substitutes: subs.map((s, i) => ({ ...s, preferenceOrder: i + 1 })) }
    })
  }
  function removeSubstitute(idx: number) {
    setForm((f) => ({
      ...f,
      substitutes: f.substitutes.filter((_, i) => i !== idx).map((s, i) => ({ ...s, preferenceOrder: i + 1 })),
    }))
  }
  function addSubstitute() {
    if (!newSubstituteId || form.substitutes.some((s) => s.substituteProductId === newSubstituteId)) return
    setForm((f) => ({
      ...f,
      substitutes: [...f.substitutes, { substituteProductId: newSubstituteId, preferenceOrder: f.substitutes.length + 1 }],
    }))
    setNewSubstituteId('')
  }

  function addPhoto() {
    if (!newPhotoUrl.trim()) return
    setForm((f) => ({
      ...f,
      photos: [...f.photos, { url: newPhotoUrl.trim(), isPrincipal: f.photos.length === 0 }],
    }))
    setNewPhotoUrl('')
  }
  function removePhoto(idx: number) {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))
  }
  function setPrincipalPhoto(idx: number) {
    setForm((f) => ({ ...f, photos: f.photos.map((p, i) => ({ ...p, isPrincipal: i === idx })) }))
  }

  if (!product) return null

  const category = categories.find((c) => c.id === product.categoryId)
  // Candidatos para sustituto: misma categoría, no el producto actual, no ya agregado
  const substituteCandidates = products.filter((p) =>
    p.id !== product.id &&
    p.categoryId === product.categoryId &&
    p.estado === 'activo' &&
    !form.substitutes.some((s) => s.substituteProductId === p.id)
  )

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#111] border border-[#2A2A2A] shadow-2xl"
        >
          <div className="flex items-start justify-between p-6 pb-4 border-b border-[#1A1A1A] sticky top-0 bg-[#111] z-10">
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

          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Datos básicos */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 resize-none focus:outline-none focus:border-[#444]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Badge</label>
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
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Stock crítico (umbral)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.stockCriticalThreshold}
                    onChange={(e) => setForm((f) => ({ ...f, stockCriticalThreshold: Math.max(1, Number(e.target.value) || 1) }))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
                  />
                </div>
              </div>
            </div>

            {/* Color y material */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Color</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  placeholder="ej: Negro mate"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Material</label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                  placeholder="ej: Acetato"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
                />
              </div>
            </div>

            {/* Estado tri-estado */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Estado del producto</label>
              <div className="grid grid-cols-3 gap-2">
                {(['borrador', 'activo', 'archivado'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, estado: s }))}
                    className={cn(
                      'border text-[10px] tracking-[0.15em] uppercase px-3 py-2 transition-colors',
                      form.estado === s
                        ? s === 'activo'
                          ? 'border-emerald-600 bg-emerald-950 text-emerald-300'
                          : s === 'borrador'
                          ? 'border-zinc-600 bg-zinc-800 text-zinc-200'
                          : 'border-red-700 bg-red-950 text-red-300'
                        : 'border-[#2A2A2A] text-[#555] hover:text-white'
                    )}
                  >
                    {s === 'borrador' && 'Borrador'}
                    {s === 'activo' && 'Activo'}
                    {s === 'archivado' && 'Archivado'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#555] mt-1.5 leading-relaxed">
                <span className="text-zinc-400">Borrador</span>: no se muestra al cliente. <span className="text-emerald-400">Activo</span>: visible en catálogo. <span className="text-red-400">Archivado</span>: oculto, conserva historial.
              </p>
            </div>

            {/* Toggles visibilidad */}
            <div className="space-y-2 border-y border-[#1A1A1A] py-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Marcadores</p>
              {[
                { key: 'destacado' as const, label: 'Destacado (aparece en lookbook público)', icon: Star, color: 'text-yellow-400' },
                { key: 'novedad' as const, label: 'Novedad', icon: Sparkles, color: 'text-emerald-400' },
                { key: 'preventa' as const, label: 'Catálogo de preventa', icon: Tag, color: 'text-blue-400' },
              ].map(({ key, label, icon: Icon, color }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form[key] as boolean}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                    className="w-4 h-4 bg-[#0A0A0A] border border-[#2A2A2A]"
                  />
                  <Icon size={12} className={color} />
                  <span className="text-xs text-[#A0A0A0] group-hover:text-white">{label}</span>
                </label>
              ))}
            </div>

            {/* Sustitutos */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Sustitutos por orden de preferencia</p>
              <div className="space-y-1">
                {form.substitutes.length === 0 && (
                  <p className="text-xs text-[#555] italic py-2">Sin sustitutos definidos</p>
                )}
                {form.substitutes.map((sub, idx) => {
                  const subProduct = products.find((p) => p.id === sub.substituteProductId)
                  return (
                    <div key={sub.substituteProductId} className="flex items-center gap-2 bg-[#0A0A0A] border border-[#1A1A1A] px-3 py-2">
                      <span className="text-yellow-500 font-mono text-[10px] w-5">{idx + 1}ª</span>
                      <span className="text-xs text-white flex-1 truncate">
                        {subProduct?.name ?? sub.substituteProductId}
                        <span className="text-[#555] ml-2">{subProduct?.sku}</span>
                      </span>
                      <button type="button" onClick={() => moveSubstituteUp(idx)} disabled={idx === 0}
                        className="text-[#555] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronUp size={12} />
                      </button>
                      <button type="button" onClick={() => moveSubstituteDown(idx)} disabled={idx === form.substitutes.length - 1}
                        className="text-[#555] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronDown size={12} />
                      </button>
                      <button type="button" onClick={() => removeSubstitute(idx)}
                        className="text-[#555] hover:text-red-400">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )
                })}
              </div>
              {substituteCandidates.length > 0 && (
                <div className="flex gap-2 mt-2">
                  <select
                    value={newSubstituteId}
                    onChange={(e) => setNewSubstituteId(e.target.value)}
                    className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#444]"
                  >
                    <option value="">Agregar sustituto de {category?.name}…</option>
                    {substituteCandidates.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  <button type="button" onClick={addSubstitute} disabled={!newSubstituteId}
                    className="border border-[#2A2A2A] text-white text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-[#1A1A1A] disabled:opacity-40">
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Fotos */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Fotos del producto</p>
              <div className="space-y-1">
                {form.photos.map((photo, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#0A0A0A] border border-[#1A1A1A] px-3 py-2">
                    <button type="button" onClick={() => setPrincipalPhoto(idx)}
                      className={cn('flex-shrink-0 w-2 h-2 rounded-full', photo.isPrincipal ? 'bg-white' : 'bg-[#333] hover:bg-[#666]')} />
                    <span className="text-[10px] text-[#888] flex-1 truncate font-mono">{photo.url}</span>
                    {photo.isPrincipal && (
                      <span className="text-[9px] tracking-[0.15em] uppercase text-white border border-[#333] px-1.5 py-0.5">Principal</span>
                    )}
                    {form.photos.length > 1 && (
                      <button type="button" onClick={() => removePhoto(idx)}
                        className="text-[#555] hover:text-red-400">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="text" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="URL de foto (ej: /brand/products/clipon-2.jpg)"
                  className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]" />
                <button type="button" onClick={addPhoto} disabled={!newPhotoUrl.trim()}
                  className="border border-[#2A2A2A] text-white text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-[#1A1A1A] disabled:opacity-40">
                  <Plus size={12} />
                </button>
              </div>
              <p className="text-[9px] text-[#555] mt-1.5 italic">Click en el círculo para marcar como principal. En producción, esto será un uploader real a Storage.</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1A1A1A] -mx-6 px-6 pt-4">
              {product.estado !== 'archivado' ? (
                <button type="button" onClick={handleArchive}
                  className="flex items-center gap-1.5 border border-red-900 text-red-400 text-[9px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-red-950/40">
                  <Archive size={11} /> Archivar
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <Dialog.Close asChild>
                  <button type="button"
                    className="border border-[#2A2A2A] text-[#A0A0A0] text-[9px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-[#1A1A1A]">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button type="submit"
                  className="border border-white bg-white text-black text-[9px] tracking-[0.15em] uppercase px-5 py-2 hover:bg-zinc-200 font-medium">
                  Guardar cambios
                </button>
              </div>
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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">PRODUCTOS</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            {products.length} productos en catálogo
          </p>
        </div>
        <a
          href="/admin/productos/importar"
          className="flex items-center gap-2 border border-[#2A2A2A] text-[#A0A0A0] hover:border-white hover:text-white text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 transition-colors"
        >
          <Plus size={12} /> Importar CSV
        </a>
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
                  {product.estado === 'activo' && (
                    <span className="text-[10px] px-2 py-0.5 uppercase tracking-[0.1em] bg-emerald-950 text-emerald-400">
                      ACTIVO
                    </span>
                  )}
                  {product.estado === 'borrador' && (
                    <span className="text-[10px] px-2 py-0.5 uppercase tracking-[0.1em] bg-zinc-800 text-zinc-400">
                      BORRADOR
                    </span>
                  )}
                  {product.estado === 'archivado' && (
                    <span className="text-[10px] px-2 py-0.5 uppercase tracking-[0.1em] bg-red-950 text-red-400">
                      ARCHIVADO
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
