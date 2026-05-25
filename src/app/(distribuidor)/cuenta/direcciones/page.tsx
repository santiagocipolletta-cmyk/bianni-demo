'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { MapPin, Plus, X, Pencil, Trash2, Star, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import type { SavedAddress } from '@/types'

const PROVINCIAS = [
  'CABA', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

type FormState = {
  etiqueta: string
  direccion: string
  ciudad: string
  provincia: string
  codigoPostal: string
  receptor: string
  telefonoContacto: string
  esPrincipal: boolean
}

const EMPTY_FORM: FormState = {
  etiqueta: '',
  direccion: '',
  ciudad: '',
  provincia: 'CABA',
  codigoPostal: '',
  receptor: '',
  telefonoContacto: '',
  esPrincipal: false,
}

export default function DireccionesPage() {
  const { user } = useAuthStore()
  const { clients, addClientAddress, updateClientAddress, deleteClientAddress, setClientAddressPrincipal } = useDataStore()

  const client = clients.find((c) => c.id === user?.clientId)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  if (!client) {
    return (
      <div className="min-h-full bg-[#000] p-6 flex items-center justify-center">
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase">Cargando…</p>
      </div>
    )
  }

  const addresses = client.addresses

  function openCreate() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, esPrincipal: addresses.length === 0 })
    setDialogOpen(true)
  }

  function openEdit(addr: SavedAddress) {
    setEditingId(addr.id)
    setForm({
      etiqueta: addr.etiqueta,
      direccion: addr.direccion,
      ciudad: addr.ciudad,
      provincia: addr.provincia,
      codigoPostal: addr.codigoPostal,
      receptor: addr.receptor ?? '',
      telefonoContacto: addr.telefonoContacto ?? '',
      esPrincipal: addr.esPrincipal,
    })
    setDialogOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.etiqueta.trim()) {
      toast.error('Ingresá una etiqueta (ej: Local principal)')
      return
    }
    if (!form.direccion.trim() || !form.ciudad.trim() || !form.codigoPostal.trim()) {
      toast.error('Completá dirección, ciudad y código postal')
      return
    }

    const payload: Omit<SavedAddress, 'id'> = {
      etiqueta: form.etiqueta.trim(),
      direccion: form.direccion.trim(),
      ciudad: form.ciudad.trim(),
      provincia: form.provincia,
      codigoPostal: form.codigoPostal.trim(),
      receptor: form.receptor.trim() || undefined,
      telefonoContacto: form.telefonoContacto.trim() || undefined,
      esPrincipal: form.esPrincipal,
    }

    if (editingId) {
      updateClientAddress(client!.id, editingId, payload)
      if (form.esPrincipal) setClientAddressPrincipal(client!.id, editingId)
      toast.success('Dirección actualizada')
    } else {
      addClientAddress(client!.id, payload)
      toast.success('Dirección agregada')
    }
    setDialogOpen(false)
  }

  function handleDelete(addr: SavedAddress) {
    if (addresses.length <= 1) return
    if (!window.confirm(`¿Eliminar la dirección "${addr.etiqueta}"?`)) return
    deleteClientAddress(client!.id, addr.id)
    toast.success('Dirección eliminada')
  }

  function handleSetPrincipal(addr: SavedAddress) {
    setClientAddressPrincipal(client!.id, addr.id)
    toast.success(`"${addr.etiqueta}" marcada como principal`)
  }

  return (
    <div className="min-h-full bg-[#000] p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-white tracking-[0.05em] mb-1">
            MIS DIRECCIONES DE ENVÍO
          </h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">
            {client.nombre} · {addresses.length} {addresses.length === 1 ? 'dirección guardada' : 'direcciones guardadas'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-white text-black text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 font-medium hover:bg-zinc-100 transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          Agregar dirección
        </button>
      </div>

      {/* Empty state */}
      {addresses.length === 0 ? (
        <div className="border border-dashed border-[#2A2A2A] p-12 text-center">
          <MapPin size={28} strokeWidth={1.2} className="mx-auto text-[#555] mb-4" />
          <p className="text-white text-sm mb-1">Todavía no tenés direcciones guardadas</p>
          <p className="text-[#555] text-xs mb-6">Agregá tu local principal, depósito o cualquier otra dirección de envío.</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 border border-[#2A2A2A] text-white text-[10px] tracking-[0.2em] uppercase px-4 py-2 hover:border-white transition-colors"
          >
            <Plus size={12} />
            Agregar primera dirección
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                'bg-[#111] border p-5 space-y-3',
                addr.esPrincipal ? 'border-emerald-800' : 'border-[#2A2A2A]'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-0.5">Etiqueta</p>
                  <p className="text-white text-base font-light truncate">{addr.etiqueta}</p>
                </div>
                {addr.esPrincipal && (
                  <span className="flex items-center gap-1 bg-emerald-950 text-emerald-400 text-[9px] tracking-[0.2em] uppercase px-2 py-1 flex-shrink-0">
                    <Star size={10} strokeWidth={2} fill="currentColor" />
                    Principal
                  </span>
                )}
              </div>

              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-0.5">Dirección</p>
                <p className="text-white text-sm leading-relaxed">{addr.direccion}</p>
                <p className="text-[#A0A0A0] text-xs">
                  {addr.ciudad}, {addr.provincia} — CP {addr.codigoPostal}
                </p>
              </div>

              {(addr.receptor || addr.telefonoContacto) && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-0.5">Contacto</p>
                  <p className="text-[#A0A0A0] text-xs">
                    {addr.receptor && <span>{addr.receptor}</span>}
                    {addr.receptor && addr.telefonoContacto && <span> · </span>}
                    {addr.telefonoContacto && <span>{addr.telefonoContacto}</span>}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#1A1A1A]">
                <button
                  onClick={() => openEdit(addr)}
                  className="flex items-center gap-1.5 border border-[#2A2A2A] text-white text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 hover:border-white transition-colors"
                >
                  <Pencil size={11} strokeWidth={1.5} />
                  Editar
                </button>
                {!addr.esPrincipal && (
                  <button
                    onClick={() => handleSetPrincipal(addr)}
                    className="flex items-center gap-1.5 border border-emerald-900 text-emerald-400 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-emerald-950 transition-colors"
                  >
                    <CheckCircle2 size={11} strokeWidth={1.5} />
                    Marcar principal
                  </button>
                )}
                {addresses.length > 1 && (
                  <button
                    onClick={() => handleDelete(addr)}
                    className="flex items-center gap-1.5 border border-red-900 text-red-400 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-red-950 transition-colors ml-auto"
                  >
                    <Trash2 size={11} strokeWidth={1.5} />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <div className="mt-8 flex items-start gap-3 border border-[#1A1A1A] p-4">
        <MapPin size={14} className="text-[#666] flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#A0A0A0] leading-relaxed">
          <p>
            Podés guardar varias direcciones (local principal, depósito, segundo local…) y elegir cuál usar al hacer cada pedido.
            La dirección marcada como <span className="text-emerald-400">principal</span> es la que se sugiere por defecto.
          </p>
          <p className="mt-2 text-[#666]">
            Para cambiar tus datos de facturación (CUIT, razón social), andá a{' '}
            <Link href="/cuenta/completar" className="text-white underline hover:no-underline">tus datos</Link>.
          </p>
        </div>
      </div>

      {/* Dialog: add/edit */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#111] border border-[#2A2A2A] shadow-2xl"
          >
            <div className="flex items-start justify-between p-6 pb-4 border-b border-[#1A1A1A] sticky top-0 bg-[#111] z-10">
              <div>
                <Dialog.Title className="font-display text-xl text-white tracking-[0.05em]">
                  {editingId ? 'EDITAR DIRECCIÓN' : 'NUEVA DIRECCIÓN'}
                </Dialog.Title>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mt-1">
                  {editingId ? 'Modificá los datos guardados' : 'Agregá una dirección de envío'}
                </p>
              </div>
              <Dialog.Close asChild>
                <button className="text-[#555] hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Etiqueta</label>
                <input
                  type="text"
                  value={form.etiqueta}
                  onChange={(e) => setForm((f) => ({ ...f, etiqueta: e.target.value }))}
                  placeholder="Ej: Local principal, Depósito, Segundo local…"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Dirección</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                  placeholder="Calle y número"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Código postal</label>
                  <input
                    type="text"
                    value={form.codigoPostal}
                    onChange={(e) => setForm((f) => ({ ...f, codigoPostal: e.target.value }))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Provincia</label>
                <select
                  value={form.provincia}
                  onChange={(e) => setForm((f) => ({ ...f, provincia: e.target.value }))}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
                >
                  {PROVINCIAS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                    Receptor <span className="text-[#444] normal-case tracking-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.receptor}
                    onChange={(e) => setForm((f) => ({ ...f, receptor: e.target.value }))}
                    placeholder="Persona que recibe"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">
                    Teléfono <span className="text-[#444] normal-case tracking-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.telefonoContacto}
                    onChange={(e) => setForm((f) => ({ ...f, telefonoContacto: e.target.value }))}
                    placeholder="11-1234-5678"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={form.esPrincipal}
                  onChange={(e) => setForm((f) => ({ ...f, esPrincipal: e.target.checked }))}
                  disabled={editingId !== null && addresses.find((a) => a.id === editingId)?.esPrincipal}
                  className="accent-emerald-500"
                />
                <span className="text-xs text-white">
                  Marcar como dirección principal
                </span>
                {editingId !== null && addresses.find((a) => a.id === editingId)?.esPrincipal && (
                  <span className="text-[10px] text-[#555]">(ya es la principal)</span>
                )}
              </label>

              <div className="flex gap-2 pt-2 border-t border-[#1A1A1A]">
                <button
                  type="submit"
                  className="flex-1 bg-white text-black text-[10px] tracking-[0.2em] uppercase py-3 font-medium hover:bg-zinc-100 transition-colors"
                >
                  {editingId ? 'Guardar cambios' : 'Agregar dirección'}
                </button>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.2em] uppercase px-4 py-3 hover:border-white hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
