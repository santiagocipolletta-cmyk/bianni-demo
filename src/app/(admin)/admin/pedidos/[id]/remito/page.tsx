'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDataStore } from '@/stores/data-store'
import { formatARS } from '@/lib/utils'
import { ArrowLeft, Printer } from 'lucide-react'

export default function RemitoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const { getOrderWithDetails, products } = useDataStore()
  const order = getOrderWithDetails(id)

  // Cuando se imprime, oculta el header de print
  useEffect(() => {
    document.body.classList.add('remito-print-mode')
    return () => document.body.classList.remove('remito-print-mode')
  }, [])

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-black">Pedido no encontrado</div>
  }

  const fecha = new Date(order.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const fechaEmision = order.remitoGeneradoEn
    ? new Date(order.remitoGeneradoEn).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const remitoNum = order.codigo.replace(/^[A-Z]+-/, '')

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .remito-page { box-shadow: none !important; margin: 0 !important; max-width: none !important; padding: 1cm !important; }
          @page { size: A4; margin: 0; }
        }
        body.remito-print-mode { background: #f0f0f0; }
      `}</style>

      {/* Toolbar — no se imprime */}
      <div className="no-print sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[#2A2A2A] px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#A0A0A0] hover:text-white text-xs tracking-[0.15em] uppercase"
        >
          <ArrowLeft size={14} /> Volver al pedido
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white text-black text-xs tracking-[0.2em] uppercase px-5 py-2.5 hover:bg-zinc-200 transition-colors font-medium"
        >
          <Printer size={14} /> Imprimir remito
        </button>
      </div>

      {/* Remito */}
      <div className="bg-[#f0f0f0] min-h-screen py-8 px-4">
        <div className="remito-page max-w-[800px] mx-auto bg-white text-black p-12 shadow-xl" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-black">
            <div>
              <h1 className="text-3xl font-light tracking-[0.3em]" style={{ fontFamily: 'Georgia, serif' }}>BIAИNI</h1>
              <p className="text-[10px] tracking-[0.25em] uppercase text-gray-600 mt-1">Optical Eyewear</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.25em] uppercase text-gray-500">Remito</p>
              <p className="text-2xl font-light mt-1">N° {remitoNum.padStart(8, '0')}</p>
              <p className="text-[10px] text-gray-600 mt-1">Pedido {order.codigo}</p>
              <p className="text-[10px] text-gray-600">Emitido: {fechaEmision}</p>
            </div>
          </div>

          {/* Datos */}
          <div className="grid grid-cols-2 gap-8 py-6 border-b border-gray-300">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-2">Emisor</p>
              <p className="text-sm font-medium">BIANNI Eyewear S.R.L.</p>
              <p className="text-xs text-gray-700">CUIT 30-XXXXXXXX-X</p>
              <p className="text-xs text-gray-700">Dirección comercial BIANNI</p>
              <p className="text-xs text-gray-700">Buenos Aires, Argentina</p>
              <p className="text-xs text-gray-700 mt-1">contacto@bianni.com.ar</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-2">Destinatario</p>
              <p className="text-sm font-medium">{order.cliente?.nombre ?? '—'}</p>
              {order.cliente?.cuit && <p className="text-xs text-gray-700">CUIT {order.cliente.cuit}</p>}
              {order.direccionEnvio?.direccion && (
                <p className="text-xs text-gray-700">{order.direccionEnvio.direccion}</p>
              )}
              <p className="text-xs text-gray-700">
                {order.cliente?.ciudad}{order.cliente?.provincia ? `, ${order.cliente.provincia}` : ''}
              </p>
              {order.cliente?.telefono && <p className="text-xs text-gray-700 mt-1">Tel: {order.cliente.telefono}</p>}
            </div>
          </div>

          {/* Tipo entrega + plazo */}
          <div className="grid grid-cols-2 gap-8 py-4 border-b border-gray-300 text-xs">
            <div>
              <span className="text-gray-500 uppercase tracking-wider text-[10px]">Tipo entrega: </span>
              <span className="font-medium">
                {order.tipoEntrega === 'envio' ? 'Envío a domicilio' : 'Coordinada con vendedor'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 uppercase tracking-wider text-[10px]">Plazo de pago: </span>
              <span className="font-medium">{order.plazoPagoDias} días</span>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mt-6 text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 text-[10px] tracking-[0.15em] uppercase font-medium">Código</th>
                <th className="text-left py-2 text-[10px] tracking-[0.15em] uppercase font-medium">Descripción</th>
                <th className="text-right py-2 text-[10px] tracking-[0.15em] uppercase font-medium">Cant.</th>
                <th className="text-right py-2 text-[10px] tracking-[0.15em] uppercase font-medium">P. Unit</th>
                <th className="text-right py-2 text-[10px] tracking-[0.15em] uppercase font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => {
                const product = products.find((p) => p.id === item.productId)
                const subtotal = item.precioUnit * item.cantidad * (1 - item.descuentoAplicado / 100)
                return (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-3 font-mono text-xs">{product?.sku ?? '—'}</td>
                    <td className="py-3">{product?.name ?? 'Producto eliminado'}</td>
                    <td className="py-3 text-right">{item.cantidad}</td>
                    <td className="py-3 text-right">{formatARS(item.precioUnit)}</td>
                    <td className="py-3 text-right font-medium">{formatARS(subtotal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Totales */}
          <div className="mt-6 ml-auto w-72 space-y-1 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatARS(order.total / (1 - (order.cuponDescuentoPct ?? 0) / 100))}</span>
            </div>
            {order.cuponDescuentoPct && order.cuponDescuentoPct > 0 && (
              <div className="flex justify-between py-1 text-gray-600">
                <span>Cupón {order.cuponCodigo} ({order.cuponDescuentoPct}%)</span>
                <span>− {formatARS(order.total * (order.cuponDescuentoPct / (100 - order.cuponDescuentoPct)))}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t-2 border-black font-medium text-lg">
              <span>Total</span>
              <span>{formatARS(order.total)}</span>
            </div>
            <p className="text-[10px] text-gray-500 pt-1 italic">Precios sin IVA. El IVA se discrimina en la factura.</p>
          </div>

          {/* Observaciones */}
          {order.observaciones && (
            <div className="mt-8 pt-4 border-t border-gray-300">
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-1">Observaciones</p>
              <p className="text-xs italic">{order.observaciones}</p>
            </div>
          )}

          {/* Footer firmas */}
          <div className="grid grid-cols-2 gap-12 mt-16 pt-4">
            <div className="text-center border-t border-gray-400 pt-2">
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-600">Firma y aclaración — Emisor</p>
            </div>
            <div className="text-center border-t border-gray-400 pt-2">
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-600">Recibí conforme — Destinatario</p>
            </div>
          </div>

          {/* Pie */}
          <div className="mt-12 text-center text-[9px] text-gray-400 tracking-wider">
            Documento generado por el sistema BIANNI · Fecha de pedido: {fecha}
          </div>
        </div>
      </div>
    </>
  )
}
