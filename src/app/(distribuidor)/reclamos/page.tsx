'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, Paperclip, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { cn, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import type { Claim } from '@/types'

const CLAIM_STATUS_LABELS: Record<Claim['estado'], string> = {
  sin_resolver: 'Sin resolver',
  a_fabrica: 'En fábrica',
  cerrado: 'Cerrado',
}

const CLAIM_STATUS_COLORS: Record<Claim['estado'], string> = {
  sin_resolver: 'bg-yellow-950 text-yellow-400',
  a_fabrica: 'bg-blue-950 text-blue-400',
  cerrado: 'bg-zinc-900 text-zinc-500',
}

export default function ReclamosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuthStore()
  const { orders, claims, products, addClaim } = useDataStore()

  const myOrders = orders.filter((o) => o.clienteId === user?.clientId)
  const myClaims = claims
    .filter((c) => c.clienteId === user?.clientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviewUrls((prev) => [...prev, ...urls])
  }

  function removePreview(idx: number) {
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  function resetForm() {
    setPreviewUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url))
      return []
    })
    setSelectedOrderId('')
    setMotivo('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedOrderId) {
      toast.error('Seleccioná un pedido relacionado')
      return
    }
    if (motivo.trim().length < 20) {
      toast.error('La descripción debe tener al menos 20 caracteres')
      return
    }
    if (!user?.clientId) return

    setSubmitting(true)

    addClaim({
      orderId: selectedOrderId,
      clienteId: user.clientId,
      motivo: motivo.trim(),
      fotosUrls: previewUrls.length > 0
        ? previewUrls.map((_, i) => `https://placehold.co/400?text=Foto+${i + 1}`)
        : [],
      estado: 'sin_resolver',
    })

    toast.success('Reclamo enviado correctamente')
    setSubmitting(false)
    setDialogOpen(false)
    resetForm()
  }

  function getOrderLabel(orderId: string) {
    const o = orders.find((ord) => ord.id === orderId)
    if (!o) return orderId
    return `${o.codigo} — ${formatDate(o.fecha)}`
  }

  function getOrderProductSummary(orderId: string) {
    const o = orders.find((ord) => ord.id === orderId)
    if (!o) return ''
    const names = o.items.slice(0, 2).map((item) => {
      const p = products.find((pr) => pr.id === item.productId)
      return p?.name ?? item.productId
    })
    const extra = o.items.length > 2 ? ` +${o.items.length - 2} más` : ''
    return names.join(', ') + extra
  }

  return (
    <div className="min-h-full bg-[#000]">
      {/* Page header */}
      <div className="sticky top-0 z-30 border-b border-[#2A2A2A] bg-[#000]/95 backdrop-blur-sm px-4 lg:px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
              Reclamos
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
              {myClaims.length} reclamo{myClaims.length !== 1 ? 's' : ''} registrado{myClaims.length !== 1 ? 's' : ''}
            </p>
          </div>

          <Dialog.Root open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <Dialog.Trigger asChild>
              <button className="flex-shrink-0 flex items-center gap-2 border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-white hover:text-black transition-colors">
                <Plus size={11} strokeWidth={2} />
                Nuevo reclamo
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
              <Dialog.Content
                className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#111] border border-[#2A2A2A] shadow-2xl outline-none"
              >
                {/* Dialog header */}
                <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
                  <Dialog.Title className="text-[10px] tracking-[0.2em] uppercase text-white font-medium">
                    Nuevo reclamo
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="text-[#555] hover:text-white transition-colors p-1">
                      <X size={16} />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
                  {/* Pedido select */}
                  <div>
                    <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">
                      Pedido relacionado *
                    </label>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      required
                      className="w-full bg-[#000] border border-[#2A2A2A] text-white text-xs px-3 py-2.5 outline-none focus:border-white transition-colors appearance-none"
                    >
                      <option value="" disabled>Seleccioná un pedido...</option>
                      {myOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.codigo} — {ORDER_STATUS_LABELS[o.estado]} — {formatDate(o.fecha)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Motivo */}
                  <div>
                    <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">
                      Descripción del problema *
                    </label>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      required
                      minLength={20}
                      rows={4}
                      placeholder="Describí el problema con detalle (mínimo 20 caracteres)..."
                      className="w-full bg-[#000] border border-[#2A2A2A] text-white text-xs px-3 py-2.5 outline-none focus:border-white transition-colors resize-none placeholder:text-[#555]"
                    />
                    <p className={cn(
                      'text-[9px] mt-1 text-right',
                      motivo.length < 20 ? 'text-[#555]' : 'text-emerald-500'
                    )}>
                      {motivo.length}/20 mínimo
                    </p>
                  </div>

                  {/* File input */}
                  <div>
                    <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">
                      Adjuntar fotos (opcional)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="claim-photos"
                    />
                    <label
                      htmlFor="claim-photos"
                      className="flex items-center gap-2 border border-[#2A2A2A] px-4 py-2.5 text-[9px] tracking-[0.15em] uppercase text-[#A0A0A0] hover:border-white hover:text-white transition-colors cursor-pointer w-fit"
                    >
                      <Paperclip size={11} strokeWidth={1.5} />
                      Seleccionar fotos
                    </label>

                    {/* Thumbnails */}
                    {previewUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {previewUrls.map((url, idx) => (
                          <div key={idx} className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={url}
                              alt={`Foto ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePreview(idx)}
                              className="absolute -top-1 -right-1 bg-black border border-[#2A2A2A] rounded-full p-0.5 hover:border-white transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A2A2A]">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="text-[9px] tracking-[0.15em] uppercase text-[#555] hover:text-white transition-colors px-4 py-2"
                      >
                        Cancelar
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="border border-white text-white text-[9px] tracking-[0.15em] uppercase px-5 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Enviando...' : 'Enviar reclamo'}
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Claims list */}
      <div className="px-4 lg:px-8 py-8">
        {myClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertTriangle size={32} className="text-[#555]" strokeWidth={1} />
            <p className="text-[#555] text-xs tracking-[0.2em] uppercase">Sin reclamos registrados</p>
            <p className="text-[#555] text-[10px]">
              Si tenés un problema con un pedido, hacé clic en &ldquo;Nuevo reclamo&rdquo;
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-px bg-[#2A2A2A]">
            {myClaims.map((claim) => (
              <div key={claim.id} className="bg-[#000] px-5 py-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[9px] tracking-[0.15em] uppercase text-[#555] mb-1">
                      {getOrderLabel(claim.orderId)}
                    </p>
                    <p className="text-[10px] text-[#555]">{getOrderProductSummary(claim.orderId)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 text-[9px] tracking-[0.15em] uppercase',
                        CLAIM_STATUS_COLORS[claim.estado]
                      )}
                    >
                      {CLAIM_STATUS_LABELS[claim.estado]}
                    </span>
                    <p className="text-[9px] text-[#555]">{formatDate(claim.createdAt)}</p>
                  </div>
                </div>

                {/* Motivo */}
                <p className="text-[#A0A0A0] text-xs font-light leading-relaxed">
                  {claim.motivo}
                </p>

                {/* Photos */}
                {claim.fotosUrls.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {claim.fotosUrls.map((url, idx) => (
                      <div key={idx} className="relative w-14 h-14 flex-shrink-0 bg-stone-900">
                        <Image
                          src={url}
                          alt={`Foto reclamo ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Notas internas */}
                {claim.notasInternas && (
                  <div className="mt-3 border-t border-[#2A2A2A] pt-3">
                    <p className="text-[9px] tracking-[0.15em] uppercase text-[#555] mb-1">
                      Respuesta de BIANNI
                    </p>
                    <p className="text-[#A0A0A0] text-xs italic">{claim.notasInternas}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
