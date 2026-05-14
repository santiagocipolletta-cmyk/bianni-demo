'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useDataStore } from '@/stores/data-store'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import type { Client } from '@/types'

interface EditForm {
  nombre: string
  ciudad: string
  plazoPagoDias: number
  priceListId: string
  sellerId: string
}

function EditClientDialog({
  client,
  open,
  onClose,
}: {
  client: Client | null
  open: boolean
  onClose: () => void
}) {
  const { priceLists, sellers } = useDataStore()
  const [form, setForm] = useState<EditForm>({
    nombre: client?.nombre ?? '',
    ciudad: client?.ciudad ?? '',
    plazoPagoDias: client?.plazoPagoDias ?? 30,
    priceListId: client?.priceListId ?? '',
    sellerId: client?.sellerId ?? '',
  })

  function handleOpen(isOpen: boolean) {
    if (isOpen && client) {
      setForm({
        nombre: client.nombre,
        ciudad: client.ciudad,
        plazoPagoDias: client.plazoPagoDias,
        priceListId: client.priceListId,
        sellerId: client.sellerId,
      })
    }
    if (!isOpen) onClose()
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Cambios guardados — demo')
    onClose()
  }

  if (!client) return null

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#111] border border-[#2A2A2A] p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <Dialog.Title className="font-display text-xl text-white tracking-[0.05em]">
              EDITAR CLIENTE
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[#555] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              />
            </div>
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
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Plazo de pago (días)</label>
              <input
                type="number"
                min={0}
                value={form.plazoPagoDias}
                onChange={(e) => setForm((f) => ({ ...f, plazoPagoDias: Number(e.target.value) }))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Lista de precios</label>
              <select
                value={form.priceListId}
                onChange={(e) => setForm((f) => ({ ...f, priceListId: e.target.value }))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              >
                {priceLists.map((pl) => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Vendedor</label>
              <select
                value={form.sellerId}
                onChange={(e) => setForm((f) => ({ ...f, sellerId: e.target.value }))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              >
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="border border-[#2A2A2A] text-[#A0A0A0] text-[9px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-[#1A1A1A] transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-white hover:text-black transition-colors"
              >
                Guardar
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default function AdminClientesPage() {
  const { clients, priceLists, sellers } = useDataStore()
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  function priceListName(priceListId: string): string {
    return priceLists.find((pl) => pl.id === priceListId)?.name ?? '—'
  }

  function sellerName(sellerId: string): string {
    return sellers.find((s) => s.id === sellerId)?.nombre ?? '—'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">CLIENTES</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          {clients.length} clientes registrados
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#2A2A2A]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
              {['Nombre', 'Ciudad', 'Plazo', 'Lista de precios', 'Vendedor', 'Teléfono', 'Acciones'].map((h) => (
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
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors"
              >
                <td className="px-4 py-3 text-white text-xs font-medium">{client.nombre}</td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs">{client.ciudad}</td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                  {client.plazoPagoDias} días
                </td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                  {priceListName(client.priceListId)}
                </td>
                <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                  {sellerName(client.sellerId)}
                </td>
                <td className="px-4 py-3 text-[#555] text-xs">{client.telefono}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingClient(client)}
                    className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-white hover:text-black transition-colors"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditClientDialog
        client={editingClient}
        open={editingClient !== null}
        onClose={() => setEditingClient(null)}
      />
    </div>
  )
}
