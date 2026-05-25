'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Gift, Sparkles, Calendar, MapPin, BookOpen, Headphones } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

const BENEFICIOS = [
  {
    icon: Gift,
    title: 'Exhibidores de regalo',
    description: 'Te enviamos exhibidores premium para que tu vitrina luzca como una experiencia editorial BIANNI. Sin costo adicional, según tu volumen y compromiso.',
  },
  {
    icon: Sparkles,
    title: 'Contenido exclusivo',
    description: 'Biblioteca curada de fotos, videos y editoriales en alta calidad — listos para tus redes y comunicación. Actualizada cada temporada.',
  },
  {
    icon: Calendar,
    title: 'Prioridad en lanzamientos',
    description: 'Acceso anticipado a preventas de colecciones nuevas. Pedís antes que el público general y aseguras stock de las piezas más buscadas.',
  },
  {
    icon: MapPin,
    title: 'Visibilidad en el mapa',
    description: 'Tu óptica aparece en el mapa público de BIANNI. Los consumidores te encuentran cuando buscan dónde comprar la marca.',
  },
  {
    icon: BookOpen,
    title: 'Capacitación continua',
    description: 'Material educativo sobre cada colección, tendencias y técnicas de venta. Para que tu equipo venda con conocimiento real del producto.',
  },
  {
    icon: Headphones,
    title: 'Vendedor dedicado',
    description: 'Un vendedor asignado a tu óptica para coordinar pedidos, plazos especiales, bonificaciones y reclamos. Comunicación directa por WhatsApp.',
  },
]

export default function BeneficiosPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-30 bg-black/95 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span className="text-[10px] tracking-[0.25em] uppercase">Volver</span>
        </Link>
        <Logo variant="wordmark" className="h-6" />
        <Link
          href="/sumate"
          className="text-white/70 hover:text-white text-[10px] tracking-[0.25em] uppercase hidden sm:block"
        >
          Sumate
        </Link>
        <div className="w-16 sm:hidden" />
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 lg:px-24 pt-20 md:pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/brand/models/model-editorial.jpg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative max-w-3xl"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-400 mb-5">Para ópticas representantes</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.01em] leading-[1.05] mb-6">
            Más que vender<br/>
            <span className="text-zinc-500">una marca.</span>
          </h1>
          <p className="text-zinc-300 text-lg font-light leading-relaxed max-w-2xl">
            Ser representante BIANNI es ser parte de una propuesta editorial.
            Acompañamos a las ópticas con herramientas, contenido y atención personalizada
            para que vendan mejor — sin que se vuelva una transacción.
          </p>
        </motion.div>
      </section>

      {/* Beneficios grid */}
      <section className="px-6 md:px-12 lg:px-24 py-16 border-t border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900">
          {BENEFICIOS.map((b, i) => {
            const Icon = b.icon
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                className="bg-black p-8 md:p-10 flex flex-col"
              >
                <div className="mb-5">
                  <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center">
                    <Icon size={16} className="text-white" strokeWidth={1.3} />
                  </div>
                </div>
                <h3 className="font-display text-xl text-white font-light mb-3 leading-snug">
                  {b.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-light">
                  {b.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Nota informativa */}
      <section className="px-6 md:px-12 lg:px-24 py-16 border-t border-zinc-900">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500 mb-4">Importante</p>
          <p className="text-sm text-zinc-400 leading-relaxed font-light">
            Los beneficios se otorgan de forma personalizada y a criterio de BIANNI según el
            compromiso comercial de cada representante. <span className="text-white">No hay niveles automáticos
            ni minimos de compra</span>: cada caso se evalúa individualmente. Lo que comunicamos acá
            son los beneficios habituales — los detalles los coordinás con tu vendedor.
          </p>
        </motion.div>
      </section>

      {/* CTA final */}
      <section className="px-6 md:px-12 lg:px-24 py-20 md:py-28 border-t border-zinc-900 bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl md:text-5xl text-white font-light leading-tight mb-6">
            ¿Tu óptica encaja con BIANNI?
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-xl mx-auto font-light">
            Contanos un poco de vos. Si tu propuesta encaja, te contactamos para sumarte como representante.
          </p>
          <Link
            href="/sumate"
            className="inline-flex items-center gap-3 bg-white text-black text-xs tracking-[0.25em] uppercase px-8 py-4 hover:bg-zinc-100 transition-colors group font-medium"
          >
            Quiero ser representante
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
