'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { cn, formatDate, CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, X, AlertCircle } from 'lucide-react'
import type { Claim, ClaimProduct } from '@/types'

function NewClaimDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuthStore()
  const { clients, products, orders, addClaim, sellers } = useDataStore()

  const seller = sellers.find((s) => s.id === user?.sellerId)
  const myClients = clients.filter((c) => c.sellerId === user?.sellerId)

  const [clienteId, setClienteId] = useState(myClients[0]?.id ?? '')
  const [orderId, setOrderId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<ClaimProduct[]>([])

  const clientOrders = orders.filter((o) => o.clienteId === clienteId)

  function addProduct() {
    const firstProduct = products[0]
    if (!firstProduct) return
    setSelectedProducts([...selectedProducts, { productId: firstProduct.id, cantidadAfectada: 1, problema: '' }])
  }

  function updateProduct(idx: number, field: keyof ClaimProduct, value: string | number) {
    const updated = [...selectedProducts]
    updated[idx] = { ...updated[idx], [field]: value }
    setSelectedProducts(updated)
  }

  function removeProduct(idx: number) {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== idx))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clienteId || !descripcion.trim() || selectedProducts.length === 0) {
      toast.error('Completá todos los campos obligatorios')
      return
    }
    const claimNum = Date.now().toString().slice(-3)
    addClaim({
      codigo: `R-${claimNum}`,
      clienteId,
      sellerId: user?.sellerId ?? '',
      orderId: orderId || undefined,
      descripcion: descripcion.trim(),
      productos: selectedProducts,
      fotosUrls: [],
      estado: 'recibido',
      notasInternas: [`Cargado por ${seller?.nombre ?? 'vendedor'} el ${new Date().toLocaleDateString('es-AR')}`],
    })
    toast.success('Reclamo cargado y derivado al admin')
    setClienteId(myClients[0]?.id ?? ''); setOrderId(''); setDescripcion(''); setSelectedProducts([])
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl bg-[#111] border border-[#2A2A2A] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <Dialog.Title className="font-display text-xl text-white tracking-[0.05em]">CARGAR RECLAMO</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[#555] hover:text-white"><X size={18} /></button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Óptica *</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2">
                {myClients.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Pedido vinculado (opcional)</label>
              <select value={orderId} onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2">
                <option value="">Sin vincular a venta específica</option>
                {clientOrders.map((o) => (<option key={o.id} value={o.id}>{o.codigo} — {formatDate(o.fecha)}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-1">Descripción del problema *</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required rows={3}
                placeholder="La óptica reporta..."
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 resize-none" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555]">Productos afectados *</label>
                <button type="button" onClick={addProduct} className="text-[10px] text-emerald-400 tracking-[0.1em] uppercase">+ Agregar</button>
              </div>
              {selectedProducts.length === 0 ? (
                <p className="text-[10px] text-[#555] italic">Aún no agregaste productos</p>
              ) : (
                <div className="space-y-2">
                  {selectedProducts.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-start border border-[#2A2A2A] p-2">
                      <select value={p.productId} onChange={(e) => updateProduct(idx, 'productId', e.target.value)}
                        className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5">
                        {products.map((pp) => (<option key={pp.id} value={pp.id}>{pp.name}</option>))}
                      </select>
                      <input type="number" min={1} value={p.cantidadAfectada} onChange={(e) => updateProduct(idx, 'cantidadAfectada', Number(e.target.value))}
                        className="w-16 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5" />
                      <input value={p.problema} onChange={(e) => updateProduct(idx, 'problema', e.target.value)}
                        placeholder="Problema..."
                        className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1.5 placeholder:text-[#555]" />
                      <button type="button" onClick={() => removeProduct(idx)} className="text-[#555] hover:text-red-400"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button type="button" className="border border-[#2A2A2A] text-[#A0A0A0] text-[9px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-[#1A1A1A]">Cancelar</button>
              </Dialog.Close>
              <button type="submit" className="border border-white bg-white text-black text-[9px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-zinc-100">Cargar reclamo</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default function VendedorReclamosPage() {
  const { user } = useAuthStore()
  const { claims, clients, products } = useDataStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  const myClaims = claims
    .filter((c) => c.sellerId === user?.sellerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pendientes = myClaims.filter((c) => c.estado !== 'resuelto').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">RECLAMOS</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            {myClaims.length} cargados · {pendientes} pendientes
          </p>
        </div>
        <button onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 border border-white bg-white text-black text-[10px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-zinc-100 transition-colors">
          <Plus size={13} />
          Cargar reclamo
        </button>
      </div>

      {pendientes > 0 && (
        <div className="bg-yellow-950/30 border border-yellow-900/50 p-3 flex items-start gap-3">
          <AlertCircle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-200 leading-relaxed">
            Recordá <span className="font-medium">bonificar</span> los reclamos pendientes en el próximo pedido de la óptica.
            Al armar un pedido, el sistema te avisa si hay reclamos sin saldar.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {myClaims.length === 0 ? (
          <div className="text-center text-[#555] text-xs py-16">Sin reclamos cargados</div>
        ) : myClaims.map((c) => {
          const cliente = clients.find((cl) => cl.id === c.clienteId)
          return (
            <div key={c.id} className="bg-[#111] border border-[#2A2A2A] p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono bg-[#1A1A1A] inline-block px-2 py-0.5 text-white mb-1">{c.codigo}</p>
                  <p className="text-white text-sm font-light">{cliente?.nombre ?? '—'}</p>
                </div>
                <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]', CLAIM_STATUS_COLORS[c.estado])}>
                  {CLAIM_STATUS_LABELS[c.estado]}
                </span>
              </div>
              <p className="text-[#A0A0A0] text-xs">{c.descripcion}</p>
              <div className="text-[10px] text-[#555] space-y-0.5">
                {c.productos.map((cp, i) => (
                  <p key={i}>• {products.find((p) => p.id === cp.productId)?.name} ×{cp.cantidadAfectada} — {cp.problema}</p>
                ))}
              </div>
              <p className="text-[10px] text-[#555] tracking-[0.1em]">Cargado el {formatDate(c.createdAt)}</p>
              {c.estado === 'resuelto' && c.bonificadoEnPedidoId && (
                <p className="text-[10px] text-emerald-400 border-t border-[#1A1A1A] pt-2">
                  ✓ Bonificado en pedido
                </p>
              )}
            </div>
          )
        })}
      </div>

      <NewClaimDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
