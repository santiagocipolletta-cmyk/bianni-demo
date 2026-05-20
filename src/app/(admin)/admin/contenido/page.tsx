'use client'

import { useState, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useDataStore } from '@/stores/data-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatDate, ASSET_CATEGORY_LABELS, ASSET_TYPE_LABELS } from '@/lib/utils'
import { toast } from 'sonner'
import { X, Plus, Download } from 'lucide-react'
import type { Asset, AssetCategory, AssetType } from '@/types'

type CategoryFilter = 'todos' | AssetCategory

const TIPO_BADGE: Record<AssetType, string> = {
  foto: 'bg-blue-950 text-blue-300',
  video: 'bg-red-950 text-red-300',
  pdf: 'bg-amber-950 text-amber-300',
  zip: 'bg-emerald-950 text-emerald-300',
}

function AddAssetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addAsset } = useDataStore()
  const { user } = useAuthStore()
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [tipo, setTipo] = useState<AssetType>('foto')
  const [categoria, setCategoria] = useState<AssetCategory>('receta')
  const [url, setUrl] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tamanioMb, setTamanioMb] = useState(2)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombreArchivo.trim() || !url.trim()) {
      toast.error('Nombre y URL son requeridos')
      return
    }
    addAsset({
      nombreArchivo: nombreArchivo.trim(),
      url: url.trim(),
      miniaturUrl: url.trim(),
      tipo,
      categoria,
      descripcion: descripcion.trim(),
      fechaSubida: new Date().toISOString(),
      subidoPor: user?.id ?? 'u3',
      descargas: 0,
      tamanioMb,
      activo: true,
    })
    toast.success('Asset agregado')
    setNombreArchivo(''); setUrl(''); setDescripcion(''); setTipo('foto'); setCategoria('receta')
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#111] border border-[#2A2A2A] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <Dialog.Title className="font-display text-xl text-white tracking-[0.05em]">SUBIR ASSET</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[#555] hover:text-white transition-colors"><X size={18} /></button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Nombre del archivo *</label>
              <input type="text" value={nombreArchivo} onChange={(e) => setNombreArchivo(e.target.value)} required
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value as AssetCategory)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]">
                  {Object.entries(ASSET_CATEGORY_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Tipo</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value as AssetType)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]">
                  {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">URL *</label>
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://..."
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]" />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Tamaño (MB)</label>
              <input type="number" min={0.1} step={0.1} value={tamanioMb} onChange={(e) => setTamanioMb(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]" />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Descripción</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 resize-none focus:outline-none focus:border-[#444]" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button type="button" className="border border-[#2A2A2A] text-[#A0A0A0] text-[9px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-[#1A1A1A] transition-colors">Cancelar</button>
              </Dialog.Close>
              <button type="submit" className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-white hover:text-black transition-colors">Subir</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default function AdminContenidoPage() {
  const { assets, removeAsset } = useDataStore()
  const [filter, setFilter] = useState<CategoryFilter>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'todos') return assets
    return assets.filter((a) => a.categoria === filter)
  }, [assets, filter])

  function handleRemove(id: string, name: string) {
    if (window.confirm(`¿Eliminar "${name}"?`)) {
      removeAsset(id)
      toast.success('Asset eliminado')
    }
  }

  const totalDescargas = assets.reduce((s, a) => s + a.descargas, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">BIBLIOTECA DE CONTENIDO</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            {assets.length} assets · {totalDescargas} descargas totales
          </p>
        </div>
        <button onClick={() => setDialogOpen(true)} className="flex items-center gap-2 border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors">
          <Plus size={13} />
          Subir asset
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-0 border border-[#2A2A2A] overflow-x-auto">
        <button onClick={() => setFilter('todos')} className={cn('px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] whitespace-nowrap', filter === 'todos' ? 'bg-[#1A1A1A] text-white' : 'text-[#555] hover:text-[#A0A0A0]')}>
          Todos
        </button>
        {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={cn('px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] last:border-r-0 whitespace-nowrap', filter === k ? 'bg-[#1A1A1A] text-white' : 'text-[#555] hover:text-[#A0A0A0]')}>
            {ASSET_CATEGORY_LABELS[k]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-[#555] text-xs py-16">Sin assets en esta categoría</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <div key={asset.id} className="bg-[#111] border border-[#2A2A2A] overflow-hidden">
              <div className="relative">
                <img src={asset.miniaturUrl} alt={asset.nombreArchivo} className="w-full aspect-square object-cover bg-stone-100" />
                <span className={cn('absolute top-2 left-2 text-[9px] px-2 py-0.5 uppercase tracking-[0.1em]', TIPO_BADGE[asset.tipo])}>
                  {ASSET_TYPE_LABELS[asset.tipo]}
                </span>
                <span className="absolute top-2 right-2 text-[9px] bg-black/80 text-white px-2 py-0.5 tracking-[0.1em] uppercase">
                  {ASSET_CATEGORY_LABELS[asset.categoria]}
                </span>
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-xs text-white font-light truncate" title={asset.nombreArchivo}>{asset.nombreArchivo}</p>
                {asset.descripcion && <p className="text-[10px] text-[#555] line-clamp-2" title={asset.descripcion}>{asset.descripcion}</p>}
                <div className="flex items-center justify-between text-[10px] text-[#666] pt-1">
                  <span>{formatDate(asset.fechaSubida)}</span>
                  <span className="flex items-center gap-1"><Download size={9} /> {asset.descargas}</span>
                </div>
                <p className="text-[10px] text-[#444]">{asset.tamanioMb} MB</p>
                <button onClick={() => handleRemove(asset.id, asset.nombreArchivo)}
                  className="mt-1 border border-[#2A2A2A] text-[#555] text-[9px] tracking-[0.15em] uppercase px-2 py-1 hover:border-red-800 hover:text-red-400 transition-colors w-full">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddAssetDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
