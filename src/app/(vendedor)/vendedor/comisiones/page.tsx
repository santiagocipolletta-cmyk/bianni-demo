'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { formatARS, formatDate, cn } from '@/lib/utils'
import { TrendingUp, Clock, CheckCircle2 } from 'lucide-react'

export default function ComisionesPage() {
  const { user } = useAuthStore()
  const { commissions, orders, clients } = useDataStore()

  const myCommissions = useMemo(
    () => commissions
      .filter((c) => c.sellerId === user?.sellerId)
      .sort((a, b) => new Date(b.fechaCalculo).getTime() - new Date(a.fechaCalculo).getTime()),
    [commissions, user?.sellerId]
  )

  const totalAcumulado = myCommissions.reduce((s, c) => s + c.monto, 0)
  const pendientes = myCommissions.filter((c) => c.estado === 'pendiente')
  const liquidadas = myCommissions.filter((c) => c.estado === 'liquidada')
  const totalPendiente = pendientes.reduce((s, c) => s + c.monto, 0)
  const totalLiquidado = liquidadas.reduce((s, c) => s + c.monto, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">MIS COMISIONES</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          Calculadas por el ERP de BIANNI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-emerald-900 bg-emerald-950/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0]">Total acumulado</p>
          </div>
          <p className="font-display text-3xl font-light text-white">{formatARS(totalAcumulado)}</p>
        </div>

        <div className="border border-yellow-900 bg-yellow-950/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-yellow-400" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0]">Pendientes de liquidar</p>
          </div>
          <p className="font-display text-3xl font-light text-white">{formatARS(totalPendiente)}</p>
          <p className="text-[10px] text-[#555] mt-1">{pendientes.length} venta{pendientes.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="border border-blue-900 bg-blue-950/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-blue-400" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0]">Ya liquidado</p>
          </div>
          <p className="font-display text-3xl font-light text-white">{formatARS(totalLiquidado)}</p>
          <p className="text-[10px] text-[#555] mt-1">{liquidadas.length} venta{liquidadas.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-[#2A2A2A]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
              {['Pedido', 'Cliente', 'Monto venta', '%', 'Comisión', 'Estado', 'Calculado'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myCommissions.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-[#555] py-12 text-xs">Sin comisiones aún</td></tr>
            ) : myCommissions.map((c) => {
              const order = orders.find((o) => o.id === c.orderId)
              const client = clients.find((cl) => cl.id === order?.clienteId)
              return (
                <tr key={c.id} className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F]">
                  <td className="px-4 py-3 text-white text-xs font-medium whitespace-nowrap">{order?.codigo ?? '—'}</td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{client?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">{formatARS(c.montoVenta)}</td>
                  <td className="px-4 py-3 text-[#555] text-xs whitespace-nowrap">{c.porcentaje}%</td>
                  <td className="px-4 py-3 text-white text-xs font-medium whitespace-nowrap">{formatARS(c.monto)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]',
                      c.estado === 'liquidada' ? 'bg-blue-950 text-blue-400' : 'bg-yellow-950 text-yellow-400'
                    )}>{c.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-[#555] text-xs whitespace-nowrap">{formatDate(c.fechaCalculo)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
