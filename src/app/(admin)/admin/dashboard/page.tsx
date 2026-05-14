'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Settings2, X, GripVertical, ShoppingBag, AlertTriangle,
  TrendingUp, Users, Package, MessageSquare, Star, Eye, EyeOff,
} from 'lucide-react'
import { useDataStore } from '@/stores/data-store'
import { formatARS, cn } from '@/lib/utils'

// ─── Widget registry ───────────────────────────────────────────────────────────

type WidgetId =
  | 'kpis'
  | 'orders_status'
  | 'sales_chart'
  | 'critical_stock'
  | 'top_products'
  | 'sellers_perf'
  | 'recent_activity'
  | 'leads_crm'

interface WidgetDef {
  id: WidgetId
  title: string
  description: string
  icon: React.ElementType
  cols: 'full' | 'half' | 'third'
}

const WIDGET_DEFS: WidgetDef[] = [
  { id: 'kpis',            title: 'KPIs generales',         description: 'Pedidos, facturación, stock crítico y reclamos en un vistazo', icon: TrendingUp,   cols: 'full'  },
  { id: 'sales_chart',     title: 'Ventas mes a mes',        description: 'Evolución de ventas por semana comparando meses',             icon: BarChart,     cols: 'half'  },
  { id: 'orders_status',   title: 'Pedidos por estado',      description: 'Distribución actual de pedidos en cada etapa',               icon: ShoppingBag,  cols: 'half'  },
  { id: 'critical_stock',  title: 'Stock crítico',           description: 'Productos con menos de 6 unidades disponibles',              icon: AlertTriangle, cols: 'half'  },
  { id: 'top_products',    title: 'Top productos',           description: 'Los modelos más pedidos del período',                        icon: Star,         cols: 'half'  },
  { id: 'sellers_perf',    title: 'Rendimiento vendedores',  description: 'Comparativa de ventas entre vendedores',                     icon: Users,        cols: 'half'  },
  { id: 'recent_activity', title: 'Actividad reciente',      description: 'Últimos cambios de estado en pedidos',                      icon: Package,      cols: 'half'  },
  { id: 'leads_crm',       title: 'Leads / CRM',             description: 'Estado del pipeline de nuevas ópticas',                      icon: MessageSquare, cols: 'half'  },
]

const DEFAULT_ENABLED: WidgetId[] = ['kpis', 'sales_chart', 'orders_status', 'critical_stock', 'top_products', 'sellers_perf', 'recent_activity', 'leads_crm']
const LS_KEY = 'bianni_dashboard_widgets'

function loadConfig(): WidgetId[] {
  if (typeof window === 'undefined') return DEFAULT_ENABLED
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) return JSON.parse(saved) as WidgetId[]
  } catch { /* ignore */ }
  return DEFAULT_ENABLED
}

// ─── Chart colors ──────────────────────────────────────────────────────────────

const CHART_COLORS = ['#FFFFFF', '#A0A0A0', '#555555', '#3A3A3A']
const STATUS_COLORS: Record<string, string> = {
  pendiente_revision: '#F59E0B',
  modificado:         '#8B5CF6',
  aceptado:           '#10B981',
  despachado:         '#3B82F6',
  entregado:          '#22C55E',
  rechazado:          '#EF4444',
  cancelado:          '#6B7280',
}

// ─── Widget shells ─────────────────────────────────────────────────────────────

function WidgetCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('border border-[#2A2A2A] bg-[#0A0A0A] flex flex-col', className)}>
      <div className="px-5 py-4 border-b border-[#1A1A1A]">
        <h3 className="text-[10px] tracking-[0.2em] uppercase text-[#555]">{title}</h3>
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  )
}

// ─── KPI Widget ────────────────────────────────────────────────────────────────

function KpisWidget() {
  const { orders, stock, claims, leads } = useDataStore()

  const now = new Date()
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.fecha)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const kpis = [
    {
      label: 'Pedidos pendientes',
      value: orders.filter((o) => o.estado === 'pendiente_revision').length,
      sub: 'esperando revisión',
      color: 'text-amber-400',
    },
    {
      label: 'Facturado este mes',
      value: formatARS(thisMonth.reduce((s, o) => s + o.total, 0)),
      sub: `${thisMonth.length} pedidos`,
      color: 'text-white',
    },
    {
      label: 'Stock crítico',
      value: stock.filter((s) => s.disponible <= 5).length,
      sub: 'productos ≤ 5 uds',
      color: 'text-red-400',
    },
    {
      label: 'Reclamos activos',
      value: claims.filter((c) => c.estado !== 'cerrado').length,
      sub: 'sin resolver',
      color: 'text-violet-400',
    },
    {
      label: 'Leads nuevos',
      value: leads.filter((l) => l.estado === 'nuevo').length,
      sub: 'sin contactar',
      color: 'text-sky-400',
    },
    {
      label: 'Pedidos este mes',
      value: thisMonth.length,
      sub: `${orders.filter((o) => o.estado === 'entregado').length} entregados total`,
      color: 'text-emerald-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px bg-[#1A1A1A]">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-[#0A0A0A] px-5 py-5">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#555] mb-2">{kpi.label}</p>
          <p className={cn('text-2xl font-light mb-0.5', kpi.color)}>{kpi.value}</p>
          <p className="text-[10px] text-[#444]">{kpi.sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Sales Chart ───────────────────────────────────────────────────────────────

const WEEKS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
const SALES_DATA = [
  { name: 'Sem 1', 'Mes actual': 420000, 'Mes anterior': 310000 },
  { name: 'Sem 2', 'Mes actual': 680000, 'Mes anterior': 540000 },
  { name: 'Sem 3', 'Mes actual': 520000, 'Mes anterior': 590000 },
  { name: 'Sem 4', 'Mes actual': 890000, 'Mes anterior': 710000 },
]

function SalesChartWidget() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={SALES_DATA} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 0, fontSize: 11 }}
          labelStyle={{ color: '#A0A0A0' }}
          formatter={(value) => [typeof value === 'number' ? formatARS(value) : String(value ?? ''), ''] as [string, string]}
        />
        <Legend wrapperStyle={{ fontSize: 10, color: '#555' }} />
        <Bar dataKey="Mes actual" fill="#FFFFFF" radius={0} />
        <Bar dataKey="Mes anterior" fill="#2A2A2A" radius={0} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Orders Status ─────────────────────────────────────────────────────────────

function OrdersStatusWidget() {
  const { orders } = useDataStore()

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach((o) => {
      counts[o.estado] = (counts[o.estado] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [orders])

  const LABELS: Record<string, string> = {
    pendiente_revision: 'Pendiente',
    modificado:         'Modificado',
    aceptado:           'Aceptado',
    despachado:         'Despachado',
    entregado:          'Entregado',
    rechazado:          'Rechazado',
    cancelado:          'Cancelado',
  }

  return (
    <div className="flex items-start gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie data={statusCounts} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={64} strokeWidth={0}>
            {statusCounts.map((entry) => (
              <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#333'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 0, fontSize: 11 }}
            formatter={(v, name) => [String(v ?? ''), LABELS[String(name)] ?? String(name)] as [string, string]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2 pt-1">
        {statusCounts.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[entry.name] ?? '#333' }} />
              <span className="text-[10px] text-[#A0A0A0]">{LABELS[entry.name] ?? entry.name}</span>
            </div>
            <span className="text-xs text-white font-light">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Critical Stock ────────────────────────────────────────────────────────────

function CriticalStockWidget() {
  const { stock, products } = useDataStore()
  const critical = stock
    .filter((s) => s.disponible <= 5)
    .slice(0, 8)
    .map((s) => ({ ...s, product: products.find((p) => p.id === s.productId) }))

  if (critical.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase">Sin stock crítico</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {critical.map((s) => (
        <div key={s.productId} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-white font-light truncate">{s.product?.name ?? s.productId}</p>
            <p className="text-[10px] text-[#555]">{s.product?.sku ?? '—'}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-16 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (s.disponible / 10) * 100)}%` }} />
            </div>
            <span className={cn('text-sm font-light w-4 text-right', s.disponible === 0 ? 'text-red-500' : 'text-red-400')}>
              {s.disponible}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Top Products ──────────────────────────────────────────────────────────────

function TopProductsWidget() {
  const { orders, products } = useDataStore()

  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach((o) => {
      o.items.forEach((item) => {
        counts[item.productId] = (counts[item.productId] || 0) + item.cantidad
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([productId, qty]) => ({
        name: products.find((p) => p.id === productId)?.name ?? productId,
        qty,
      }))
  }, [orders, products])

  const max = topProducts[0]?.qty ?? 1

  return (
    <div className="space-y-3">
      {topProducts.map((p, i) => (
        <div key={p.name} className="flex items-center gap-3">
          <span className="text-[10px] text-[#444] w-4 flex-shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white font-light truncate">{p.name}</span>
              <span className="text-[10px] text-[#555] ml-2 flex-shrink-0">{p.qty} uds</span>
            </div>
            <div className="h-0.5 bg-[#1A1A1A] rounded-full">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(p.qty / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Sellers Performance ───────────────────────────────────────────────────────

const SELLER_DATA = [
  { name: 'Fernando', ventas: 2340000, pedidos: 12, meta: 3000000 },
  { name: 'Nicolás',  ventas: 1870000, pedidos: 9,  meta: 2500000 },
  { name: 'Paula',    ventas: 950000,  pedidos: 5,  meta: 1500000 },
]

function SellersWidget() {
  return (
    <div className="space-y-4">
      {SELLER_DATA.map((s) => {
        const pct = Math.round((s.ventas / s.meta) * 100)
        return (
          <div key={s.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-xs text-white">{s.name}</span>
                <span className="text-[10px] text-[#555] ml-2">{s.pedidos} pedidos</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#A0A0A0]">{formatARS(s.ventas)}</span>
                <span className="text-[9px] text-[#555] ml-1">/ {pct}% meta</span>
              </div>
            </div>
            <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, pct)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Recent Activity ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pendiente_revision: 'Pendiente',
  modificado:         'Modificado',
  aceptado:           'Aceptado',
  despachado:         'Despachado',
  entregado:          'Entregado',
  rechazado:          'Rechazado',
}

function RecentActivityWidget() {
  const { orders, clients } = useDataStore()

  const recent = orders
    .slice()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 6)

  return (
    <div className="space-y-2">
      {recent.map((order) => {
        const client = clients.find((c) => c.id === order.clienteId)
        const date = new Date(order.fecha)
        return (
          <div key={order.id} className="flex items-center gap-3 py-2 border-b border-[#1A1A1A] last:border-0">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: STATUS_COLORS[order.estado] ?? '#555' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-light truncate">
                {order.codigo} · {client?.nombre ?? '—'}
              </p>
              <p className="text-[10px] text-[#555]">
                {STATUS_LABELS[order.estado] ?? order.estado} · {formatARS(order.total)}
              </p>
            </div>
            <span className="text-[9px] text-[#444] flex-shrink-0">
              {date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Leads CRM Widget ──────────────────────────────────────────────────────────

const LEAD_STATUS_COLORS: Record<string, string> = {
  nuevo:       '#3B82F6',
  contactado:  '#F59E0B',
  convertido:  '#10B981',
  descartado:  '#6B7280',
}
const LEAD_LABELS: Record<string, string> = {
  nuevo: 'Nuevo', contactado: 'Contactado', convertido: 'Convertido', descartado: 'Descartado',
}

function LeadsCrmWidget() {
  const { leads } = useDataStore()

  const byStatus = useMemo(() => {
    const counts: Record<string, number> = { nuevo: 0, contactado: 0, convertido: 0, descartado: 0 }
    leads.forEach((l) => { counts[l.estado] = (counts[l.estado] || 0) + 1 })
    return counts
  }, [leads])

  const recent = leads.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4)

  return (
    <div className="space-y-4">
      {/* Pipeline bars */}
      <div className="grid grid-cols-4 gap-1">
        {Object.entries(byStatus).map(([status, count]) => (
          <div key={status} className="text-center">
            <div className="h-12 bg-[#1A1A1A] flex items-end justify-center pb-1">
              <motion.div
                className="w-full"
                style={{ background: LEAD_STATUS_COLORS[status], height: `${Math.max(4, (count / Math.max(...Object.values(byStatus), 1)) * 44)}px` }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, (count / Math.max(...Object.values(byStatus), 1)) * 44)}px` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[8px] text-[#555] mt-1 tracking-wide uppercase">{LEAD_LABELS[status]}</p>
            <p className="text-sm text-white font-light">{count}</p>
          </div>
        ))}
      </div>

      {/* Recent leads */}
      <div className="space-y-1.5">
        {recent.map((lead) => (
          <div key={lead.id} className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: LEAD_STATUS_COLORS[lead.estado] }} />
            <span className="text-white font-light truncate">{lead.nombre}</span>
            <span className="text-[#555] flex-shrink-0">{lead.telefono}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Widget renderer ───────────────────────────────────────────────────────────

function renderWidget(id: WidgetId) {
  switch (id) {
    case 'kpis':            return <KpisWidget />
    case 'sales_chart':     return <SalesChartWidget />
    case 'orders_status':   return <OrdersStatusWidget />
    case 'critical_stock':  return <CriticalStockWidget />
    case 'top_products':    return <TopProductsWidget />
    case 'sellers_perf':    return <SellersWidget />
    case 'recent_activity': return <RecentActivityWidget />
    case 'leads_crm':       return <LeadsCrmWidget />
  }
}

// ─── Config panel ──────────────────────────────────────────────────────────────

function ConfigPanel({
  enabled,
  onToggle,
  onClose,
}: {
  enabled: WidgetId[]
  onToggle: (id: WidgetId) => void
  onClose: () => void
}) {
  return (
    <motion.div
      key="config"
      className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col bg-[#0A0A0A] border-l border-[#2A2A2A] shadow-2xl"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between border-b border-[#2A2A2A] px-5 py-4">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-white font-medium">Configurar dashboard</p>
          <p className="text-[10px] text-[#555] mt-0.5">Activá o desactivá cada bloque</p>
        </div>
        <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {WIDGET_DEFS.map((def) => {
          const isOn = enabled.includes(def.id)
          const Icon = def.icon
          return (
            <button
              key={def.id}
              onClick={() => onToggle(def.id)}
              className={cn(
                'w-full flex items-start gap-3 p-4 border text-left transition-colors',
                isOn ? 'border-[#3A3A3A] bg-[#111]' : 'border-[#1A1A1A] bg-transparent opacity-50 hover:opacity-70'
              )}
            >
              <div className={cn('mt-0.5 flex-shrink-0', isOn ? 'text-white' : 'text-[#444]')}>
                <Icon size={15} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-medium mb-0.5', isOn ? 'text-white' : 'text-[#555]')}>
                  {def.title}
                </p>
                <p className="text-[10px] text-[#444] leading-relaxed">{def.description}</p>
              </div>
              <div className={cn(
                'flex-shrink-0 mt-0.5 transition-colors',
                isOn ? 'text-emerald-400' : 'text-[#333]'
              )}>
                {isOn ? <Eye size={13} /> : <EyeOff size={13} />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="border-t border-[#2A2A2A] p-4">
        <p className="text-[9px] text-[#444] tracking-wide text-center">
          La configuración se guarda automáticamente en este navegador.
        </p>
      </div>
    </motion.div>
  )
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [enabledWidgets, setEnabledWidgets] = useState<WidgetId[]>(DEFAULT_ENABLED)
  const [configOpen, setConfigOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setEnabledWidgets(loadConfig())
  }, [])

  function toggleWidget(id: WidgetId) {
    setEnabledWidgets((prev) => {
      const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }

  // Ordered widgets to render (maintain registry order but only enabled ones)
  const visibleWidgets = WIDGET_DEFS.filter((d) => enabledWidgets.includes(d.id))

  return (
    <div className="relative p-6 space-y-6 min-h-full">
      {/* Config overlay backdrop */}
      <AnimatePresence>
        {configOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfigOpen(false)}
            />
            <ConfigPanel
              enabled={enabledWidgets}
              onToggle={toggleWidget}
              onClose={() => setConfigOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">DASHBOARD</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
            Resumen operativo · {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setConfigOpen(true)}
          className={cn(
            'flex items-center gap-2 border px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors',
            configOpen
              ? 'border-white text-white'
              : 'border-[#2A2A2A] text-[#555] hover:border-[#555] hover:text-[#A0A0A0]'
          )}
        >
          <Settings2 size={13} strokeWidth={1.5} />
          Configurar
        </button>
      </div>

      {/* Widget grid */}
      <div className="space-y-4">
        {/* KPIs — always full width when visible */}
        {enabledWidgets.includes('kpis') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <WidgetCard title="KPIs generales" className="overflow-hidden">
              <div className="-m-5">
                <KpisWidget />
              </div>
            </WidgetCard>
          </motion.div>
        )}

        {/* 2-column grid for the rest */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {visibleWidgets
            .filter((w) => w.id !== 'kpis')
            .map((def, i) => (
              <motion.div
                key={def.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
              >
                <WidgetCard title={def.title} className="h-full">
                  {renderWidget(def.id)}
                </WidgetCard>
              </motion.div>
            ))}
        </div>

        {visibleWidgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Settings2 size={32} strokeWidth={1} className="text-[#333]" />
            <p className="text-[#555] text-xs tracking-[0.2em] uppercase">
              No hay widgets activos
            </p>
            <button
              onClick={() => setConfigOpen(true)}
              className="border border-[#2A2A2A] text-[#555] text-[10px] tracking-[0.2em] uppercase px-6 py-2 hover:border-white hover:text-white transition-colors"
            >
              Abrir configuración
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
