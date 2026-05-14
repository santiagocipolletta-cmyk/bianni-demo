'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { formatARS, formatDate } from '@/lib/utils'
import { Info } from 'lucide-react'

// Mock upcoming payments (hardcoded for demo)
const VENCIMIENTOS = [
  { id: 'v1', fecha: '2026-06-15', monto: 120000, pedido: 'P-0004' },
  { id: 'v2', fecha: '2026-06-30', monto: 85000, pedido: 'P-0007' },
  { id: 'v3', fecha: '2026-07-15', monto: 209600, pedido: 'P-0006' },
]

// Mock credit movements
const MOCK_CREDITS = [
  { id: 'cr1', fecha: '2026-04-01', concepto: 'Pago recibido', monto: 150000, tipo: 'credito' as const },
  { id: 'cr2', fecha: '2026-03-20', concepto: 'Pago recibido', monto: 95000, tipo: 'credito' as const },
]

// Mock saldo (starting balance)
const MOCK_SALDO = 485000

// Movement type definition
type Movement = {
  id: string
  fecha: string
  concepto: string
  debito?: number
  credito?: number
  tipo: 'debito' | 'credito'
}

export default function CuentaPage() {
  const { user } = useAuthStore()
  const { orders } = useDataStore()

  const myOrders = orders.filter((o) => o.clienteId === user?.clientId)

  // Count orders this month (May 2026)
  const thisMonth = myOrders.filter((o) => {
    const d = new Date(o.fecha)
    return d.getFullYear() === 2026 && d.getMonth() === 4 // May = index 4
  })

  // Build movements from orders (charges) + mock credits
  const chargeStatuses = ['aceptado', 'despachado', 'entregado'] as const
  const charges: Movement[] = myOrders
    .filter((o) => (chargeStatuses as readonly string[]).includes(o.estado))
    .map((o) => ({
      id: o.id,
      fecha: o.fecha,
      concepto: `Pedido ${o.codigo}`,
      debito: o.total,
      tipo: 'debito' as const,
    }))

  const credits: Movement[] = MOCK_CREDITS.map((c) => ({
    id: c.id,
    fecha: c.fecha,
    concepto: c.concepto,
    credito: c.monto,
    tipo: 'credito' as const,
  }))

  const allMovements = [...charges, ...credits].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )

  return (
    <div className="min-h-full bg-[#000]">
      {/* Page header */}
      <div className="sticky top-0 z-30 border-b border-[#2A2A2A] bg-[#000]/95 backdrop-blur-sm px-4 lg:px-8 py-5">
        <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
          Cuenta Corriente
        </h1>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
          Estado de cuenta — demo
        </p>
      </div>

      <div className="px-4 lg:px-8 py-8 flex flex-col gap-8">

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#2A2A2A]">
          {/* Saldo actual */}
          <div className="bg-[#000] px-6 py-5">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">Saldo actual</p>
            <p className="text-white font-display text-3xl font-light">{formatARS(MOCK_SALDO)}</p>
            <p className="text-[9px] tracking-[0.15em] uppercase text-[#555] mt-1">ARS</p>
          </div>

          {/* Próximo vencimiento */}
          <div className="bg-[#000] px-6 py-5">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">
              Próximo vencimiento
            </p>
            <p className="text-white font-display text-3xl font-light">
              {formatARS(VENCIMIENTOS[0].monto)}
            </p>
            <p className="text-[9px] tracking-[0.15em] uppercase text-[#555] mt-1">
              {formatDate(VENCIMIENTOS[0].fecha)} — {VENCIMIENTOS[0].pedido}
            </p>
          </div>

          {/* Pedidos este mes */}
          <div className="bg-[#000] px-6 py-5">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">
              Pedidos este mes
            </p>
            <p className="text-white font-display text-3xl font-light">{thisMonth.length}</p>
            <p className="text-[9px] tracking-[0.15em] uppercase text-[#555] mt-1">Mayo 2026</p>
          </div>
        </div>

        {/* Movimientos */}
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-4">Movimientos</p>
          <div className="border border-[#2A2A2A]">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 border-b border-[#2A2A2A] bg-[#0A0A0A]">
              {['Fecha', 'Concepto', 'Débito', 'Crédito'].map((h) => (
                <p key={h} className="text-[9px] tracking-[0.15em] uppercase text-[#555] text-right first:text-left last:text-right [&:nth-child(2)]:text-left">
                  {h}
                </p>
              ))}
            </div>

            {allMovements.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[#555] text-[10px] tracking-[0.15em] uppercase">Sin movimientos</p>
              </div>
            ) : (
              allMovements.map((mov) => (
                <div
                  key={mov.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 border-b border-[#2A2A2A] last:border-0 items-center"
                >
                  <p className="text-[#A0A0A0] text-xs whitespace-nowrap">{formatDate(mov.fecha)}</p>
                  <p className="text-white text-xs font-light truncate">{mov.concepto}</p>
                  <p className="text-red-400 text-xs text-right">
                    {mov.debito ? formatARS(mov.debito) : '—'}
                  </p>
                  <p className="text-emerald-400 text-xs text-right">
                    {mov.credito ? formatARS(mov.credito) : '—'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vencimientos próximos */}
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-4">Vencimientos próximos</p>
          <div className="flex flex-col gap-px bg-[#2A2A2A]">
            {VENCIMIENTOS.map((v) => (
              <div key={v.id} className="bg-[#000] flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-white text-sm font-light">{formatDate(v.fecha)}</p>
                  <p className="text-[#555] text-[10px] tracking-[0.1em] mt-0.5">Pedido {v.pedido}</p>
                </div>
                <p className="text-white text-sm font-light">{formatARS(v.monto)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Demo notice */}
        <div className="flex items-start gap-3 border border-[#2A2A2A] px-5 py-4">
          <Info size={14} className="text-[#555] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-[#555] text-[10px] leading-relaxed">
            Los datos de cuenta corriente son provisorios para la demo. La integración con el ERP
            mostrará tu estado real de cuenta, saldos y vencimientos actualizados.
          </p>
        </div>
      </div>
    </div>
  )
}
