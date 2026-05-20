'use client'

import { MessageCircle, ShieldCheck, Headphones } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { getWhatsAppUrl } from '@/lib/utils'

export default function DistribuidorReclamosPage() {
  const { user } = useAuthStore()
  const { clients, sellers } = useDataStore()

  const client = clients.find((c) => c.id === user?.clientId)
  const seller = client ? sellers.find((s) => s.id === client.sellerId) : null

  const sellerWaUrl = seller
    ? getWhatsAppUrl(
        seller.telefono,
        `Hola ${seller.nombre}, soy ${client?.nombre}. Necesito hacer un reclamo sobre un producto.`
      )
    : null

  return (
    <div className="min-h-full bg-[#000] p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl lg:text-4xl text-white tracking-[0.1em] uppercase mb-2">
            Garantía & Reclamos
          </h1>
          <p className="text-[#A0A0A0] text-sm font-light leading-relaxed">
            Todos los productos BIANNI están cubiertos por nuestra garantía.
          </p>
        </div>

        {/* Hero card */}
        <div className="relative overflow-hidden border border-[#2A2A2A] p-10 md:p-14 mb-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl" />
          <ShieldCheck size={42} strokeWidth={1.2} className="text-emerald-400 mb-6 relative z-10" />
          <h2 className="font-display text-2xl md:text-3xl text-white font-light mb-4 relative z-10">
            Cobertura total
          </h2>
          <p className="text-[#A0A0A0] text-sm leading-relaxed mb-8 max-w-md relative z-10">
            Si recibís algún producto con desperfecto, falla de fábrica o problemas estéticos,
            contactá a tu vendedor asignado. Él se encarga de gestionar tu reclamo con BIANNI
            y de coordinar el reemplazo o bonificación correspondiente.
          </p>

          {seller && sellerWaUrl ? (
            <a
              href={sellerWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-black px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-[#1ebe5a] transition-colors relative z-10"
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              Contactar a {seller.nombre}
            </a>
          ) : (
            <p className="text-[#555] text-xs">No tenés vendedor asignado todavía.</p>
          )}
        </div>

        {/* Process steps */}
        <div className="space-y-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#555] mb-4">
            Cómo funciona
          </p>
          {[
            { n: '01', title: 'Contactá a tu vendedor', text: 'Mandá un mensaje a tu vendedor con la descripción del problema y fotos del producto.' },
            { n: '02', title: 'Tu vendedor carga el reclamo', text: 'Él registra el reclamo en el sistema y lo deriva a la fábrica si corresponde.' },
            { n: '03', title: 'Resolución', text: 'Una vez confirmado, BIANNI bonifica el producto en tu próximo pedido o coordina la reposición.' },
          ].map((s) => (
            <div key={s.n} className="flex gap-5 border-b border-[#1A1A1A] pb-5 last:border-0">
              <span className="font-display text-2xl text-[#555] font-light flex-shrink-0">{s.n}</span>
              <div>
                <h3 className="text-white text-sm font-medium tracking-wide mb-1">{s.title}</h3>
                <p className="text-[#A0A0A0] text-xs leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[#1A1A1A] pt-6">
          <div className="flex items-start gap-3 text-[#666]">
            <Headphones size={14} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              También podés contactar directamente al equipo BIANNI escribiendo a{' '}
              <a href="mailto:contacto@bianni.com" className="text-[#A0A0A0] hover:text-white underline underline-offset-2">
                contacto@bianni.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
