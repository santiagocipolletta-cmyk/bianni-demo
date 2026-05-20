'use client'

import { useState, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { formatARS, formatDate, cn } from '@/lib/utils'
import { Info, ArrowDownToLine, ArrowUpFromLine, FileText, AlertCircle, EyeOff } from 'lucide-react'
import type { AccountMovement } from '@/types'

const MOV_LABEL: Record<AccountMovement['tipo'], string> = {
  cargo_venta: 'Venta',
  pago: 'Pago',
  bonificacion: 'Bonificación',
  ajuste: 'Ajuste',
  nota_credito: 'Nota de crédito',
}

const MOV_COLOR: Record<AccountMovement['tipo'], string> = {
  cargo_venta: 'text-red-300',
  pago: 'text-emerald-300',
  bonificacion: 'text-emerald-400',
  ajuste: 'text-yellow-300',
  nota_credito: 'text-blue-300',
}

export default function CuentaPage() {
  const { user } = useAuthStore()
  const { accountMovements, orders, clients, getClientBalance } = useDataStore()
  const [filter, setFilter] = useState<'todos' | 'cargos' | 'pagos'>('todos')

  const client = clients.find((c) => c.id === user?.clientId)
  const balance = client ? getClientBalance(client.id) : 0

  const movements = useMemo(() => {
    const all = accountMovements
      .filter((m) => m.clienteId === user?.clientId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    if (filter === 'cargos') return all.filter((m) => m.monto > 0)
    if (filter === 'pagos') return all.filter((m) => m.monto < 0)
    return all
  }, [accountMovements, user?.clientId, filter])

  const vencimientos = useMemo(() => {
    return accountMovements
      .filter((m) => m.clienteId === user?.clientId && m.tipo === 'cargo_venta' && m.vencimiento)
      .filter((m) => {
        // Solo vencimientos futuros o recientes
        const vto = new Date(m.vencimiento!)
        const today = new Date()
        return vto.getTime() > today.getTime() - 30 * 24 * 60 * 60 * 1000
      })
      .sort((a, b) => new Date(a.vencimiento!).getTime() - new Date(b.vencimiento!).getTime())
  }, [accountMovements, user?.clientId])

  if (client && !client.verCuentaCorriente) {
    return (
      <div className="min-h-full bg-[#000] p-6 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <EyeOff size={32} className="mx-auto text-[#555]" strokeWidth={1.2} />
          <h2 className="text-xl text-white font-light">Cuenta corriente no disponible</h2>
          <p className="text-[#A0A0A0] text-sm leading-relaxed">
            Tu cuenta corriente no está visible en este momento.
            Si necesitás información sobre saldos o pagos, contactá a tu vendedor.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#000] p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl lg:text-4xl text-white tracking-[0.05em] mb-1">CUENTA CORRIENTE</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase">{client?.nombre}</p>
      </div>

      {/* Saldo + Plazo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={cn('border p-6', balance > 0 ? 'border-red-900' : 'border-emerald-900')}>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#555] mb-2">Saldo actual</p>
          <p className={cn('font-display text-4xl font-light', balance > 0 ? 'text-red-300' : 'text-emerald-300')}>
            {formatARS(Math.abs(balance))}
          </p>
          <p className="text-[10px] text-[#555] mt-1 uppercase tracking-[0.1em]">
            {balance > 0 ? 'Debés' : balance < 0 ? 'A favor' : 'Sin saldo'}
          </p>
        </div>

        <div className="border border-[#2A2A2A] p-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#555] mb-2">Plazo estándar</p>
          <p className="font-display text-4xl font-light text-white">{client?.plazoPagoDias ?? 30}</p>
          <p className="text-[10px] text-[#555] mt-1 uppercase tracking-[0.1em]">días desde la venta</p>
        </div>

        <div className="border border-[#2A2A2A] p-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#555] mb-2">Próximos vencimientos</p>
          <p className="font-display text-4xl font-light text-white">{vencimientos.length}</p>
          <p className="text-[10px] text-[#555] mt-1 uppercase tracking-[0.1em]">facturas próximas</p>
        </div>
      </div>

      {/* Vencimientos próximos */}
      {vencimientos.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#555] mb-3">Próximos vencimientos</p>
          <div className="border border-[#2A2A2A]">
            {vencimientos.map((m) => {
              const order = orders.find((o) => o.id === m.orderId)
              const vto = new Date(m.vencimiento!)
              const days = Math.ceil((vto.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const isOverdue = days < 0
              return (
                <div key={m.id} className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A] last:border-0 hover:bg-[#0A0A0A]">
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-[#555]" />
                    <div>
                      <p className="text-white text-sm font-light">{order?.codigo ?? '—'}</p>
                      <p className="text-[10px] text-[#555]">Vence {formatDate(m.vencimiento!)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{formatARS(m.monto)}</p>
                    <p className={cn('text-[10px] uppercase tracking-[0.1em]', isOverdue ? 'text-red-400' : days < 7 ? 'text-yellow-400' : 'text-[#555]')}>
                      {isOverdue ? `Vencido hace ${Math.abs(days)}d` : `En ${days}d`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Historial */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#555]">Historial completo</p>
          <div className="flex gap-1">
            {(['todos', 'cargos', 'pagos'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn(
                'text-[10px] tracking-[0.15em] uppercase px-3 py-1 border transition-colors',
                filter === f ? 'border-white bg-white text-black' : 'border-[#2A2A2A] text-[#555] hover:text-white'
              )}>{f}</button>
            ))}
          </div>
        </div>

        <div className="border border-[#2A2A2A]">
          {movements.length === 0 ? (
            <p className="text-center text-[#555] text-xs py-8">Sin movimientos</p>
          ) : movements.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A] last:border-0 hover:bg-[#0A0A0A]">
              <div className="flex items-center gap-3">
                {m.monto > 0 ? (
                  <ArrowDownToLine size={14} className="text-red-300" />
                ) : (
                  <ArrowUpFromLine size={14} className="text-emerald-300" />
                )}
                <div>
                  <p className="text-white text-xs font-light">{m.descripcion}</p>
                  <p className="text-[10px] text-[#555]">
                    <span className={cn('uppercase tracking-[0.1em] mr-2', MOV_COLOR[m.tipo])}>
                      {MOV_LABEL[m.tipo]}
                    </span>
                    {formatDate(m.fecha)} · {m.registradoPor}
                  </p>
                </div>
              </div>
              <p className={cn('text-sm font-light', m.monto > 0 ? 'text-red-300' : 'text-emerald-300')}>
                {m.monto > 0 ? '+' : ''}{formatARS(m.monto)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 flex items-start gap-3 border border-[#1A1A1A] p-4">
        <Info size={14} className="text-[#666] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#A0A0A0] leading-relaxed">
          Los saldos, pagos y vencimientos los registra el ERP de BIANNI. Esta vista es de solo lectura.
          Para coordinar plazos especiales, contactá a tu vendedor.
        </p>
      </div>
    </div>
  )
}
