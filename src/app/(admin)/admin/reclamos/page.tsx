'use client'

import { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/data-store'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Claim } from '@/types'

type ClaimFilter = 'todos' | 'sin_resolver' | 'a_fabrica' | 'cerrado'

const ESTADO_BADGE: Record<Claim['estado'], string> = {
  sin_resolver: 'bg-red-950 text-red-400',
  a_fabrica: 'bg-blue-950 text-blue-400',
  cerrado: 'bg-zinc-800 text-zinc-400',
}

const ESTADO_LABEL: Record<Claim['estado'], string> = {
  sin_resolver: 'Sin resolver',
  a_fabrica: 'En fábrica',
  cerrado: 'Cerrado',
}

function ClaimCard({ claim }: { claim: Claim }) {
  const { clients, orders, updateClaimStatus } = useDataStore()
  const [editedNotas, setEditedNotas] = useState(claim.notasInternas ?? '')

  const cliente = clients.find((c) => c.id === claim.clienteId)
  const order = orders.find((o) => o.id === claim.orderId)

  function handleSaveNotas() {
    updateClaimStatus(claim.id, claim.estado, editedNotas)
    toast.success('Notas guardadas')
  }

  function handleSendToFactory() {
    updateClaimStatus(claim.id, 'a_fabrica')
    toast.success('Reclamo enviado a fábrica')
  }

  function handleClose() {
    updateClaimStatus(claim.id, 'cerrado')
    toast.success('Reclamo cerrado')
  }

  return (
    <div className="bg-[#111] border border-[#2A2A2A] p-5 space-y-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-1 text-[#A0A0A0]">
            #{claim.id.toUpperCase()}
          </span>
          <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]', ESTADO_BADGE[claim.estado])}>
            {ESTADO_LABEL[claim.estado]}
          </span>
        </div>
        <span className="text-[#555] text-xs">{formatDate(claim.createdAt)}</span>
      </div>

      {/* Cliente / Pedido */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Cliente</p>
          <p className="text-white text-sm font-light">{cliente?.nombre ?? claim.clienteId}</p>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Pedido</p>
          <p className="text-white text-sm font-light font-display">{order?.codigo ?? claim.orderId}</p>
        </div>
      </div>

      {/* Motivo */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Motivo</p>
        <p className="text-[#A0A0A0] text-sm font-light leading-relaxed">{claim.motivo}</p>
      </div>

      {/* Thumbnails */}
      {claim.fotosUrls.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Fotos adjuntas</p>
          <div className="flex gap-2 flex-wrap">
            {claim.fotosUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Foto ${i + 1}`}
                className="h-12 w-12 object-cover border border-[#2A2A2A]"
              />
            ))}
          </div>
        </div>
      )}

      {/* Notas internas */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Notas internas</p>
        <textarea
          value={editedNotas}
          onChange={(e) => setEditedNotas(e.target.value)}
          rows={2}
          placeholder="Agregar notas internas..."
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#A0A0A0] text-xs px-3 py-2 resize-none focus:outline-none focus:border-[#444] placeholder:text-[#444]"
        />
        <button
          onClick={handleSaveNotas}
          className="mt-1 border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors"
        >
          Guardar notas
        </button>
      </div>

      {/* Action buttons */}
      {claim.estado !== 'cerrado' && (
        <div className="flex gap-2 justify-end flex-wrap">
          {claim.estado === 'sin_resolver' && (
            <button
              onClick={handleSendToFactory}
              className="bg-blue-950 text-blue-300 text-[9px] tracking-[0.15em] uppercase px-4 py-1.5 hover:bg-blue-900 transition-colors border border-blue-700"
            >
              Enviar a fábrica
            </button>
          )}
          <button
            onClick={handleClose}
            className="border border-[#2A2A2A] text-[#A0A0A0] text-[9px] tracking-[0.15em] uppercase px-4 py-1.5 hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            Cerrar reclamo
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminReclamosPage() {
  const { claims } = useDataStore()
  const [filter, setFilter] = useState<ClaimFilter>('todos')

  const TABS: { key: ClaimFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'sin_resolver', label: 'Sin resolver' },
    { key: 'a_fabrica', label: 'En fábrica' },
    { key: 'cerrado', label: 'Cerrado' },
  ]

  const filtered = useMemo(() => {
    if (filter === 'todos') return claims
    return claims.filter((c) => c.estado === filter)
  }, [claims, filter])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">RECLAMOS</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          {claims.length} reclamo{claims.length !== 1 ? 's' : ''} en total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 border border-[#2A2A2A]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] last:border-r-0',
              filter === tab.key
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#555] hover:text-[#A0A0A0]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Claims */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-[#555] text-xs py-16">Sin reclamos</div>
        ) : (
          filtered.map((claim) => <ClaimCard key={claim.id} claim={claim} />)
        )}
      </div>
    </div>
  )
}
