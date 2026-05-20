'use client'

import { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/data-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import type { RepresentativeRequest } from '@/types'

type Filter = 'todas' | 'pendiente' | 'aprobada' | 'rechazada'

const ESTADO_LABEL: Record<RepresentativeRequest['estado'], string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}
const ESTADO_COLOR: Record<RepresentativeRequest['estado'], string> = {
  pendiente: 'bg-yellow-950 text-yellow-400',
  aprobada: 'bg-emerald-950 text-emerald-400',
  rechazada: 'bg-red-950 text-red-400',
}

export default function AdminSolicitudesPage() {
  const { representativeRequests, sellers, approveRepresentativeRequest, rejectRepresentativeRequest } = useDataStore()
  const { user } = useAuthStore()
  const [filter, setFilter] = useState<Filter>('pendiente')
  const [openedId, setOpenedId] = useState<string | null>(null)
  const [assignedSeller, setAssignedSeller] = useState('s1')
  const [rejectReason, setRejectReason] = useState('')

  const stats = useMemo(() => ({
    pendiente: representativeRequests.filter((r) => r.estado === 'pendiente').length,
    aprobada: representativeRequests.filter((r) => r.estado === 'aprobada').length,
    rechazada: representativeRequests.filter((r) => r.estado === 'rechazada').length,
    total: representativeRequests.length,
  }), [representativeRequests])

  const filtered = useMemo(() => {
    if (filter === 'todas') return representativeRequests
    return representativeRequests.filter((r) => r.estado === filter)
  }, [representativeRequests, filter])

  function handleApprove(id: string) {
    if (!assignedSeller) {
      toast.error('Asigná un vendedor antes de aprobar')
      return
    }
    approveRepresentativeRequest(id, assignedSeller, user?.name ?? 'Admin')
    toast.success('Solicitud aprobada. Las credenciales se envían a la óptica por WhatsApp.')
    setOpenedId(null)
  }

  function handleReject(id: string) {
    if (!rejectReason.trim()) {
      toast.error('Indicá el motivo del rechazo')
      return
    }
    rejectRepresentativeRequest(id, rejectReason, user?.name ?? 'Admin')
    toast.success('Solicitud rechazada')
    setOpenedId(null); setRejectReason('')
  }

  const TABS: { key: Filter; label: string; count?: number }[] = [
    { key: 'pendiente', label: 'Pendientes', count: stats.pendiente },
    { key: 'aprobada', label: 'Aprobadas', count: stats.aprobada },
    { key: 'rechazada', label: 'Rechazadas', count: stats.rechazada },
    { key: 'todas', label: 'Todas', count: stats.total },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">SOLICITUDES DE REPRESENTANTE</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          Ópticas que pidieron representar BIANNI desde la web
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)} className={cn(
            'border p-4 text-left transition-colors',
            filter === t.key ? 'border-white bg-[#0A0A0A]' : 'border-[#2A2A2A] hover:border-[#444]'
          )}>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">{t.label}</p>
            <p className="font-display text-3xl text-white">{t.count ?? 0}</p>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-[#555] text-xs py-16">Sin solicitudes en esta categoría</div>
        ) : filtered.map((req) => (
          <div key={req.id} className="bg-[#111] border border-[#2A2A2A] p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-white text-base font-light">{req.nombreOptica}</p>
                <p className="text-[#A0A0A0] text-xs">{req.nombreContacto} · {req.ciudad}, {req.provincia}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]', ESTADO_COLOR[req.estado])}>
                  {ESTADO_LABEL[req.estado]}
                </span>
                <span className="text-[10px] text-[#555]">{formatDate(req.createdAt)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
              <div><span className="text-[#555]">Email:</span> <span className="text-white">{req.email}</span></div>
              <div><span className="text-[#555]">Teléfono:</span> <span className="text-white">{req.telefono}</span></div>
              <div><span className="text-[#555]">CUIT:</span> <span className="text-white">{req.cuit ?? '—'}</span></div>
              <div><span className="text-[#555]">Experiencia:</span> <span className="text-white">{req.experienciaRubro ?? '—'}</span></div>
            </div>

            {req.mensaje && (
              <p className="text-[#A0A0A0] text-xs italic border-l-2 border-[#2A2A2A] pl-3 mb-3">{req.mensaje}</p>
            )}

            {req.estado === 'pendiente' && (
              <div className="border-t border-[#1A1A1A] pt-3 mt-3">
                {openedId === req.id ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Asignar vendedor</p>
                      <select value={assignedSeller} onChange={(e) => setAssignedSeller(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2">
                        {sellers.map((s) => (<option key={s.id} value={s.id}>{s.nombre}</option>))}
                      </select>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Motivo de rechazo (si rechazás)</p>
                      <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ej: No tiene local físico verificable"
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2 placeholder:text-[#444]" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setOpenedId(null)}
                        className="border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-[#1A1A1A]">Cancelar</button>
                      <button onClick={() => handleReject(req.id)}
                        className="border border-red-700 text-red-400 bg-red-950 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-red-900 flex items-center gap-1">
                        <X size={12} /> Rechazar
                      </button>
                      <button onClick={() => handleApprove(req.id)}
                        className="border border-emerald-700 text-emerald-400 bg-emerald-950 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-emerald-900 flex items-center gap-1">
                        <Check size={12} /> Aprobar + enviar credenciales
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setOpenedId(req.id)}
                    className="text-[10px] tracking-[0.15em] uppercase text-white border border-[#2A2A2A] px-4 py-1.5 hover:border-white">
                    Revisar y decidir
                  </button>
                )}
              </div>
            )}

            {req.estado === 'aprobada' && req.sellerIdAsignado && (
              <p className="text-[10px] text-emerald-400 border-t border-[#1A1A1A] pt-2 mt-2">
                ✓ Aprobada por {req.resueltaPor} · Vendedor asignado: {sellers.find((s) => s.id === req.sellerIdAsignado)?.nombre}
              </p>
            )}
            {req.estado === 'rechazada' && req.motivoRechazo && (
              <p className="text-[10px] text-red-400 border-t border-[#1A1A1A] pt-2 mt-2">
                ✗ Rechazada por {req.resueltaPor}: {req.motivoRechazo}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
