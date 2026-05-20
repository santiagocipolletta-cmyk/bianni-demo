'use client'

import { useState, useMemo, useRef } from 'react'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, Minus, ScanLine } from 'lucide-react'

type StockFilter = 'todos' | 'normal' | 'bajo' | 'critico'
type AdjustMode = 'set' | 'add' | 'subtract'

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
  const [scanLog, setScanLog] = useState<{ sku: string; name: string; cantidad: number }[]>([])
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
    ingresoStock(product.id, scanCantidad, 'Giuliana Bianni', `Ingreso por código de barras: ${code} ×${scanCantidad}`)
    setScanLog((prev) => {
      // Si ya estaba en el log, sumar cantidades
      const existing = prev.find((s) => s.sku === product.sku)
      if (existing) {
        return prev.map((s) => s.sku === product.sku ? { ...s, cantidad: s.cantidad + scanCantidad } : s)
      }
      return [{ sku: product.sku, name: product.name, cantidad: scanCantidad }, ...prev]
    })
    toast.success(`+${scanCantidad} · ${product.name}`)
    setBarcodeInput('')
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

      {/* Carga rápida por código de barras */}
      <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-5">
        <div className="flex items-center gap-2 mb-3">
          <ScanLine size={16} className="text-emerald-400" />
          <h3 className="text-[10px] tracking-[0.2em] uppercase text-white">Ingreso por código de barras</h3>
        </div>
        <p className="text-[11px] text-[#A0A0A0] mb-3">
          Escaneá con la pistola o tipeá el SKU. Cada escaneo suma <span className="text-white">+{scanCantidad}</span> unidades al producto.
        </p>
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">SKU</label>
            <input
              ref={barcodeInputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Ej: CL-001"
              autoFocus
              className="w-full bg-[#000] border border-[#2A2A2A] text-white font-mono text-sm px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="w-24">
            <label className="block text-[9px] tracking-[0.2em] uppercase text-[#555] mb-1">Cantidad</label>
            <input type="number" min={1} value={scanCantidad} onChange={(e) => setScanCantidad(Number(e.target.value))}
              className="w-full bg-[#000] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-emerald-500" />
          </div>
          <button type="submit"
            className="border border-emerald-700 bg-emerald-950 text-emerald-400 text-[10px] tracking-[0.15em] uppercase px-4 py-2 hover:bg-emerald-900 transition-colors">
            Ingresar
          </button>
        </form>

        {scanLog.length > 0 && (
          <div className="mt-4 border-t border-[#1A1A1A] pt-3 space-y-1 max-h-32 overflow-y-auto">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#555]">Sesión actual</p>
            {scanLog.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-[#A0A0A0]"><span className="font-mono text-white">{s.sku}</span> · {s.name}</span>
                <span className="text-emerald-400 font-medium">+{s.cantidad}</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
