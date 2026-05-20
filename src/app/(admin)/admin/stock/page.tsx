'use client'

import { useState, useMemo, useRef } from 'react'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, Minus, ScanLine, X, Check, Trash2, FileText } from 'lucide-react'

type StockFilter = 'todos' | 'normal' | 'bajo' | 'critico'
type AdjustMode = 'set' | 'add' | 'subtract'

interface DraftLine {
  productId: string
  sku: string
  name: string
  cantidad: number
}

function getEstado(disponible: number): { label: string; cls: string } {
  if (disponible <= 5) return { label: 'CRÍTICO', cls: 'bg-red-950 text-red-400' }
  if (disponible <= 10) return { label: 'BAJO', cls: 'bg-yellow-950 text-yellow-400' }
  return { label: 'OK', cls: 'bg-emerald-950 text-emerald-400' }
}

export default function AdminStockPage() {
  const { stock, products, categories, updateStock, ingresoStock } = useDataStore()
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanCantidad, setScanCantidad] = useState(1)

  // Borrador de ingreso — NO impacta stock hasta confirmar
  const [draft, setDraft] = useState<DraftLine[]>([])
  const [referencia, setReferencia] = useState('')           // Nº factura / orden de compra
  const [notaIngreso, setNotaIngreso] = useState('')
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  const [filter, setFilter] = useState<StockFilter>('todos')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [adjustMode, setAdjustMode] = useState<AdjustMode>('set')

  const criticalCount = useMemo(
    () => stock.filter((s) => s.disponible <= 5).length,
    [stock]
  )

  const enriched = useMemo(() => {
    return stock.map((s) => {
      const product = products.find((p) => p.id === s.productId)
      const category = product
        ? categories.find((c) => c.id === product.categoryId)
        : null
      return { ...s, product, category }
    })
  }, [stock, products, categories])

  const filtered = useMemo(() => {
    switch (filter) {
      case 'normal':
        return enriched.filter((s) => s.disponible > 10)
      case 'bajo':
        return enriched.filter((s) => s.disponible > 5 && s.disponible <= 10)
      case 'critico':
        return enriched.filter((s) => s.disponible <= 5)
      default:
        return enriched
    }
  }, [enriched, filter])

  const TABS: { key: StockFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'normal', label: 'Normal (>10)' },
    { key: 'bajo', label: 'Bajo (5-10)' },
    { key: 'critico', label: 'Crítico (≤5)' },
  ]

  // Totales del borrador
  const draftTotalUnidades = useMemo(() => draft.reduce((sum, l) => sum + l.cantidad, 0), [draft])

  function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = barcodeInput.trim().toUpperCase()
    if (!code) return
    const product = products.find((p) => p.sku.toUpperCase() === code || p.id === code)
    if (!product) {
      toast.error(`Producto no encontrado: ${code}`)
      setBarcodeInput('')
      barcodeInputRef.current?.focus()
      return
    }
    // ⚡ Solo agrega al borrador, NO al stock real
    setDraft((prev) => {
      const existing = prev.find((l) => l.productId === product.id)
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id ? { ...l, cantidad: l.cantidad + scanCantidad } : l
        )
      }
      return [{ productId: product.id, sku: product.sku, name: product.name, cantidad: scanCantidad }, ...prev]
    })
    toast.success(`+${scanCantidad} · ${product.name}`, { duration: 1200 })
    setBarcodeInput('')
    barcodeInputRef.current?.focus()
  }

  function updateDraftLine(productId: string, cantidad: number) {
    if (cantidad <= 0) {
      setDraft((prev) => prev.filter((l) => l.productId !== productId))
      return
    }
    setDraft((prev) => prev.map((l) => l.productId === productId ? { ...l, cantidad } : l))
  }

  function removeDraftLine(productId: string) {
    setDraft((prev) => prev.filter((l) => l.productId !== productId))
  }

  function clearDraft() {
    if (draft.length === 0) return
    if (window.confirm(`¿Descartar el ingreso de ${draftTotalUnidades} unidades? No se aplicó al stock todavía.`)) {
      setDraft([])
      setReferencia('')
      setNotaIngreso('')
      toast.info('Borrador descartado')
    }
  }

  function confirmDraft() {
    if (draft.length === 0) return
    const motivoBase = referencia
      ? `Ingreso ref ${referencia}${notaIngreso ? ' · ' + notaIngreso : ''}`
      : `Ingreso de mercadería${notaIngreso ? ' · ' + notaIngreso : ''}`
    draft.forEach((line) => {
      ingresoStock(line.productId, line.cantidad, 'Giuliana Bianni', motivoBase)
    })
    toast.success(`Stock actualizado: ${draftTotalUnidades} unidades en ${draft.length} producto${draft.length !== 1 ? 's' : ''}`)
    setDraft([])
    setReferencia('')
    setNotaIngreso('')
    setConfirmModalOpen(false)
    barcodeInputRef.current?.focus()
  }

  function startAdjust(productId: string, current: number, mode: AdjustMode) {
    setEditingId(productId)
    setAdjustMode(mode)
    setEditValue(mode === 'set' ? current : 0)
  }

  function commitAdjust(productId: string, currentStock: number) {
    let newValue: number
    if (adjustMode === 'add') {
      newValue = currentStock + editValue
    } else if (adjustMode === 'subtract') {
      newValue = Math.max(0, currentStock - editValue)
    } else {
      newValue = editValue
    }
    updateStock(productId, newValue, `Ajuste manual: ${adjustMode === 'add' ? '+' : adjustMode === 'subtract' ? '-' : '='}${editValue}`, 'Giuliana Bianni')
    const verb = adjustMode === 'add' ? `+${editValue} unidades cargadas` : adjustMode === 'subtract' ? `-${editValue} unidades descontadas` : 'Stock actualizado'
    toast.success(verb)
    setEditingId(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">STOCK</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          Inventario en tiempo real
        </p>
      </div>

      {/* Alert banner */}
      {criticalCount > 0 && (
        <div className="bg-amber-950/60 border border-amber-700/50 px-4 py-3 text-amber-300 text-xs tracking-[0.1em]">
          ⚠️ {criticalCount} producto{criticalCount !== 1 ? 's' : ''} con stock crítico (≤5 unidades)
        </div>
      )}

      {/* Ingreso de mercadería (borrador → confirmar) */}
      <div className="border border-[#2A2A2A] bg-[#0A0A0A]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2A2A2A] flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ScanLine size={16} className="text-emerald-400" />
              <h3 className="text-[10px] tracking-[0.2em] uppercase text-white">Ingreso de mercadería</h3>
              {draft.length > 0 && (
                <span className="text-[9px] tracking-[0.15em] uppercase bg-yellow-950 text-yellow-400 px-2 py-0.5 ml-1">
                  Borrador sin confirmar
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#A0A0A0]">
              Escaneá o tipeá los SKU. Se arma una lista que podés <span className="text-white">comparar con la factura</span> antes de aplicar al stock.
            </p>
          </div>
        </div>

        {/* Input de carga */}
        <div className="px-5 py-4 border-b border-[#1A1A1A]">
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">SKU / Código</label>
              <input
                ref={barcodeInputRef}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Escaneá o tipeá: CL-001"
                autoFocus
                className="w-full bg-[#000] border border-[#2A2A2A] text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">Cantidad</label>
              <input type="number" min={1} value={scanCantidad} onChange={(e) => setScanCantidad(Number(e.target.value))}
                className="w-full bg-[#000] border border-[#2A2A2A] text-white text-sm px-3 py-2.5 focus:outline-none focus:border-emerald-500" />
            </div>
            <button type="submit"
              className="border border-emerald-700 bg-emerald-950 text-emerald-400 text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 hover:bg-emerald-900 transition-colors">
              + Agregar a la lista
            </button>
          </form>
        </div>

        {/* Tabla del borrador */}
        {draft.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[#555] text-xs tracking-[0.15em] uppercase">
              Empezá escaneando o tipeando un SKU
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1A1A1A] bg-[#000]">
                    {['SKU', 'Producto', 'Cantidad', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {draft.map((line) => (
                    <tr key={line.productId} className="border-b border-[#1A1A1A] hover:bg-[#000]/50">
                      <td className="px-5 py-2.5 font-mono text-xs text-white">{line.sku}</td>
                      <td className="px-5 py-2.5 text-xs text-[#A0A0A0]">{line.name}</td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateDraftLine(line.productId, line.cantidad - 1)}
                            className="flex h-6 w-6 items-center justify-center border border-[#2A2A2A] text-[#A0A0A0] hover:border-white hover:text-white">
                            <Minus size={11} />
                          </button>
                          <input
                            type="number"
                            value={line.cantidad}
                            onChange={(e) => updateDraftLine(line.productId, Math.max(0, Number(e.target.value)))}
                            className="w-14 h-6 bg-[#000] border border-[#2A2A2A] text-white text-xs text-center focus:outline-none focus:border-emerald-500"
                          />
                          <button onClick={() => updateDraftLine(line.productId, line.cantidad + 1)}
                            className="flex h-6 w-6 items-center justify-center border border-[#2A2A2A] text-[#A0A0A0] hover:border-white hover:text-white">
                            <Plus size={11} />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <button onClick={() => removeDraftLine(line.productId)}
                          className="text-[#555] hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#000] border-t border-[#2A2A2A]">
                    <td className="px-5 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555]" colSpan={2}>
                      {draft.length} producto{draft.length !== 1 ? 's' : ''} distintos
                    </td>
                    <td className="px-5 py-3 text-sm text-white font-light">
                      <span className="font-display text-xl">{draftTotalUnidades}</span>
                      <span className="text-[10px] text-[#555] tracking-[0.15em] uppercase ml-1">u.</span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Referencia / Factura */}
            <div className="px-5 py-4 border-t border-[#1A1A1A] bg-[#000]/30 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1 flex items-center gap-1.5">
                  <FileText size={10} /> Factura / Orden de compra
                </label>
                <input value={referencia} onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: FC A-0001-00234"
                  className="w-full bg-[#000] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]" />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">Nota interna</label>
                <input value={notaIngreso} onChange={(e) => setNotaIngreso(e.target.value)}
                  placeholder="Ej: Lote mayo 2026 — Proveedor X"
                  className="w-full bg-[#000] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]" />
              </div>
            </div>

            {/* Acciones */}
            <div className="px-5 py-4 border-t border-[#1A1A1A] bg-[#000]/30 flex items-center justify-end gap-2 flex-wrap">
              <button onClick={clearDraft}
                className="flex items-center gap-1.5 border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase px-4 py-2 hover:border-red-800 hover:text-red-400 transition-colors">
                <X size={12} /> Descartar borrador
              </button>
              <button onClick={() => setConfirmModalOpen(true)}
                className="flex items-center gap-1.5 border border-emerald-600 bg-emerald-500 text-black text-[10px] tracking-[0.2em] uppercase px-5 py-2 hover:bg-emerald-400 font-medium transition-colors">
                <Check size={12} /> Confirmar e ingresar al stock
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmación */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setConfirmModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#0A0A0A] border border-[#2A2A2A] max-w-md w-full">
            <div className="px-5 py-4 border-b border-[#2A2A2A]">
              <h3 className="text-base text-white font-light">Confirmar ingreso de mercadería</h3>
            </div>
            <div className="px-5 py-5 space-y-3">
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                Vas a ingresar <span className="text-white font-medium">{draftTotalUnidades} unidades</span> repartidas en <span className="text-white font-medium">{draft.length} producto{draft.length !== 1 ? 's' : ''}</span>.
              </p>
              {referencia && (
                <p className="text-xs text-[#A0A0A0]">
                  Referencia: <span className="text-white font-mono">{referencia}</span>
                </p>
              )}
              <div className="bg-[#000] border border-[#1A1A1A] p-3 text-xs space-y-1 max-h-40 overflow-y-auto">
                {draft.map((l) => (
                  <div key={l.productId} className="flex justify-between">
                    <span className="text-[#A0A0A0]"><span className="font-mono text-white">{l.sku}</span> · {l.name}</span>
                    <span className="text-emerald-400 font-medium">+{l.cantidad}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-yellow-400 italic">
                Esta acción no se puede deshacer. Verificá contra la factura antes de confirmar.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-[#2A2A2A] flex justify-end gap-2">
              <button onClick={() => setConfirmModalOpen(false)}
                className="border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-[#1A1A1A]">
                Volver a revisar
              </button>
              <button onClick={confirmDraft}
                className="border border-emerald-600 bg-emerald-500 text-black text-[10px] tracking-[0.2em] uppercase px-5 py-2 hover:bg-emerald-400 font-medium">
                Confirmar ingreso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-0 border border-[#2A2A2A]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] last:border-r-0',
              filter === tab.key
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#555] hover:text-[#A0A0A0]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#2A2A2A]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
              {['SKU', 'Nombre', 'Categoría', 'Disponible', 'Reservado', 'Estado', 'Ajustar'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-[#555] font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-[#555] py-12 text-xs">
                  Sin resultados
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const estado = getEstado(s.disponible)
                const isEditing = editingId === s.productId
                return (
                  <tr
                    key={s.productId}
                    className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#555] text-xs font-mono">
                      {s.product?.sku ?? s.productId}
                    </td>
                    <td className="px-4 py-3 text-white text-xs">
                      {s.product?.name ?? s.productId}
                    </td>
                    <td className="px-4 py-3 text-[#A0A0A0] text-xs">
                      {s.category?.name ?? '—'}
                    </td>
                    {/* Disponible — click number to set absolute value */}
                    <td className="px-4 py-3">
                      {isEditing && adjustMode === 'set' ? (
                        <input
                          type="number"
                          min={0}
                          value={editValue}
                          autoFocus
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          onBlur={() => commitAdjust(s.productId, s.disponible)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitAdjust(s.productId, s.disponible)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="w-20 bg-[#1A1A1A] border border-[#444] text-white text-xs px-2 py-1 focus:outline-none focus:border-white"
                        />
                      ) : (
                        <button
                          onClick={() => startAdjust(s.productId, s.disponible, 'set')}
                          className="text-white text-sm font-light hover:underline cursor-pointer"
                          title="Click para fijar valor exacto"
                        >
                          {s.disponible}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#A0A0A0] text-sm font-light">
                      {s.reservado}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[10px] px-2 py-1 uppercase tracking-[0.1em]', estado.cls)}>
                        {estado.label}
                      </span>
                    </td>
                    {/* Adjust column: cargar / quitar */}
                    <td className="px-4 py-3">
                      {isEditing && adjustMode !== 'set' ? (
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            'text-[11px] font-bold',
                            adjustMode === 'add' ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {adjustMode === 'add' ? '+' : '−'}
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={editValue}
                            autoFocus
                            onChange={(e) => setEditValue(Math.max(0, Number(e.target.value)))}
                            onBlur={() => commitAdjust(s.productId, s.disponible)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitAdjust(s.productId, s.disponible)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="w-16 bg-[#1A1A1A] border border-[#444] text-white text-xs px-2 py-1 focus:outline-none focus:border-white"
                          />
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-[#555] hover:text-white text-xs transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startAdjust(s.productId, s.disponible, 'add')}
                            title="Cargar stock"
                            className="flex items-center gap-1 border border-emerald-800 text-emerald-400 hover:bg-emerald-950 px-2 py-1 text-[9px] tracking-[0.1em] uppercase transition-colors"
                          >
                            <Plus size={9} strokeWidth={2} />
                            Cargar
                          </button>
                          <button
                            onClick={() => startAdjust(s.productId, s.disponible, 'subtract')}
                            title="Quitar stock"
                            className="flex items-center gap-1 border border-red-900 text-red-400 hover:bg-red-950 px-2 py-1 text-[9px] tracking-[0.1em] uppercase transition-colors"
                          >
                            <Minus size={9} strokeWidth={2} />
                            Quitar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p className="text-[#555] text-[10px] tracking-[0.15em] uppercase">
        El stock se descuenta automáticamente al aceptar pedidos.
      </p>
    </div>
  )
}
