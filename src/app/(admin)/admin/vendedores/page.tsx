'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Wifi, Briefcase, Package } from 'lucide-react'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'

function initials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function AdminVendedoresPage() {
  const { sellers, clients, orders } = useDataStore()

  const stats = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    return sellers.map((s) => {
      const opticasCount = clients.filter((c) => c.sellerId === s.id).length
      const pedidosMes = orders.filter((o) => {
        if (o.sellerId !== s.id) return false
        const d = new Date(o.fecha)
        return d.getMonth() === month && d.getFullYear() === year
      }).length
      return { sellerId: s.id, opticasCount, pedidosMes }
    })
  }, [sellers, clients, orders])

  function getStats(sellerId: string) {
    return stats.find((s) => s.sellerId === sellerId) ?? { opticasCount: 0, pedidosMes: 0 }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em] uppercase">
          Vendedores
        </h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          {sellers.length} representantes activos
        </p>
      </div>

      {/* Aviso */}
      <div className="border border-[#2A2A2A] bg-[#0A0A0A] px-5 py-4">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Importante</p>
        <p className="text-[#A0A0A0] text-sm leading-relaxed">
          Los vendedores se dan de alta y baja desde el ERP. Acá solo se visualizan y se gestionan
          sus carteras de ópticas. Para reasignar ópticas, usá{' '}
          <Link
            href="/admin/clientes"
            className="text-white underline underline-offset-2 hover:text-emerald-400 transition-colors"
          >
            Clientes
          </Link>
          .
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sellers.map((seller) => {
          const s = getStats(seller.id)
          return (
            <div
              key={seller.id}
              className="bg-[#111] border border-[#2A2A2A] p-5 hover:border-[#444] transition-colors"
            >
              {/* Header tarjeta */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center">
                  <span className="font-display text-lg text-white tracking-wider">
                    {initials(seller.nombre)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg text-white tracking-[0.03em] truncate">
                        {seller.nombre}
                      </h3>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mt-0.5">
                        ID · {seller.id}
                      </p>
                    </div>
                    {seller.esOnline && (
                      <span
                        className={cn(
                          'flex items-center gap-1 text-[9px] tracking-[0.2em] uppercase px-2 py-1 border',
                          'border-emerald-800 text-emerald-400 bg-emerald-950/40 flex-shrink-0'
                        )}
                      >
                        <Wifi size={10} strokeWidth={2} />
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="mt-5 space-y-2 border-t border-[#1A1A1A] pt-4">
                <Row icon={Mail} value={seller.email} />
                <Row icon={Phone} value={seller.telefono} />
                <Row icon={MapPin} value={seller.ciudad ?? '—'} />
              </div>

              {/* Métricas cartera */}
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#1A1A1A] pt-4">
                <Metric
                  icon={Briefcase}
                  label="Ópticas asignadas"
                  value={s.opticasCount}
                />
                <Metric
                  icon={Package}
                  label="Pedidos del mes"
                  value={s.pedidosMes}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Row({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={13} strokeWidth={1.5} className="text-[#555] flex-shrink-0" />
      <p className="text-[#A0A0A0] text-xs truncate">{value}</p>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3">
      <div className="flex items-center gap-1.5 text-[#555]">
        <Icon size={11} strokeWidth={1.5} />
        <p className="text-[9px] tracking-[0.2em] uppercase">{label}</p>
      </div>
      <p className="font-display text-2xl text-white mt-1.5">{value}</p>
    </div>
  )
}
