'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Search, MapPin, ArrowLeft, ExternalLink } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { useDataStore } from '@/stores/data-store'

export default function MapaPage() {
  const { clients } = useDataStore()
  const [query, setQuery] = useState('')

  // Solo ópticas activas (no suspendidas ni pendientes)
  const opticasActivas = useMemo(
    () => clients.filter((c) => c.status === 'activa' && c.profileCompleto),
    [clients]
  )

  // Búsqueda libre: nombre, ciudad, provincia, dirección, código postal
  const filteredOpticas = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return opticasActivas
    return opticasActivas.filter((c) => {
      const principal = c.addresses.find((a) => a.esPrincipal) ?? c.addresses[0]
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.ciudad.toLowerCase().includes(q) ||
        c.provincia.toLowerCase().includes(q) ||
        (principal?.direccion ?? '').toLowerCase().includes(q) ||
        (principal?.codigoPostal ?? '').toLowerCase().includes(q)
      )
    })
  }, [opticasActivas, query])

  // Sugerencias rápidas — sacadas de la data
  const ciudades = useMemo(
    () => Array.from(new Set(opticasActivas.map((c) => c.ciudad))).sort(),
    [opticasActivas]
  )

  // Mapa URL — busca el query si hay; si no, Argentina
  const mapSrc = query.trim()
    ? `https://www.google.com/maps?q=${encodeURIComponent(query + ' Argentina')}&output=embed`
    : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284265.0568858264!2d-66.97619615!3d-34.6037398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccac630f04469%3A0x7e6bc233d9f5b3da!2sArgentina!5e0!3m2!1ses!2sar!4v1716000000000'

  return (
    <main className="bg-black min-h-screen">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-30 bg-black/95 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span className="text-[10px] tracking-[0.25em] uppercase">Volver</span>
        </Link>
        <Logo variant="wordmark" className="h-6" />
        <div className="w-16" />
      </nav>

      {/* Header */}
      <section className="px-6 md:px-12 lg:px-24 pt-16 md:pt-24 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500 mb-4">Mapa de ópticas</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.01em] leading-[1.05] mb-5">
            Encontrá tu<br/>óptica BIANNI<span className="text-zinc-500">.</span>
          </h1>
          <p className="text-zinc-400 text-base font-light leading-relaxed max-w-xl">
            Buscá por ciudad, provincia, barrio o calle. Te mostramos las ópticas oficiales
            BIANNI más cercanas a tu zona.
          </p>
        </motion.div>
      </section>

      {/* Search */}
      <section className="px-6 md:px-12 lg:px-24 pb-8 sticky top-[73px] z-20 bg-black">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="relative max-w-2xl"
        >
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscá ciudad, provincia, dirección..."
            className="w-full bg-zinc-950 border border-zinc-800 text-white text-base px-12 py-4 focus:outline-none focus:border-white/40 placeholder:text-zinc-600 tracking-wide transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs tracking-[0.2em] uppercase"
            >
              Limpiar
            </button>
          )}
        </motion.div>

        {/* Sugerencias rápidas */}
        {!query && (
          <div className="mt-3 flex items-center gap-2 flex-wrap max-w-2xl">
            <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-600">Búsquedas frecuentes:</span>
            {ciudades.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => setQuery(c)}
                className="text-[10px] tracking-[0.15em] uppercase text-zinc-400 border border-zinc-800 px-3 py-1 hover:border-white/40 hover:text-white transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Map + Listing */}
      <section className="px-6 md:px-12 lg:px-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border border-zinc-800">
          {/* Map */}
          <div className="lg:col-span-2 aspect-video lg:aspect-auto lg:min-h-[600px] bg-zinc-950 relative">
            <iframe
              key={mapSrc}
              title="Mapa de ópticas BIANNI"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(80%) contrast(0.95)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </div>

          {/* List */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-950 flex flex-col">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white">
                {filteredOpticas.length} óptica{filteredOpticas.length !== 1 ? 's' : ''}
              </p>
              {query && (
                <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-500">
                  resultados de &ldquo;{query}&rdquo;
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {filteredOpticas.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                  <MapPin size={24} className="text-zinc-700 mb-3" strokeWidth={1.2} />
                  <p className="text-zinc-400 text-sm font-light mb-1">Sin ópticas en esta zona</p>
                  <p className="text-zinc-600 text-xs leading-relaxed max-w-xs">
                    Probá con otra ciudad o provincia. Si querés ser representante BIANNI en tu zona,{' '}
                    <Link href="/#sumate" className="text-white underline underline-offset-2">
                      contactanos
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                filteredOpticas.map((c) => {
                  const principal = c.addresses.find((a) => a.esPrincipal) ?? c.addresses[0]
                  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${principal?.direccion ?? ''} ${c.ciudad} ${c.provincia} Argentina`
                  )}`
                  return (
                    <a
                      key={c.id}
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-5 py-4 border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-light tracking-wide truncate">
                            {c.nombre}
                          </p>
                          <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-500 mt-1">
                            {c.ciudad} · {c.provincia}
                          </p>
                          {principal?.direccion && (
                            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                              {principal.direccion}
                              {principal.codigoPostal && (
                                <span className="text-zinc-600"> · {principal.codigoPostal}</span>
                              )}
                            </p>
                          )}
                        </div>
                        <ExternalLink
                          size={12}
                          className="text-zinc-600 group-hover:text-white transition-colors flex-shrink-0 mt-1"
                        />
                      </div>
                    </a>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-zinc-600 text-[10px] mt-6 tracking-[0.15em] uppercase">
          {opticasActivas.length} ópticas oficiales en Argentina · Tocá una óptica para abrirla en Google Maps
        </p>
      </section>
    </main>
  )
}
