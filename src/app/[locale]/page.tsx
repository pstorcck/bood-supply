import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, CheckCircle2, DollarSign, ShieldCheck, HeadphonesIcon, Truck, MapPin, Phone, Mail } from 'lucide-react'

function HeroSection() {
  const t = useTranslations('hero')
  return (
    <section className="relative min-h-screen flex items-center bg-brand-navy overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="badge-orange mb-6 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mr-2 inline-block" />
              {t('badge')}
            </div>
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white leading-none mb-4">
              {t('title')}<br />
              <span className="text-brand-orange">{t('titleAccent')}</span>
            </h1>
            <p className="font-body text-blue-200 text-lg leading-relaxed mb-10 max-w-xl">
              {t('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/registro" className="btn-primary flex items-center justify-center gap-2 text-base">
                {t('ctaPrimary')} <ArrowRight size={18} />
              </Link>
              <Link href="/productos" className="btn-ghost flex items-center justify-center gap-2 text-base">
                {t('ctaSecondary')}
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
              <div className="text-blue-200 text-sm">{t('stat1')}</div>
            </div>
            <div className="card bg-white/5 border-white/10 text-center">
              <div className="text-4xl font-heading font-bold text-brand-orange mb-1">5+</div>
              <div className="text-blue-200 text-sm">{t('stat2')}</div>
            </div>
            <div className="col-span-2 card bg-brand-orange/10 border-brand-orange/20 text-center">
              <div className="text-5xl font-heading font-bold text-brand-orange mb-1">98%</div>
              <div className="text-blue-200 text-sm">{t('stat3')}</div>
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
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const t = useTranslations('features')
  const features = [
    { key: 'f1', icon: DollarSign, color: 'text-brand-orange bg-orange-50' },
    { key: 'f2', icon: ShieldCheck, color: 'text-brand-blue bg-blue-50' },
    { key: 'f3', icon: HeadphonesIcon, color: 'text-brand-orange bg-orange-50' },
    { key: 'f4', icon: Truck, color: 'text-brand-blue bg-blue-50' },
  ]
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle mx-auto">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ key, icon: Icon, color }) => (
            <div key={key} className="card-hover text-center">
              <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mx-auto mb-5`}>
                <Icon size={26} />
              </div>
              <h3 className="font-heading font-bold text-brand-navy text-xl mb-3">
                {t(`${key}_title` as any)}
              </h3>
              <p className="font-body text-brand-gray-mid text-sm leading-relaxed">
                {t(`${key}_desc` as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <FeaturesSection />

        {/* CTA Strip */}
        <section className="py-20 bg-brand-navy">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              ¿Tu restaurante necesita un proveedor confiable?
            </h2>
            <p className="text-blue-200 text-lg mb-10">
              Únete a los restaurantes que ya confían en BOOD SUPPLY. Registro gratuito, aprobación rápida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro" className="btn-primary text-base">Hazte Cliente Hoy</Link>
              <Link href="/contacto" className="btn-ghost text-base">Contáctanos</Link>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-24 bg-brand-gray-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="section-title mb-3">Lo que dicen nuestros clientes</h2>
            <p className="section-subtitle mx-auto mb-16">Restaurantes que confían en BOOD SUPPLY todos los días</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Restaurante La Paloma', text: 'Excelente servicio y precios justos. Llevamos 2 años trabajando con BOOD SUPPLY y nunca nos han fallado.' },
                { name: 'Tacos El Toro', text: 'La entrega siempre llega a tiempo. El equipo es muy profesional y resuelven cualquier problema rápidamente.' },
                { name: 'Chicago Grill House', text: 'Calidad consistente en todos los productos. Muy recomendados para cualquier restaurante en Chicago.' },
              ].map((item) => (
                <div key={item.name} className="card text-left">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <span key={s} className="text-brand-orange text-lg">★</span>)}
                  </div>
                  <p className="text-brand-gray-dark mb-5 leading-relaxed italic">"{item.text}"</p>
                  <p className="font-heading font-bold text-brand-navy text-sm">{item.name}</p>
                </div>
              ))}
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
                  Distribuidora para restaurantes en Chicago. Precio justo, calidad y servicio de primera.
                </p>
              </div>
              <div>
                <h4 className="font-heading font-semibold text-lg mb-4">Navegación</h4>
                <ul className="space-y-2">
                  {[['/', 'Inicio'], ['/sobre-nosotros', 'Sobre Nosotros'], ['/productos', 'Productos'], ['/contacto', 'Contacto'], ['/registro', 'Hazte Cliente']].map(([href, label]) => (
                    <li key={href}><Link href={href} className="text-blue-200 hover:text-brand-orange transition-colors text-sm">{label}</Link></li>
                  ))}
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
            <div className="border-t border-blue-900 mt-12 pt-8 text-center">
              <p className="text-blue-300 text-sm">© {new Date().getFullYear()} BOOD SUPPLY. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}