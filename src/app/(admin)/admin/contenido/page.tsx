'use client'

import { useState, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useDataStore } from '@/stores/data-store'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'
import type { Asset } from '@/types'

type AssetFilter = 'todos' | 'foto_producto' | 'editorial' | 'catalogo_pdf' | 'lookbook'

const TIPO_LABELS: Record<Asset['tipo'], string> = {
  foto_producto: 'Foto producto',
  editorial: 'Editorial',
  catalogo_pdf: 'Catálogo PDF',
  lookbook: 'Lookbook',
  video: 'Video',
}

const TIPO_BADGE: Record<Asset['tipo'], string> = {
  foto_producto: 'bg-blue-950 text-blue-300',
  editorial: 'bg-purple-950 text-purple-300',
  catalogo_pdf: 'bg-amber-950 text-amber-300',
  lookbook: 'bg-emerald-950 text-emerald-300',
  video: 'bg-red-950 text-red-300',
}

function AddAssetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addAsset } = useDataStore()
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [tipo, setTipo] = useState<Asset['tipo']>('foto_producto')
  const [url, setUrl] = useState('')
  const [miniaturUrl, setMiniaturUrl] = useState('')
  const [descripcion, setDescripcion] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombreArchivo.trim() || !url.trim()) {
      toast.error('Nombre y URL son requeridos')
      return
    }
    addAsset({
      nombreArchivo: nombreArchivo.trim(),
      url: url.trim(),
      miniaturUrl: miniaturUrl.trim() || url.trim(),
      tipo,
      descripcion: descripcion.trim(),
      fechaSubida: new Date().toISOString(),
      activo: true,
    })
    toast.success('Asset agregado')
    setNombreArchivo('')
    setUrl('')
    setMiniaturUrl('')
    setDescripcion('')
    setTipo('foto_producto')
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#111] border border-[#2A2A2A] p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <Dialog.Title className="font-display text-xl text-white tracking-[0.05em]">
              AGREGAR ASSET
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[#555] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                Nombre del archivo *
              </label>
              <input
                type="text"
                value={nombreArchivo}
                onChange={(e) => setNombreArchivo(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Asset['tipo'])}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              >
                <option value="foto_producto">Foto producto</option>
                <option value="editorial">Editorial</option>
                <option value="catalogo_pdf">Catálogo PDF</option>
                <option value="lookbook">Lookbook</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                URL *
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://..."
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                URL miniatura
              </label>
              <input
                type="text"
                value={miniaturUrl}
                onChange={(e) => setMiniaturUrl(e.target.value)}
                placeholder="https://... (thumbnail)"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 resize-none focus:outline-none focus:border-[#444]"
              />
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
                Agregar
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default function AdminContenidoPage() {
  const { assets, removeAsset } = useDataStore()
  const [filter, setFilter] = useState<AssetFilter>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)

  const TABS: { key: AssetFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'foto_producto', label: 'Fotos' },
    { key: 'editorial', label: 'Editorial' },
    { key: 'catalogo_pdf', label: 'Catálogos' },
    { key: 'lookbook', label: 'Lookbooks' },
  ]

  const filtered = useMemo(() => {
    if (filter === 'todos') return assets
    return assets.filter((a) => a.tipo === filter)
  }, [assets, filter])

  function handleRemove(id: string, name: string) {
    if (window.confirm(`¿Eliminar "${name}"?`)) {
      removeAsset(id)
      toast.success('Asset eliminado')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">CONTENIDO</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            Biblioteca de materiales
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors"
        >
          <Plus size={13} />
          Agregar asset
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-[#2A2A2A] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] last:border-r-0 whitespace-nowrap',
              filter === tab.key
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#555] hover:text-[#A0A0A0]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center text-[#555] text-xs py-16">Sin assets</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <div key={asset.id} className="bg-[#111] border border-[#2A2A2A] overflow-hidden">
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={asset.miniaturUrl}
                  alt={asset.nombreArchivo}
                  className="w-full aspect-square object-cover bg-stone-100"
                />
                <span className={cn('absolute top-2 left-2 text-[9px] px-2 py-0.5 uppercase tracking-[0.1em]', TIPO_BADGE[asset.tipo])}>
                  {TIPO_LABELS[asset.tipo]}
                </span>
              </div>
              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="text-xs text-white font-light truncate" title={asset.nombreArchivo}>
                  {asset.nombreArchivo}
                </p>
                {asset.descripcion && (
                  <p className="text-[10px] text-[#555] truncate" title={asset.descripcion}>
                    {asset.descripcion}
                  </p>
                )}
                <p className="text-[10px] text-[#444]">{formatDate(asset.fechaSubida)}</p>
                <button
                  onClick={() => handleRemove(asset.id, asset.nombreArchivo)}
                  className="mt-1 border border-[#2A2A2A] text-[#555] text-[9px] tracking-[0.15em] uppercase px-2 py-1 hover:border-red-800 hover:text-red-400 transition-colors w-full"
                >
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
