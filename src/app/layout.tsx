import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BOOD SUPPLY',
  description: 'Distribuidor de suministros para restaurantes en Chicago',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}