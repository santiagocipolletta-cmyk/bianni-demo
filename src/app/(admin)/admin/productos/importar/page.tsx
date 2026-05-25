'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDataStore } from '@/stores/data-store'
import { toast } from 'sonner'
import { Upload, Download, Check, X, ArrowLeft, FileText, AlertCircle } from 'lucide-react'
import type { Product } from '@/types'

interface ParsedRow {
  raw: Record<string, string>
  product: Partial<Product> | null
  errors: string[]
  valid: boolean
}

const CSV_HEADERS = ['sku', 'nombre', 'categoryId', 'descripcion', 'pvr', 'destacado', 'novedad', 'preventa']

const TEMPLATE_CSV = `sku,nombre,categoryId,descripcion,pvr,destacado,novedad,preventa
NEW-001,Modelo Demo 1,cat1,Descripción del producto demo,45000,true,false,false
NEW-002,Modelo Demo 2,cat2,Otro producto demo,52000,false,true,false
NEW-003,Modelo Demo 3,cat3,Tercer producto demo,48000,false,false,true`

/**
 * Parser CSV manual minimal — split por línea + comas
 * Respeta comillas dobles. No soporta escapes complejos.
 */
function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length < 2) return []

  const headers = parseLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h.trim()] = (values[i] ?? '').trim()
    })
    return row
  })
}

function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { result.push(current); current = ''; continue }
    current += ch
  }
  result.push(current)
  return result
}

export default function ImportProductosPage() {
  const router = useRouter()
  const { products, categories, addProductsBulk } = useDataStore()
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)

  const validCount = useMemo(() => rows.filter((r) => r.valid).length, [rows])

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla-productos-bianni.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        toast.error('CSV vacío o malformado')
        return
      }

      const existingSkus = new Set(products.map((p) => p.sku.toUpperCase()))
      const validCategoryIds = new Set(categories.map((c) => c.id))
      const skusInFile = new Set<string>()

      const processed: ParsedRow[] = parsed.map((raw) => {
        const errors: string[] = []
        const sku = (raw.sku || '').toUpperCase()
        const pvrNum = Number(raw.pvr || 0)

        if (!sku) errors.push('SKU vacío')
        else if (existingSkus.has(sku)) errors.push(`SKU "${sku}" ya existe`)
        else if (skusInFile.has(sku)) errors.push(`SKU "${sku}" duplicado en el archivo`)

        if (!raw.nombre?.trim()) errors.push('Nombre vacío')
        if (!raw.categoryId || !validCategoryIds.has(raw.categoryId)) {
          errors.push(`Categoría "${raw.categoryId}" inválida`)
        }
        if (!pvrNum || pvrNum <= 0) errors.push('PVR debe ser > 0')

        if (sku) skusInFile.add(sku)

        const valid = errors.length === 0
        return {
          raw,
          valid,
          errors,
          product: valid
            ? {
                id: `imp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                sku,
                name: raw.nombre.trim(),
                categoryId: raw.categoryId,
                description: raw.descripcion?.trim() || '',
                badge: null,
                imageUrl: '/brand/products/clipon.jpg', // default placeholder
                active: true,
                pvr: pvrNum,
                photos: [{ url: '/brand/products/clipon.jpg', isPrincipal: true }],
                substitutes: [],
                destacado: raw.destacado?.toLowerCase() === 'true',
                novedad: raw.novedad?.toLowerCase() === 'true',
                preventa: raw.preventa?.toLowerCase() === 'true',
                stockCriticalThreshold: 5,
              }
            : null,
        }
      })

      setFileName(file.name)
      setRows(processed)
      toast.success(`Archivo procesado: ${processed.length} filas (${processed.filter((r) => r.valid).length} válidas)`)
    }
    reader.readAsText(file)
  }

  function handleImport() {
    const valid = rows.filter((r) => r.valid && r.product)
    if (valid.length === 0) {
      toast.error('No hay productos válidos para importar')
      return
    }
    addProductsBulk(valid.map((r) => r.product as Product))
    toast.success(`${valid.length} productos importados correctamente`)
    router.push('/admin/productos')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 text-[#A0A0A0] hover:text-white text-[10px] tracking-[0.2em] uppercase mb-2"
          >
            <ArrowLeft size={11} /> Productos
          </Link>
          <h1 className="font-display text-3xl text-white tracking-[0.05em]">CARGA MASIVA</h1>
          <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">Importar productos desde CSV</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 border border-[#2A2A2A] text-[#A0A0A0] hover:border-white hover:text-white text-[10px] tracking-[0.15em] uppercase px-4 py-2.5"
        >
          <Download size={12} /> Descargar plantilla
        </button>
      </div>

      {/* Instrucciones */}
      <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-5 text-xs space-y-2">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Columnas requeridas</p>
        <div className="flex flex-wrap gap-1.5">
          {CSV_HEADERS.map((h) => (
            <code key={h} className="bg-[#1A1A1A] text-emerald-300 px-2 py-0.5 font-mono text-[11px]">{h}</code>
          ))}
        </div>
        <p className="text-[#A0A0A0] leading-relaxed pt-2">
          <span className="text-yellow-400">categoryId</span> debe ser uno de:{' '}
          {categories.map((c, i) => (
            <span key={c.id}>
              <code className="text-emerald-300 font-mono">{c.id}</code> ({c.name})
              {i < categories.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
        <p className="text-[#A0A0A0]">
          <span className="text-yellow-400">destacado / novedad / preventa</span>: true o false
        </p>
      </div>

      {/* Upload */}
      <div className="border-2 border-dashed border-[#2A2A2A] hover:border-[#444] transition-colors p-10 text-center">
        <Upload size={28} className="mx-auto mb-3 text-[#555]" strokeWidth={1.2} />
        <p className="text-sm text-white mb-1">{fileName ?? 'Soltá un archivo CSV o seleccioná uno'}</p>
        <p className="text-[10px] text-[#555] tracking-[0.15em] uppercase mb-4">.csv UTF-8</p>
        <label className="inline-block">
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
          <span className="cursor-pointer border border-white bg-white text-black text-[10px] tracking-[0.2em] uppercase px-6 py-2.5 hover:bg-zinc-200 inline-block">
            {fileName ? 'Cambiar archivo' : 'Seleccionar archivo'}
          </span>
        </label>
      </div>

      {/* Preview */}
      {rows.length > 0 && (
        <div className="border border-[#2A2A2A]">
          <div className="px-5 py-3 border-b border-[#2A2A2A] bg-[#0A0A0A] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <FileText size={14} className="text-[#A0A0A0]" />
              <p className="text-xs text-white tracking-wider">
                {rows.length} fila{rows.length !== 1 ? 's' : ''} ·{' '}
                <span className="text-emerald-400">{validCount} válidas</span>
                {rows.length - validCount > 0 && (
                  <span className="text-red-400"> · {rows.length - validCount} con error</span>
                )}
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={validCount === 0}
              className="flex items-center gap-2 border border-emerald-600 bg-emerald-500 text-black text-[10px] tracking-[0.2em] uppercase px-5 py-2 hover:bg-emerald-400 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={12} /> Importar {validCount} producto{validCount !== 1 ? 's' : ''} válido{validCount !== 1 ? 's' : ''}
            </button>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#0A0A0A]">
                <tr className="border-b border-[#2A2A2A] text-[10px] tracking-[0.15em] uppercase text-[#555]">
                  <th className="text-center px-3 py-2 font-normal w-10">#</th>
                  <th className="text-left px-3 py-2 font-normal">SKU</th>
                  <th className="text-left px-3 py-2 font-normal">Nombre</th>
                  <th className="text-left px-3 py-2 font-normal">Categoría</th>
                  <th className="text-right px-3 py-2 font-normal">PVR</th>
                  <th className="text-left px-3 py-2 font-normal">Flags</th>
                  <th className="text-center px-3 py-2 font-normal w-12">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[#1A1A1A] ${row.valid ? '' : 'bg-red-950/20'}`}
                  >
                    <td className="px-3 py-2 text-center text-[#555]">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-white">{row.raw.sku || '—'}</td>
                    <td className="px-3 py-2 text-white">{row.raw.nombre || '—'}</td>
                    <td className="px-3 py-2 text-[#A0A0A0]">{row.raw.categoryId || '—'}</td>
                    <td className="px-3 py-2 text-right text-[#A0A0A0]">{row.raw.pvr || '—'}</td>
                    <td className="px-3 py-2 text-[10px]">
                      {row.raw.destacado === 'true' && <span className="bg-yellow-950 text-yellow-300 px-1.5 py-0.5 mr-1">DEST</span>}
                      {row.raw.novedad === 'true' && <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 mr-1">NUEVO</span>}
                      {row.raw.preventa === 'true' && <span className="bg-blue-950 text-blue-300 px-1.5 py-0.5 mr-1">PREV</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {row.valid ? (
                        <Check size={14} className="text-emerald-400 mx-auto" />
                      ) : (
                        <span title={row.errors.join(', ')}>
                          <X size={14} className="text-red-400 mx-auto" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Errores detalle */}
          {rows.some((r) => !r.valid) && (
            <div className="border-t border-[#2A2A2A] p-4 bg-red-950/20">
              <div className="flex items-start gap-2 text-xs">
                <AlertCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-red-300 font-medium text-[10px] tracking-[0.15em] uppercase">Errores en {rows.length - validCount} fila(s)</p>
                  {rows.filter((r) => !r.valid).slice(0, 5).map((r, i) => (
                    <p key={i} className="text-red-200">
                      <span className="font-mono">Fila {rows.indexOf(r) + 1}</span> ({r.raw.sku || 'sin SKU'}): {r.errors.join(', ')}
                    </p>
                  ))}
                  {rows.filter((r) => !r.valid).length > 5 && (
                    <p className="text-red-300 text-[10px] italic">y {rows.filter((r) => !r.valid).length - 5} más…</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
