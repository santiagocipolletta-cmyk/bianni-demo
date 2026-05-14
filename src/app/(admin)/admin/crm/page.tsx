'use client'

import { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/data-store'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Lead } from '@/types'

type LeadFilter = 'todos' | 'nuevo' | 'contactado' | 'convertido'

const ESTADO_BADGE: Record<Lead['estado'], string> = {
  nuevo: 'bg-yellow-950 text-yellow-400',
  contactado: 'bg-blue-950 text-blue-400',
  convertido: 'bg-emerald-950 text-emerald-400',
  descartado: 'bg-zinc-800 text-zinc-400',
}

const ESTADO_OPTIONS: Lead['estado'][] = ['nuevo', 'contactado', 'convertido', 'descartado']

export default function AdminCRMPage() {
  const { leads, updateLeadStatus } = useDataStore()
  const [filter, setFilter] = useState<LeadFilter>('todos')

  const TABS: { key: LeadFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'nuevo', label: 'Nuevos' },
    { key: 'contactado', label: 'Contactados' },
    { key: 'convertido', label: 'Convertidos' },
  ]

  const stats = useMemo(() => ({
    nuevos: leads.filter((l) => l.estado === 'nuevo').length,
    contactados: leads.filter((l) => l.estado === 'contactado').length,
    convertidos: leads.filter((l) => l.estado === 'convertido').length,
    total: leads.length,
  }), [leads])

  const sorted = useMemo(
    () => [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [leads]
  )

  const filtered = useMemo(() => {
    if (filter === 'todos') return sorted
    return sorted.filter((l) => l.estado === filter)
  }, [sorted, filter])

  function handleEstadoChange(leadId: string, newEstado: Lead['estado']) {
    updateLeadStatus(leadId, newEstado)
    toast.success('Estado actualizado')
  }

  const KPI_BOXES = [
    { label: 'Nuevos', value: stats.nuevos, cls: 'text-yellow-400' },
    { label: 'Contactados', value: stats.contactados, cls: 'text-blue-400' },
    { label: 'Convertidos', value: stats.convertidos, cls: 'text-emerald-400' },
    { label: 'Total', value: stats.total, cls: 'text-white' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">CRM — LEADS</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          Contactos del formulario web
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {KPI_BOXES.map((kpi) => (
          <div key={kpi.label} className="bg-[#111] border border-[#2A2A2A] p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">{kpi.label}</p>
            <p className={cn('font-display text-3xl', kpi.cls)}>{kpi.value}</p>
          </div>
        ))}
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

      {/* Table */}
      <div className="overflow-x-auto border border-[#2A2A2A]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
              {['Nombre', 'Email', 'Teléfono', 'Mensaje', 'Estado', 'Fecha', 'Cambiar estado'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-[#555] py-12 text-xs">
                  Sin leads
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors"
                >
                  <td className="px-4 py-3 text-white text-xs font-medium whitespace-nowrap">
                    {lead.nombre}
                  </td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs">{lead.email}</td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{lead.telefono}</td>
                  <td className="px-4 py-3 text-[#555] text-xs max-w-[200px]">
                    <span title={lead.mensaje}>
                      {lead.mensaje.length > 60
                        ? lead.mensaje.slice(0, 60) + '...'
                        : lead.mensaje}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]', ESTADO_BADGE[lead.estado])}>
                      {lead.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#555] text-xs whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.estado}
                      onChange={(e) => handleEstadoChange(lead.id, e.target.value as Lead['estado'])}
                      className="bg-[#0A0A0A] border border-[#2A2A2A] text-white text-[10px] px-2 py-1 focus:outline-none focus:border-[#444]"
                    >
                      {ESTADO_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
