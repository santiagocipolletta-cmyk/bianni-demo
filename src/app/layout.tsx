import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { Toaster } from "sonner"

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "BIANNI Eyewear — Portal Mayorista",
  description: "Portal B2B mayorista para distribuidores de BIANNI Eyewear",
  icons: {
    icon: "/brand/logo-white.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es-AR"
      className={`${cormorant.variable} ${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <QueryProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#111111",
                border: "1px solid #2A2A2A",
                color: "#FFFFFF",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
