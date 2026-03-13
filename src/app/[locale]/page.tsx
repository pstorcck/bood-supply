"use client"
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, MapPin, Phone, Mail, ShoppingBag, Truck, Star, ChevronRight } from 'lucide-react'

const PRODUCTS = [
  { name: 'Aceites y Grasas', emoji: '🫙', desc: 'Aceite vegetal, oliva, manteca y más' },
  { name: 'Carnes y Proteínas', emoji: '🥩', desc: 'Res, pollo, cerdo y mariscos frescos' },
  { name: 'Lácteos', emoji: '🧀', desc: 'Quesos, cremas, mantequilla y más' },
  { name: 'Frutas y Verduras', emoji: '🥦', desc: 'Productos frescos de temporada' },
  { name: 'Abarrotes', emoji: '🥫', desc: 'Conservas, salsas, especias y más' },
  { name: 'Bebidas', emoji: '🧃', desc: 'Refrescos, jugos y agua para tu negocio' },
  { name: 'Desechables', emoji: '🥡', desc: 'Contenedores, vasos, bolsas y más' },
  { name: 'Limpieza', emoji: '🧹', desc: 'Productos de higiene y limpieza' },
]

const AREAS = [
  'Chicago', 'Cicero', 'Berwyn', 'Oak Park', 'Evanston',
  'Skokie', 'Schaumburg', 'Naperville', 'Aurora', 'Joliet',
  'Waukegan', 'Elgin', 'Arlington Heights', 'Bolingbrook'
]

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">
            <Image src="/logo.png" alt="BOOD SUPPLY" width={120} height={60} className="object-contain" />
            <div className="hidden lg:flex items-center gap-6">
              <Link href="#productos" className="text-brand-gray-dark hover:text-brand-orange font-medium text-sm transition-colors">Productos</Link>
              <Link href="#areas" className="text-brand-gray-dark hover:text-brand-orange font-medium text-sm transition-colors">Áreas de Servicio</Link>
              <Link href="#contacto" className="text-brand-gray-dark hover:text-brand-orange font-medium text-sm transition-colors">Contacto</Link>
              <Link href="/login" className="text-brand-navy border-2 border-brand-navy font-semibold text-sm px-4 py-2 rounded-button hover:bg-brand-navy hover:text-white transition-all">Iniciar Sesión</Link>
              <Link href="/registro" className="btn-primary !py-2 !px-5 text-sm">Hazte Cliente</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-brand-navy overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl">
            <h1 className="font-heading text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Los productos que<br />
              <span className="text-brand-orange">necesitas</span> en<br />
              un solo lugar
            </h1>
            <p className="text-blue-200 text-xl leading-relaxed mb-10 max-w-2xl">
              Distribuimos todo lo que tu restaurante necesita en Chicago y sus suburbios. Precio justo, calidad garantizada y entrega puntual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/registro" className="btn-primary flex items-center justify-center gap-2 text-lg !px-8 !py-4">
                Hazte Cliente Gratis <ArrowRight size={20} />
              </Link>
              <Link href="#productos" className="btn-ghost flex items-center justify-center gap-2 text-lg !px-8 !py-4">
                Ver Productos <ChevronRight size={20} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-6">
              {['Más de 200 productos', 'Entrega en 24-48hrs', 'Servicio personalizado'].map(item => (
                <div key={item} className="flex items-center gap-2 text-blue-200">
                  <CheckCircle2 size={18} className="text-brand-orange shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 10 960 0 720 0C480 0 240 10 0 40Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '200+', label: 'Productos disponibles', icon: ShoppingBag },
              { value: '5+', label: 'Años de experiencia', icon: Star },
              { value: '98%', label: 'Clientes satisfechos', icon: CheckCircle2 },
              { value: '24h', label: 'Tiempo de entrega', icon: Truck },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-brand-orange" />
                </div>
                <div className="font-heading font-bold text-4xl text-brand-navy mb-1">{value}</div>
                <div className="text-brand-gray-mid text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section id="productos" className="py-24 bg-brand-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="badge-orange text-sm mb-4 inline-block">Nuestro Catálogo</span>
            <h2 className="section-title mb-4">Todo lo que tu restaurante necesita</h2>
            <p className="section-subtitle mx-auto">Desde ingredientes frescos hasta artículos de limpieza — tenemos todo en un solo pedido</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {PRODUCTS.map(p => (
              <div key={p.name} className="card-hover group">
                <div className="text-4xl mb-4">{p.emoji}</div>
                <h3 className="font-heading font-bold text-brand-navy text-base mb-2 group-hover:text-brand-orange transition-colors">{p.name}</h3>
                <p className="text-brand-gray-mid text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/registro" className="btn-primary inline-flex items-center gap-2 text-base">
              Ver Catálogo Completo <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* AREAS */}
      <section id="areas" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge-orange text-sm mb-4 inline-block">Cobertura</span>
              <h2 className="section-title mb-6">Servimos Chicago y todos sus suburbios</h2>
              <p className="text-brand-gray-mid text-lg leading-relaxed mb-8">
                Entregamos directamente a tu restaurante en toda el área metropolitana de Chicago. Si tienes dudas si llegamos a tu área, contáctanos.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {AREAS.map(area => (
                  <span key={area} className="flex items-center gap-1.5 bg-brand-gray-light text-brand-navy text-sm font-medium px-3 py-1.5 rounded-full">
                    <MapPin size={12} className="text-brand-orange" />{area}
                  </span>
                ))}
              </div>
              <Link href="/registro" className="btn-primary inline-flex items-center gap-2">
                Empezar Ahora <ArrowRight size={18} />
              </Link>
            </div>
            <div className="bg-brand-navy rounded-2xl p-8 text-white">
              <h3 className="font-heading font-bold text-2xl mb-6">¿Cómo funciona?</h3>
              {[
                { n: '01', title: 'Regístrate gratis', desc: 'Crea tu cuenta en minutos. Sin cargos de membresía.' },
                { n: '02', title: 'Haz tu pedido', desc: 'Explora el catálogo y selecciona lo que necesitas.' },
                { n: '03', title: 'Recibe en tu negocio', desc: 'Entregamos en 24-48 horas directo a tu restaurante.' },
              ].map(step => (
                <div key={step.n} className="flex gap-4 mb-6 last:mb-0">
                  <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center shrink-0 font-heading font-bold text-sm">{step.n}</div>
                  <div>
                    <p className="font-heading font-bold text-white mb-1">{step.title}</p>
                    <p className="text-blue-200 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-orange">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-4">
            ¿Listo para simplificar tu abastecimiento?
          </h2>
          <p className="text-orange-100 text-lg mb-10">
            Únete a los restaurantes que ya confían en BOOD SUPPLY en Chicago.
          </p>
          <Link href="/registro" className="bg-white text-brand-orange font-heading font-bold text-lg px-10 py-4 rounded-button hover:bg-orange-50 transition-all inline-flex items-center gap-2 shadow-lg">
            Crear Cuenta Gratis <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-brand-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <Image src="/logo.png" alt="BOOD SUPPLY" width={140} height={70} className="object-contain mb-4 rounded-xl" />
              <p className="text-blue-200 text-sm leading-relaxed">
                Distribuidora de productos para restaurantes en Chicago y suburbios.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Navegación</h4>
              <ul className="space-y-2">
                <li><Link href="#productos" className="text-blue-200 hover:text-brand-orange text-sm transition-colors">Productos</Link></li>
                <li><Link href="#areas" className="text-blue-200 hover:text-brand-orange text-sm transition-colors">Áreas de Servicio</Link></li>
                <li><Link href="/registro" className="text-blue-200 hover:text-brand-orange text-sm transition-colors">Hazte Cliente</Link></li>
                <li><Link href="/login" className="text-blue-200 hover:text-brand-orange text-sm transition-colors">Iniciar Sesión</Link></li>
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
          <div className="border-t border-blue-900 pt-8 text-center">
            <p className="text-blue-300 text-sm">© {new Date().getFullYear()} BOOD SUPPLY. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}