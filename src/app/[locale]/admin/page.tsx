'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, ShoppingBag, Package, Clock, Truck, LogOut, Search, MoreVertical, AlertCircle } from 'lucide-react'

type AdminTab = 'dashboard' | 'clients' | 'orders'

const ORDER_STATES = [
  { key: 'new',        label: 'Nuevo',          color: 'bg-gray-100 text-gray-700',    count: 3 },
  { key: 'review',     label: 'En revisión',    color: 'bg-blue-50 text-blue-700',     count: 2 },
  { key: 'approved',   label: 'Aprobado',       color: 'bg-teal-50 text-teal-700',     count: 5 },
  { key: 'invoiced',   label: 'Facturado',      color: 'bg-purple-50 text-purple-700', count: 4 },
  { key: 'preparing',  label: 'En preparación', color: 'bg-amber-50 text-amber-700',   count: 3 },
  { key: 'dispatched', label: 'Despachado',     color: 'bg-orange-50 text-orange-700', count: 6 },
  { key: 'delivered',  label: 'Entregado',      color: 'bg-green-50 text-green-700',   count: 24 },
  { key: 'cancelled',  label: 'Cancelado',      color: 'bg-red-50 text-red-700',       count: 1 },
]

const MOCK_CLIENTS = [
  { id: 1, name: 'Restaurante La Paloma', contact: 'Maria Lopez',  email: 'maria@lapaloma.com', status: 'active',  orders: 12 },
  { id: 2, name: 'Tacos El Toro',         contact: 'Jose Rodriguez', email: 'jose@eltoro.com',  status: 'active',  orders: 8 },
  { id: 3, name: 'New Client Grill',      contact: 'Sam Smith',    email: 'sam@newclient.com', status: 'pending', orders: 0 },
  { id: 4, name: 'Chicago Bistro',        contact: 'Anne Doe',     email: 'anne@bistro.com',   status: 'active',  orders: 19 },
]

const MOCK_ORDERS = [
  { id: 'ORD-041', client: 'La Paloma',    date: '2024-07-12', status: 'new',        total: '$284' },
  { id: 'ORD-040', client: 'Tacos El Toro', date: '2024-07-11', status: 'preparing', total: '$156' },
  { id: 'ORD-039', client: 'Chicago Bistro', date: '2024-07-10', status: 'dispatched', total: '$432' },
  { id: 'ORD-038', client: 'La Paloma',    date: '2024-07-09', status: 'delivered',  total: '$198' },
  { id: 'ORD-037', client: 'Tacos El Toro', date: '2024-07-08', status: 'cancelled', total: '$75' },
]

const statusStyle: Record<string, string> = {
  new: 'status-new', review: 'status-review', approved: 'status-approved',
  invoiced: 'status-invoiced', preparing: 'status-preparing',
  dispatched: 'status-dispatched', delivered: 'status-delivered', cancelled: 'status-cancelled',
}

const statusLabel: Record<string, string> = {
  new: 'Nuevo', review: 'En revisión', approved: 'Aprobado', invoiced: 'Facturado',
  preparing: 'En prep.', dispatched: 'Despachado', delivered: 'Entregado', cancelled: 'Cancelado',
}

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [clientSearch, setClientSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'clients',   icon: Users,           label: 'Clientes' },
    { id: 'orders',    icon: ShoppingBag,      label: 'Pedidos' },
  ]

  const filteredOrders = MOCK_ORDERS.filter(o =>
    (!orderSearch || o.client.toLowerCase().includes(orderSearch.toLowerCase()) || o.id.includes(orderSearch)) &&
    (!selectedStatus || o.status === selectedStatus)
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-60 bg-brand-navy text-white flex-col hidden lg:flex">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-orange rounded-md flex items-center justify-center">
              <span className="font-heading font-bold text-white text-xs">BS</span>
            </div>
            <span className="font-heading font-bold text-sm">BOOD SUPPLY</span>
          </div>
          <p className="text-blue-300 text-xs mt-1">Panel Administrativo</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as AdminTab)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-brand-orange text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon size={17} />{label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link href="/" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut size={17} />Salir
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-heading font-bold text-brand-navy text-lg">
            {tab === 'dashboard' ? 'Resumen General' : tab === 'clients' ? 'Gestión de Clientes' : 'Gestión de Pedidos'}
          </h1>
          <span className="badge-orange text-xs">Admin</span>
        </div>

        <div className="p-6">

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: ShoppingBag, label: 'Pedidos hoy',    value: '7',  color: 'text-brand-navy',   bg: 'bg-blue-50' },
                  { icon: Clock,       label: 'Pendientes',     value: '5',  color: 'text-amber-600',    bg: 'bg-amber-50' },
                  { icon: Truck,       label: 'Despachados',    value: '6',  color: 'text-orange-600',   bg: 'bg-orange-50' },
                  { icon: Users,       label: 'Clientes nuevos', value: '2', color: 'text-green-600',    bg: 'bg-green-50' },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-white rounded-card border border-gray-100 p-5 flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                      <kpi.icon size={20} className={kpi.color} />
                    </div>
                    <div>
                      <p className="text-brand-gray-mid text-xs">{kpi.label}</p>
                      <p className={`font-heading font-bold text-2xl ${kpi.color}`}>{kpi.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-card border border-gray-100 p-6">
                <h3 className="font-heading font-bold text-brand-navy text-base mb-5">Pipeline de Pedidos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {ORDER_STATES.map(s => (
                    <div key={s.key} className="text-center">
                      <div className={`rounded-xl p-3 ${s.color} mb-2`}>
                        <div className="font-heading font-bold text-2xl">{s.count}</div>
                      </div>
                      <p className="text-xs text-brand-gray-mid leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-card p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 text-sm">1 cliente pendiente de aprobación</p>
                  <button onClick={() => setTab('clients')} className="text-amber-700 text-xs underline">Revisar ahora →</button>
                </div>
              </div>
            </div>
          )}

          {/* CLIENTS */}
          {tab === 'clients' && (
            <div className="bg-white rounded-card border border-gray-100">
              <div className="p-5 border-b border-gray-50">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-mid" />
                  <input
                    type="text" placeholder="Buscar cliente..."
                    className="input-field pl-9 !py-2 text-sm"
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                  />
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left py-3 px-4 text-brand-gray-mid font-medium">Negocio</th>
                    <th className="text-left py-3 px-4 text-brand-gray-mid font-medium">Contacto</th>
                    <th className="text-left py-3 px-4 text-brand-gray-mid font-medium">Estado</th>
                    <th className="text-right py-3 px-4 text-brand-gray-mid font-medium">Pedidos</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CLIENTS.filter(c => !clientSearch || c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(client => (
                    <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-brand-navy">{client.name}</p>
                        <p className="text-xs text-brand-gray-mid">{client.email}</p>
                      </td>
                      <td className="py-3 px-4 text-brand-gray-mid">{client.contact}</td>
                      <td className="py-3 px-4">
                        <span className={`badge text-xs ${client.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {client.status === 'active' ? 'Activo' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-brand-navy">{client.orders}</td>
                      <td className="py-3 px-4 text-right">
                        {client.status === 'pending' ? (
                          <div className="flex gap-2 justify-end">
                            <button className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium">Aprobar</button>
                            <button className="text-xs px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium">Rechazar</button>
                          </div>
                        ) : (
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-brand-gray-mid"><MoreVertical size={16} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="bg-white rounded-card border border-gray-100">
              <div className="p-5 border-b border-gray-50 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-mid" />
                  <input
                    type="text" placeholder="Buscar orden o cliente..."
                    className="input-field pl-9 !py-2 text-sm"
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                  />
                </div>
                <select className="input-field !py-2 text-sm !w-auto" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                  <option value="">Todos los estados</option>
                  {ORDER_STATES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left py-3 px-4 text-brand-gray-mid font-medium">Orden</th>
                    <th className="text-left py-3 px-4 text-brand-gray-mid font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 text-brand-gray-mid font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 text-brand-gray-mid font-medium">Estado</th>
                    <th className="text-right py-3 px-4 text-brand-gray-mid font-medium">Total</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-brand-navy">{order.id}</td>
                      <td className="py-3 px-4 text-brand-gray-dark">{order.client}</td>
                      <td className="py-3 px-4 text-brand-gray-mid">{order.date}</td>
                      <td className="py-3 px-4"><span className={`${statusStyle[order.status]} text-xs`}>{statusLabel[order.status]}</span></td>
                      <td className="py-3 px-4 text-right font-bold text-brand-navy">{order.total}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-xs px-3 py-1 bg-brand-navy text-white rounded-lg hover:bg-brand-blue font-medium">Ver detalle</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}