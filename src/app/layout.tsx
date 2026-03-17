import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import '../globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'BOOD SUPPLY — Distribuidora para Restaurantes en Chicago',
  description: 'Distribuimos productos de calidad para restaurantes.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className={`${syne.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  )
}