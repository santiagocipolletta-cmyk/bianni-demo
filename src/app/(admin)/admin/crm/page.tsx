'use client'

import { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/data-store'
import { cn, formatDate, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/utils'
import { toast } from 'sonner'
import type { Lead, LeadStatus } from '@/types'

type LeadFilter = 'todos' | LeadStatus
type ViewMode = 'embudo' | 'tabla'

const ALL_STATES: LeadStatus[] = ['nuevo', 'contactado', 'en_negociacion', 'convertido', 'perdido']
const ORIGENES_LABEL: Record<Lead['origen'], string> = {
  formulario_web: 'Formulario web',
  instagram: 'Instagram',
  referido: 'Referido',
  feria: 'Feria',
  otro: 'Otro',
}

export default function AdminCRMPage() {
  const { leads, sellers, updateLeadStatus, assignLead, addLeadNote } = useDataStore()
  const [view, setView] = useState<ViewMode>('embudo')
  const [filter, setFilter] = useState<LeadFilter>('todos')
  const [openedLead, setOpenedLead] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')

  const stats = useMemo(() => ({
    nuevo: leads.filter((l) => l.estado === 'nuevo').length,
    contactado: leads.filter((l) => l.estado === 'contactado').length,
    en_negociacion: leads.filter((l) => l.estado === 'en_negociacion').length,
    convertido: leads.filter((l) => l.estado === 'convertido').length,
    perdido: leads.filter((l) => l.estado === 'perdido').length,
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

  function handleEstadoChange(leadId: string, newEstado: LeadStatus) {
    updateLeadStatus(leadId, newEstado)
    toast.success('Estado actualizado')
  }

  function handleAssign(leadId: string, sellerId: string) {
    assignLead(leadId, sellerId)
    toast.success('Lead asignado')
  }

  function handleAddNote(leadId: string) {
    if (!newNote.trim()) return
    addLeadNote(leadId, { texto: newNote.trim(), autor: 'Giuliana Bianni' })
    setNewNote('')
    toast.success('Nota agregada')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">CRM — LEADS</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            Embudo de captación · {stats.total} leads totales
          </p>
        </div>
        <div className="flex border border-[#2A2A2A]">
          {(['embudo', 'tabla'] as ViewMode[]).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn(
              'px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors',
              view === v ? 'bg-[#1A1A1A] text-white' : 'text-[#555] hover:text-[#A0A0A0]'
            )}>{v}</button>
          ))}
        </div>
      </div>

      {/* KPIs embudo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {ALL_STATES.map((est) => (
          <button key={est} onClick={() => setFilter(est)}
            className={cn(
              'border p-4 text-left transition-colors',
              filter === est ? 'border-white bg-[#0A0A0A]' : 'border-[#2A2A2A] hover:border-[#444]'
            )}>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">{LEAD_STATUS_LABELS[est]}</p>
            <p className={cn('font-display text-3xl', LEAD_STATUS_COLORS[est].split(' ')[1])}>{stats[est]}</p>
          </button>
        ))}
      </div>

      {/* EMBUDO VIEW (Kanban) */}
      {view === 'embudo' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {ALL_STATES.map((est) => {
            const colLeads = sorted.filter((l) => l.estado === est)
            return (
              <div key={est} className="border border-[#2A2A2A] bg-[#0A0A0A] min-h-[400px]">
                <div className="px-3 py-2.5 border-b border-[#2A2A2A] bg-[#111]">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white">{LEAD_STATUS_LABELS[est]}</p>
                  <p className="text-[9px] text-[#555] mt-0.5">{colLeads.length} lead{colLeads.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="p-2 space-y-2">
                  {colLeads.map((lead) => {
                    const seller = sellers.find((s) => s.id === lead.asignadoA)
                    return (
                      <button key={lead.id} onClick={() => setOpenedLead(lead.id)}
                        className="w-full text-left border border-[#2A2A2A] bg-[#111] p-2.5 hover:border-[#555] transition-colors">
                        <p className="text-xs text-white font-light truncate">{lead.nombre}</p>
                        {lead.nombreOptica && <p className="text-[10px] text-[#A0A0A0] truncate mt-0.5">{lead.nombreOptica}</p>}
                        <div className="flex items-center justify-between mt-2 text-[9px] text-[#555]">
                          <span>{seller?.nombre ?? 'Sin asignar'}</span>
                          <span>{formatDate(lead.createdAt)}</span>
                        </div>
                      </button>
                    )
                  })}
                  {colLeads.length === 0 && (
                    <p className="text-[10px] text-[#444] text-center py-4">Vacío</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLA VIEW */
        <div className="overflow-x-auto border border-[#2A2A2A]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
                {['Lead', 'Óptica', 'Teléfono', 'Origen', 'Asignado', 'Estado', 'Fecha', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-[#555] py-12 text-xs">Sin leads</td></tr>
              ) : filtered.map((lead) => {
                const seller = sellers.find((s) => s.id === lead.asignadoA)
                return (
                  <tr key={lead.id} className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors">
                    <td className="px-4 py-3 text-white text-xs font-medium whitespace-nowrap">{lead.nombre}</td>
                    <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{lead.nombreOptica ?? '—'}</td>
                    <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{lead.telefono}</td>
                    <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{ORIGENES_LABEL[lead.origen]}</td>
                    <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{seller?.nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]', LEAD_STATUS_COLORS[lead.estado])}>
                        {LEAD_STATUS_LABELS[lead.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#555] text-xs whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setOpenedLead(lead.id)} className="text-[#A0A0A0] hover:text-white text-[10px] tracking-[0.15em] uppercase">Abrir</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* LEAD DETAIL DRAWER */}
      {openedLead && (() => {
        const lead = leads.find((l) => l.id === openedLead)
        if (!lead) return null
        const seller = sellers.find((s) => s.id === lead.asignadoA)
        return (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center md:p-6" onClick={() => setOpenedLead(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-[#0A0A0A] border border-[#2A2A2A] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between p-5 border-b border-[#2A2A2A]">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Lead</p>
                  <h2 className="text-xl text-white font-light">{lead.nombre}</h2>
                  {lead.nombreOptica && <p className="text-sm text-[#A0A0A0]">{lead.nombreOptica}</p>}
                </div>
                <button onClick={() => setOpenedLead(null)} className="text-[#555] hover:text-white text-2xl">×</button>
              </div>

              <div className="p-5 space-y-5">
                {/* Estado + origen */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Estado</p>
                    <select value={lead.estado} onChange={(e) => handleEstadoChange(lead.id, e.target.value as LeadStatus)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5">
                      {ALL_STATES.map((e) => (<option key={e} value={e}>{LEAD_STATUS_LABELS[e]}</option>))}
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Asignado a</p>
                    <select value={lead.asignadoA ?? ''} onChange={(e) => handleAssign(lead.id, e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5">
                      <option value="">Sin asignar</option>
                      {sellers.map((s) => (<option key={s.id} value={s.id}>{s.nombre}</option>))}
                    </select>
                  </div>
                </div>

                {/* Contacto */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-[#555]">Email:</span> <span className="text-white">{lead.email}</span></div>
                  <div><span className="text-[#555]">Teléfono:</span> <span className="text-white">{lead.telefono}</span></div>
                  <div><span className="text-[#555]">Ciudad:</span> <span className="text-white">{lead.ciudad ?? '—'}</span></div>
                  <div><span className="text-[#555]">Origen:</span> <span className="text-white">{ORIGENES_LABEL[lead.origen]}</span></div>
                </div>

                {/* Mensaje original */}
                {lead.mensaje && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Mensaje original</p>
                    <p className="text-[#A0A0A0] text-xs italic border-l-2 border-[#2A2A2A] pl-3">{lead.mensaje}</p>
                  </div>
                )}

                {/* Notas */}
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Notas de seguimiento ({lead.notas.length})</p>
                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                    {lead.notas.map((n) => (
                      <div key={n.id} className="border-l-2 border-[#2A2A2A] pl-3 py-1">
                        <p className="text-xs text-[#A0A0A0]">{n.texto}</p>
                        <p className="text-[10px] text-[#555] mt-0.5">{n.autor} · {formatDate(n.createdAt)}</p>
                      </div>
                    ))}
                    {lead.notas.length === 0 && <p className="text-[#555] text-xs italic">Sin notas</p>}
                  </div>
                  <div className="flex gap-2">
                    <input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Nueva nota..."
                      className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#444]" />
                    <button onClick={() => handleAddNote(lead.id)}
                      className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors">
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
