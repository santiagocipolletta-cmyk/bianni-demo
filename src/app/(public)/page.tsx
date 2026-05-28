'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'
import { Lock, Award, ShieldCheck, Star, Truck, ShoppingBag, Headphones } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/brand/Logo'
import { LoginModal } from '@/components/auth/LoginModal'
import { HeroSlideshow } from '@/components/public/HeroSlideshow'
import { NoveltyMarquee } from '@/components/public/NoveltyMarquee'
import { CategoriesHoverSlider } from '@/components/public/CategoriesHoverSlider'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const ROLE_REDIRECTS: Record<UserRole, string> = {
  distribuidor: '/catalogo',
  vendedor: '/dashboard',
  admin: '/admin/pedidos',
  marketing: '/marketing/biblioteca',
}

// ─── Shared easing ────────────────────────────────────────────────────────────

const EASE_OUT = 'easeOut' as const

// ─── Public Nav ────────────────────────────────────────────────────────────────

function PublicNav({ onLoginClick }: { onLoginClick: () => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 md:px-12 py-6 transition-all duration-500 border-b ${
        scrolled
          ? 'bg-black/40 backdrop-blur-md border-white/[0.06]'
          : 'bg-black border-white/10'
      }`}
    >
      <Logo variant="wordmark" className="h-7" />
      <div className="flex items-center gap-3 md:gap-6">
        {/* Links públicos — solo desktop */}
        <Link
          href="/coleccion"
          className="hidden md:inline-block text-white/70 hover:text-white text-[10px] tracking-[0.25em] uppercase transition-colors"
        >
          Colección
        </Link>
        <Link
          href="/beneficios"
          className="hidden md:inline-block text-white/70 hover:text-white text-[10px] tracking-[0.25em] uppercase transition-colors"
        >
          Beneficios
        </Link>
        <Link
          href="/sumate"
          className="hidden sm:inline-block text-white/70 hover:text-white text-[10px] tracking-[0.25em] uppercase transition-colors"
        >
          Sumate
        </Link>
        <button
          onClick={onLoginClick}
          className="btn-bianni-outline text-[10px] hidden sm:block"
        >
          Ingresar a tu cuenta
        </button>
        <Link
          href="/sumate"
          className="sm:hidden text-white/70 text-[10px] tracking-[0.2em] uppercase"
        >
          Sumate
        </Link>
        <button
          onClick={onLoginClick}
          className="sm:hidden text-white text-[10px] tracking-[0.2em] uppercase border border-white/50 px-4 py-2 hover:bg-white hover:text-black transition-colors"
        >
          Ingresar
        </button>
      </div>
    </nav>
  )
}

// ─── Statement Section ─────────────────────────────────────────────────────────

function StatementSection() {
  return (
    <section className="bg-black py-16 md:py-20 px-8 md:px-16 lg:px-24 overflow-hidden">
      <motion.p
        className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-[1.25] text-zinc-400 max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
      >
        La marca de lentes que{' '}
        <span className="text-white">potencia tu óptica.</span>{' '}
        Certificación europea, sin pedido mínimo, envíos a todo el país.
      </motion.p>
    </section>
  )
}

// ─── Editorial Image Section ───────────────────────────────────────────────────

function EditorialSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  // Subtle parallax: image moves slightly slower than scroll
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])

  return (
    <section ref={sectionRef} className="relative bg-black overflow-hidden">
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, scale: 1.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
      >
        <motion.div style={{ y }} className="relative w-full">
          <Image
            src="/brand/editorial-main.jpg"
            alt="BIANNI Eyewear — colección editorial"
            width={2400}
            height={1032}
            className="w-full h-auto object-cover"
            sizes="100vw"
            priority={false}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Public Catalog Section ────────────────────────────────────────────────────

const ALL_CAT = 'all'

interface PublicCatalogProps {
  onLoginClick: () => void
  selectedCat: string
  onCategoryChange: (id: string) => void
  sectionRef: React.RefObject<HTMLElement | null>
}

function PublicCatalogSection({ onLoginClick, selectedCat, onCategoryChange, sectionRef }: PublicCatalogProps) {
  const { products, categories } = useDataStore()

  // LOOKBOOK público: solo destacados y novedad — NO el catálogo completo
  const activeProducts = products.filter((p) => p.estado === 'activo' && (p.destacado || p.novedad))
  const visible =
    selectedCat === ALL_CAT
      ? activeProducts
      : activeProducts.filter((p) => p.categoryId === selectedCat)

  const tabs = [
    { id: ALL_CAT, label: 'Todos' },
    ...categories
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((c) => ({ id: c.id, label: c.name })),
  ]

  return (
    <section ref={sectionRef} className="bg-black py-24">
      <div className="px-8 md:px-16 mb-12">
        <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-500 mb-3">
          Colección 2026
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <h2 className="font-display text-4xl md:text-5xl text-white font-light">
            Nuestros productos
          </h2>
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 border border-white/20 px-4 py-2 text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:border-white hover:text-white transition-colors self-start sm:self-auto"
          >
            <Lock size={11} strokeWidth={1.5} />
            Ver precios mayoristas
          </button>
        </div>
      </div>

      <div className="px-8 md:px-16 mb-8 flex gap-0 overflow-x-auto">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onCategoryChange(id)}
            className={cn(
              'flex-shrink-0 px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase border transition-colors',
              selectedCat === id
                ? 'border-white bg-white text-black'
                : 'border-[#2A2A2A] text-zinc-500 hover:text-white hover:border-[#555]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-8 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-[#1A1A1A]">
          {visible.map((product, index) => {
            const category = categories.find((c) => c.id === product.categoryId)
            return (
              <motion.div
                key={product.id}
                className="bg-black flex flex-col group"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03, ease: 'easeOut' }}
              >
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  {product.badge && (
                    <span className="absolute top-3 left-3 z-10 bg-black text-white text-[8px] tracking-[0.2em] uppercase px-2 py-1">
                      {product.badge}
                    </span>
                  )}
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col p-4 border-t border-[#1A1A1A] flex-1">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-600 mb-1">
                    {category?.name ?? '—'}
                  </p>
                  <h3 className="text-sm text-white font-light mb-1 leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-zinc-600 leading-relaxed line-clamp-2 flex-1 mb-4">
                    {product.description}
                  </p>
                  <button
                    onClick={onLoginClick}
                    className="flex items-center gap-1.5 text-[9px] tracking-[0.15em] uppercase text-zinc-600 hover:text-white transition-colors mt-auto"
                  >
                    <Lock size={9} strokeWidth={1.5} />
                    Precio mayorista — iniciá sesión
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="px-8 md:px-16 mt-12 flex justify-center">
        <button onClick={onLoginClick} className="btn-bianni-outline text-[10px] py-4 px-12">
          Acceder para ver precios y hacer pedidos
        </button>
      </div>
    </section>
  )
}

// ─── Benefits Section ──────────────────────────────────────────────────────────

const BENEFITS = [
  { Icon: Award,       label: 'Certificado Europeo',         desc: 'Toda nuestra línea cumple los estándares CE de la Unión Europea.' },
  { Icon: ShieldCheck, label: 'Seguridad y Confianza',       desc: 'Más de 500 ópticas confían en BIANNI en todo el país.' },
  { Icon: Star,        label: 'Garantía de Calidad',         desc: 'Materiales premium: Zilo, TR90 y acero con bisagras triples.' },
  { Icon: Truck,       label: 'Envíos Rápidos',              desc: 'Despacho a todo el país. Pedidos procesados en 24-48 hs.' },
  { Icon: ShoppingBag, label: 'Sin Compra Mínima',           desc: 'Pedí lo que necesitás, cuando lo necesitás, sin restricciones.' },
  { Icon: Headphones,  label: 'Servicio Post Venta',         desc: 'Asesoramiento técnico y soporte dedicado para tu óptica.' },
]

function BenefitsSection() {
  return (
    <section className="bg-white py-24 px-8 md:px-16 overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-16">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-3"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          ¿Por qué elegir BIANNI?
        </motion.h2>
        <motion.p
          className="text-stone-500 text-sm tracking-[0.1em]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          nuestros principales beneficios
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-14 max-w-4xl mx-auto">
        {BENEFITS.map(({ Icon, label, desc }, i) => (
          <motion.div
            key={label}
            className="flex flex-col items-center text-center gap-3"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.75, delay: i * 0.1, ease: EASE_OUT }}
          >
            {/* Icon circle */}
            <motion.div
              className="w-16 h-16 rounded-full border border-stone-200 flex items-center justify-center mb-1"
              whileHover={{ scale: 1.08, borderColor: '#000' }}
              transition={{ duration: 0.3 }}
            >
              <Icon size={26} strokeWidth={1} className="text-black" />
            </motion.div>
            <p className="text-black text-sm font-medium tracking-wide leading-tight">{label}</p>
            <p className="text-stone-400 text-xs leading-relaxed max-w-[180px]">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── Join Form Section ─────────────────────────────────────────────────────────

function JoinFormSection() {
  const { addLead } = useDataStore()
  const [form, setForm] = useState({
    nombre: '',
    optica: '',
    email: '',
    telefono: '',
    ciudad: '',
  })
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.optica || !form.telefono) {
      toast.error('Completá nombre, óptica y teléfono para continuar.')
      return
    }
    setSubmitting(true)
    addLead({
      nombre: form.nombre,
      nombreOptica: form.optica,
      email: form.email,
      telefono: form.telefono,
      ciudad: form.ciudad,
      mensaje: `Óptica: ${form.optica}. Ciudad: ${form.ciudad}`,
      estado: 'nuevo',
      origen: 'formulario_web',
    })
    setTimeout(() => {
      setSubmitting(false)
      setForm({ nombre: '', optica: '', email: '', telefono: '', ciudad: '' })
      toast.success('¡Recibimos tu solicitud! Te contactamos pronto.')
    }, 800)
  }

  const fields = [
    { name: 'nombre',   label: 'Nombre completo',     placeholder: 'Tu nombre',        required: true },
    { name: 'optica',   label: 'Nombre de tu óptica', placeholder: 'Ej: Óptica Visión', required: true },
    { name: 'email',    label: 'Email',                placeholder: 'tu@email.com',     required: false },
    { name: 'telefono', label: 'Teléfono',             placeholder: '+54 9 11 ...',      required: true },
    { name: 'ciudad',   label: 'Ciudad',               placeholder: 'Buenos Aires, ...',required: false },
  ]

  return (
    <section className="bg-black py-28 px-8 md:px-16 border-t border-white/5 overflow-hidden">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <div className="overflow-hidden mb-3">
            <motion.p
              className="text-[10px] tracking-[0.4em] uppercase text-zinc-600"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              Distribución mayorista
            </motion.p>
          </div>
          <div className="overflow-hidden">
            <motion.h2
              className="font-display text-4xl md:text-5xl text-white font-light"
              initial={{ y: '105%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.85, ease: EASE_OUT }}
            >
              Sumá tu óptica
            </motion.h2>
          </div>
          <motion.p
            className="text-zinc-500 text-sm leading-relaxed mt-4 max-w-md"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Completá el formulario y uno de nuestros representantes se pone en contacto.
            Sin compromiso, sin costo de inscripción.
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-0"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#1A1A1A]">
            {fields.map(({ name, label, placeholder, required }) => (
              <div key={name} className="bg-black p-5 group focus-within:bg-[#0A0A0A] transition-colors">
                <label className="block text-[9px] tracking-[0.2em] uppercase text-zinc-600 group-focus-within:text-white transition-colors mb-2">
                  {label}{required && <span className="text-white/40 ml-1">*</span>}
                </label>
                <input
                  type={name === 'email' ? 'email' : 'text'}
                  name={name}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-white text-sm font-light placeholder:text-zinc-700 focus:outline-none border-b border-zinc-800 focus:border-white pb-1 transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-zinc-700 text-[10px] tracking-wide">
              * campos obligatorios
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="bg-white text-black text-[10px] tracking-[0.2em] uppercase px-10 py-3.5 hover:bg-zinc-100 transition-colors disabled:opacity-50 font-medium"
            >
              {submitting ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <Link
              href="/sumate"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Quiero ser representante BIANNI
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.form>
      </div>
    </section>
  )
}

// ─── Exclusive Access Section ──────────────────────────────────────────────────

function ExclusiveAccessSection({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <section className="bg-zinc-900 py-28 px-8 md:px-16 overflow-hidden">
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          className="text-[10px] tracking-[0.35em] uppercase text-zinc-500 mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Acceso exclusivo
        </motion.p>

        <div className="overflow-hidden mb-2">
          <motion.h2
            className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-light leading-tight"
            initial={{ y: '105%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
          >
            Solo para representantes
          </motion.h2>
        </div>
        <div className="overflow-hidden mb-8">
          <motion.h2
            className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-light leading-tight italic"
            initial={{ y: '105%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, delay: 0.12, ease: EASE_OUT }}
          >
            seleccionados.
          </motion.h2>
        </div>

        <motion.p
          className="text-zinc-400 text-sm tracking-wide leading-relaxed mb-10 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Potencia tu óptica con nuestra línea exclusiva de lentes Bianni.
          Accedé a precios mayoristas, catálogo completo y gestión de pedidos en tiempo real.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <button
            onClick={onLoginClick}
            className="btn-bianni-outline py-4 px-12 text-[11px]"
          >
            Ingresar a tu cuenta
          </button>
          <Link
            href="/sumate"
            className="text-white/60 hover:text-white text-[11px] tracking-[0.2em] uppercase py-4 px-6 transition-colors"
          >
            Quiero ser representante →
          </Link>
        </motion.div>

        <div className="flex items-center gap-6 mt-16 justify-center opacity-20">
          <div className="flex-1 max-w-24 h-px bg-white" />
          <p className="text-[9px] tracking-[0.3em] uppercase text-white">Bianni Eyewear</p>
          <div className="flex-1 max-w-24 h-px bg-white" />
        </div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <footer className="bg-black border-t border-white/10 py-16 px-8 md:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <Logo variant="full" className="h-11 mb-4" />
            <p className="text-zinc-600 text-[11px] italic tracking-wide">
              todo comienza con una mirada
            </p>
          </div>
          <nav className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-zinc-500 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Inicio
            </button>
            <button
              onClick={onLoginClick}
              className="text-zinc-500 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Catálogo
            </button>
            <a
              href="mailto:contacto@bianni.com"
              className="text-zinc-500 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Contacto
            </a>
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

// ─── Map CTA (links to /mapa) ──────────────────────────────────────────────────

function MapCtaSection() {
  return (
    <section className="bg-black py-24 px-8 md:px-16 lg:px-24 border-t border-zinc-900">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
      >
        <Link
          href="/mapa"
          className="group relative block border border-zinc-800 bg-zinc-950 overflow-hidden hover:border-white/30 transition-colors"
        >
          {/* Background — silueta del mapa de Argentina muy sutil */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.4)_0%,_transparent_60%)]" />

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-8 md:px-12 py-12 md:py-16">
            {/* Left — copy */}
            <div className="flex flex-col justify-center">
              <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500 mb-4">
                Mapa de ópticas
              </p>
              <h2 className="font-display text-3xl md:text-5xl text-white font-light leading-[1.05] tracking-[-0.01em] mb-5">
                Encontrá tu<br/>
                <span className="text-zinc-500">óptica BIANNI</span>
              </h2>
              <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-md mb-6">
                Buscá por ciudad, provincia, dirección o código postal.
                Te mostramos todas las ópticas oficiales BIANNI.
              </p>
              <div className="inline-flex items-center gap-3 text-white text-[11px] tracking-[0.25em] uppercase border border-white/40 group-hover:border-white group-hover:bg-white group-hover:text-black transition-all w-fit px-6 py-3">
                Ver mapa completo
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>

            {/* Right — visual placeholder */}
            <div className="relative aspect-square md:aspect-auto md:min-h-[280px] border border-zinc-800 bg-black/40 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.08)_0%,_transparent_60%)]" />
              {/* Pins decorativos */}
              <div className="relative w-full h-full">
                {[
                  { top: '20%', left: '38%', size: 'lg', label: 'BUENOS AIRES' },
                  { top: '32%', left: '32%', size: 'sm', label: 'CÓRDOBA' },
                  { top: '38%', left: '40%', size: 'sm', label: 'ROSARIO' },
                  { top: '48%', left: '20%', size: 'sm', label: 'MENDOZA' },
                  { top: '18%', left: '52%', size: 'sm', label: 'TUCUMÁN' },
                  { top: '68%', left: '24%', size: 'sm', label: 'BARILOCHE' },
                ].map((pin, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{ top: pin.top, left: pin.left }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className={`rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] ${
                        pin.size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'
                      }`} />
                      <div className={`absolute top-2 mt-0.5 rounded-full bg-white/30 animate-ping ${
                        pin.size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'
                      }`} />
                    </div>
                  </motion.div>
                ))}
                <p className="absolute bottom-4 right-4 text-[9px] tracking-[0.25em] uppercase text-zinc-600">
                  Argentina
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  )
}

// ─── Home Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState(ALL_CAT)
  const catalogRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { categories } = useDataStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(ROLE_REDIRECTS[user.role])
    }
  }, [isAuthenticated, user, router])

  function handleCategoryClick(name: string) {
    const cat = categories.find((c) => c.name === name)
    setSelectedCat(cat ? cat.id : ALL_CAT)
    setTimeout(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  if (isAuthenticated && user) return null

  return (
    <main className="bg-black min-h-screen">
      <PublicNav onLoginClick={() => setLoginOpen(true)} />

      {/* 1 — Hero slideshow (BATCH 1 del rediseño público) */}
      <HeroSlideshow />

      {/* 2 — Statement: "Conoce nuestra línea exclusiva" */}
      <StatementSection />

      {/* 3 — Carrusel de novedades (BATCH 2) — scroll infinito de productos novedad */}
      <NoveltyMarquee />

      {/* 4 — Editorial poster */}
      <EditorialSection />

      {/* 5 — Colecciones: HoverSlider de categorías dinámicas (BATCH 3) */}
      <CategoriesHoverSlider onSelectCategory={handleCategoryClick} />

      {/* 5 — Public catalog */}
      <PublicCatalogSection
        onLoginClick={() => setLoginOpen(true)}
        selectedCat={selectedCat}
        onCategoryChange={setSelectedCat}
        sectionRef={catalogRef}
      />

      {/* 6 — Why BIANNI (white section) */}
      <BenefitsSection />

      {/* 6.5 — CTA Mapa de ópticas (lleva a /mapa) */}
      <MapCtaSection />

      {/* 7 — Join form */}
      <JoinFormSection />

      {/* 8 — Exclusive access */}
      <ExclusiveAccessSection onLoginClick={() => setLoginOpen(true)} />

      {/* 9 — Footer */}
      <Footer onLoginClick={() => setLoginOpen(true)} />

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </main>
  )
}
