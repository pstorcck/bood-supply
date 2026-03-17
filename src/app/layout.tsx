import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bood Supply',
  description: 'Distribuidor de suministros para restaurantes en Chicago',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}