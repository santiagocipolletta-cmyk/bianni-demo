'use client'

import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { formatARS } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const CONFIRMED_STATUSES: OrderStatus[] = ['aceptado', 'modificado', 'despachado', 'entregado']
const ACTIVE_STATUSES: OrderStatus[] = ['pendiente_revision', 'modificado']

const APRIL_TOTAL_HARDCODED: number = 850000

function isInMonth(dateStr: string, year: number, month: number): boolean {
  const d = new Date(dateStr)
  return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month
}

function getWeekOfMonth(dateStr: string): number {
  const d = new Date(dateStr)
  const day = d.getUTCDate()
  return Math.ceil(day / 7)
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { orders, clients, products } = useDataStore()

  const sellerId = user?.sellerId

  const myOrders = useMemo(
    () => orders.filter((o) => o.sellerId === sellerId),
    [orders, sellerId]
  )

  // May 2026 orders for this seller
  const mayOrders = useMemo(
    () => myOrders.filter((o) => isInMonth(o.fecha, 2026, 5)),
    [myOrders]
  )

  // KPI 1: Ventas del mes (confirmed statuses, May 2026)
  const ventasMes = useMemo(
    () =>
      mayOrders
        .filter((o) => CONFIRMED_STATUSES.includes(o.estado))
        .reduce((sum, o) => sum + o.total, 0),
    [mayOrders]
  )

  // KPI 2: % change vs April (hardcoded April)
  const pctChange = useMemo(() => {
    if (APRIL_TOTAL_HARDCODED === 0) return 0
    return ((ventasMes - APRIL_TOTAL_HARDCODED) / APRIL_TOTAL_HARDCODED) * 100
  }, [ventasMes])

  // KPI 3: Pedidos activos (all time, active statuses)
  const pedidosActivos = useMemo(
    () => myOrders.filter((o) => ACTIVE_STATUSES.includes(o.estado)).length,
    [myOrders]
  )

  // KPI 4: Clientes atendidos this month (unique clients with any order in May)
  const clientesAtendidos = useMemo(() => {
    const ids = new Set(mayOrders.map((o) => o.clienteId))
    return ids.size
  }, [mayOrders])

  // Weekly chart data — all May orders (for pipeline visibility)
  const weeklyData = useMemo(() => {
    const weeks = [
      { name: 'Sem 1', total: 0 },
      { name: 'Sem 2', total: 0 },
      { name: 'Sem 3', total: 0 },
      { name: 'Sem 4', total: 0 },
    ]
    mayOrders.forEach((o) => {
      const w = Math.min(getWeekOfMonth(o.fecha), 4) - 1
      weeks[w].total += o.total
    })
    return weeks
  }, [mayOrders])

  // Top products by units sold in May (all orders, not just confirmed)
  const topProducts = useMemo(() => {
    const map = new Map<string, { units: number; revenue: number }>()
    mayOrders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = map.get(item.productId) ?? { units: 0, revenue: 0 }
        map.set(item.productId, {
          units: existing.units + item.cantidad,
          revenue:
            existing.revenue +
            item.precioUnit * item.cantidad * (1 - item.descuentoAplicado / 100),
        })
      })
    })
    return Array.from(map.entries())
      .map(([productId, stats]) => ({
        product: products.find((p) => p.id === productId),
        ...stats,
      }))
      .filter((e) => e.product !== undefined)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5)
  }, [mayOrders, products])

  // Top clients by total order value in May
  const topClients = useMemo(() => {
    const map = new Map<string, number>()
    mayOrders.forEach((o) => {
      map.set(o.clienteId, (map.get(o.clienteId) ?? 0) + o.total)
    })
    return Array.from(map.entries())
      .map(([clientId, total]) => ({
        client: clients.find((c) => c.id === clientId),
        total,
      }))
      .filter((e) => e.client !== undefined)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
  }, [mayOrders, clients])

  const kpis = [
    {
      label: 'Ventas del mes',
      value: formatARS(ventasMes),
      sub: 'Mayo 2026',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Vs. mes anterior',
      value: `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%`,
      sub: 'vs. Abril 2026',
      icon: pctChange >= 0 ? TrendingUp : TrendingDown,
      iconColor: pctChange >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'Pedidos activos',
      value: String(pedidosActivos),
      sub: 'Pendientes + Modificados',
      icon: Clock,
      iconColor: 'text-yellow-400',
    },
    {
      label: 'Clientes atendidos',
      value: String(clientesAtendidos),
      sub: 'Este mes',
      icon: Users,
      iconColor: 'text-blue-400',
    },
  ]

  return (
    <div className="min-h-full bg-[#000] px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white">
          Dashboard
        </h1>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#555] mt-1">
          Ramitos — Mayo 2026
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#2A2A2A]">
        {kpis.map(({ label, value, sub, icon: Icon, iconColor }, index) => (
          <motion.div
            key={label}
            className="bg-[#0A0A0A] p-5 flex flex-col gap-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">{label}</p>
              <Icon size={14} strokeWidth={1.5} className={iconColor} />
            </div>
            <p className="text-2xl lg:text-3xl text-white font-light">{value}</p>
            <p className="text-[10px] text-[#555] uppercase tracking-[0.15em]">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + side panels */}
      <div className="grid lg:grid-cols-3 gap-px bg-[#2A2A2A]">
        {/* Weekly bar chart */}
        <div className="lg:col-span-2 bg-[#0A0A0A] p-6">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-6">
            Ventas por semana — Mayo 2026
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#555', fontSize: 10, letterSpacing: '0.1em' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#555', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#111',
                  border: '1px solid #2A2A2A',
                  color: '#fff',
                  fontSize: 11,
                  borderRadius: 0,
                }}
                formatter={(value) =>
                  [typeof value === 'number' ? formatARS(value) : String(value ?? ''), 'Total'] as [string, string]
                }
                cursor={{ fill: '#1A1A1A' }}
              />
              <Bar dataKey="total" fill="#10b981" radius={0} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top clientes */}
        <div className="bg-[#0A0A0A] p-6">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-5">
            Top Clientes — Mayo
          </p>
          <div className="space-y-4">
            {topClients.map(({ client, total }, idx) => (
              <div key={client!.id} className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] text-[#555] mt-0.5 w-3">{idx + 1}</span>
                  <div>
                    <p className="text-sm text-white font-light leading-tight">{client!.nombre}</p>
                    <p className="text-[10px] text-[#555] mt-0.5 uppercase tracking-[0.1em]">
                      {client!.ciudad}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#A0A0A0] font-light flex-shrink-0">
                  {formatARS(total)}
                </p>
              </div>
            ))}
            {topClients.length === 0 && (
              <p className="text-[10px] text-[#555]">Sin datos este mes</p>
            )}
          </div>
        </div>
      </div>

      {/* Top productos */}
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-5">
          Top Productos — Mayo 2026
        </p>
        <div className="divide-y divide-[#2A2A2A]">
          {topProducts.map(({ product, units, revenue }) => (
            <div
              key={product!.id}
              className="flex items-center justify-between py-3 gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-light truncate">{product!.name}</p>
                <p className="text-[9px] text-[#555] uppercase tracking-[0.15em] mt-0.5">
                  {product!.sku}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-white font-light">{units} uds.</p>
                <p className="text-[10px] text-[#555]">{formatARS(revenue)}</p>
              </div>
            </div>
          ))}
          {topProducts.length === 0 && (
            <p className="text-[10px] text-[#555] py-3">Sin ventas registradas este mes</p>
          )}
        </div>
      </div>
    </div>
  )
}
