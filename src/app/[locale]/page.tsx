'use client'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, DollarSign, ShieldCheck, HeadphonesIcon, Truck, MapPin, Phone, Mail } from 'lucide-react'

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-brand-navy overflow-hidden pt-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge-orange mb-6 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mr-2 inline-block" />
                Distribuidor #1 para restaurantes en Chicago
              </div>
              <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white leading-none mb-4">
                Productos para tu restaurante<br />
                <span className="text-brand-orange">al mejor precio</span>
              </h1>
              <p className="font-body text-blue-200 text-lg leading-relaxed mb-10 max-w-xl">
                Distribuimos productos de calidad para restaurantes en Chicago. Precio justo, entrega puntual y atención personalizada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/registro" className="btn-primary flex items-center justify-center gap-2 text-base">
                  Hazte Cliente <ArrowRight size={18} />
                </Link>
                <Link href="/productos" className="btn-ghost flex items-center justify-center gap-2 text-base">
                  Ver Productos
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 mt-10">
                {['Precio justo garantizado', 'Entrega puntual', 'Atención personalizada'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-blue-200 text-sm">
                    <CheckCircle2 size={15} className="text-brand-orange" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-white/5 border-white/10 text-center">
                <div className="text-4xl font-heading font-bold text-brand-orange mb-1">200+</div>
                <div className="text-blue-200 text-sm">Productos disponibles</div>
              </div>
              <div className="card bg-white/5 border-white/10 text-center">
                <div className="text-4xl font-heading font-bold text-brand-orange mb-1">5+</div>
                <div className="text-blue-200 text-sm">Años de experiencia</div>
              </div>
              <div className="col-span-2 card bg-brand-orange/10 border-brand-orange/20 text-center">
                <div className="text-5xl font-heading font-bold text-brand-orange mb-1">98%</div>
                <div className="text-blue-200 text-sm">Clientes satisfechos</div>
              </div>
              <div className="col-span-2 card bg-white text-center">
                <p className="font-body text-brand-gray-dark font-medium mb-3">¿Listo para trabajar juntos?</p>
                <Link href="/registro" className="btn-primary w-full text-center block text-sm !py-2.5">
                  Crea tu cuenta gratis →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">¿Por qué elegirnos?</h2>
            <p className="section-subtitle mx-auto">Todo lo que tu restaurante necesita en un solo lugar</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: DollarSign, title: 'Precio Justo', desc: 'Precios competitivos sin sacrificar calidad.', color: 'text-brand-orange bg-orange-50' },
              { icon: ShieldCheck, title: 'Calidad Garantizada', desc: 'Productos seleccionados con los más altos estándares.', color: 'text-brand-blue bg-blue-50' },
              { icon: HeadphonesIcon, title: 'Soporte 24/7', desc: 'Estamos disponibles cuando nos necesites.', color: 'text-brand-orange bg-orange-50' },
              { icon: Truck, title: 'Entrega Rápida', desc: 'Entregas puntuales directo a tu restaurante.', color: 'text-brand-blue bg-blue-50' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-hover text-center">
                <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mx-auto mb-5`}>
                  <Icon size={26} />
                </div>
                <h3 className="font-heading font-bold text-brand-navy text-xl mb-3">{title}</h3>
                <p className="font-body text-brand-gray-mid text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-navy">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl font-bold text-white mb-4">
            ¿Tu restaurante necesita un proveedor confiable?
          </h2>
          <p className="text-blue-200 text-lg mb-10">
            Únete a los restaurantes que ya confían en BOOD SUPPLY.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro" className="btn-primary text-base">Hazte Cliente Hoy</Link>
            <Link href="/contacto" className="btn-ghost text-base">Contáctanos</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-brand-orange rounded-lg flex items-center justify-center">
                  <span className="font-heading font-bold text-white text-sm">BS</span>
                </div>
                <span className="font-heading font-bold text-2xl">BOOD <span className="text-brand-orange">SUPPLY</span></span>
              </div>
              <p className="text-blue-200 leading-relaxed max-w-sm text-sm">
                Distribuidora para restaurantes en Chicago.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Navegación</h4>
              <ul className="space-y-2">
                {[['/', 'Inicio'], ['/registro', 'Hazte Cliente'], ['/login', 'Iniciar Sesión']].map(([href, label
