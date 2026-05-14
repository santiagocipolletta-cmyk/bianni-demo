'use client'

const SYNC_LOG = [
  { timestamp: '2026-05-13 09:15', evento: 'Pedido P-0001 sincronizado', entidad: 'orders', estado: '✅ OK' },
  { timestamp: '2026-05-12 14:30', evento: 'Stock actualizado (−9 unidades)', entidad: 'stock', estado: '✅ OK' },
  { timestamp: '2026-05-12 10:00', evento: 'Cliente c3 actualizado', entidad: 'clients', estado: '✅ OK' },
  { timestamp: '2026-05-11 08:00', evento: 'Precios importados desde ERP', entidad: 'price_lists', estado: '✅ OK' },
  { timestamp: '2026-05-10 18:00', evento: 'Pedido P-0002 sincronizado', entidad: 'orders', estado: '✅ OK' },
  { timestamp: '2026-05-09 12:00', evento: 'Stock sync completo', entidad: 'stock', estado: '✅ OK' },
  { timestamp: '2026-05-08 09:00', evento: 'Vendedores sincronizados', entidad: 'sellers', estado: '✅ OK' },
]

const ARCH_BOXES = [
  { label: 'Web Pública', sub: 'Next.js / Vercel' },
  { label: 'Sistema B2B', sub: 'Portal mayorista' },
  { label: 'ERP Bianni', sub: 'Sistema interno' },
  { label: 'Supabase Postgres', sub: 'Base de datos' },
]

export default function AdminERPSyncPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">SINCRONIZACIÓN ERP</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">Estado de integración con sistemas internos</p>
      </div>

      {/* Status card */}
      <div className="bg-[#111] border border-[#2A2A2A] p-5 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Demo activa — Modo standalone</p>
            <p className="text-[#555] text-xs tracking-[0.1em] uppercase mt-0.5">Datos locales sin conexión al ERP real</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Disabled toggle switch */}
          <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#2A2A2A] cursor-not-allowed opacity-50">
            <span className="inline-block h-3.5 w-3.5 rounded-full bg-[#555] translate-x-1 transition-transform" />
          </div>
          <div>
            <p className="text-[#A0A0A0] text-xs">Activar sincronización con ERP real</p>
            <p className="text-[#555] text-[10px] tracking-[0.1em] uppercase">(Disponible post-adjudicación)</p>
          </div>
        </div>
      </div>

      {/* Architecture diagram */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-4">Arquitectura del sistema</p>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {ARCH_BOXES.map((box, i) => (
            <div key={box.label} className="flex items-center">
              <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-4 text-center min-w-[130px]">
                <p className="text-white text-xs font-medium whitespace-nowrap">{box.label}</p>
                <p className="text-[#555] text-[10px] mt-1 whitespace-nowrap">{box.sub}</p>
              </div>
              {i < ARCH_BOXES.length - 1 && (
                <span className="text-[#555] px-2 text-lg shrink-0">
                  {i === 1 ? '↔' : '→'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sync log */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-4">Log de sincronización</p>
        <div className="overflow-x-auto border border-[#2A2A2A]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
                {['Timestamp', 'Evento', 'Entidad', 'Estado'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SYNC_LOG.map((row, i) => (
                <tr key={i} className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors">
                  <td className="px-4 py-3 text-[#555] text-xs font-mono whitespace-nowrap">{row.timestamp}</td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs">{row.evento}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 text-[#555]">
                      {row.entidad}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-400 text-xs">{row.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-5">
        <p className="text-[#A0A0A0] text-xs leading-relaxed">
          En producción, este módulo conecta el sistema comercial con el ERP de BIANNI en tiempo real. Los pedidos aceptados descuentan stock automáticamente. Los clientes y listas de precios se sincronizan desde el ERP.
        </p>
      </div>
    </div>
  )
}
