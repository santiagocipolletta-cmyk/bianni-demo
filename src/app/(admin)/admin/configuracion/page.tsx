'use client'

import { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import type { DiscountCode, DiscountType, WhatsappTemplates } from '@/types'

type TabKey = 'general' | 'remito' | 'cupones' | 'categorias' | 'mensajes'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'remito', label: 'Remito' },
  { key: 'cupones', label: 'Cupones' },
  { key: 'categorias', label: 'Categorías' },
  { key: 'mensajes', label: 'Mensajes WhatsApp' },
]

export default function AdminConfiguracionPage() {
  const [tab, setTab] = useState<TabKey>('general')

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A] min-h-full">
      <div>
        <h1 className="font-display text-3xl text-white tracking-[0.05em]">CONFIGURACIÓN</h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mt-1">
          Parámetros del sistema
        </p>
      </div>

      <div className="flex gap-0 border border-[#2A2A2A] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors border-r border-[#2A2A2A] last:border-r-0 whitespace-nowrap border-b-2',
              tab === t.key
                ? 'bg-[#1A1A1A] text-white border-b-emerald-500'
                : 'text-[#555] hover:text-[#A0A0A0] border-b-transparent'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && <GeneralTab />}
      {tab === 'remito' && <RemitoTab />}
      {tab === 'cupones' && <CuponesTab />}
      {tab === 'categorias' && <CategoriasTab />}
      {tab === 'mensajes' && <MensajesTab />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1: GENERAL
// ─────────────────────────────────────────────────────────────────────────────

function GeneralTab() {
  const { settings, updateSettings } = useDataStore()
  const [plazo, setPlazo] = useState(settings.plazoPagoEstandarDias)
  const [umbral, setUmbral] = useState(settings.stockCriticalDefaultThreshold)
  const [diasInactivo, setDiasInactivo] = useState(settings.diasClienteInactivo)
  const [wa, setWa] = useState(settings.whatsappBianni)
  const [email, setEmail] = useState(settings.emailContacto)

  function handleSave() {
    updateSettings({
      plazoPagoEstandarDias: plazo,
      stockCriticalDefaultThreshold: umbral,
      diasClienteInactivo: diasInactivo,
      whatsappBianni: wa,
      emailContacto: email,
    })
    toast.success('Configuración general guardada')
  }

  return (
    <div className="bg-[#111] border border-[#2A2A2A] p-6 space-y-5 max-w-2xl">
      <FieldNumber
        label="Plazo de pago estándar (días)"
        value={plazo}
        onChange={setPlazo}
      />
      <FieldNumber
        label="Umbral de stock crítico por defecto"
        value={umbral}
        onChange={setUmbral}
      />
      <FieldNumber
        label="Días para marcar cliente como inactivo"
        value={diasInactivo}
        onChange={setDiasInactivo}
      />
      <FieldText label="WhatsApp BIANNI" value={wa} onChange={setWa} />
      <FieldText label="Email de contacto" value={email} onChange={setEmail} type="email" />

      <div className="pt-3">
        <PrimaryButton onClick={handleSave}>Guardar cambios</PrimaryButton>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2: REMITO
// ─────────────────────────────────────────────────────────────────────────────

function RemitoTab() {
  const { settings, updateSettings } = useDataStore()
  const [razon, setRazon] = useState(settings.razonSocialBianni)
  const [cuit, setCuit] = useState(settings.cuitBianni)
  const [dir, setDir] = useState(settings.direccionBianni)
  const [proxNum, setProxNum] = useState(settings.remitoProximoNumero)

  function handleSave() {
    updateSettings({
      razonSocialBianni: razon,
      cuitBianni: cuit,
      direccionBianni: dir,
      remitoProximoNumero: proxNum,
    })
    toast.success('Datos del remito guardados')
  }

  return (
    <div className="bg-[#111] border border-[#2A2A2A] p-6 space-y-5 max-w-2xl">
      <FieldText label="Razón social" value={razon} onChange={setRazon} />
      <FieldText label="CUIT" value={cuit} onChange={setCuit} />
      <FieldText label="Dirección" value={dir} onChange={setDir} />
      <div className="space-y-2">
        <FieldNumber
          label="Próximo número de remito"
          value={proxNum}
          onChange={setProxNum}
        />
        <p className="text-[10px] tracking-[0.1em] uppercase text-yellow-500/80">
          Editar con cuidado: la numeración debe ser correlativa.
        </p>
      </div>

      <div className="pt-3">
        <PrimaryButton onClick={handleSave}>Guardar</PrimaryButton>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3: CUPONES
// ─────────────────────────────────────────────────────────────────────────────

function CuponesTab() {
  const { discountCodes, sellers, updateCoupon, deleteCoupon } = useDataStore()
  const [openNew, setOpenNew] = useState(false)

  function sellerName(id?: string): string {
    if (!id) return '—'
    return sellers.find((s) => s.id === id)?.nombre ?? '—'
  }

  function handleDelete(c: DiscountCode) {
    if (window.confirm(`¿Eliminar el cupón ${c.codigo}? Esta acción no se puede deshacer.`)) {
      deleteCoupon(c.id)
      toast.success(`Cupón ${c.codigo} eliminado`)
    }
  }

  function handleToggleActivo(c: DiscountCode) {
    updateCoupon(c.id, { activo: !c.activo })
    toast.success(c.activo ? `Cupón ${c.codigo} desactivado` : `Cupón ${c.codigo} activado`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PrimaryButton onClick={() => setOpenNew(true)}>
          <Plus size={12} strokeWidth={2} /> Nuevo cupón
        </PrimaryButton>
      </div>

      <div className="overflow-x-auto border border-[#2A2A2A] bg-[#111]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
              {['Código', 'Tipo', 'Valor', 'Vencimiento', 'Usos', 'Vendedor', 'Activo', 'Acciones'].map((h) => (
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
            {discountCodes.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-[#555] py-12 text-xs">
                  Sin cupones
                </td>
              </tr>
            ) : (
              discountCodes.map((c) => (
                <tr key={c.id} className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors">
                  <td className="px-4 py-3 text-white text-xs font-medium whitespace-nowrap">
                    {c.codigo}
                    {c.descripcion && (
                      <p className="text-[#666] text-[10px] font-normal">{c.descripcion}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                    {c.tipo === 'porcentaje' ? '%' : '$'}
                  </td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                    {c.tipo === 'porcentaje' ? `${c.valor}%` : `$${c.valor.toLocaleString('es-AR')}`}
                  </td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                    {c.fechaVencimiento
                      ? new Date(c.fechaVencimiento).toLocaleDateString('es-AR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                    {c.usosActual} / {c.usosMax}
                  </td>
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                    {sellerName(c.sellerId)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActivo(c)}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center transition-colors',
                        c.activo ? 'bg-emerald-600' : 'bg-[#2A2A2A]'
                      )}
                      title={c.activo ? 'Activo' : 'Inactivo'}
                    >
                      <span
                        className={cn(
                          'inline-block h-3.5 w-3.5 transform bg-white transition-transform',
                          c.activo ? 'translate-x-4' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(c)}
                      className="text-[#666] hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <NewCouponDialog open={openNew} onOpenChange={setOpenNew} />
    </div>
  )
}

function NewCouponDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { sellers, addCoupon } = useDataStore()
  const [codigo, setCodigo] = useState('')
  const [tipo, setTipo] = useState<DiscountType>('porcentaje')
  const [valor, setValor] = useState(10)
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [usosMax, setUsosMax] = useState(50)
  const [descripcion, setDescripcion] = useState('')
  const [sellerId, setSellerId] = useState('')

  function reset() {
    setCodigo('')
    setTipo('porcentaje')
    setValor(10)
    setFechaVencimiento('')
    setUsosMax(50)
    setDescripcion('')
    setSellerId('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo.trim()) {
      toast.error('El código es obligatorio')
      return
    }
    if (valor <= 0) {
      toast.error('El valor debe ser mayor a 0')
      return
    }
    if (usosMax <= 0) {
      toast.error('La cantidad de usos debe ser mayor a 0')
      return
    }
    addCoupon({
      codigo: codigo.trim().toUpperCase(),
      tipo,
      valor,
      activo: true,
      usosMax,
      fechaVencimiento: fechaVencimiento
        ? new Date(fechaVencimiento + 'T23:59:59.000Z').toISOString()
        : undefined,
      descripcion: descripcion.trim() || undefined,
      sellerId: sellerId || undefined,
    })
    toast.success(`Cupón ${codigo.trim().toUpperCase()} creado`)
    reset()
    onOpenChange(false)
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 bg-[#0A0A0A] border border-[#2A2A2A] p-8 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <Dialog.Title className="text-white text-base font-light tracking-[0.15em] uppercase mb-1">
            Nuevo cupón
          </Dialog.Title>
          <Dialog.Description className="text-[#555] text-xs tracking-wide mb-6">
            Configurá un nuevo código de descuento.
          </Dialog.Description>

          <Dialog.Close className="absolute right-5 top-5 text-[#555] hover:text-white transition-colors">
            <X size={16} />
          </Dialog.Close>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldText label="Código" value={codigo} onChange={setCodigo} placeholder="EJ: BIANNI10" />

            <div className="space-y-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555]">Tipo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipo('porcentaje')}
                  className={cn(
                    'flex-1 border text-[10px] tracking-[0.2em] uppercase px-4 py-2 transition-colors',
                    tipo === 'porcentaje'
                      ? 'border-white bg-white text-black'
                      : 'border-[#2A2A2A] text-[#A0A0A0] hover:border-[#444]'
                  )}
                >
                  Porcentaje (%)
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('monto_fijo')}
                  className={cn(
                    'flex-1 border text-[10px] tracking-[0.2em] uppercase px-4 py-2 transition-colors',
                    tipo === 'monto_fijo'
                      ? 'border-white bg-white text-black'
                      : 'border-[#2A2A2A] text-[#A0A0A0] hover:border-[#444]'
                  )}
                >
                  Monto fijo ($)
                </button>
              </div>
            </div>

            <FieldNumber
              label={tipo === 'porcentaje' ? 'Valor (%)' : 'Valor ($)'}
              value={valor}
              onChange={setValor}
            />
            <FieldNumber label="Cantidad máxima de usos" value={usosMax} onChange={setUsosMax} />

            <div className="space-y-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555]">
                Fecha de vencimiento (opcional)
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555]">
                Vendedor asociado (opcional)
              </label>
              <select
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              >
                <option value="">— Sin asociar —</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555]">
                Descripción (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.2em] uppercase px-4 py-2 hover:border-[#444] hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="border border-white bg-white text-black text-[10px] tracking-[0.2em] uppercase px-4 py-2 hover:bg-[#e0e0e0] transition-colors"
              >
                Crear cupón
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4: CATEGORÍAS
// ─────────────────────────────────────────────────────────────────────────────

function CategoriasTab() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useDataStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editOrder, setEditOrder] = useState(0)

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  )

  function productCount(catId: string): number {
    return products.filter((p) => p.categoryId === catId).length
  }

  function startEdit(catId: string, name: string, order: number) {
    setEditingId(catId)
    setEditName(name)
    setEditOrder(order)
  }

  function saveEdit(catId: string) {
    if (!editName.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }
    updateCategory(catId, { name: editName.trim(), order: editOrder })
    setEditingId(null)
    toast.success('Categoría actualizada')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function handleDelete(catId: string, name: string) {
    if (!window.confirm(`¿Eliminar la categoría "${name}"?`)) return
    const result = deleteCategory(catId)
    if (!result.ok) {
      toast.error(result.reason ?? 'No se pudo eliminar')
      return
    }
    toast.success(`Categoría "${name}" eliminada`)
  }

  function handleAdd() {
    const nextOrder = categories.length === 0 ? 1 : Math.max(...categories.map((c) => c.order)) + 1
    addCategory({ name: 'Nueva categoría', order: nextOrder })
    toast.success('Categoría agregada — editala para personalizarla')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PrimaryButton onClick={handleAdd}>
          <Plus size={12} strokeWidth={2} /> Nueva categoría
        </PrimaryButton>
      </div>

      <div className="overflow-x-auto border border-[#2A2A2A] bg-[#111]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]">
              {['Orden', 'Nombre', 'Productos', 'Acciones'].map((h) => (
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
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-[#555] py-12 text-xs">
                  Sin categorías
                </td>
              </tr>
            ) : (
              sorted.map((cat) => {
                const isEditing = editingId === cat.id
                return (
                  <tr key={cat.id} className="border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors">
                    <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap w-24">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editOrder}
                          onChange={(e) => setEditOrder(Number(e.target.value))}
                          className="w-16 bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1 focus:outline-none focus:border-[#444]"
                        />
                      ) : (
                        cat.order
                      )}
                    </td>
                    <td className="px-4 py-3 text-white text-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full max-w-xs bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs px-2 py-1 focus:outline-none focus:border-[#444]"
                        />
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#A0A0A0] text-xs whitespace-nowrap">
                      {productCount(cat.id)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(cat.id)}
                            className="text-emerald-400 hover:text-emerald-300"
                            title="Guardar"
                          >
                            <Check size={14} strokeWidth={2} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-[#666] hover:text-white"
                            title="Cancelar"
                          >
                            <X size={14} strokeWidth={2} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => startEdit(cat.id, cat.name, cat.order)}
                            className="text-[#666] hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Pencil size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="text-[#666] hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
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
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 5: MENSAJES WHATSAPP
// ─────────────────────────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<keyof WhatsappTemplates, string> = {
  pedidoConfirmadoAdmin: 'Pedido confirmado (admin → óptica)',
  pedidoDespachado: 'Pedido despachado',
  pedidoEntregado: 'Pedido entregado',
  pedidoRechazado: 'Pedido rechazado',
  bienvenidaCredenciales: 'Bienvenida y credenciales',
}

const TEMPLATE_KEYS: (keyof WhatsappTemplates)[] = [
  'pedidoConfirmadoAdmin',
  'pedidoDespachado',
  'pedidoEntregado',
  'pedidoRechazado',
  'bienvenidaCredenciales',
]

function MensajesTab() {
  const { settings, updateSettings } = useDataStore()
  const [templates, setTemplates] = useState<WhatsappTemplates>(settings.whatsappTemplates)

  function handleChange(key: keyof WhatsappTemplates, value: string) {
    setTemplates((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    updateSettings({ whatsappTemplates: templates })
    toast.success('Mensajes guardados')
  }

  return (
    <div className="bg-[#111] border border-[#2A2A2A] p-6 space-y-6 max-w-3xl">
      {TEMPLATE_KEYS.map((key) => (
        <div key={key} className="space-y-2">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555]">
            {TEMPLATE_LABELS[key]}
          </label>
          <textarea
            value={templates[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={3}
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] resize-none"
          />
          <p className="text-[10px] text-[#444] tracking-wide">
            Variables disponibles: <code className="text-[#888]">{'{codigo}'}</code>,{' '}
            <code className="text-[#888]">{'{email}'}</code>,{' '}
            <code className="text-[#888]">{'{password}'}</code>,{' '}
            <code className="text-[#888]">{'{url}'}</code>
          </p>
        </div>
      ))}

      <div className="pt-3">
        <PrimaryButton onClick={handleSave}>Guardar mensajes</PrimaryButton>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable field components
// ─────────────────────────────────────────────────────────────────────────────

function FieldText({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#444]"
      />
    </div>
  )
}

function FieldNumber({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555]">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
      />
    </div>
  )
}

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 border border-white bg-white text-black text-[10px] tracking-[0.2em] uppercase px-4 py-2 hover:bg-[#e0e0e0] transition-colors"
    >
      {children}
    </button>
  )
}
