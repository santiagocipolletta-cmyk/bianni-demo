'use client'

import { useState, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useDataStore } from '@/stores/data-store'
import { cn, normalizeText } from '@/lib/utils'
import { toast } from 'sonner'
import { Eye, EyeOff, Pause, Play, Search, KeyRound, Users, X, ArrowRight, MapPin, Star } from 'lucide-react'
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
  const {
    clients,
    priceLists,
    sellers,
    updateClientStatus,
    toggleClientCtaCteVisibility,
    updateClientPlazoPago,
    reassignClient,
    reassignClientsBulk,
    resetClientPassword,
  } = useDataStore()
  const [filter, setFilter] = useState<StatusFilter>('todas')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPlazo, setEditPlazo] = useState(30)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkFrom, setBulkFrom] = useState<string>(sellers[0]?.id ?? '')
  const [bulkTo, setBulkTo] = useState<string>(sellers[1]?.id ?? sellers[0]?.id ?? '')
  const [addressesClientId, setAddressesClientId] = useState<string | null>(null)
  const addressesClient = clients.find((c) => c.id === addressesClientId) ?? null

  const stats = useMemo(() => ({
    activa: clients.filter((c) => c.status === 'activa').length,
    suspendida: clients.filter((c) => c.status === 'suspendida').length,
    pendiente_datos: clients.filter((c) => c.status === 'pendiente_datos').length,
  }), [clients])

  const filtered = useMemo(() => {
    let result = clients
    if (filter !== 'todas') result = result.filter((c) => c.status === filter)
    const q = normalizeText(search.trim())
    if (q) {
      result = result.filter((c) =>
        normalizeText(c.nombre).includes(q) ||
        normalizeText(c.ciudad).includes(q) ||
        (c.cuit?.includes(q) ?? false) ||
        normalizeText(c.email).includes(q)
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

  function handleReassignClient(client: Client, newSellerId: string) {
    if (newSellerId === client.sellerId) return
    reassignClient(client.id, newSellerId)
    const newSellerName = sellerName(newSellerId)
    toast.success(`Óptica reasignada a ${newSellerName}`)
  }

  async function handleResetPassword(client: Client) {
    if (!window.confirm(`¿Resetear la contraseña de ${client.nombre}?`)) return
    const newPassword = resetClientPassword(client.id)
    try {
      await navigator.clipboard.writeText(newPassword)
      toast.success(`Nueva contraseña: ${newPassword} — copiada al portapapeles`)
    } catch {
      toast.success(`Nueva contraseña: ${newPassword}`)
    }
  }

  const bulkCount = useMemo(
    () => (bulkFrom ? clients.filter((c) => c.sellerId === bulkFrom).length : 0),
    [clients, bulkFrom]
  )

  function handleBulkReassign() {
    if (!bulkFrom || !bulkTo) {
      toast.error('Seleccioná vendedor origen y destino')
      return
    }
    if (bulkFrom === bulkTo) {
      toast.error('Origen y destino no pueden ser iguales')
      return
    }
    const count = reassignClientsBulk(bulkFrom, bulkTo)
    if (count === 0) {
      toast.error('El vendedor origen no tiene ópticas asignadas')
      return
    }
    toast.success(
      `${count} ${count === 1 ? 'óptica reasignada' : 'ópticas reasignadas'} de ${sellerName(bulkFrom)} a ${sellerName(bulkTo)}`
    )
    setBulkOpen(false)
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
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-2 border border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#444] hover:bg-[#111] text-white text-[10px] tracking-[0.2em] uppercase px-3 py-2 transition-colors"
          >
            <Users size={12} strokeWidth={1.5} />
            Reasignar todas las ópticas de un vendedor
          </button>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar óptica..."
              className="w-72 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs pl-9 pr-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]" />
          </div>
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
              {['Óptica', 'Estado', 'CUIT', 'Ciudad', 'Lista', 'Vendedor', 'Plazo', 'Cta Cte', 'Direcciones', 'Origen', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={11} className="text-center text-[#555] py-12 text-xs">Sin clientes</td></tr>
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
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={client.sellerId}
                    onChange={(e) => handleReassignClient(client, e.target.value)}
                    className="bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#444] text-[#A0A0A0] hover:text-white text-xs px-2 py-1 focus:outline-none focus:border-[#555] transition-colors"
                  >
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0A0A0A] text-white">
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </td>
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
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => setAddressesClientId(client.id)}
                    title="Ver direcciones de envío"
                    className="flex items-center gap-1 text-[10px] text-[#A0A0A0] hover:text-white transition-colors"
                  >
                    <MapPin size={12} strokeWidth={1.5} />
                    {client.addresses.length}
                  </button>
                </td>
                <td className="px-4 py-3 text-[#A0A0A0] text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                  {client.origenAlta}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSuspend(client)}
                      className={cn('flex items-center gap-1 border text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 transition-colors',
                        client.status === 'suspendida'
                          ? 'border-emerald-700 text-emerald-400 hover:bg-emerald-950'
                          : 'border-red-800 text-red-400 hover:bg-red-950')}>
                      {client.status === 'suspendida' ? <><Play size={11} /> Reactivar</> : <><Pause size={11} /> Suspender</>}
                    </button>
                    <button onClick={() => handleResetPassword(client)}
                      title="Resetear contraseña"
                      className="flex items-center gap-1 border border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#444] text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 transition-colors">
                      <KeyRound size={11} /> Reset password
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog: reasignación masiva */}
      <Dialog.Root open={bulkOpen} onOpenChange={setBulkOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-[#111] border border-[#2A2A2A] shadow-2xl"
          >
            <div className="flex items-start justify-between p-6 pb-4 border-b border-[#1A1A1A]">
              <div>
                <Dialog.Title className="font-display text-xl text-white tracking-[0.05em]">
                  REASIGNACIÓN MASIVA
                </Dialog.Title>
                <p className="text-[#555] text-[10px] tracking-[0.15em] uppercase mt-1">
                  Transferir cartera entre vendedores
                </p>
              </div>
              <Dialog.Close asChild>
                <button className="text-[#555] hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1.5">
                    Vendedor origen
                  </label>
                  <select
                    value={bulkFrom}
                    onChange={(e) => setBulkFrom(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2.5 focus:outline-none focus:border-[#555]"
                  >
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-center pb-2 text-[#555]">
                  <ArrowRight size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1.5">
                    Vendedor destino
                  </label>
                  <select
                    value={bulkTo}
                    onChange={(e) => setBulkTo(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2.5 focus:outline-none focus:border-[#555]"
                  >
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mb-1">Resumen</p>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">
                  Esto reasignará <span className="text-white font-medium">{bulkCount}</span>{' '}
                  {bulkCount === 1 ? 'óptica' : 'ópticas'} del vendedor{' '}
                  <span className="text-white">{sellerName(bulkFrom)}</span> al vendedor{' '}
                  <span className="text-white">{sellerName(bulkTo)}</span>.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <Dialog.Close asChild>
                  <button className="flex-1 border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase px-3 py-2.5 hover:bg-[#1A1A1A] transition-colors">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleBulkReassign}
                  disabled={!bulkFrom || !bulkTo || bulkFrom === bulkTo || bulkCount === 0}
                  className="flex-[2] border border-emerald-700 text-emerald-400 bg-emerald-950/40 text-[10px] tracking-[0.15em] uppercase px-3 py-2.5 hover:bg-emerald-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar reasignación
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dialog: ver direcciones de envío (read-only) */}
      <Dialog.Root open={addressesClient !== null} onOpenChange={(v) => { if (!v) setAddressesClientId(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl max-h-[85vh] overflow-y-auto bg-[#111] border border-[#2A2A2A] shadow-2xl"
          >
            <div className="flex items-start justify-between p-6 pb-4 border-b border-[#1A1A1A] sticky top-0 bg-[#111] z-10">
              <div>
                <Dialog.Title className="font-display text-xl text-white tracking-[0.05em]">
                  DIRECCIONES DE ENVÍO
                </Dialog.Title>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mt-1">
                  {addressesClient?.nombre} · {addressesClient?.addresses.length ?? 0} guardadas
                </p>
              </div>
              <Dialog.Close asChild>
                <button className="text-[#555] hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6 space-y-3">
              {addressesClient && addressesClient.addresses.length === 0 ? (
                <div className="border border-dashed border-[#2A2A2A] p-8 text-center">
                  <MapPin size={20} strokeWidth={1.2} className="mx-auto text-[#555] mb-3" />
                  <p className="text-[#A0A0A0] text-xs">Esta óptica todavía no cargó direcciones de envío.</p>
                </div>
              ) : (
                addressesClient?.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={cn(
                      'border p-4 space-y-2',
                      addr.esPrincipal ? 'border-emerald-800 bg-emerald-950/10' : 'border-[#2A2A2A] bg-[#0A0A0A]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm font-light">{addr.etiqueta}</p>
                      {addr.esPrincipal && (
                        <span className="flex items-center gap-1 bg-emerald-950 text-emerald-400 text-[9px] tracking-[0.2em] uppercase px-2 py-0.5">
                          <Star size={10} strokeWidth={2} fill="currentColor" />
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-white text-xs">{addr.direccion}</p>
                    <p className="text-[#A0A0A0] text-[11px]">
                      {addr.ciudad}, {addr.provincia} — CP {addr.codigoPostal}
                    </p>
                    {(addr.receptor || addr.telefonoContacto) && (
                      <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] pt-1 border-t border-[#1A1A1A]">
                        {addr.receptor ?? '—'}{addr.telefonoContacto ? ` · ${addr.telefonoContacto}` : ''}
                      </p>
                    )}
                  </div>
                ))
              )}

              <p className="text-[10px] text-[#555] pt-3 border-t border-[#1A1A1A] leading-relaxed">
                Las direcciones las gestiona el propio cliente desde su panel
                (<span className="text-[#A0A0A0]">/cuenta/direcciones</span>). Esta vista es de solo lectura.
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
