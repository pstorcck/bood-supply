"use client"
import Link from 'next/link'
import { ArrowRight, CheckCircle2, DollarSign, ShieldCheck, HeadphonesIcon, Truck, MapPin, Phone, Mail } from 'lucide-react'

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-screen flex items-center bg-brand-navy overflow-hidden pt-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white leading-none mb-4">
                Productos para tu restaurante<br />
                <span className="text-brand-orange">al mejor precio</span>
              </h1>
              <p className="font-body text-blue-200 text-lg leading-relaxed mb-10 max-w-xl">
                Distribuimos productos de calidad para restaurantes en Chicago.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/registro" className="btn-primary flex items-center justify-center gap-2 text-base">
                  Hazte Cliente <ArrowRight size={18} />
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 mt-10">
                {['Precio justo garantizado', 'Entrega puntual', 'Atencion personalizada'].map((item) => (
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
                <div className="text-blue-200 text-sm">Anos de experiencia</div>
              </div>
              <div className="col-span-2 card bg-white text-center">
                <Link href="/registro" className="btn-primary w-full text-center block text-sm">
                  Crea tu cuenta gratis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Por que elegirnos?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: DollarSign, title: 'Precio Justo', desc: 'Precios competitivos sin sacrificar calidad.', color: 'text-brand-orange bg-orange-50' },
              { icon: ShieldCheck, title: 'Calidad', desc: 'Productos con los mas altos estandares.', color: 'text-brand-blue bg-blue-50' },
              { icon: HeadphonesIcon, title: 'Soporte', desc: 'Disponibles cuando nos necesites.', color: 'text-brand-orange bg-orange-50' },
              { icon: Truck, title: 'Entrega Rapida', desc: 'Entregas puntuales a tu restaurante.', color: 'text-brand-blue bg-blue-50' },
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
      <footer className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <span className="font-heading font-bold text-2xl">BOOD <span className="text-brand-orange">SUPPLY</span></span>
              <p className="text-blue-200 mt-4 text-sm">Distribuidora para restaurantes en Chicago.</p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Navegacion</h4>
              <ul className="space-y-2">
                <li><Link href="/registro" className="text-blue-200 hover:text-brand-orange text-sm">Hazte Cliente</Link></li>
                <li><Link href="/login" className="text-blue-200 hover:text-brand-orange text-sm">Iniciar Sesion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-blue-200 text-sm"><MapPin size={15} className="text-brand-orange mt-0.5 shrink-0" />2900 N Richmond St, Chicago, IL 60618</li>
                <li className="flex items-center gap-2.5 text-blue-200 text-sm"><Phone size={15} className="text-brand-orange shrink-0" />+1 (312) 409-0106</li>
                <li className="flex items-center gap-2.5 text-blue-200 text-sm"><Mail size={15} className="text-brand-orange shrink-0" />boodsupplies@gmail.com</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
