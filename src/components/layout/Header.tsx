'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/sobre-nosotros', label: t('about') },
    { href: '/productos', label: t('products') },
    { href: '/contacto', label: t('contact') },
  ]

  const switchLocale = (newLocale: string) => {
    const stripped = pathname.replace(/^\/(en|es)/, '') || '/'
    router.push(newLocale === 'en' ? `/en${stripped}` : stripped)
    setLangOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-navy rounded-lg flex items-center justify-center">
              <span className="font-heading font-bold text-white text-sm">BS</span>
            </div>
            <span className="font-heading font-bold text-brand-navy text-xl tracking-tight">
              BOOD <span className="text-brand-orange">SUPPLY</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg font-body font-medium text-brand-gray-dark hover:text-brand-orange hover:bg-orange-50 transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-brand-gray-mid hover:text-brand-navy hover:bg-gray-50 transition-all duration-150 text-sm font-medium"
              >
                <Globe size={15} />
                <span className="uppercase">{locale}</span>
                <ChevronDown size={13} className={langOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white rounded-card shadow-card border border-gray-100 py-1">
                  {['es', 'en'].map((l) => (
                    <button
                      key={l}
                      onClick={() => switchLocale(l)}
                      className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${l === locale ? 'text-brand-orange bg-orange-50' : 'text-brand-gray-dark hover:bg-gray-50'}`}
                    >
                      {l === 'es' ? '🇲🇽 Español' : '🇺🇸 English'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/login" className="btn-secondary !py-2 !px-4 text-sm">
              {t('login')}
            </Link>
            <Link href="/registro" className="btn-primary !py-2 !px-4 text-sm">
              {t('becomeClient')}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-brand-gray-dark hover:bg-gray-50"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg font-medium text-brand-gray-dark hover:text-brand-orange hover:bg-orange-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex gap-2 border-t border-gray-100 mt-3">
            <Link href="/login" className="btn-secondary flex-1 text-center text-sm !py-2">{t('login')}</Link>
            <Link href="/registro" className="btn-primary flex-1 text-center text-sm !py-2">{t('becomeClient')}</Link>
          </div>
          <div className="flex gap-2 pt-2">
            {['es', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${l === locale ? 'border-brand-orange text-brand-orange bg-orange-50' : 'border-gray-200 text-brand-gray-mid'}`}
              >
                {l === 'es' ? 'ES' : 'EN'}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}