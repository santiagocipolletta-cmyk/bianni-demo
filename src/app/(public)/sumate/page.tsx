'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { useDataStore } from '@/stores/data-store'

const PROVINCIAS = [
  'CABA', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

function PageNav() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 bg-transparent flex items-center justify-between px-8 md:px-12 py-6">
      <Link href="/">
        <Logo variant="wordmark" className="h-7" />
      </Link>
      <Link
        href="/"
        className="flex items-center gap-2 text-white/60 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
      >
        <ArrowLeft size={11} strokeWidth={1.5} />
        Volver
      </Link>
    </nav>
  )
}

export default function SumatePage() {
  const addRepresentativeRequest = useDataStore((s) => s.addRepresentativeRequest)

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    ciudad: '',
    provincia: 'CABA',
    mensaje: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.nombre.trim() || form.nombre.trim().length < 2) e.nombre = 'Ingresá tu nombre'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.telefono.trim()) e.telefono = 'Ingresá un teléfono'
    if (!form.ciudad.trim()) e.ciudad = 'Ingresá la ciudad'
    if (!form.provincia.trim()) e.provincia = 'Seleccioná la provincia'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setTimeout(() => {
      addRepresentativeRequest({
        nombreOptica: form.nombre.trim(),
        nombreContacto: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        ciudad: form.ciudad.trim(),
        provincia: form.provincia,
        mensaje: form.mensaje.trim() || undefined,
      })
      setSubmitting(false)
      setSubmitted(true)
      setForm({
        nombre: '',
        email: '',
        telefono: '',
        ciudad: '',
        provincia: 'CABA',
        mensaje: '',
      })
    }, 700)
  }

  return (
    <main className="bg-black min-h-screen relative overflow-hidden">
      <PageNav />

      {/* Hero / Form */}
      <section className="relative min-h-screen flex items-center px-8 md:px-16 lg:px-24 pt-32 pb-20">
        {/* Subtle bg accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.06)_0%,_transparent_50%)] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left — copy */}
          <div className="flex flex-col justify-center">
            <motion.p
              className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Distribución mayorista
            </motion.p>
            <motion.h1
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-tight mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Quiero ser<br />
              <span className="italic font-light">representante BIANNI.</span>
            </motion.h1>
            <motion.p
              className="text-zinc-400 text-sm md:text-base font-light leading-relaxed max-w-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Sumate a la red de ópticas que distribuyen BIANNI en Argentina.
              Sin pedido mínimo, certificación europea, gestión simple online.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                'Acceso a catálogo mayorista completo',
                'Soporte directo de tu vendedor asignado',
                'Envíos a todo el país en 24–48 hs',
              ].map((line) => (
                <div key={line} className="flex items-center gap-3 text-zinc-500 text-sm">
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  {line}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — form or success */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start"
          >
            {submitted ? (
              <div className="w-full bg-[#0A0A0A] border border-emerald-900/40 p-10 flex flex-col gap-5">
                <CheckCircle2 size={36} strokeWidth={1.2} className="text-emerald-400" />
                <h2 className="font-display text-3xl text-white font-light">¡Recibimos tu solicitud!</h2>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">
                  Nuestro equipo revisa tu solicitud y te contactamos por WhatsApp con los próximos pasos.
                  Mientras tanto podés volver al sitio y conocer la colección.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#1A1A1A]">
                  <Link
                    href="/"
                    className="flex-1 text-center bg-white text-black text-[10px] tracking-[0.2em] uppercase px-5 py-3 hover:bg-zinc-100 font-medium"
                  >
                    Volver al inicio
                  </Link>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="flex-1 text-center border border-[#2A2A2A] text-[#A0A0A0] text-[10px] tracking-[0.2em] uppercase px-5 py-3 hover:border-white hover:text-white transition-colors"
                  >
                    Enviar otra solicitud
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] p-8 md:p-10 space-y-5"
                noValidate
              >
                <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-6 pb-4 border-b border-[#1A1A1A]">
                  Completá tus datos
                </p>

                <FormField
                  label="Nombre completo *"
                  value={form.nombre}
                  onChange={(v) => setForm({ ...form, nombre: v })}
                  placeholder="María García"
                  error={errors.nombre}
                />
                <FormField
                  label="Email *"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="hola@tuoptica.com"
                  error={errors.email}
                />
                <FormField
                  label="Teléfono *"
                  type="tel"
                  value={form.telefono}
                  onChange={(v) => setForm({ ...form, telefono: v })}
                  placeholder="+54 9 11 1234-5678"
                  error={errors.telefono}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Ciudad *"
                    value={form.ciudad}
                    onChange={(v) => setForm({ ...form, ciudad: v })}
                    placeholder="Buenos Aires"
                    error={errors.ciudad}
                  />
                  <div>
                    <label className="block text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
                      Provincia *
                    </label>
                    <select
                      value={form.provincia}
                      onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                      className="w-full bg-transparent border border-white/15 text-white px-4 py-3 text-sm outline-none focus:border-white/40 transition-colors"
                    >
                      {PROVINCIAS.map((p) => (
                        <option key={p} value={p} className="bg-[#0A0A0A]">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    rows={4}
                    placeholder="Contanos sobre tu óptica, experiencia, ubicación..."
                    className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 px-4 py-3 text-sm outline-none focus:border-white/40 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black text-[11px] font-medium tracking-[0.2em] uppercase py-4 hover:bg-zinc-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-3"
                >
                  {submitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>

                <p className="text-[10px] text-white/30 text-center tracking-wide">
                  Te respondemos en menos de 48 hs hábiles.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 px-4 py-3 text-sm outline-none focus:border-white/40 transition-colors"
      />
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}
