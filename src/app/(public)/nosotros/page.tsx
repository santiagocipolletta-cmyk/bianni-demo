import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

// ─── Simple Nav for inner pages ─────────────────────────────────────────────

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

// ─── Section A: Hero ────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="bg-black flex items-center min-h-[60vh] px-8 md:px-16 lg:px-24 py-24">
      <div className="max-w-4xl">
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-8">
          Nuestra Historia
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-semibold text-white leading-[0.95] tracking-tight">
          Pasión por la<br />
          <span className="italic font-light">óptica desde</span><br />
          el primer día.
        </h1>
      </div>
    </section>
  )
}

// ─── Section B: Declaración de marca ───────────────────────────────────────

function BrandStatement() {
  return (
    <section className="bg-black py-24 px-8 md:px-16">
      <div className="max-w-5xl mx-auto text-center">
        <p className="font-display italic text-3xl md:text-4xl text-white/90 leading-snug">
          Diseñamos lentes que transforman cómo el mundo<br className="hidden md:block" />
          ve la óptica profesional.
        </p>
        <div className="mt-16 h-px bg-white/10 max-w-xs mx-auto" />
      </div>
    </section>
  )
}

// ─── Section C: Tres valores ────────────────────────────────────────────────

const VALUES = [
  {
    number: '01',
    title: 'CALIDAD SIN\nCOMPROMISO',
    description:
      'Cada montura BIANNI pasa por controles de calidad exhaustivos antes de llegar a tu óptica.',
  },
  {
    number: '02',
    title: 'DISEÑO\nITALIANO',
    description:
      'Inspiración europea con producción de primer nivel. Líneas limpias, materiales premium.',
  },
  {
    number: '03',
    title: 'ALIADOS DE\nTU NEGOCIO',
    description:
      'No somos solo proveedores. Somos partners. Tu éxito es el nuestro.',
  },
]

function ValuesSection() {
  return (
    <section className="bg-zinc-950 py-24 px-8 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
        {VALUES.map((val) => (
          <div key={val.number} className="bg-zinc-950 p-10 md:p-14 relative overflow-hidden">
            {/* Large number watermark */}
            <span className="absolute top-6 right-8 font-display text-[7rem] font-light text-white/5 leading-none select-none">
              {val.number}
            </span>
            <p className="text-[10px] tracking-[0.3em] text-white/30 mb-6 font-mono">
              {val.number}
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-white whitespace-pre-line leading-tight mb-5">
              {val.title}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed tracking-wide">
              {val.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section D: Cifras ──────────────────────────────────────────────────────

const STATS = [
  { number: '200+', label: 'Modelos activos' },
  { number: '5', label: 'Colecciones anuales' },
  { number: '300+', label: 'Ópticas aliadas' },
  { number: '15', label: 'Años de trayectoria' },
]

function StatsSection() {
  return (
    <section className="bg-zinc-900 py-20 px-8 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-5xl md:text-6xl font-light text-white tracking-tight">
              {stat.number}
            </p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 mt-3">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section E: Equipo ──────────────────────────────────────────────────────

function TeamSection() {
  return (
    <section className="bg-black py-28 px-8 md:px-16">
      <div className="max-w-3xl">
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/30 mb-8">
          El equipo
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight mb-10">
          El equipo detrás de BIANNI
        </h2>
        <div className="space-y-5 text-white/55 text-sm md:text-base leading-relaxed tracking-wide">
          <p>
            Somos un equipo de profesionales apasionados por la moda y la óptica. Fundado en Buenos Aires, BIANNI nació de la convicción de que el mercado mayorista merecía algo mejor: diseños con identidad propia, atención personalizada y una plataforma a la altura del siglo XXI.
          </p>
          <p>
            Trabajamos codo a codo con ópticas de todo el país para entender sus necesidades reales. Cada colección es el resultado de meses de investigación, selección de materiales y pruebas de ajuste que garantizan la satisfacción del usuario final.
          </p>
          <p>
            Creemos que la relación con nuestros distribuidores es un vínculo a largo plazo, no una transacción. Por eso invertimos en herramientas digitales, capacitación y soporte continuo.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Section F: CTA ─────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="bg-black border-t border-white/10 py-28 px-8 md:px-16">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
          ¿Querés ser distribuidor?
        </h2>
        <p className="text-white/50 text-sm tracking-wide mb-10">
          Contactanos y sumá BIANNI a tu óptica.
        </p>
        <Link href="/contacto" className="btn-bianni-outline text-[11px] py-4 px-12 inline-block">
          Contactar
        </Link>
      </div>
    </section>
  )
}

// ─── Footer ─────────────────────────────────────────────────────────────────

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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NosotrosPage() {
  return (
    <main className="bg-black min-h-screen">
      <PageNav />
      <HeroSection />
      <BrandStatement />
      <ValuesSection />
      <StatsSection />
      <TeamSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
