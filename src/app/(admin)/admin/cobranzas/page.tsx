'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDataStore } from '@/stores/data-store'
import { formatARS, normalizeText } from '@/lib/utils'
import { ArrowUpDown, Search, X, MessageCircle, Calendar, AlertTriangle, TrendingDown, Wallet } from 'lucide-react'
import type { Client, AccountMovement } from '@/types'

type SortKey = 'saldo' | 'nombre' | 'ultimaCompra'

function tipoLabel(tipo: AccountMovement['tipo']): string {
  switch (tipo) {
    case 'cargo_venta': return 'Cargo venta'
    case 'pago': return 'Pago'
    case 'bonificacion': return 'Bonificación'
    case 'ajuste': return 'Ajuste'
    case 'nota_credito': return 'Nota crédito'
  }
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.ceil((target - now) / (24 * 60 * 60 * 1000))
}

export default function CobranzasPage() {
  const { clients, accountMovements, getClientBalance } = useDataStore()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('saldo')
  const [sortDesc, setSortDesc] = useState(true)
  const [drawerClient, setDrawerClient] = useState<Client | null>(null)

  const activeClients = useMemo(() => clients.filter((c) => c.status === 'activa'), [clients])

  // Enrich con saldo y vencimientos
  const enriched = useMemo(() => {
    const now = Date.now()
    return activeClients.map((c) => {
      const saldo = getClientBalance(c.id)
      const myMovs = accountMovements
        .filter((m) => m.clienteId === c.id && m.vencimiento)
        .sort((a, b) => new Date(a.vencimiento!).getTime() - new Date(b.vencimiento!).getTime())

      const vencidoHoy = myMovs.filter((m) => {
        const d = daysUntil(m.vencimiento!)
        return d <= 0 && m.monto > 0
      }).reduce((sum, m) => sum + m.monto, 0)

      const proximos7 = myMovs.filter((m) => {
        const d = daysUntil(m.vencimiento!)
        return d > 0 && d <= 7 && m.monto > 0
      }).reduce((sum, m) => sum + m.monto, 0)

      const proximoVenc = myMovs.find((m) => daysUntil(m.vencimiento!) >= 0 && m.monto > 0)

      // Días desde última compra
      const diasUltimaCompra = c.ultimaCompra
        ? Math.floor((now - new Date(c.ultimaCompra).getTime()) / (24 * 60 * 60 * 1000))
        : null

      return { client: c, saldo, vencidoHoy, proximos7, proximoVenc, diasUltimaCompra }
    })
  }, [activeClients, accountMovements, getClientBalance])

  // Filtrar por query
  const filtered = useMemo(() => {
    const q = normalizeText(query.trim())
    if (!q) return enriched
    return enriched.filter((e) =>
      normalizeText(e.client.nombre).includes(q) ||
      normalizeText(e.client.ciudad).includes(q) ||
      normalizeText(e.client.provincia).includes(q)
    )
  }, [enriched, query])

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let res = 0
      if (sortKey === 'saldo') res = a.saldo - b.saldo
      else if (sortKey === 'nombre') res = a.client.nombre.localeCompare(b.client.nombre)
      else if (sortKey === 'ultimaCompra') res = (a.diasUltimaCompra ?? 9999) - (b.diasUltimaCompra ?? 9999)
      return sortDesc ? -res : res
    })
  }, [filtered, sortKey, sortDesc])

  // KPIs globales
  const totalPendiente = enriched.reduce((s, e) => s + Math.max(0, e.saldo), 0)
  const totalVencido = enriched.reduce((s, e) => s + e.vencidoHoy, 0)
  const totalProximos7 = enriched.reduce((s, e) => s + e.proximos7, 0)
  const plazoPromedio = activeClients.length > 0
    ? Math.round(activeClients.reduce((s, c) => s + c.plazoPagoDias, 0) / activeClients.length)
    : 0

  const drawerMovements = useMemo(() => {
    if (!drawerClient) return []
    return accountMovements
      .filter((m) => m.clienteId === drawerClient.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [drawerClient, accountMovements])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDesc(!sortDesc)
    else { setSortKey(key); setSortDesc(true) }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">COBRANZAS</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          Panel consolidado de saldos por óptica
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2A2A2A]">
        {[
          { label: 'Total pendiente', value: formatARS(totalPendiente), icon: Wallet, color: 'text-white' },
          { label: 'Vencido hoy', value: formatARS(totalVencido), icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Próx. 7 días', value: formatARS(totalProximos7), icon: Calendar, color: 'text-yellow-400' },
          { label: 'Plazo promedio', value: `${plazoPromedio}d`, icon: TrendingDown, color: 'text-[#A0A0A0]' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0A0A0A] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={12} className={color} />
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#555]">{label}</p>
            </div>
            <p className={`font-display text-2xl font-light ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtro */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar óptica por nombre, ciudad..."
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-white/40"
        />
      </div>

      {/* Tabla */}
      <div className="border border-[#2A2A2A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A] text-[10px] tracking-[0.15em] uppercase text-[#555]">
              <th className="text-left px-4 py-3 font-normal">
                <button onClick={() => toggleSort('nombre')} className="flex items-center gap-1 hover:text-white">
                  Óptica <ArrowUpDown size={10} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-normal">Ciudad</th>
              <th className="text-right px-4 py-3 font-normal">
                <button onClick={() => toggleSort('saldo')} className="flex items-center gap-1 hover:text-white ml-auto">
                  Saldo deuda <ArrowUpDown size={10} />
                </button>
              </th>
              <th className="text-right px-4 py-3 font-normal">Vencido</th>
              <th className="text-right px-4 py-3 font-normal">Próx. venc.</th>
              <th className="text-center px-4 py-3 font-normal">Plazo</th>
              <th className="text-right px-4 py-3 font-normal">
                <button onClick={() => toggleSort('ultimaCompra')} className="flex items-center gap-1 hover:text-white ml-auto">
                  Última compra <ArrowUpDown size={10} />
                </button>
              </th>
              <th className="text-center px-4 py-3 font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={8} className="text-center text-[#555] text-xs py-8">Sin resultados</td></tr>
            )}
            {sorted.map(({ client, saldo, vencidoHoy, proximoVenc, diasUltimaCompra }) => {
              const debe = saldo > 0
              return (
                <tr
                  key={client.id}
                  onClick={() => setDrawerClient(client)}
                  className="border-b border-[#1A1A1A] hover:bg-[#0A0A0A]/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-white">{client.nombre}</td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs">{client.ciudad}</td>
                  <td className={`px-4 py-3 text-right font-medium ${debe ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatARS(saldo)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    {vencidoHoy > 0 ? (
                      <span className="text-red-400">{formatARS(vencidoHoy)}</span>
                    ) : (
                      <span className="text-[#555]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    {proximoVenc ? (
                      <span className="text-[#A0A0A0]">
                        {new Date(proximoVenc.vencimiento!).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </span>
                    ) : (
                      <span className="text-[#555]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-[#A0A0A0] text-xs">{client.plazoPagoDias}d</td>
                  <td className="px-4 py-3 text-right text-xs text-[#A0A0A0]">
                    {diasUltimaCompra !== null ? `Hace ${diasUltimaCompra}d` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={`https://wa.me/${client.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${client.nombre}, te escribo desde BIANNI por tu cuenta corriente.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-[10px] tracking-[0.1em] uppercase"
                    >
                      <MessageCircle size={11} /> WA
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer detalle cliente */}
      <AnimatePresence>
        {drawerClient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerClient(null)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-[#0A0A0A] border-l border-[#2A2A2A] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#0A0A0A] border-b border-[#2A2A2A] px-6 py-4 flex items-start justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#555]">Cuenta corriente</p>
                  <h2 className="font-display text-xl text-white mt-1">{drawerClient.nombre}</h2>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">{drawerClient.ciudad}, {drawerClient.provincia} · Plazo {drawerClient.plazoPagoDias}d</p>
                </div>
                <button onClick={() => setDrawerClient(null)} className="text-[#555] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Saldo destacado */}
              {(() => {
                const saldo = getClientBalance(drawerClient.id)
                return (
                  <div className="px-6 py-5 border-b border-[#1A1A1A]">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#555] mb-2">Saldo actual</p>
                    <p className={`font-display text-3xl font-light ${saldo > 0 ? 'text-red-400' : saldo < 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {formatARS(saldo)}
                    </p>
                    {saldo > 0 && <p className="text-xs text-[#888] mt-1">Pendiente de pago</p>}
                    {saldo < 0 && <p className="text-xs text-[#888] mt-1">A favor del cliente</p>}
                  </div>
                )
              })()}

              {/* Movimientos */}
              <div className="px-6 py-5">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#555] mb-3">Historial de movimientos</p>
                {drawerMovements.length === 0 ? (
                  <p className="text-xs text-[#555] italic">Sin movimientos registrados</p>
                ) : (
                  <div className="space-y-px">
                    {drawerMovements.map((m) => (
                      <div key={m.id} className="bg-[#000] border border-[#1A1A1A] p-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] tracking-[0.2em] uppercase px-1.5 py-0.5 ${
                              m.monto > 0
                                ? 'bg-red-950 text-red-400'
                                : m.tipo === 'pago'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-blue-950 text-blue-400'
                            }`}>
                              {tipoLabel(m.tipo)}
                            </span>
                            <span className="text-[10px] text-[#555]">
                              {new Date(m.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs text-white truncate">{m.descripcion}</p>
                          {m.vencimiento && (
                            <p className="text-[10px] text-[#666] mt-0.5">
                              Vence: {new Date(m.vencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                            </p>
                          )}
                          <p className="text-[9px] text-[#555] mt-0.5">Por: {m.registradoPor}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-medium ${m.monto > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {m.monto > 0 ? '+' : ''}{formatARS(m.monto)}
                          </p>
                          <p className="text-[10px] text-[#666] mt-0.5">Saldo: {formatARS(m.saldoAcumulado)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="px-6 pb-6">
                <p className="text-[10px] text-[#555] mb-3 italic">
                  Los pagos los registra el ERP. Esta vista es solo de consulta.
                </p>
                <a
                  href={`https://wa.me/${drawerClient.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${drawerClient.nombre}, te escribo de BIANNI por tu cuenta corriente.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs tracking-[0.2em] uppercase py-3 font-medium transition-colors"
                >
                  <MessageCircle size={14} /> Contactar por WhatsApp
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
