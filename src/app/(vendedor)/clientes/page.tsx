'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { Phone, ShoppingBag, MapPin, Clock, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { formatARS } from '@/lib/utils'
import type { Client } from '@/types'

const PROVINCIAS = [
  'CABA', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

function isInMonth(dateStr: string, year: number, month: number): boolean {
  const d = new Date(dateStr)
  return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month
}

export default function ClientesPage() {
  const { user } = useAuthStore()
  const { clients, orders, priceLists, addClient } = useDataStore()

  const sellerId = user?.sellerId

  const myClients = useMemo(
    () => clients.filter((c) => c.sellerId === sellerId),
    [clients, sellerId]
  )

  const mayOrders = useMemo(
    () => orders.filter((o) => isInMonth(o.fecha, 2026, 5)),
    [orders]
  )

  function getClientOrderCount(clientId: string): number {
    return mayOrders.filter((o) => o.clienteId === clientId).length
  }

  function getClientMonthTotal(clientId: string): number {
    return mayOrders
      .filter((o) => o.clienteId === clientId)
      .reduce((sum, o) => sum + o.total, 0)
  }

  function getPriceListName(priceListId: string): string {
    return priceLists.find((pl) => pl.id === priceListId)?.name ?? priceListId
  }

  // ── Dialog state ─────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    cuit: '',
    email: '',
    telefono: '',
    ciudad: '',
    provincia: 'CABA',
    direccion: '',
  })
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setForm({
      nombre: '',
      cuit: '',
      email: '',
      telefono: '',
      ciudad: '',
      provincia: 'CABA',
      direccion: '',
    })
  }

  function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    if (!sellerId) {
      toast.error('No se identificó el vendedor')
      return
    }
    if (!form.nombre.trim() || !form.cuit.trim() || !form.email.trim() || !form.telefono.trim() || !form.ciudad.trim() || !form.provincia.trim() || !form.direccion.trim()) {
      toast.error('Completá todos los campos')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      const newClient: Client = {
        id: `c_${Date.now()}`,
        nombre: form.nombre.trim(),
        ciudad: form.ciudad.trim(),
        provincia: form.provincia,
        plazoPagoDias: 30,
        priceListId: 'pl1',
        sellerId,
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        cuit: form.cuit.trim(),
        direccion: form.direccion.trim(),
        status: 'activa',
        profileCompleto: true,
        verCuentaCorriente: true,
        fechaAlta: new Date().toISOString(),
        origenAlta: 'vendedor',
      }
      addClient(newClient)
      setSubmitting(false)
      setDialogOpen(false)
      resetForm()
      toast.success(`Óptica "${newClient.nombre}" creada y asignada a tu cartera`)
    }, 500)
  }

  return (
    <div className="min-h-full bg-[#000] px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
            Mis Clientes
          </h1>
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
            {myClients.length} cliente{myClients.length !== 1 ? 's' : ''} asignados
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center justify-center gap-2 border border-white bg-white text-black text-[10px] tracking-[0.2em] uppercase px-5 py-3 hover:bg-zinc-100 transition-colors font-medium self-start"
        >
          <Plus size={14} strokeWidth={2} />
          Nueva óptica
        </button>
      </div>

      {myClients.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-[#555] text-xs tracking-[0.2em] uppercase">
            No tenés clientes asignados
          </p>
        </div>
      ) : (
        <div className="grid gap-px bg-[#2A2A2A] sm:grid-cols-2 xl:grid-cols-3">
          {myClients.map((client) => {
            const orderCount = getClientOrderCount(client.id)
            const monthTotal = getClientMonthTotal(client.id)
            const priceListName = getPriceListName(client.priceListId)

            return (
              <div key={client.id} className="bg-[#0A0A0A] p-6 flex flex-col gap-5">
                {/* Name + location */}
                <div>
                  <h2 className="text-lg text-white font-light leading-tight">{client.nombre}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={11} strokeWidth={1.5} className="text-[#555]" />
                    <span className="text-[10px] text-[#555] uppercase tracking-[0.15em]">
                      {client.ciudad}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-0.5">
                      Lista de precios
                    </p>
                    <p className="text-xs text-[#A0A0A0]">{priceListName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-0.5">
                      Plazo de pago
                    </p>
                    <div className="flex items-center gap-1">
                      <Clock size={10} strokeWidth={1.5} className="text-[#555]" />
                      <p className="text-xs text-[#A0A0A0]">{client.plazoPagoDias} días</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-0.5">
                      Pedidos este mes
                    </p>
                    <p className="text-xs text-[#A0A0A0]">{orderCount}</p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-0.5">
                      Total mayo
                    </p>
                    <p className="text-xs text-[#A0A0A0]">
                      {monthTotal > 0 ? formatARS(monthTotal) : '—'}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <a
                  href={`tel:+${client.telefono}`}
                  className="flex items-center gap-2 text-[#555] hover:text-white transition-colors text-[10px] tracking-[0.15em] uppercase"
                >
                  <Phone size={12} strokeWidth={1.5} />
                  +{client.telefono}
                </a>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2 border-t border-[#2A2A2A]">
                  <Link
                    href={`/pedido-nuevo?clientId=${client.id}`}
                    className="flex items-center gap-2 flex-1 justify-center border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-white hover:text-black transition-colors"
                  >
                    <ShoppingBag size={12} strokeWidth={1.5} />
                    Tomar pedido
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New óptica Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm() }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-[#0A0A0A] border border-[#2A2A2A] p-8 shadow-2xl max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Dialog.Title className="text-white text-lg font-light tracking-[0.15em] uppercase">
                  Nueva óptica
                </Dialog.Title>
                <Dialog.Description className="text-[#555] text-xs tracking-wide mt-1">
                  Se agrega activa y se asigna a tu cartera.
                </Dialog.Description>
              </div>
              <Dialog.Close className="text-[#555] hover:text-white transition-colors">
                <X size={18} strokeWidth={1.5} />
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <Field
                label="Nombre de la óptica *"
                value={form.nombre}
                onChange={(v) => setForm({ ...form, nombre: v })}
                placeholder="Ej: Óptica del Centro"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="CUIT *"
                  value={form.cuit}
                  onChange={(v) => setForm({ ...form, cuit: v })}
                  placeholder="30-12345678-9"
                />
                <Field
                  label="Teléfono *"
                  value={form.telefono}
                  onChange={(v) => setForm({ ...form, telefono: v })}
                  placeholder="5491144001111"
                />
              </div>
              <Field
                label="Email *"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="contacto@optica.com"
              />
              <Field
                label="Dirección *"
                value={form.direccion}
                onChange={(v) => setForm({ ...form, direccion: v })}
                placeholder="Calle, número, piso"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Ciudad *"
                  value={form.ciudad}
                  onChange={(v) => setForm({ ...form, ciudad: v })}
                  placeholder="Ej: Buenos Aires"
                />
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
                    Provincia *
                  </label>
                  <select
                    value={form.provincia}
                    onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                    className="w-full bg-[#111] border border-[#2A2A2A] text-white px-3 py-2.5 text-sm outline-none focus:border-[#555]"
                  >
                    {PROVINCIAS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#1A1A1A]">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex-1 border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase px-4 py-3 hover:bg-[#1A1A1A]"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-white text-black text-[10px] tracking-[0.2em] uppercase px-4 py-3 hover:bg-zinc-100 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creando...' : 'Crear óptica'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#111] border border-[#2A2A2A] text-white placeholder-[#444] px-3 py-2.5 text-sm outline-none focus:border-[#555] transition-colors"
      />
    </div>
  )
}
