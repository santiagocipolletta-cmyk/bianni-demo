'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { toast } from 'sonner'

const PROVINCIAS = [
  'CABA', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
]

export default function CompletarDatosPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { clients, completeClientProfile } = useDataStore()

  const client = clients.find((c) => c.id === user?.clientId)

  const [form, setForm] = useState({
    cuit: '',
    razonSocial: '',
    direccion: '',
    ciudad: '',
    provincia: 'CABA',
    codigoPostal: '',
    telefono: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Si ya tiene perfil completo, redirigir
  useEffect(() => {
    if (client?.profileCompleto) router.replace('/catalogo')
  }, [client?.profileCompleto, router])

  if (!client) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.cuit || !form.razonSocial || !form.direccion || !form.ciudad || !form.codigoPostal) {
      toast.error('Completá todos los campos obligatorios')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      completeClientProfile(client!.id, {
        cuit: form.cuit,
        razonSocial: form.razonSocial,
        direccion: form.direccion,
        ciudad: form.ciudad,
        provincia: form.provincia,
        codigoPostal: form.codigoPostal,
        telefono: form.telefono || undefined,
      })
      toast.success('¡Datos completados! Ya podés empezar a pedir.')
      router.replace('/catalogo')
    }, 800)
  }

  return (
    <div className="min-h-full bg-[#000] flex items-start justify-center p-6 lg:p-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={24} strokeWidth={1.2} className="text-emerald-400" />
            <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-500">Primer ingreso</p>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl text-white tracking-[0.05em] mb-2">
            Completá tus datos
          </h1>
          <p className="text-[#A0A0A0] text-sm font-light leading-relaxed max-w-md">
            Para poder pedir necesitamos algunos datos de facturación y envío.
            Solo lo hacemos esta vez.
          </p>
        </div>

        {/* Info note */}
        <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-4 mb-8 flex items-start gap-3">
          <AlertCircle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#A0A0A0] leading-relaxed">
            Podés <span className="text-white">navegar el catálogo</span> sin completar estos datos,
            pero <span className="text-white">no podrás enviar pedidos</span> hasta que los completes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { name: 'cuit', label: 'CUIT *', placeholder: '30-12345678-9', cols: 1 },
            { name: 'razonSocial', label: 'Razón social *', placeholder: 'Ej: Óptica del Centro S.A.', cols: 2 },
            { name: 'direccion', label: 'Dirección de envío *', placeholder: 'Calle, número, piso, dpto', cols: 2 },
            { name: 'ciudad', label: 'Ciudad *', placeholder: 'Ej: Buenos Aires', cols: 1 },
            { name: 'codigoPostal', label: 'Código Postal *', placeholder: 'Ej: C1043', cols: 1 },
            { name: 'telefono', label: 'Teléfono (opcional)', placeholder: 'Ej: 5491144001111', cols: 1 },
          ].map((field) => (
            <div key={field.name} className={field.cols === 2 ? '' : 'inline-block w-full'}>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
                {field.label}
              </label>
              <input
                type="text"
                value={form[field.name as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                placeholder={field.placeholder}
                required={field.label.includes('*')}
                className="w-full bg-[#111] border border-[#2A2A2A] text-white placeholder-[#444] px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors"
              />
            </div>
          ))}

          {/* Provincia select */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
              Provincia *
            </label>
            <select
              value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })}
              className="w-full bg-[#111] border border-[#2A2A2A] text-white px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors"
            >
              {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-white text-black text-[11px] font-medium tracking-[0.2em] uppercase py-4 hover:bg-zinc-200 transition-colors disabled:opacity-60 mt-2"
          >
            {submitting ? 'Guardando...' : 'Guardar y empezar a pedir'}
          </button>
        </form>
      </div>
    </div>
  )
}
