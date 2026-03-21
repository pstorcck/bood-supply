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
    { name: 'Vasos Desechables', emoji: '🥤', desc: 'Vasos transparentes 8oz, 12oz, 16oz y 32oz' },
    { name: 'Platos Desechables', emoji: '🍽️', desc: 'Platos de carton y foam en diferentes tamanos' },
    { name: 'Cubiertos', emoji: '🍴', desc: 'Tenedores, cuchillos, cucharas y sets completos' },
    { name: 'Bolsas y Contenedores', emoji: '🛍️', desc: 'Bolsas de papel, plastico y contenedores con tapa' },
    { name: 'Servilletas', emoji: '🗒️', desc: 'Servilletas de papel blancas en paquetes grandes' },
    { name: 'Papel para Bano', emoji: '🧻', desc: 'Papel higienico y papel toalla para tu negocio' },
    { name: 'Papel', emoji: '📄', desc: 'Papel encerado y papel para envolver alimentos' },
    { name: 'Palillos', emoji: '🪥', desc: 'Palillos de dientes y palillos removedores' },
    { name: 'Grocery', emoji: '🛒', desc: 'Productos de abarrotes y alimentos no perecederos' },
    { name: 'Quimicos y Limpieza', emoji: '🧴', desc: 'Productos de limpieza e higiene para tu negocio' },
  ],
  en: [
    { name: 'Disposable Cups', emoji: '🥤', desc: 'Clear cups 8oz, 12oz, 16oz and 32oz' },
    { name: 'Disposable Plates', emoji: '🍽️', desc: 'Cardboard and foam plates in different sizes' },
    { name: 'Cutlery', emoji: '🍴', desc: 'Forks, knives, spoons and complete sets' },
    { name: 'Bags & Containers', emoji: '🛍️', desc: 'Paper bags, plastic bags and lidded containers' },
    { name: 'Napkins', emoji: '🗒️', desc: 'White paper napkins in large packages' },
    { name: 'Bathroom Paper', emoji: '🧻', desc: 'Toilet paper and paper towels for your business' },
    { name: 'Paper', emoji: '📄', desc: 'Wax paper and food wrapping paper' },
    { name: 'Toothpicks', emoji: '🪥', desc: 'Toothpicks and cocktail picks' },
    { name: 'Grocery', emoji: '🛒', desc: 'Grocery products and non-perishable foods' },
    { name: 'Chemicals & Cleaning', emoji: '🧴', desc: 'Cleaning and hygiene products for your business' },
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
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-8" style={{lineHeight:'1.4', overflow:'visible'}}>
            {t.hero_title}<br />
            <span className="text-brand-orange" style={{lineHeight:'1.6', display:'block', paddingBottom:'6px'}}>{t.hero_title_accent}</span>
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
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-blue-300 text-sm">
          {t.footer_rights}
        </div>
      </footer>
    </div>
  )
}