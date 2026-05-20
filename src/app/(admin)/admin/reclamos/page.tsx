'use client'

import { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/data-store'
import { cn, formatDate, CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import type { Claim, ClaimStatus } from '@/types'

type ClaimFilter = 'todos' | ClaimStatus

function ClaimCard({ claim }: { claim: Claim }) {
  const { clients, sellers, orders, products, updateClaimStatus, addClaimNote, resolveClaim } = useDataStore()
  const [nuevaNota, setNuevaNota] = useState('')

  const cliente = clients.find((c) => c.id === claim.clienteId)
  const seller = sellers.find((s) => s.id === claim.sellerId)
  const order = orders.find((o) => o.id === claim.orderId)

  function handleAddNota() {
    if (!nuevaNota.trim()) return
    addClaimNote(claim.id, nuevaNota.trim())
    setNuevaNota('')
    toast.success('Nota agregada')
  }

  function handleSendToFactory() {
    updateClaimStatus(claim.id, 'enviado_a_fabrica')
    addClaimNote(claim.id, `${formatDate(new Date().toISOString())} — Enviado a fábrica`)
    toast.success('Reclamo enviado a fábrica')
  }

  function handleResolve() {
    // En producción esto pediría qué pedido de bonificación se aplicó
    resolveClaim(claim.id, claim.orderId ?? '')
    toast.success('Reclamo marcado como resuelto')
  }

  return (
    <div className="bg-[#111] border border-[#2A2A2A] p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-1 text-white font-medium">
            {claim.codigo}
          </span>
          <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]', CLAIM_STATUS_COLORS[claim.estado])}>
            {CLAIM_STATUS_LABELS[claim.estado]}
          </span>
        </div>
        <span className="text-[#555] text-xs">{formatDate(claim.createdAt)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Cliente</p>
          <p className="text-white text-sm font-light">{cliente?.nombre ?? '—'}</p>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Vendedor</p>
          <p className="text-white text-sm font-light">{seller?.nombre ?? '—'}</p>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Pedido vinculado</p>
          <p className="text-white text-sm font-light font-display">
            {order?.codigo ?? <span className="text-[#555] italic font-sans">Sin vincular</span>}
          </p>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Items afectados</p>
          <p className="text-white text-sm font-light">
            {claim.productos.reduce((s, p) => s + p.cantidadAfectada, 0)} unidad{claim.productos.reduce((s, p) => s + p.cantidadAfectada, 0) !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Descripción</p>
        <p className="text-[#A0A0A0] text-sm font-light leading-relaxed">{claim.descripcion}</p>
      </div>

      {/* Productos afectados */}
      {claim.productos.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Productos</p>
          <div className="space-y-1.5">
            {claim.productos.map((cp, i) => {
              const p = products.find((pp) => pp.id === cp.productId)
              return (
                <div key={i} className="flex items-center justify-between text-xs border-b border-[#1A1A1A] pb-1.5">
                  <span className="text-[#A0A0A0]">
                    {p?.name ?? cp.productId} <span className="text-[#555]">×{cp.cantidadAfectada}</span>
                  </span>
                  <span className="text-[#666] text-[10px]">{cp.problema}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Notas internas */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Notas internas</p>
        {claim.notasInternas.length > 0 && (
          <ul className="space-y-1 mb-2">
            {claim.notasInternas.map((n, i) => (
              <li key={i} className="text-[11px] text-[#A0A0A0] border-l-2 border-[#2A2A2A] pl-2">
                {n}
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            placeholder="Agregar nota..."
            className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] text-[#A0A0A0] text-xs px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
          />
          <button
            onClick={handleAddNota}
            className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>

      {claim.estado !== 'resuelto' && (
        <div className="flex gap-2 justify-end flex-wrap pt-2 border-t border-[#1A1A1A]">
          {claim.estado === 'recibido' && (
            <button
              onClick={handleSendToFactory}
              className="bg-blue-950 text-blue-300 text-[9px] tracking-[0.15em] uppercase px-4 py-1.5 hover:bg-blue-900 transition-colors border border-blue-700"
            >
              Enviar a fábrica
            </button>
          )}
          <button
            onClick={handleResolve}
            className="bg-emerald-950 text-emerald-300 text-[9px] tracking-[0.15em] uppercase px-4 py-1.5 hover:bg-emerald-900 transition-colors border border-emerald-700"
          >
            Marcar resuelto
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
    { key: 'recibido', label: 'Recibidos' },
    { key: 'enviado_a_fabrica', label: 'En fábrica' },
    { key: 'resuelto', label: 'Resueltos' },
  ]

  const filtered = useMemo(() => {
    if (filter === 'todos') return claims
    return claims.filter((c) => c.estado === filter)
  }, [claims, filter])

  // KPIs
  const totalReclamos = claims.length
  const pendientes = claims.filter((c) => c.estado !== 'resuelto').length
  const resueltos = claims.filter((c) => c.estado === 'resuelto').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">RECLAMOS</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            Gestión de reclamos cargados por los vendedores
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: totalReclamos, color: 'text-white' },
          { label: 'Pendientes', value: pendientes, color: 'text-yellow-400' },
          { label: 'Resueltos', value: resueltos, color: 'text-emerald-400' },
        ].map((k) => (
          <div key={k.label} className="border border-[#2A2A2A] p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">{k.label}</p>
            <p className={cn('text-2xl font-light', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

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

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-[#555] text-xs py-16">Sin reclamos en esta categoría</div>
        ) : (
          filtered.map((claim) => <ClaimCard key={claim.id} claim={claim} />)
        )}
      </div>
    </div>
  )
}
