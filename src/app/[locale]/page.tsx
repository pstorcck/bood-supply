"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const TEXTS = {
  es: {
    nav_productos: 'Productos',
    nav_areas: 'Areas',
    nav_contacto: 'Contacto',
    nav_login: 'Iniciar Sesion',
    nav_registro: 'Crear Cuenta',
    hero_badge: 'Distribuidor de Suministros en Chicago',
    hero_title: 'Los suministros que necesitas',
    hero_title_accent: 'en un solo lugar',
    hero_subtitle: 'Vasos, platos, cubiertos, bolsas y mas — entregados directo a tu restaurante en Chicago y area metropolitana.',
    hero_cta1: 'Crear Cuenta Gratis',
    hero_cta2: 'Ver Productos',
    stat1_value: 'Gran variedad',
    stat1_label: 'de productos disponibles',
    stat2_label: 'Anos en servicio al cliente y ventas',
    stat3_label: 'Clientes satisfechos',
    stat4_label: 'Entrega rapida garantizada',
    products_title: 'Nuestros Productos',
    products_subtitle: 'Suministros de calidad para restaurantes, cafeterias y negocios de food service',
    products_cta: 'Ver Precios y Hacer Pedido',
    areas_title: 'Areas de Servicio',
    areas_subtitle: 'Entregamos en Chicago y toda el area metropolitana',
    areas_subtitle2: 'Chicago y Suburbios',
    how_title: 'Como funciona?',
    step1_title: 'Crea tu cuenta',
    step1_desc: 'Registro gratis en menos de 1 minuto',
    step2_title: 'Haz tu pedido',
    step2_desc: 'Elige productos y cantidades desde tu catalogo',
    step3_title: 'Recibe en tu negocio',
    step3_desc: 'Entregamos directo a tu puerta en 48 horas',
    cta_title: 'Listo para ordenar?',
    cta_subtitle: 'Crea tu cuenta gratis y accede a nuestro catalogo completo con precios especiales',
    cta_btn: 'Empezar Ahora',
    footer_desc: 'Distribuidor de suministros para restaurantes en Chicago y area metropolitana.',
    footer_products: 'Productos',
    footer_contact: 'Contacto',
    footer_rights: '2025 Bood Supply. Todos los derechos reservados.',
  },
  en: {
    nav_productos: 'Products',
    nav_areas: 'Areas',
    nav_contacto: 'Contact',
    nav_login: 'Sign In',
    nav_registro: 'Create Account',
    hero_badge: 'Supply Distributor in Chicago',
    hero_title: 'The supplies you need',
    hero_title_accent: 'all in one place',
    hero_subtitle: 'Cups, plates, cutlery, bags and more — delivered directly to your restaurant in Chicago and the metropolitan area.',
    hero_cta1: 'Create Free Account',
    hero_cta2: 'View Products',
    stat1_value: 'Wide variety',
    stat1_label: 'of products available',
    stat2_label: 'Years of customer service and sales',
    stat3_label: 'Satisfied customers',
    stat4_label: 'Fast guaranteed delivery',
    products_title: 'Our Products',
    products_subtitle: 'Quality supplies for restaurants, cafeterias and food service businesses',
    products_cta: 'View Prices and Place Order',
    areas_title: 'Service Areas',
    areas_subtitle: 'We deliver in Chicago and the entire metropolitan area',
    areas_subtitle2: 'Chicago and Suburbs',
    how_title: 'How does it work?',
    step1_title: 'Create your account',
    step1_desc: 'Free registration in less than 1 minute',
    step2_title: 'Place your order',
    step2_desc: 'Choose products and quantities from your catalog',
    step3_title: 'Receive at your business',
    step3_desc: 'We deliver directly to your door in 48 hours',
    cta_title: 'Ready to order?',
    cta_subtitle: 'Create your free account and access our complete catalog with special prices',
    cta_btn: 'Get Started Now',
    footer_desc: 'Restaurant supply distributor in Chicago and the metropolitan area.',
    footer_products: 'Products',
    footer_contact: 'Contact',
    footer_rights: '2025 Bood Supply. All rights reserved.',
  }
}

const PRODUCTS = {
  es: [
    { name: 'Foam Containers, Cups and Lids', emoji: '🥤', desc: 'Vasos, platos y tapas foam para llevar' },
    { name: 'Bolsas, Cubiertos y papel', emoji: '🛍️', desc: 'Bolsas, cubiertos y papel para tu negocio' },
    { name: 'Aluminio', emoji: '🍽️', desc: 'Charolas y papel aluminio para cocina' },
    { name: 'Especies para cocina', emoji: '🌶️', desc: 'Especias y condimentos a granel' },
    { name: 'Quimicos y Limpieza', emoji: '🧴', desc: 'Productos de limpieza e higiene para tu negocio' },
    { name: 'Guantes', emoji: '🧤', desc: 'Guantes desechables para manejo de alimentos' },
  ],
  en: [
    { name: 'Foam Containers, Cups and Lids', emoji: '🥤', desc: 'Cups, plates and foam lids to go' },
    { name: 'Bags, Cutlery and Paper', emoji: '🛍️', desc: 'Bags, cutlery and paper for your business' },
    { name: 'Aluminum', emoji: '🍽️', desc: 'Aluminum trays and foil for cooking' },
    { name: 'Cooking Spices', emoji: '🌶️', desc: 'Spices and condiments in bulk' },
    { name: 'Chemicals & Cleaning', emoji: '🧴', desc: 'Cleaning and hygiene products for your business' },
    { name: 'Gloves', emoji: '🧤', desc: 'Disposable gloves for food handling' },
  ]
}

const AREAS = ['Chicago', 'Cicero', 'Berwyn', 'Oak Park', 'Evanston', 'Skokie', 'Schaumburg', 'Naperville', 'Aurora', 'Joliet', 'Waukegan', 'Elgin', 'Arlington Heights', 'Bolingbrook']

const FOOTER_PRODUCTS = {
  es: ['Vasos Desechables', 'Platos Desechables', 'Cubiertos', 'Bolsas y Contenedores', 'Servilletas', 'Grocery', 'Quimicos y Limpieza'],
  en: ['Disposable Cups', 'Disposable Plates', 'Cutlery', 'Bags & Containers', 'Napkins', 'Grocery', 'Chemicals & Cleaning'],
}

export default function HomePage() {
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const t = TEXTS[lang]
  const products = PRODUCTS[lang]
  const footerProducts = FOOTER_PRODUCTS[lang]

  return (
    <div className="min-h-screen bg-white font-body">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Bood Supply" width={40} height={40} className="rounded-lg" />
            <span className="font-heading font-bold text-xl text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-gray-dark">
            <a href="#productos" className="hover:text-brand-orange transition-colors">{t.nav_productos}</a>
            <a href="#areas" className="hover:text-brand-orange transition-colors">{t.nav_areas}</a>
            <a href="#contacto" className="hover:text-brand-orange transition-colors">{t.nav_contacto}</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:border-brand-orange transition-colors text-brand-gray-dark">
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <Link href="/es/login" className="text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors">{t.nav_login}</Link>
            <Link href="/es/registro" className="btn-primary text-sm !py-2 !px-4">{t.nav_registro}</Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-brand-orange/20 border border-brand-orange/30 text-brand-orange-light px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            {t.hero_badge}
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-8" style={{ lineHeight: 'normal', overflow: 'visible' }}>
            {t.hero_title}<br />
            <span className="text-brand-orange" style={{ lineHeight: '1.8', display: 'block', paddingBottom: '20px' }}>{t.hero_title_accent}</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">{t.hero_subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/es/registro" className="bg-brand-orange hover:bg-brand-orange-light text-white font-heading font-bold px-8 py-4 rounded-button text-lg transition-all hover:shadow-lg">
              {t.hero_cta1}
            </Link>
            <a href="#productos" className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold px-8 py-4 rounded-button text-lg transition-all border border-white/20">
              {t.hero_cta2}
            </a>
          </div>
        </div>
      </section>

      <section className="bg-brand-gray-light py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: t.stat1_value, label: t.stat1_label },
            { value: '5+', label: t.stat2_label },
            { value: '98%', label: t.stat3_label },
            { value: '48h', label: t.stat4_label },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="font-heading text-3xl font-bold text-brand-navy">{value}</div>
              <div className="text-sm text-brand-gray-mid mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="productos" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-brand-navy mb-3">{t.products_title}</h2>
            <p className="text-brand-gray-mid text-lg max-w-xl mx-auto">{t.products_subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.map(({ name, emoji, desc }) => (
              <div key={name} className="card hover:shadow-lg hover:-translate-y-1 transition-all cursor-default group">
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="font-heading font-bold text-brand-navy text-base mb-1 group-hover:text-brand-orange transition-colors">{name}</h3>
                <p className="text-brand-gray-mid text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/es/registro" className="btn-primary text-base px-8 py-3 inline-block">
              {t.products_cta}
            </Link>
          </div>
        </div>
      </section>

      <section id="areas" className="bg-brand-gray-light py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-brand-navy mb-3">{t.areas_title}</h2>
            <p className="text-brand-gray-mid text-lg">{t.areas_subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h3 className="font-heading font-bold text-brand-navy text-lg mb-4">{t.areas_subtitle2}</h3>
              <div className="flex flex-wrap gap-2">
                {AREAS.map(area => (
                  <span key={area} className="bg-white border border-gray-200 text-brand-navy text-sm font-medium px-4 py-2 rounded-full shadow-sm">{area}</span>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-heading font-bold text-brand-navy text-xl mb-4">{t.how_title}</h3>
              <div className="space-y-4">
                {[
                  { num: '1', title: t.step1_title, desc: t.step1_desc },
                  { num: '2', title: t.step2_title, desc: t.step2_desc },
                  { num: '3', title: t.step3_title, desc: t.step3_desc },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-brand-orange text-white rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">{num}</div>
                    <div>
                      <p className="font-semibold text-brand-navy">{title}</p>
                      <p className="text-brand-gray-mid text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-orange py-16 px-6 text-white text-center">
        <h2 className="font-heading text-4xl font-bold mb-4">{t.cta_title}</h2>
        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">{t.cta_subtitle}</p>
        <Link href="/es/registro" className="bg-white text-brand-orange font-heading font-bold px-10 py-4 rounded-button text-lg hover:shadow-lg transition-all inline-block">
          {t.cta_btn}
        </Link>
      </section>

      <footer id="contacto" className="bg-brand-navy text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="Bood Supply" width={36} height={36} className="rounded-lg" />
              <span className="font-heading font-bold text-lg">BOOD SUPPLY</span>
            </div>
            <p className="text-blue-200 text-sm">{t.footer_desc}</p>
          </div>
          <div>
            <h4 className="font-heading font-bold mb-4">{t.footer_products}</h4>
            <ul className="space-y-1 text-blue-200 text-sm">
              {footerProducts.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-bold mb-4">{t.footer_contact}</h4>
            <div className="space-y-2 text-blue-200 text-sm">
              <p>2900 N Richmond St, Chicago, IL 60618</p>
              <p>+1 (312) 409-0106</p>
              <p>boodsupplies@gmail.com</p>
            </div>
            <div className="flex gap-4 mt-5">
              <a href="https://www.instagram.com/boodsupplies/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 transition-opacity shadow-md" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61582953226409" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1877F2] hover:opacity-90 transition-opacity shadow-md" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-blue-300 text-sm">
          {t.footer_rights}
        </div>
      </footer>
    </div>
  )
}