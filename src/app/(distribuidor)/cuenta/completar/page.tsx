'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'

const PROVINCIAS = [
  'CABA', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

export default function CompletarCuentaPage() {
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
  })
  const [submitting, setSubmitting] = useState(false)

  // Pre-cargar lo que ya exista
  useEffect(() => {
    if (!client) return
    const principal = client.addresses.find((a) => a.esPrincipal) ?? client.addresses[0]
    setForm((f) => ({
      cuit: client.cuit ?? f.cuit,
      razonSocial: client.razonSocial ?? f.razonSocial,
      direccion: principal?.direccion ?? f.direccion,
      ciudad: principal?.ciudad ?? client.ciudad ?? f.ciudad,
      provincia: principal?.provincia ?? client.provincia ?? f.provincia,
      codigoPostal: principal?.codigoPostal ?? f.codigoPostal,
    }))
  }, [client])

  // Si ya tiene perfil completo, redirigir
  useEffect(() => {
    if (client?.profileCompleto) router.replace('/catalogo')
  }, [client?.profileCompleto, router])

  if (!client) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Required: CUIT, dirección, ciudad, provincia
    if (!form.cuit.trim()) {
      toast.error('Ingresá el CUIT')
      return
    }
    if (!form.direccion.trim()) {
      toast.error('Ingresá la dirección')
      return
    }
    if (!form.ciudad.trim()) {
      toast.error('Ingresá la ciudad')
      return
    }
    if (!form.provincia.trim()) {
      toast.error('Seleccioná la provincia')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      completeClientProfile(client!.id, {
        cuit: form.cuit.trim(),
        razonSocial: form.razonSocial.trim(),
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
        provincia: form.provincia,
        codigoPostal: form.codigoPostal.trim(),
      })
      toast.success('¡Datos completados! Ya podés empezar a pedir.')
      router.push('/catalogo')
    }, 600)
  }

  return (
    <div className="min-h-full bg-[#000] flex items-start justify-center p-6 lg:p-10">
      <div className="w-full max-w-xl">
        {/* Back */}
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#555] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          Volver al catálogo
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={24} strokeWidth={1.2} className="text-emerald-400" />
            <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-500">
              Datos de la óptica
            </p>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl text-white tracking-[0.05em] mb-2">
            Completá tus datos
          </h1>
          <p className="text-[#A0A0A0] text-sm font-light leading-relaxed max-w-md">
            Para poder enviar pedidos necesitamos algunos datos de facturación y envío.
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
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
              CUIT *
            </label>
            <input
              type="text"
              value={form.cuit}
              onChange={(e) => setForm({ ...form, cuit: e.target.value })}
              placeholder="30-12345678-9"
              className="w-full bg-[#111] border border-[#2A2A2A] text-white placeholder-[#444] px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
              Razón social (opcional)
            </label>
            <input
              type="text"
              value={form.razonSocial}
              onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
              placeholder="Ej: Óptica del Centro S.A."
              className="w-full bg-[#111] border border-[#2A2A2A] text-white placeholder-[#444] px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
              Dirección *
            </label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Calle, número, piso, dpto"
              className="w-full bg-[#111] border border-[#2A2A2A] text-white placeholder-[#444] px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
                Ciudad *
              </label>
              <input
                type="text"
                value={form.ciudad}
                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                placeholder="Ej: Buenos Aires"
                className="w-full bg-[#111] border border-[#2A2A2A] text-white placeholder-[#444] px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
                Código Postal (opcional)
              </label>
              <input
                type="text"
                value={form.codigoPostal}
                onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
                placeholder="Ej: C1043"
                className="w-full bg-[#111] border border-[#2A2A2A] text-white placeholder-[#444] px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium mb-1.5">
              Provincia *
            </label>
            <select
              value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })}
              className="w-full bg-[#111] border border-[#2A2A2A] text-white px-4 py-3 text-sm outline-none focus:border-[#555] transition-colors"
            >
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
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
