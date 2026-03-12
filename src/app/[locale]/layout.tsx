import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'BOOD SUPPLY — Distribuidora para Restaurantes en Chicago',
  description: 'Distribuimos productos de calidad para restaurantes.',
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}