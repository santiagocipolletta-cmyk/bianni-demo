'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, X, Mail, Phone, MapPin, Calendar, Building2, UserCheck, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useDataStore } from '@/stores/data-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatDate } from '@/lib/utils'
import type { RepresentativeRequest, Client } from '@/types'

type Filter = 'todas' | 'pendiente' | 'aprobada' | 'rechazada'

const ESTADO_LABEL: Record<RepresentativeRequest['estado'], string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}
const ESTADO_COLOR: Record<RepresentativeRequest['estado'], string> = {
  pendiente: 'bg-yellow-950 text-yellow-400 border-yellow-900/50',
  aprobada: 'bg-emerald-950 text-emerald-400 border-emerald-900/50',
  rechazada: 'bg-red-950 text-red-400 border-red-900/50',
}

function genPassword(): string {
  return Math.random().toString(36).slice(-8)
}

export default function AdminRepresentantesPage() {
  const {
    representativeRequests,
    sellers,
    clients,
    approveRepresentativeRequest,
    rejectRepresentativeRequest,
    addClient,
    addNotification,
    resetClientPassword,
  } = useDataStore()
  const { user } = useAuthStore()

  const [filter, setFilter] = useState<Filter>('pendiente')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<'view' | 'approve' | 'reject'>('view')
  const [assignedSeller, setAssignedSeller] = useState<string>('s1')
  const [rejectReason, setRejectReason] = useState<string>('')

  const stats = useMemo(
    () => ({
      pendiente: representativeRequests.filter((r) => r.estado === 'pendiente').length,
      aprobada: representativeRequests.filter((r) => r.estado === 'aprobada').length,
      rechazada: representativeRequests.filter((r) => r.estado === 'rechazada').length,
      total: representativeRequests.length,
    }),
    [representativeRequests]
  )

  const filtered = useMemo(() => {
    const all =
      filter === 'todas'
        ? representativeRequests
        : representativeRequests.filter((r) => r.estado === filter)
    return [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [representativeRequests, filter])

  const selected = selectedId
    ? representativeRequests.find((r) => r.id === selectedId) ?? null
    : null

  function closeDrawer() {
    setSelectedId(null)
    setMode('view')
    setRejectReason('')
  }

  function handleApprove() {
    if (!selected) return
    if (!assignedSeller) {
      toast.error('Asigná un vendedor antes de aprobar')
      return
    }

    // 1. Aprobar la solicitud
    approveRepresentativeRequest(selected.id, assignedSeller, user?.name ?? 'Admin')

    // 2. Crear el cliente
    const newClient: Client = {
      id: `c_${Date.now()}`,
      nombre: selected.nombreOptica,
      ciudad: selected.ciudad,
      provincia: selected.provincia,
      plazoPagoDias: 30,
      priceListId: 'pl1',
      sellerId: assignedSeller,
      telefono: selected.telefono,
      email: selected.email,
      cuit: selected.cuit,
      addresses: [],
      status: 'pendiente_datos',
      profileCompleto: false,
      verCuentaCorriente: true,
      fechaAlta: new Date().toISOString(),
      origenAlta: 'web',
    }
    addClient(newClient)

    // 3. Notificación al vendedor asignado (mock)
    addNotification({
      userId: 'u2', // vendedor demo
      tipo: 'alta_optica',
      titulo: 'Nueva óptica asignada',
      mensaje: `Se asignó la óptica ${selected.nombreOptica} (${selected.ciudad}, ${selected.provincia}).`,
      leida: false,
    })

    // 4. Mock — credenciales generadas
    const mockPassword = genPassword()
    toast.success(
      `Solicitud aprobada. Credenciales enviadas por WhatsApp (mock: ${selected.email} / ${mockPassword})`
    )
    closeDrawer()
  }

  async function handleResetClientPassword() {
    if (!selected) return
    // Búsqueda por email (no hay vínculo directo entre request y client)
    const client = clients.find(
      (c) => c.email.toLowerCase() === selected.email.toLowerCase()
    )
    if (!client) {
      toast.error('No se encontró la óptica creada para esta solicitud')
      return
    }
    if (!window.confirm(`¿Resetear la contraseña de ${client.nombre}?`)) return
    const newPassword = resetClientPassword(client.id)
    try {
      await navigator.clipboard.writeText(newPassword)
      toast.success(`Nueva contraseña: ${newPassword} — copiada al portapapeles`)
    } catch {
      toast.success(`Nueva contraseña: ${newPassword}`)
    }
  }

  function handleReject() {
    if (!selected) return
    if (!rejectReason.trim()) {
      toast.error('Indicá el motivo del rechazo')
      return
    }
    rejectRepresentativeRequest(selected.id, rejectReason.trim(), user?.name ?? 'Admin')
    toast.success('Solicitud rechazada')
    closeDrawer()
  }

  const TABS: { key: Filter; label: string; count: number }[] = [
    { key: 'pendiente', label: 'Pendientes', count: stats.pendiente },
    { key: 'aprobada', label: 'Aprobadas', count: stats.aprobada },
    { key: 'rechazada', label: 'Rechazadas', count: stats.rechazada },
    { key: 'todas', label: 'Todas', count: stats.total },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em] uppercase">
          Solicitudes de representante
        </h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          Bandeja de entrada — ópticas que pidieron sumarse a BIANNI
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              'border p-4 text-left transition-colors',
              filter === t.key
                ? 'border-white bg-[#0A0A0A]'
                : 'border-[#2A2A2A] hover:border-[#444]'
            )}
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">{t.label}</p>
            <p className="font-display text-3xl text-white">{t.count}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#2A2A2A] bg-[#0A0A0A] overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-[#555] text-xs py-16 tracking-[0.15em] uppercase">
            Sin solicitudes en esta categoría
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2A2A2A] text-[#555]">
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-medium">Óptica</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-medium">Contacto</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-medium hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-medium hidden lg:table-cell">Ciudad</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-medium hidden md:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => {
                    setSelectedId(req.id)
                    setMode('view')
                  }}
                  className="border-b border-[#1A1A1A] hover:bg-[#111] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-white font-light">{req.nombreOptica}</td>
                  <td className="px-4 py-3 text-[#A0A0A0]">{req.nombreContacto}</td>
                  <td className="px-4 py-3 text-[#A0A0A0] hidden md:table-cell">{req.email}</td>
                  <td className="px-4 py-3 text-[#A0A0A0] hidden lg:table-cell">
                    {req.ciudad}, {req.provincia}
                  </td>
                  <td className="px-4 py-3 text-[#555] hidden md:table-cell">{formatDate(req.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-[10px] px-2 py-1 uppercase tracking-[0.1em] border',
                        ESTADO_COLOR[req.estado]
                      )}
                    >
                      {ESTADO_LABEL[req.estado]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70"
              onClick={closeDrawer}
            />
            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0A0A0A] border-l border-[#2A2A2A] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-5">
                <div className="flex items-center gap-2">
                  <Building2 size={16} strokeWidth={1.5} className="text-[#666]" />
                  <h2 className="text-[11px] tracking-[0.3em] uppercase text-white font-medium">
                    Detalle solicitud
                  </h2>
                </div>
                <button
                  onClick={closeDrawer}
                  className="text-[#555] hover:text-white transition-colors"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Estado */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-[10px] px-3 py-1 uppercase tracking-[0.15em] border',
                      ESTADO_COLOR[selected.estado]
                    )}
                  >
                    {ESTADO_LABEL[selected.estado]}
                  </span>
                  <span className="text-[10px] text-[#555] tracking-wide">
                    {formatDate(selected.createdAt)}
                  </span>
                </div>

                {/* Óptica */}
                <div>
                  <p className="text-[9px] tracking-[0.25em] uppercase text-[#555] mb-1">Óptica</p>
                  <p className="font-display text-2xl text-white font-light">
                    {selected.nombreOptica}
                  </p>
                </div>

                {/* Info */}
                <div className="space-y-3 border-t border-[#1A1A1A] pt-5">
                  <Detail icon={UserCheck} label="Contacto" value={selected.nombreContacto} />
                  <Detail icon={Mail} label="Email" value={selected.email} />
                  <Detail icon={Phone} label="Teléfono" value={selected.telefono} />
                  <Detail
                    icon={MapPin}
                    label="Ubicación"
                    value={`${selected.ciudad}, ${selected.provincia}`}
                  />
                  {selected.cuit && <Detail icon={Building2} label="CUIT" value={selected.cuit} />}
                  <Detail icon={Calendar} label="Fecha" value={formatDate(selected.createdAt)} />
                </div>

                {selected.mensaje && (
                  <div className="border-t border-[#1A1A1A] pt-5">
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#555] mb-2">Mensaje</p>
                    <p className="text-[#A0A0A0] text-sm italic border-l-2 border-[#2A2A2A] pl-3 leading-relaxed">
                      {selected.mensaje}
                    </p>
                  </div>
                )}

                {selected.experienciaRubro && (
                  <div className="border-t border-[#1A1A1A] pt-5">
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#555] mb-2">
                      Experiencia
                    </p>
                    <p className="text-[#A0A0A0] text-sm">{selected.experienciaRubro}</p>
                  </div>
                )}

                {/* Acciones */}
                {selected.estado === 'pendiente' && (
                  <div className="border-t border-[#1A1A1A] pt-5">
                    {mode === 'view' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMode('reject')}
                          className="flex-1 border border-red-700 text-red-400 bg-red-950/30 text-[10px] tracking-[0.15em] uppercase px-3 py-2.5 hover:bg-red-900/40 flex items-center justify-center gap-1.5"
                        >
                          <X size={12} /> Rechazar
                        </button>
                        <button
                          onClick={() => setMode('approve')}
                          className="flex-1 border border-emerald-700 text-emerald-400 bg-emerald-950/30 text-[10px] tracking-[0.15em] uppercase px-3 py-2.5 hover:bg-emerald-900/40 flex items-center justify-center gap-1.5"
                        >
                          <Check size={12} /> Aprobar
                        </button>
                      </div>
                    )}

                    {mode === 'approve' && (
                      <div className="space-y-3 border border-emerald-900/50 bg-emerald-950/20 p-4">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-emerald-400">
                          Aprobar y crear cliente
                        </p>
                        <div>
                          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1.5">
                            Vendedor asignado
                          </label>
                          <select
                            value={assignedSeller}
                            onChange={(e) => setAssignedSeller(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2.5 outline-none focus:border-[#555]"
                          >
                            {sellers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="text-[10px] text-[#666] leading-relaxed">
                          Se creará la óptica con estado &ldquo;pendiente de datos&rdquo; y se le
                          enviarán credenciales mock por WhatsApp.
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => setMode('view')}
                            className="flex-1 border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-[#1A1A1A]"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleApprove}
                            className="flex-[2] border border-emerald-700 text-emerald-400 bg-emerald-950 text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-emerald-900 flex items-center justify-center gap-1.5"
                          >
                            <Check size={12} /> Aprobar y crear cliente
                          </button>
                        </div>
                      </div>
                    )}

                    {mode === 'reject' && (
                      <div className="space-y-3 border border-red-900/50 bg-red-950/20 p-4">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-red-400">
                          Rechazar solicitud
                        </p>
                        <div>
                          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1.5">
                            Motivo del rechazo
                          </label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="Ej: No tiene local físico verificable"
                            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2.5 outline-none focus:border-[#555] resize-none placeholder:text-[#444]"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              setMode('view')
                              setRejectReason('')
                            }}
                            className="flex-1 border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-[#1A1A1A]"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleReject}
                            className="flex-[2] border border-red-700 text-red-400 bg-red-950 text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-red-900 flex items-center justify-center gap-1.5"
                          >
                            <X size={12} /> Confirmar rechazo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selected.estado === 'aprobada' && selected.sellerIdAsignado && (
                  <div className="border-t border-[#1A1A1A] pt-5 space-y-4">
                    <div>
                      <p className="text-[10px] text-emerald-400 leading-relaxed">
                        ✓ Aprobada por {selected.resueltaPor} ·{' '}
                        {selected.resueltaEn && formatDate(selected.resueltaEn)}
                      </p>
                      <p className="text-[10px] text-[#A0A0A0] mt-1">
                        Vendedor asignado:{' '}
                        {sellers.find((s) => s.id === selected.sellerIdAsignado)?.nombre ?? '—'}
                      </p>
                    </div>
                    <button
                      onClick={handleResetClientPassword}
                      className="w-full flex items-center justify-center gap-1.5 border border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#444] text-[10px] tracking-[0.15em] uppercase px-3 py-2.5 transition-colors"
                    >
                      <KeyRound size={12} strokeWidth={1.5} />
                      Reset password de esta óptica
                    </button>
                  </div>
                )}

                {selected.estado === 'rechazada' && selected.motivoRechazo && (
                  <div className="border-t border-[#1A1A1A] pt-5">
                    <p className="text-[10px] text-red-400 leading-relaxed">
                      ✗ Rechazada por {selected.resueltaPor}
                    </p>
                    <p className="text-[10px] text-[#A0A0A0] mt-2 italic border-l-2 border-[#2A2A2A] pl-3">
                      {selected.motivoRechazo}
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} strokeWidth={1.5} className="text-[#555] mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-0.5">{label}</p>
        <p className="text-sm text-white font-light truncate">{value}</p>
      </div>
    </div>
  )
}
