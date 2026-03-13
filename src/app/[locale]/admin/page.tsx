// v2
"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, LogOut, Package, Eye, EyeOff, Users, ShoppingBag, ChevronDown } from 'lucide-react'

const CATEGORIAS = ['Vasos Desechables', 'Platos Desechables', 'Cubiertos', 'Bolsas y Contenedores', 'Servilletas', 'Papel para Baño', 'Papel', 'Palillos']
const ADMIN_EMAIL = 'boodsupplies@gmail.com'
const ESTADOS = ['pendiente', 'confirmado', 'en_preparacion', 'despachado', 'entregado', 'cancelado']

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'productos' | 'pedidos' | 'clientes'>('pedidos')
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', categoria: CATEGORIAS[0], precio: '', unidad: '' })
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { window.location.href = '/es/login'; return }
      setUser(user)
      await Promise.all([cargarProductos(), cargarPedidos(), cargarClientes()])
      setLoading(false)
    }
    init()
  }, [])

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').order('categoria').order('nombre')
    setProductos(data || [])
  }

  async function cargarPedidos() {
    const { data } = await supabase.from('pedidos').select('*, pedido_items(*, productos(*))').order('created_at', { ascending: false })
    setPedidos(data || [])
  }

  async function cargarClientes() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setClientes(data || [])
  }

  async function agregarProducto() {
    if (!form.nombre || !form.precio || !form.unidad) return alert('Llena todos los campos')
    setGuardando(true)
    await supabase.from('productos').insert({ ...form, precio: parseFloat(form.precio), activo: true })
    setForm({ nombre: '', descripcion: '', categoria: CATEGORIAS[0], precio: '', unidad: '' })
    setShowForm(false)
    await cargarProductos()
    setGuardando(false)
  }

  async function toggleActivo(id: string, activo: boolean) {
    await supabase.from('productos').update({ activo: !activo }).eq('id', id)
    await cargarProductos()
  }

  async function eliminarProducto(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    await cargarProductos()
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from('pedidos').update({ estado }).eq('id', id)
    await cargarPedidos()
  }

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

  const porCategoria = CATEGORIAS.reduce((acc, cat) => {
    acc[cat] = productos.filter(p => p.categoria === cat)
    return acc
  }, {} as Record<string, any[]>)

  const estadoColor: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    confirmado: 'bg-blue-100 text-blue-700',
    en_preparacion: 'bg-purple-100 text-purple-700',
    despachado: 'bg-orange-100 text-orange-700',
    entregado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <nav className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Package size={22} className="text-brand-orange" />
          <span className="font-heading font-bold text-lg">Admin — BOOD SUPPLY</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-300 text-sm hidden md:block">{user?.email}</span>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pedidos totales', value: pedidos.length, color: 'text-brand-navy' },
            { label: 'Pedidos pendientes', value: pedidos.filter(p => p.estado === 'pendiente').length, color: 'text-yellow-600' },
            { label: 'Clientes registrados', value: clientes.length, color: 'text-brand-orange' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <div className={`font-heading text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-brand-gray-mid text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-3 mb-8">
          {[
            { key: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
            { key: 'clientes', label: 'Clientes', icon: Users },
            { key: 'productos', label: 'Productos', icon: Package },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as any)} className={`font-heading font-semibold px-5 py-2.5 rounded-button transition-all flex items-center gap-2 ${tab === key ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy border border-gray-200 hover:border-brand-navy'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* PEDIDOS */}
        {tab === 'pedidos' && (
          <div className="space-y-4">
            {pedidos.length === 0 ? (
              <div className="card text-center py-12 text-brand-gray-mid">
                <ShoppingBag size={40} className="mx-auto mb-3 opacity-25" />
                <p>No hay pedidos aún</p>
              </div>
            ) : pedidos.map(ped => (
              <div key={ped.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-heading font-bold text-brand-navy">Pedido #{ped.id.slice(0,8).toUpperCase()}</p>
                    <p className="text-sm text-brand-gray-mid">{new Date(ped.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-brand-gray-mid mt-0.5">Cliente: {ped.cliente_id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-bold text-brand-orange text-lg">${ped.total?.toFixed(2)}</span>
                    <div className="relative">
                      <select value={ped.estado} onChange={e => cambiarEstado(ped.id, e.target.value)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none ${estadoColor[ped.estado] || 'bg-gray-100'}`}>
                        {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ').charAt(0).toUpperCase() + e.replace('_', ' ').slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-1">
                  {ped.pedido_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-brand-gray-dark">{item.productos?.nombre} <span className="text-brand-gray-mid">x{item.cantidad}</span></span>
                      <span className="font-medium">${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CLIENTES */}
        {tab === 'clientes' && (
          <div className="card">
            <h2 className="font-heading font-bold text-brand-navy text-xl mb-5">Clientes Registrados</h2>
            {clientes.length === 0 ? (
              <div className="text-center py-12 text-brand-gray-mid">
                <Users size={40} className="mx-auto mb-3 opacity-25" />
                <p>No hay clientes aún</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientes.map(c => (
                  <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 bg-brand-navy text-white rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                      {(c.full_name || c.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-brand-navy text-sm">{c.full_name || 'Sin nombre'}</p>
                      <p className="text-xs text-brand-gray-mid">{c.email || c.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-brand-gray-mid">{new Date(c.created_at).toLocaleDateString('es-MX')}</p>
                      <p className="text-xs font-medium text-brand-orange">{pedidos.filter(p => p.cliente_id === c.id).length} pedidos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTOS */}
        {tab === 'productos' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-brand-gray-mid text-sm">{productos.length} productos · {productos.filter(p => p.activo).length} activos</p>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Agregar Producto
              </button>
            </div>
            {showForm && (
              <div className="card mb-6 border-2 border-brand-orange/30">
                <h2 className="font-heading font-bold text-brand-navy text-lg mb-5">Nuevo Producto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Nombre *</label>
                    <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Vaso 8oz" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Categoría *</label>
                    <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white">
                      {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Precio * (USD)</label>
                    <input value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} placeholder="Ej: 9.99" type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Unidad *</label>
                    <input value={form.unidad} onChange={e => setForm({...form, unidad: e.target.value})} placeholder="Ej: paquete 100u" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Descripción</label>
                    <input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción breve del producto" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={agregarProducto} disabled={guardando} className="btn-primary flex items-center gap-2">
                    {guardando ? 'Guardando...' : <><Plus size={16} /> Guardar</>}
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy">Cancelar</button>
                </div>
              </div>
            )}
            <div className="space-y-6">
              {CATEGORIAS.map(cat => {
                const prods = porCategoria[cat]
                if (prods.length === 0) return null
                return (
                  <div key={cat} className="card">
                    <h2 className="font-heading font-bold text-brand-navy mb-4 flex items-center gap-2">
                      {cat} <span className="text-xs font-normal text-brand-gray-mid bg-gray-100 px-2 py-0.5 rounded-full">{prods.length}</span>
                    </h2>
                    <div className="space-y-2">
                      {prods.map(p => (
                        <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${p.activo ? 'border-gray-100 bg-gray-50' : 'border-red-100 bg-red-50 opacity-60'}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-brand-navy text-sm">{p.nombre}</span>
                              {!p.activo && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactivo</span>}
                            </div>
                            <div className="text-xs text-brand-gray-mid mt-0.5">{p.descripcion} · {p.unidad}</div>
                          </div>
                          <div className="font-heading font-bold text-brand-navy">${p.precio}</div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleActivo(p.id, p.activo)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-brand-gray-mid">
                              {p.activo ? <Eye size={15} /> : <EyeOff size={15} />}
                            </button>
                            <button onClick={() => eliminarProducto(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors text-red-400 hover:text-red-600">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}