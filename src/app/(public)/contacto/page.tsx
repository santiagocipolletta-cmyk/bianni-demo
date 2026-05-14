'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Logo } from '@/components/brand/Logo'
import { useDataStore } from '@/stores/data-store'

// ─── Schema ──────────────────────────────────────────────────────────────────

const contactSchema = z.object({
  nombre: z.string().min(2, 'Ingresá tu nombre completo'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  optica: z.string().optional(),
  mensaje: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

// ─── Nav ─────────────────────────────────────────────────────────────────────

function PageNav() {
  return (
    <nav className="bg-black border-b border-white/10 flex items-center justify-between px-8 md:px-12 py-6">
      <Link href="/">
        <Logo variant="wordmark" className="h-7" />
      </Link>
      <Link
        href="/?login=1"
        className="btn-bianni-outline text-[10px] hidden sm:inline-block"
      >
        Ingresar a tu cuenta
      </Link>
    </nav>
  )
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const addLead = useDataStore((s) => s.addLead)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  function onSubmit(data: ContactFormData) {
    addLead({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono ?? '',
      mensaje: `Óptica: ${data.optica ?? 'No indicada'}. ${data.mensaje ?? ''}`.trim(),
      estado: 'nuevo',
    })
    setSubmitted(true)
    reset()
  }

  if (submitted) {
    return (
      <div className="bg-zinc-900 border border-white/10 p-10 flex flex-col items-start gap-4">
        <div className="w-10 h-px bg-white/40" />
        <p className="font-display text-3xl text-white font-light italic">
          ¡Gracias!
        </p>
        <p className="text-white/55 text-sm leading-relaxed">
          Recibimos tu consulta. Te contactaremos pronto.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors"
        >
          Enviar otra consulta
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Nombre */}
      <div>
        <label className="block text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
          Nombre completo <span className="text-white/60">*</span>
        </label>
        <input
          {...register('nombre')}
          type="text"
          placeholder="María García"
          className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 px-4 py-3 text-sm outline-none focus:border-white/40 transition-colors"
        />
        {errors.nombre && (
          <p className="text-[11px] text-red-400 mt-1">{errors.nombre.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
          Email <span className="text-white/60">*</span>
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="hola@tuoptica.com"
          className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 px-4 py-3 text-sm outline-none focus:border-white/40 transition-colors"
        />
        {errors.email && (
          <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
          Teléfono
        </label>
        <input
          {...register('telefono')}
          type="tel"
          placeholder="+54 9 11 1234-5678"
          className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 px-4 py-3 text-sm outline-none focus:border-white/40 transition-colors"
        />
      </div>

      {/* Nombre de la óptica */}
      <div>
        <label className="block text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
          Nombre de la óptica
        </label>
        <input
          {...register('optica')}
          type="text"
          placeholder="Óptica Central"
          className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 px-4 py-3 text-sm outline-none focus:border-white/40 transition-colors"
        />
      </div>

      {/* Mensaje */}
      <div>
        <label className="block text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
          Mensaje / Consulta
        </label>
        <textarea
          {...register('mensaje')}
          rows={4}
          placeholder="Contanos sobre tu óptica y qué te interesa..."
          className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 px-4 py-3 text-sm outline-none focus:border-white/40 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-bianni-solid w-full text-[11px] py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Enviando...' : 'ENVIAR CONSULTA'}
      </button>
    </form>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-16 px-8 md:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <Logo variant="full" className="h-11 mb-4" />
            <p className="text-zinc-600 text-[11px] italic tracking-wide">
              todo comienza con una mirada
            </p>
          </div>
          <nav className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <Link
              href="/"
              className="text-zinc-500 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/nosotros"
              className="text-zinc-500 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Nosotros
            </Link>
            <Link
              href="/contacto"
              className="text-zinc-500 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Contacto
            </Link>
          </nav>
        </div>
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-700 text-[10px] tracking-wide">
            © 2026 Bianni Eyewear. Todos los derechos reservados.
          </p>
          <p className="text-zinc-700 text-[10px] tracking-wide">
            Portal B2B Mayorista
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactoPage() {
  return (
    <main className="bg-black min-h-screen">
      <PageNav />

      {/* Header */}
      <section className="bg-black px-8 md:px-16 lg:px-24 pt-20 pb-16">
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/30 mb-8">
          Contacto
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-semibold text-white leading-[0.95] tracking-tight">
          Sumate a la<br />
          <span className="italic font-light">familia BIANNI.</span>
        </h1>
      </section>

      {/* 2-column layout */}
      <section className="px-8 md:px-16 lg:px-24 pb-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left: info */}
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-white/30 mb-8">
              Para representantes y ópticas
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-1">
                  Email
                </p>
                <a
                  href="mailto:hola@bianni.com.ar"
                  className="text-white text-sm hover:text-white/70 transition-colors"
                >
                  hola@bianni.com.ar
                </a>
              </div>

              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-1">
                  WhatsApp
                </p>
                <a
                  href="https://wa.me/5491112345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm hover:text-white/70 transition-colors"
                >
                  +54 9 11 1234-5678
                </a>
              </div>

              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-1">
                  Horario
                </p>
                <p className="text-white/70 text-sm">
                  Lunes a viernes, 9 a 18 hs.
                </p>
              </div>

              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-1">
                  Dirección
                </p>
                <p className="text-white/70 text-sm">
                  Buenos Aires, Argentina
                </p>
              </div>
            </div>

            <div className="my-10 h-px bg-white/10" />

            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/30 mb-4">
                ¿Ya sos distribuidor?
              </p>
              <Link
                href="/?login=1"
                className="text-white text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all"
              >
                Ingresá a tu cuenta
              </Link>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
