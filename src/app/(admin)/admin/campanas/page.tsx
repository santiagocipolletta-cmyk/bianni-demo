'use client'

import { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/data-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import type { Campaign } from '@/types'

type Segmento = 'todos' | 'ciudad' | 'vendedor'

const ESTADO_BADGE: Record<Campaign['estado'], string> = {
  enviada: 'bg-emerald-950 text-emerald-400',
  borrador: 'bg-yellow-950 text-yellow-400',
  fallida: 'bg-red-950 text-red-400',
}

const MAX_CHARS = 500

export default function AdminCampanasPage() {
  const { clients, sellers, campaigns, addCampaign } = useDataStore()
  const { user } = useAuthStore()

  const [nombre, setNombre] = useState('')
  const [segmento, setSegmento] = useState<Segmento>('todos')
  const [selectedCiudad, setSelectedCiudad] = useState('')
  const [selectedSeller, setSelectedSeller] = useState('')
  const [mensaje, setMensaje] = useState('')

  const uniqueCities = useMemo(
    () => Array.from(new Set(clients.map((c) => c.ciudad))).sort(),
    [clients]
  )

  const destinatariosCount = useMemo(() => {
    if (segmento === 'todos') return clients.length
    if (segmento === 'ciudad') {
      if (!selectedCiudad) return 0
      return clients.filter((c) => c.ciudad === selectedCiudad).length
    }
    if (segmento === 'vendedor') {
      if (!selectedSeller) return 0
      return clients.filter((c) => c.sellerId === selectedSeller).length
    }
    return 0
  }, [clients, segmento, selectedCiudad, selectedSeller])

  const preview = `🔷 *BIANNI EYEWEAR* 🔷\n\n${mensaje}`

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !mensaje.trim()) {
      toast.error('Completá nombre y mensaje')
      return
    }
    addCampaign({
      nombre: nombre.trim(),
      mensaje: preview,
      destinatariosCount,
      fechaEnvio: new Date().toISOString(),
      enviadaPor: user?.name ?? 'Admin',
      estado: 'enviada',
    })
    toast.success(`Campaña enviada a ${destinatariosCount} clientes (demo)`)
    setNombre('')
    setMensaje('')
    setSegmento('todos')
    setSelectedCiudad('')
    setSelectedSeller('')
  }

  const sortedCampaigns = useMemo(
    () => [...campaigns].sort((a, b) => new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime()),
    [campaigns]
  )

  const SEGMENTOS: { key: Segmento; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'ciudad', label: 'Por ciudad' },
    { key: 'vendedor', label: 'Por vendedor' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">CAMPAÑAS</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">Mensajes WhatsApp masivos</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left: Composer */}
        <div className="bg-[#111] border border-[#2A2A2A] p-6">
          <h2 className="font-display text-xl text-white tracking-[0.05em] mb-6">NUEVA CAMPAÑA</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Ej: Lanzamiento Temporada 2026"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
              />
            </div>

            {/* Segmento */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">
                Segmento
              </label>
              <div className="flex gap-0 border border-[#2A2A2A]">
                {SEGMENTOS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSegmento(s.key)}
                    className={cn(
                      'flex-1 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] last:border-r-0',
                      segmento === s.key
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-[#555] hover:text-[#A0A0A0]'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {segmento === 'ciudad' && (
                <select
                  value={selectedCiudad}
                  onChange={(e) => setSelectedCiudad(e.target.value)}
                  className="mt-2 w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#444]"
                >
                  <option value="">Seleccionar ciudad...</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              )}

              {segmento === 'vendedor' && (
                <select
                  value={selectedSeller}
                  onChange={(e) => setSelectedSeller(e.target.value)}
                  className="mt-2 w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#444]"
                >
                  <option value="">Seleccionar vendedor...</option>
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">
                Mensaje
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value.slice(0, MAX_CHARS))}
                rows={5}
                placeholder="Usá *negrita* y _cursiva_ para WhatsApp"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 resize-none focus:outline-none focus:border-[#444] placeholder:text-[#444]"
              />
              <p className="text-right text-[10px] text-[#555] mt-1">
                {mensaje.length} / {MAX_CHARS}
              </p>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">
                Vista previa
              </label>
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 text-xs text-[#A0A0A0] whitespace-pre-wrap font-mono leading-relaxed min-h-[80px]">
                {preview || <span className="text-[#444]">El mensaje aparecerá aquí...</span>}
              </div>
            </div>

            {/* Destinatarios */}
            <p className="text-[#A0A0A0] text-xs">
              Destinatarios:{' '}
              <span className="text-white font-medium">{destinatariosCount} clientes</span>
            </p>

            {/* Submit */}
            <button
              type="submit"
              className="w-full border border-white text-white text-[9px] tracking-[0.15em] uppercase px-3 py-3 hover:bg-white hover:text-black transition-colors"
            >
              Enviar campaña
            </button>
          </form>
        </div>

        {/* Right: History */}
        <div>
          <h2 className="font-display text-xl text-white tracking-[0.05em] mb-4">
            CAMPAÑAS ENVIADAS
          </h2>
          <div className="space-y-3">
            {sortedCampaigns.length === 0 ? (
              <div className="text-center text-[#555] text-xs py-12">Sin campañas</div>
            ) : (
              sortedCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-[#111] border border-[#2A2A2A] p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-medium">{camp.nombre}</p>
                    <span className={cn('text-[10px] px-2 py-0.5 uppercase tracking-[0.1em] shrink-0', ESTADO_BADGE[camp.estado])}>
                      {camp.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[#555] text-[10px] tracking-[0.1em] uppercase">
                    <span>{camp.destinatariosCount} destinatarios</span>
                    <span>·</span>
                    <span>{formatDateTime(camp.fechaEnvio)}</span>
                  </div>
                  <p className="text-[#555] text-xs font-light leading-relaxed">
                    {camp.mensaje.length > 80 ? camp.mensaje.slice(0, 80) + '...' : camp.mensaje}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
