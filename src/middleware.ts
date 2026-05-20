import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication (cookie check only — role guard in client)
const PROTECTED_PREFIXES = [
  '/catalogo',
  '/pedidos',
  '/cuenta',
  '/reclamos',
  '/contenido',
  '/dashboard',
  '/clientes',
  '/pedido-nuevo',
  '/codigos',
  '/preventas',
  '/completar-datos',
  '/admin',
  '/marketing',
  '/vendedor',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (!isProtected) return NextResponse.next()

  const authCookie = request.cookies.get('bianni-auth')
  if (!authCookie || authCookie.value !== 'true') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/catalogo/:path*',
    '/pedidos/:path*',
    '/cuenta/:path*',
    '/reclamos/:path*',
    '/contenido/:path*',
    '/dashboard/:path*',
    '/clientes/:path*',
    '/pedido-nuevo/:path*',
    '/codigos/:path*',
    '/preventas/:path*',
    '/completar-datos/:path*',
    '/admin/:path*',
    '/marketing/:path*',
    '/vendedor/:path*',
  ],
}
