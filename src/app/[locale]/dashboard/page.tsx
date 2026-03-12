'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, User, LogOut, Plus, RefreshCw, ChevronRight, Bell } from 'lucide-react'

const MOCK_ORDERS = [
  { id: 'ORD-001', date: '2024-07-10', status: 'delivered', total: '$284.50', items: 8 },
  { id: 'ORD-002', date: '2024-07-08', status: 'dispatched', total: '$156.00', items: 4 },
  { id: 'ORD-003', date: '2024-07-05', status: 'preparing', total: '$432.75', items: 12 },
  { id: 'ORD-004', date: '2024-07-01', status: 'delivered', total: '$198.20', items: 6 },
]

const statusLabels: Record<string, { label: string; cls: string }> = {
  new:        { label: 'Nuevo',          cls: 'status-new' },
  review:     { label: 'En revisión',    cls: 'status-review' },
  approved:   { label: 'Aprobado',       cls: 'status-approved' },
  invoiced:   { label: 'Facturado',      cls: 'status-invoiced' },
  preparing:  { label: 'En preparación', cls: 'status-preparing' },
  dispatched: { label: 'Despachado',     cls: 'status-dispatched' },
  delivered:  { label: 'Entregado',      cls: 'status-delivered' },
  cancelled:  { label: 'Cancelado',      cls: 'status-cancelled' },
}

type Tab = 'overview' | 'orders' | 'products' | 'profile'

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('overview')

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Resumen' },
    { id: 'products', icon: Package,         label: 'Productos' },
    { id: 'orders',   icon: ShoppingCart,    label: 'Mis Pedidos' },
    { id: 'profile',  icon: User,            label: 'Mi Perfil' },
  ]

  return (
    <div className="min-h-screen bg-brand-gray-light flex">

      {/* Sidebar */}
      <aside className="w-64 bg-brand-navy text-white flex-col hidden lg:flex">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
              <span className="font-heading font-bold text-white text-xs">BS</span>
            </div>
            <span className="font-heading font-bold text-lg">BOOD <span className="text-brand-orange">SUPPLY</span></span>
          </div>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-sm">MR</div>
            <div>
              <p className="font-medium text-sm text-white">Mi Restaurante</p>
              <p className="text-xs text-blue-300">Cliente activo</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-brand-orange text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut size={18} />Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-heading font-bold text-brand-navy text-xl">
            {tab === 'overview' ? 'Mi Cuenta' : tab === 'orders' ? 'Mis Pedidos' : tab === 'products' ? 'Catálogo' : 'Mi Perfil'}
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-50 text-brand-gray-mid">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-orange rounded-full" />
            </button>
            <button className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
              <Plus size={16} />Nuevo Pedido
            </button>
          </div>
        </div>

        <div className="p-6">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Pedidos este mes', value: '3',    color: 'text-brand-navy' },
                  { label: 'Pendientes',        value: '1',    color: 'text-amber-600' },
                  { label: 'Entregados',         value: '8',    color: 'text-green-600' },
                  { label: 'Total gastado',      value: '$1,240', color: 'text-brand-orange' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-card border border-gray-100 p-4">
                    <p className="text-brand-gray-mid text-xs mb-1">{stat.label}</p>
                    <p className={`font-heading font-bold text-2xl ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading font-bold text-brand-navy text-lg">Pedidos Recientes</h3>
                  <button onClick={() => setTab('orders')} className="text-brand-orange text-sm font-medium hover:underline">Ver todos →</button>
                </div>
                <div className="space-y-3">
                  {MOCK_ORDERS.slice(0, 3).map(order => {
                    const st = statusLabels[order.status]
                    return (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-medium text-brand-navy text-sm">{order.id}</p>
                          <p className="text-brand-gray-mid text-xs">{order.date} · {order.items} productos</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={st.cls}>{st.label}</span>
                          <span className="font-bold text-brand-navy text-sm">{order.total}</span>
                          <ChevronRight size={16} className="text-brand-gray-mid" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="card">
              <h3 className="font-heading font-bold text-brand-navy text-lg mb-5">Historial de Pedidos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-brand-gray-mid font-medium">Orden</th>
                      <th className="text-left py-3 px-2 text-brand-gray-mid font-medium">Fecha</th>
                      <th className="text-left py-3 px-2 text-brand-gray-mid font-medium">Estado</th>
                      <th className="text-right py-3 px-2 text-brand-gray-mid font-medium">Total</th>
                      <th className="text-right py-3 px-2 text-brand-gray-mid font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.map(order => {
                      const st = statusLabels[order.status]
                      return (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-2 font-medium text-brand-navy">{order.id}</td>
                          <td className="py-3 px-2 text-brand-gray-mid">{order.date}</td>
                          <td className="py-3 px-2"><span className={st.cls}>{st.label}</span></td>
                          <td className="py-3 px-2 text-right font-bold text-brand-navy">{order.total}</td>
                          <td className="py-3 px-2 text-right">
                            <button className="text-brand-orange hover:underline text-xs flex items-center gap-1 ml-auto">
                              <RefreshCw size={12} />Repetir
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {tab === 'profile' && (
            <div className="card max-w-xl">
              <h3 className="font-heading font-bold text-brand-navy text-lg mb-5">Mi Perfil</h3>
              <div className="space-y-4">
                {[
                  { label: 'Nombre del negocio', value: 'Mi Restaurante LLC' },
                  { label: 'Persona de contacto', value: 'Juan García' },
                  { label: 'Correo', value: 'juan@mirestaurante.com' },
                  { label: 'Teléfono', value: '+1 (312) 555-0100' },
                  { label: 'Dirección', value: '123 N State St, Chicago, IL 60601' },
                  { label: 'Tipo de negocio', value: 'Restaurante mexicano' },
                ].map(f => (
                  <div key={f.label} className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-brand-gray-mid text-sm">{f.label}</span>
                    <span className="font-medium text-brand-navy text-sm">{f.value}</span>
                  </div>
                ))}
                <button className="btn-primary mt-4 text-sm">Editar Perfil</button>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {tab === 'products' && (
            <div className="text-center py-16">
              <Package size={48} className="text-brand-gray-mid mx-auto mb-4" />
              <h3 className="font-heading font-bold text-brand-navy text-xl mb-2">Catálogo de Productos</h3>
              <p className="text-brand-gray-mid mb-6">Explora nuestro catálogo y agrega productos a tu pedido</p>
              <Link href="/productos" className="btn-primary inline-flex">Ver Catálogo</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}