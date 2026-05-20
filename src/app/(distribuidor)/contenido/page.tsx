'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, FileText, Video, FileArchive } from 'lucide-react'
import { toast } from 'sonner'
import { useDataStore } from '@/stores/data-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatDate, ASSET_CATEGORY_LABELS, ASSET_TYPE_LABELS } from '@/lib/utils'
import type { Asset, AssetCategory } from '@/types'

type FilterKey = 'todos' | AssetCategory

export default function ContenidoPage() {
  const [filter, setFilter] = useState<FilterKey>('todos')
  const { assets, incrementAssetDownload } = useDataStore()
  const { user } = useAuthStore()

  const activeAssets = assets.filter((a) => a.activo)
  const visibleAssets =
    filter === 'todos' ? activeAssets : activeAssets.filter((a) => a.categoria === filter)

  function handleDownload(asset: Asset) {
    if (user) incrementAssetDownload(asset.id, user.id)
    if (asset.tipo === 'pdf' || asset.tipo === 'zip') {
      toast.success(`${asset.nombreArchivo} descargado (demo)`)
      return
    }
    if (asset.url !== '#') window.open(asset.url, '_blank')
    else toast.success(`${asset.nombreArchivo} descargado (demo)`)
  }

  function handleDownloadAll() {
    const count = visibleAssets.length
    toast.success(`${count} archivos preparándose como ZIP (demo).`)
  }

  function getTypeIcon(asset: Asset) {
    if (asset.tipo === 'video') return <Video size={32} className="text-[#555]" strokeWidth={1} />
    if (asset.tipo === 'pdf') return <FileText size={32} className="text-[#555]" strokeWidth={1} />
    if (asset.tipo === 'zip') return <FileArchive size={32} className="text-[#555]" strokeWidth={1} />
    return null
  }

  return (
    <div className="min-h-full bg-[#000]">
      <div className="sticky top-0 z-30 border-b border-[#2A2A2A] bg-[#000]/95 backdrop-blur-sm px-4 lg:px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
              Contenido
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
              Materiales BIANNI para tu marketing
            </p>
          </div>
          <button onClick={handleDownloadAll}
            className="flex-shrink-0 flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 text-[9px] tracking-[0.15em] uppercase text-[#A0A0A0] hover:border-white hover:text-white transition-colors">
            <Download size={13} strokeWidth={1.5} />
            Descargar todo
          </button>
        </div>

        <div className="flex gap-0 mt-4 overflow-x-auto">
          <button onClick={() => setFilter('todos')} className={cn(
            'flex-shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors',
            filter === 'todos' ? 'border-white bg-white text-black' : 'border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#555]'
          )}>Todos</button>
          {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={cn(
              'flex-shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors',
              filter === k ? 'border-white bg-white text-black' : 'border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#555]'
            )}>{ASSET_CATEGORY_LABELS[k]}</button>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-8 py-8">
        {visibleAssets.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-[#555] text-xs tracking-[0.2em] uppercase">Sin archivos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#2A2A2A]">
            {visibleAssets.map((asset) => (
              <div key={asset.id} className="bg-[#000] flex flex-col">
                <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden">
                  <span className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm text-white text-[8px] tracking-[0.2em] uppercase px-2 py-1 border border-[#2A2A2A]">
                    {ASSET_TYPE_LABELS[asset.tipo]}
                  </span>
                  <span className="absolute top-3 right-3 z-10 bg-white/10 backdrop-blur-sm text-white text-[8px] tracking-[0.2em] uppercase px-2 py-1 border border-white/20">
                    {ASSET_CATEGORY_LABELS[asset.categoria]}
                  </span>

                  {(asset.tipo === 'pdf' || asset.tipo === 'video' || asset.tipo === 'zip') ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      {getTypeIcon(asset)}
                      <p className="text-[9px] tracking-[0.15em] uppercase text-[#555]">{ASSET_TYPE_LABELS[asset.tipo]}</p>
                    </div>
                  ) : (
                    <Image src={asset.miniaturUrl} alt={asset.nombreArchivo} fill sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-105" />
                  )}
                </div>

                <div className="flex flex-col flex-1 p-4 border-t border-[#2A2A2A]">
                  <p className="text-white text-sm font-light leading-snug mb-1 truncate">{asset.nombreArchivo}</p>
                  <p className="text-[#555] text-[10px] leading-relaxed line-clamp-2 flex-1 mb-3">{asset.descripcion}</p>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="text-[9px] tracking-[0.1em] text-[#555]">
                      {formatDate(asset.fechaSubida)} · {asset.tamanioMb}MB · {asset.descargas} descargas
                    </div>
                  </div>
                  <button onClick={() => handleDownload(asset)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors">
                    <Download size={10} strokeWidth={2} />
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
