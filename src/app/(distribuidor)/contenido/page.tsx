'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useDataStore } from '@/stores/data-store'
import { cn, formatDate } from '@/lib/utils'
import type { Asset } from '@/types'

type AssetTipo = Asset['tipo']
type FilterKey = 'todos' | AssetTipo

const FILTER_CONFIG: FilterKey[] = ['todos', 'foto_producto', 'editorial', 'catalogo_pdf', 'lookbook', 'video']

const FILTER_LABELS: Record<FilterKey, string> = {
  todos: 'Todos',
  foto_producto: 'Fotos Producto',
  editorial: 'Editorial',
  catalogo_pdf: 'Catálogos',
  lookbook: 'Lookbooks',
  video: 'Videos',
}

const TIPO_BADGE: Record<AssetTipo, string> = {
  foto_producto: 'Foto Producto',
  editorial: 'Editorial',
  catalogo_pdf: 'Catálogo PDF',
  lookbook: 'Lookbook',
  video: 'Video',
}

export default function ContenidoPage() {
  const [filter, setFilter] = useState<FilterKey>('todos')
  const { assets } = useDataStore()

  const activeAssets = assets.filter((a) => a.activo)
  const visibleAssets =
    filter === 'todos' ? activeAssets : activeAssets.filter((a) => a.tipo === filter)

  // Only show filter tabs that have at least 1 asset
  const availableTypes = Array.from(new Set(activeAssets.map((a) => a.tipo))) as AssetTipo[]

  function handleDownload(asset: Asset) {
    if (asset.tipo === 'catalogo_pdf') {
      toast.success('PDF descargado (demo)')
      return
    }
    window.open(asset.url, '_blank')
  }

  function handleDownloadAll() {
    const count = visibleAssets.filter((a) => a.tipo !== 'catalogo_pdf').length
    toast.success(
      `${count} archivo${count !== 1 ? 's' : ''} disponible${count !== 1 ? 's' : ''}. En producción se descargan como ZIP.`
    )
  }

  return (
    <div className="min-h-full bg-[#000]">
      {/* Page header */}
      <div className="sticky top-0 z-30 border-b border-[#2A2A2A] bg-[#000]/95 backdrop-blur-sm px-4 lg:px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
              Contenido
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
              Materiales de marca para tu óptica
            </p>
          </div>
          <button
            onClick={handleDownloadAll}
            className="flex-shrink-0 flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 text-[9px] tracking-[0.15em] uppercase text-[#A0A0A0] hover:border-white hover:text-white transition-colors"
          >
            <Download size={13} strokeWidth={1.5} />
            Descargar todo
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 mt-4 overflow-x-auto">
          {FILTER_CONFIG.map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setFilter(filterKey)}
              className={cn(
                'flex-shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors',
                filter === filterKey
                  ? 'border-white bg-white text-black'
                  : 'border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#555]'
              )}
            >
              {FILTER_LABELS[filterKey]}
            </button>
          ))}
        </div>
      </div>

      {/* Asset grid */}
      <div className="px-4 lg:px-8 py-8">
        {visibleAssets.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-[#555] text-xs tracking-[0.2em] uppercase">
              Sin archivos en esta categoría
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#2A2A2A]">
            {visibleAssets.map((asset) => (
              <div key={asset.id} className="bg-[#000] flex flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden">
                  {/* Type badge */}
                  <span className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm text-white text-[8px] tracking-[0.2em] uppercase px-2 py-1 border border-[#2A2A2A]">
                    {TIPO_BADGE[asset.tipo]}
                  </span>

                  {asset.tipo === 'catalogo_pdf' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <FileText size={32} className="text-[#555]" strokeWidth={1} />
                      <p className="text-[9px] tracking-[0.15em] uppercase text-[#555]">PDF</p>
                    </div>
                  ) : (
                    <Image
                      src={asset.miniaturUrl}
                      alt={asset.nombreArchivo}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 p-4 border-t border-[#2A2A2A]">
                  <p className="text-white text-sm font-light leading-snug mb-1 truncate">
                    {asset.nombreArchivo}
                  </p>
                  <p className="text-[#555] text-[10px] leading-relaxed line-clamp-2 flex-1 mb-3">
                    {asset.descripcion}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <p className="text-[9px] tracking-[0.1em] text-[#555]">
                      {formatDate(asset.fechaSubida)}
                    </p>
                    <button
                      onClick={() => handleDownload(asset)}
                      className="flex items-center gap-1.5 border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors"
                    >
                      <Download size={10} strokeWidth={2} />
                      Descargar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
