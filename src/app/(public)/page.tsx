'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'motion/react'
import { Lock, Award, ShieldCheck, Star, Truck, ShoppingBag, Headphones } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/brand/Logo'
import { LoginModal } from '@/components/auth/LoginModal'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const ROLE_REDIRECTS: Record<UserRole, string> = {
  distribuidor: '/catalogo',
  vendedor: '/dashboard',
  admin: '/admin/pedidos',
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
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 md:px-12 py-6 transition-all duration-500 ${
        scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <Logo variant="wordmark" className="h-7" />
      <button
        onClick={onLoginClick}
        className="btn-bianni-outline text-[10px] hidden sm:block"
      >
        Ingresar a tu cuenta
      </button>
      <button
        onClick={onLoginClick}
        className="sm:hidden text-white text-[10px] tracking-[0.2em] uppercase border border-white/50 px-4 py-2 hover:bg-white hover:text-black transition-colors"
      >
        Ingresar
      </button>
    </nav>
  )
}

// ─── Hero Section ──────────────────────────────────────────────────────────────

function HeroSection({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <Image
        src="/brand/models/model-hero.jpg"
        alt="BIANNI Eyewear editorial"
        fill
        priority
        className="object-cover object-top"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

      <div className="relative z-10 px-8 md:px-16 lg:px-24 max-w-4xl">
        <motion.p
          className="text-[10px] tracking-[0.35em] uppercase text-white/60 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          BIANNI Eyewear
        </motion.p>
        <motion.h1
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-semibold text-white leading-[0.9] uppercase tracking-tight mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          Todo comienza<br />
          con una<br />
          <span className="italic font-light">mirada.</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <button onClick={onLoginClick} className="btn-bianni-outline text-[11px] py-4 px-10">
            Ver catálogo
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-white text-[9px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-white animate-scroll-bounce" />
      </div>
    </section>
  )
}

// ─── Statement Section ─────────────────────────────────────────────────────────

function StatementSection() {
  return (
    <section className="relative bg-black overflow-hidden py-20 md:py-28 lg:py-36 px-8 md:px-16 lg:px-24">

      {/* Vertical rule left */}
      <motion.div
        className="absolute left-8 md:left-16 lg:left-24 top-20 bottom-20 w-px bg-zinc-800"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        style={{ originY: 0 }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
      />

      <div className="pl-6 md:pl-8">

        {/* Overline */}
        <motion.div
          className="flex items-center gap-4 mb-10 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <div className="w-8 h-px bg-white/20" />
          <p className="text-[9px] tracking-[0.45em] uppercase text-zinc-500">
            DISEÑO · IDENTIDAD · EXCLUSIVIDAD
          </p>
        </motion.div>

        {/* Main statement — big, line by line */}
        <div className="mb-10 space-y-1">
          {[
            { text: 'La marca de lentes que', dim: true },
            { text: 'potencia tu óptica.', dim: false },
          ].map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.h2
                className={`font-display font-light leading-[1.0] tracking-[-0.01em] ${
                  line.dim
                    ? 'text-zinc-500 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl'
                    : 'text-white  text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl'
                }`}
                initial={{ y: '110%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.9, delay: i * 0.13, ease: EASE_OUT }}
              >
                {line.text}
              </motion.h2>
            </div>
          ))}
        </div>

        {/* Separator */}
        <motion.div
          className="w-full h-px bg-zinc-800 mb-10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          style={{ originX: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: EASE_OUT }}
        />

        {/* Three pillars */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-zinc-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.45, ease: EASE_OUT }}
        >
          {[
            { label: 'CERTIFICACIÓN', value: 'Europea' },
            { label: 'PEDIDO MÍNIMO', value: 'Sin límite' },
            { label: 'ENVÍOS', value: 'Todo el país' },
          ].map(({ label, value }) => (
            <div key={label} className="sm:px-8 first:pl-0 last:pr-0">
              <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-1.5">{label}</p>
              <p className="font-display text-xl md:text-2xl text-white font-light">{value}</p>
            </div>
          ))}
        </motion.div>

      </div>
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

// ─── Categories Section ────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    name: 'CLIP-ON',
    description: 'Versatilidad sin compromiso',
    bg: 'bg-zinc-800',
    textColor: 'text-white',
    borderColor: 'border-zinc-600',
    image: '/brand/models/model-editorial.jpg',
  },
  {
    name: 'RECETA',
    description: 'Precisión óptica, diseño puro',
    bg: 'bg-zinc-700',
    textColor: 'text-white',
    borderColor: 'border-zinc-500',
    image: '/brand/models/model-receta.jpg',
  },
  {
    name: 'SOL',
    description: 'Editoriales de carácter',
    bg: 'bg-zinc-900',
    textColor: 'text-white',
    borderColor: 'border-zinc-700',
    image: '/brand/models/model-sol.jpg',
  },
]

function CategoriesSection({ onCategoryClick }: { onCategoryClick: (name: string) => void }) {
  return (
    <section className="bg-black py-px">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.name}
            onClick={() => onCategoryClick(cat.name)}
            className={`group relative overflow-hidden h-64 md:h-72 text-left ${cat.bg} transition-all duration-500 hover:brightness-110`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover object-center opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-700"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div>
                <p className={`text-[9px] tracking-[0.3em] uppercase mb-2 ${cat.textColor} opacity-60`}>
                  Colección
                </p>
                <h3 className={`font-display text-4xl font-semibold tracking-tight uppercase ${cat.textColor}`}>
                  {cat.name}
                </h3>
                <p className={`text-xs tracking-wide mt-1 ${cat.textColor} opacity-60`}>
                  {cat.description}
                </p>
              </div>
              <div
                className={`mt-4 flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-medium ${cat.textColor} opacity-0 group-hover:opacity-70 translate-y-2 group-hover:translate-y-0 transition-all duration-300`}
              >
                Ver colección
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                  <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
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

  const activeProducts = products.filter((p) => p.active)
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
      email: form.email,
      telefono: form.telefono,
      mensaje: `Óptica: ${form.optica}. Ciudad: ${form.ciudad}`,
      estado: 'nuevo',
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

          <div className="mt-8 flex items-center justify-between">
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

        <motion.button
          onClick={onLoginClick}
          className="btn-bianni-outline py-4 px-12 text-[11px]"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          Ingresar a tu cuenta
        </motion.button>

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

      {/* 1 — Hero */}
      <HeroSection onLoginClick={() => setLoginOpen(true)} />

      {/* 2 — Statement: "Conoce nuestra línea exclusiva" */}
      <StatementSection />

      {/* 3 — Editorial poster */}
      <EditorialSection />

      {/* 4 — Categories: CLIP-ON / RECETA / SOL */}
      <CategoriesSection onCategoryClick={handleCategoryClick} />

      {/* 5 — Public catalog */}
      <PublicCatalogSection
        onLoginClick={() => setLoginOpen(true)}
        selectedCat={selectedCat}
        onCategoryChange={setSelectedCat}
        sectionRef={catalogRef}
      />

      {/* 6 — Why BIANNI (white section) */}
      <BenefitsSection />

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
