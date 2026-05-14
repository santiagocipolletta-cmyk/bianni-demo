'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Phone, ShoppingBag, MapPin, Clock } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { formatARS } from '@/lib/utils'

function isInMonth(dateStr: string, year: number, month: number): boolean {
  const d = new Date(dateStr)
  return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month
}

export default function ClientesPage() {
  const { user } = useAuthStore()
  const { clients, orders, priceLists } = useDataStore()

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

  return (
    <div className="min-h-full bg-[#000] px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
          Mis Clientes
        </h1>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
          {myClients.length} cliente{myClients.length !== 1 ? 's' : ''} asignados
        </p>
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
    </div>
  )
}
