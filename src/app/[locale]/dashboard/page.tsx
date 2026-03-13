"use client"
import Image from 'next/image'
import Link from 'next/link'

const PRODUCTS = [
  { name: 'Vasos Desechables', emoji: '🥤', desc: 'Vasos transparentes 8oz, 12oz, 16oz y 32oz' },
  { name: 'Platos Desechables', emoji: '🍽️', desc: 'Platos de cartón y foam en diferentes tamaños' },
  { name: 'Cubiertos', emoji: '🍴', desc: 'Tenedores, cuchillos, cucharas y sets completos' },
  { name: 'Bolsas y Contenedores', emoji: '🛍️', desc: 'Bolsas de papel, plástico y contenedores con tapa' },
  { name: 'Servilletas', emoji: '🗒️', desc: 'Servilletas de papel blancas en paquetes grandes' },
  { name: 'Papel para Baño', emoji: '🧻', desc: 'Papel higiénico y papel toalla para tu negocio' },
  { name: 'Papel', emoji: '📄', desc: 'Papel encerado y papel para envolver alimentos' },
  { name: 'Palillos', emoji: '🪥', desc: 'Palillos de dientes y palillos removedores' },
]

const AREAS = ['Chicago', 'Cicero', 'Berwyn', 'Oak Park', 'Evanston', 'Skokie', 'Schaumburg', 'Naperville', 'Aurora', 'Joliet', 'Waukegan', 'Elgin', 'Arlington Heights', 'Bolingbrook']

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-body">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Bood Supply" width={40} height={40} className="rounded-lg" />
            <span className="font-heading font-bold text-xl text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-gray-dark">
            <a href="#productos" className="hover:text-brand-orange transition-colors">Productos</a>
            <a href="#areas" className="hover:text-brand-orange transition-colors">Áreas</a>
            <a href="#contacto" className="hover:text-brand-orange transition-colors">Contacto</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/es/login" className="text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors">Iniciar Sesión</Link>
            <Link href="/es/registro" className="btn-primary text-sm !py-2 !px-4">Crear Cuenta</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-brand-orange/20 border border-brand-orange/30 text-brand-orange-light px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            Distribuidor de Suministros en Chicago
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold leading-tight mb-6">
            Los suministros que necesitas<br />
            <span className="text-brand-orange">en un solo lugar</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Vasos, platos, cubiertos, bolsas y más — entregados directo a tu restaurante en Chicago y área metropolitana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/es/registro" className="bg-brand-orange hover:bg-brand-orange-light text-white font-heading font-bold px-8 py-4 rounded-button text-lg transition-all hover:shadow-lg">
              Crear Cuenta Gratis
            </Link>
            <a href="#productos" className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold px-8 py-4 rounded-button text-lg transition-all border border-white/20">
              Ver Productos
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-brand-gray-light py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '200+', label: 'Productos disponibles' },
            { value: '5+', label: 'Años de experiencia' },
            { value: '98%', label: 'Clientes satisfechos' },
            { value: '24h', label: 'Entrega rápida' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="font-heading text-3xl font-bold text-brand-navy">{value}</div>
              <div className="text-sm text-brand-gray-mid mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTOS */}
      <section id="productos" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-brand-navy mb-3">Nuestros Productos</h2>
            <p className="text-brand-gray-mid text-lg max-w-xl mx-auto">Suministros de calidad para restaurantes, cafeterías y negocios de food service</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {PRODUCTS.map(({ name, emoji, desc }) => (
              <div key={name} className="card hover:shadow-lg hover:-translate-y-1 transition-all cursor-default group">
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="font-heading font-bold text-brand-navy text-base mb-1 group-hover:text-brand-orange transition-colors">{name}</h3>
                <p className="text-brand-gray-mid text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/es/registro" className="btn-primary text-base px-8 py-3 inline-block">
              Ver Precios y Hacer Pedido →
            </Link>
          </div>
        </div>
      </section>

      {/* AREAS */}
      <section id="areas" className="bg-brand-gray-light py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-brand-navy mb-3">Áreas de Servicio</h2>
            <p className="text-brand-gray-mid text-lg">Entregamos en Chicago y toda el área metropolitana</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                {AREAS.map(area => (
                  <span key={area} className="bg-white border border-gray-200 text-brand-navy text-sm font-medium px-4 py-2 rounded-full shadow-sm">{area}</span>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-heading font-bold text-brand-navy text-xl mb-4">¿Cómo funciona?</h3>
              <div className="space-y-4">
                {[
                  { num: '1', title: 'Crea tu cuenta', desc: 'Registro gratis en menos de 1 minuto' },
                  { num: '2', title: 'Haz tu pedido', desc: 'Elige productos y cantidades desde tu catálogo' },
                  { num: '3', title: 'Recibe en tu negocio', desc: 'Entregamos directo a tu puerta' },
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

      {/* CTA */}
      <section className="bg-brand-orange py-16 px-6 text-white text-center">
        <h2 className="font-heading text-4xl font-bold mb-4">¿Listo para ordenar?</h2>
        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">Crea tu cuenta gratis y accede a nuestro catálogo completo con precios especiales</p>
        <Link href="/es/registro" className="bg-white text-brand-orange font-heading font-bold px-10 py-4 rounded-button text-lg hover:shadow-lg transition-all inline-block">
          Empezar Ahora
        </Link>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-brand-navy text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="Bood Supply" width={36} height={36} className="rounded-lg" />
              <span className="font-heading font-bold text-lg">BOOD SUPPLY</span>
            </div>
            <p className="text-blue-200 text-sm">Distribuidor de suministros para restaurantes en Chicago y área metropolitana.</p>
          </div>
          <div>
            <h4 className="font-heading font-bold mb-4">Productos</h4>
            <ul className="space-y-1 text-blue-200 text-sm">
              {['Vasos Desechables', 'Platos Desechables', 'Cubiertos', 'Bolsas y Contenedores', 'Servilletas', 'Palillos'].map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-bold mb-4">Contacto</h4>
            <div className="space-y-2 text-blue-200 text-sm">
              <p>📍 2900 N Richmond St, Chicago, IL 60618</p>
              <p>📞 +1 (312) 409-0106</p>
              <p>✉️ boodsupplies@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-blue-300 text-sm">
          © 2025 Bood Supply. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}