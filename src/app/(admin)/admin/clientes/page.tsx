'use client'

import { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/data-store'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Eye, EyeOff, Pause, Play, Search } from 'lucide-react'
import type { Client } from '@/types'

type StatusFilter = 'todas' | 'activa' | 'suspendida' | 'pendiente_datos'

const STATUS_LABEL: Record<Client['status'], string> = {
  activa: 'Activa',
  suspendida: 'Suspendida',
  pendiente_datos: 'Datos pendientes',
}
const STATUS_COLOR: Record<Client['status'], string> = {
  activa: 'bg-emerald-950 text-emerald-400',
  suspendida: 'bg-red-950 text-red-400',
  pendiente_datos: 'bg-yellow-950 text-yellow-400',
}

export default function AdminClientesPage() {
  const { clients, priceLists, sellers, updateClientStatus, toggleClientCtaCteVisibility, updateClientPlazoPago } = useDataStore()
  const [filter, setFilter] = useState<StatusFilter>('todas')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPlazo, setEditPlazo] = useState(30)

  const stats = useMemo(() => ({
    activa: clients.filter((c) => c.status === 'activa').length,
    suspendida: clients.filter((c) => c.status === 'suspendida').length,
    pendiente_datos: clients.filter((c) => c.status === 'pendiente_datos').length,
  }), [clients])

  const filtered = useMemo(() => {
    let result = clients
    if (filter !== 'todas') result = result.filter((c) => c.status === filter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.ciudad.toLowerCase().includes(q) ||
        c.cuit?.includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    }
    return result
  }, [clients, filter, search])

  function priceListName(priceListId: string): string {
    return priceLists.find((pl) => pl.id === priceListId)?.name ?? '—'
  }

  function sellerName(sellerId: string): string {
    return sellers.find((s) => s.id === sellerId)?.nombre ?? '—'
  }

  function handleSuspend(client: Client) {
    if (client.status === 'suspendida') {
      updateClientStatus(client.id, 'activa')
      toast.success(`${client.nombre} reactivada`)
    } else {
      if (window.confirm(`¿Suspender ${client.nombre}? La óptica no podrá hacer pedidos hasta ser reactivada.`)) {
        updateClientStatus(client.id, 'suspendida')
        toast.success(`${client.nombre} suspendida`)
      }
    }
  }

  function handleToggleCtaCte(client: Client) {
    toggleClientCtaCteVisibility(client.id)
    toast.success(
      client.verCuentaCorriente
        ? `Cta cte oculta para ${client.nombre}`
        : `Cta cte visible para ${client.nombre}`
    )
  }

  function handleSavePlazo(clientId: string) {
    updateClientPlazoPago(clientId, editPlazo)
    setEditingId(null)
    toast.success('Plazo actualizado')
  }

  const TABS: { key: StatusFilter; label: string; count?: number }[] = [
    { key: 'todas', label: 'Todas', count: clients.length },
    { key: 'activa', label: 'Activas', count: stats.activa },
    { key: 'pendiente_datos', label: 'Datos pendientes', count: stats.pendiente_datos },
    { key: 'suspendida', label: 'Suspendidas', count: stats.suspendida },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">ÓPTICAS</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            {clients.length} clientes registrados
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar óptica..."
            className="w-72 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs pl-9 pr-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]" />
        </div>
      </div>

      <div className="flex gap-0 border border-[#2A2A2A] overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)} className={cn(
            'px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] last:border-r-0 whitespace-nowrap',
            filter === t.key ? 'bg-[#1A1A1A] text-white' : 'text-[#555] hover:text-[#A0A0A0]'
          )}>
            {t.label} ({t.count ?? 0})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-[#2A2A2A]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
              {['Óptica', 'Estado', 'CUIT', 'Ciudad', 'Lista', 'Vendedor', 'Plazo', 'Cta Cte', 'Origen', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="text-center text-[#555] py-12 text-xs">Sin clientes</td></tr>
            ) : filtered.map((client) => (
              <tr key={client.id} className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors">
                <td className="px-4 py-3 text-white text-xs font-medium whitespace-nowrap">
                  {client.nombre}
                  <p className="text-[#666] text-[10px] font-normal">{client.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]', STATUS_COLOR[client.status])}>
                    {STATUS_LABEL[client.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{client.cuit ?? '—'}</td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{client.ciudad}</td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{priceListName(client.priceListId)}</td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{sellerName(client.sellerId)}</td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                  {editingId === client.id ? (
                    <div className="flex gap-1">
                      <input type="number" value={editPlazo} onChange={(e) => setEditPlazo(Number(e.target.value))}
                        className="w-16 bg-[#0A0A0A] border border-[#2A2A2A] text-white px-2 py-1 text-xs" />
                      <button onClick={() => handleSavePlazo(client.id)}
                        className="text-emerald-400 text-[10px] px-2 hover:text-emerald-300">✓</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(client.id); setEditPlazo(client.plazoPagoDias) }}
                      className="hover:text-white">{client.plazoPagoDias} días</button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleCtaCte(client)}
                    title={client.verCuentaCorriente ? 'Visible' : 'Oculta'}
                    className={cn('flex items-center gap-1 text-[10px] hover:text-white transition-colors',
                      client.verCuentaCorriente ? 'text-emerald-400' : 'text-[#555]')}>
                    {client.verCuentaCorriente ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </td>
                <td className="px-4 py-3 text-[#A0A0A0] text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                  {client.origenAlta}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleSuspend(client)}
                    className={cn('flex items-center gap-1 border text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 transition-colors',
                      client.status === 'suspendida'
                        ? 'border-emerald-700 text-emerald-400 hover:bg-emerald-950'
                        : 'border-red-800 text-red-400 hover:bg-red-950')}>
                    {client.status === 'suspendida' ? <><Play size={11} /> Reactivar</> : <><Pause size={11} /> Suspender</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
