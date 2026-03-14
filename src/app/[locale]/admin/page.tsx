"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, LogOut, Package, Eye, EyeOff, Users, ShoppingBag, Tag, CheckSquare, Square } from 'lucide-react'

const ADMIN_EMAIL = 'boodsupplies@gmail.com'
const ESTADOS = ['pendiente', 'confirmado', 'en_preparacion', 'despachado', 'entregado', 'cancelado']

const GRUPOS = [
  { key: ['pendiente'], label: '📥 Recibidos', color: 'border-yellow-300 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  { key: ['confirmado', 'en_preparacion'], label: '⏳ En Proceso', color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  { key: ['despachado'], label: '🚚 Despachados', color: 'border-orange-300 bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  { key: ['entregado'], label: '✅ Entregados', color: 'border-green-300 bg-green-50', badge: 'bg-green-100 text-green-700' },
  { key: ['cancelado'], label: '❌ Cancelados', color: 'border-red-300 bg-red-50', badge: 'bg-red-100 text-red-700' },
]

const estadoColor: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmado: 'bg-blue-100 text-blue-700',
  en_preparacion: 'bg-purple-100 text-purple-700',
  despachado: 'bg-orange-100 text-orange-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pedidos' | 'clientes' | 'productos' | 'categorias'>('pedidos')
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [showFormProducto, setShowFormProducto] = useState(false)
  const [showFormCategoria, setShowFormCategoria] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [formProducto, setFormProducto] = useState({ nombre: '', descripcion: '', categoria: '', precio: '', unidad: '' })
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
    const prods = data || []
    setProductos(prods)
    const cats = [...new Set(prods.map((p: any) => p.categoria))].filter(Boolean) as string[]
    setCategorias(cats)
  }

  async function cargarPedidos() {
    const { data } = await supabase.from('pedidos')
      .select('*, pedido_items(*, productos(*))')
      .order('created_at', { ascending: false })
    setPedidos(data || [])
  }

  async function cargarClientes() {
    const { data: authData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setClientes(authData || [])
  }

  function getCliente(cliente_id: string) {
    return clientes.find(c => c.id === cliente_id)
  }

  function getPedidosCliente(cliente_id: string) {
    return pedidos.filter(p => p.cliente_id === cliente_id)
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from('pedidos').update({ estado }).eq('id', id)
    await cargarPedidos()
  }

  async function agregarProducto() {
    if (!formProducto.nombre || !formProducto.precio || !formProducto.unidad || !formProducto.categoria) return alert('Llena todos los campos')
    setGuardando(true)
    await supabase.from('productos').insert({ ...formProducto, precio: parseFloat(formProducto.precio), activo: true })
    setFormProducto({ nombre: '', descripcion: '', categoria: '', precio: '', unidad: '' })
    setShowFormProducto(false)
    await cargarProductos()
    setGuardando(false)
  }

  async function agregarCategoria() {
    if (!nuevaCategoria.trim()) return alert('Escribe un nombre')
    if (categorias.includes(nuevaCategoria.trim())) return alert('Ya existe esa categoría')
    setCategorias(prev => [...prev, nuevaCategoria.trim()])
    setNuevaCategoria('')
    setShowFormCategoria(false)
  }

  async function eliminarCategoria(cat: string) {
    if (!confirm(`¿Eliminar categoría "${cat}"?`)) return
    await supabase.from('productos').update({ categoria: '' }).eq('categoria', cat)
    await cargarProductos()
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

  function toggleSeleccion(id: string) {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function imprimirOrdenes() {
    const pedidosSeleccionados = pedidos.filter(p => seleccionados.includes(p.id))
    const html = `
      <html><head><title>Órdenes de Entrega — BOOD SUPPLY</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #2D3748; }
        .orden { border: 1px solid #ccc; padding: 16px; margin-bottom: 28px; page-break-inside: avoid; border-radius: 8px; }
        .header { background: #0F2B5B; color: white; padding: 10px 16px; border-radius: 6px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
        .header h2 { margin: 0; font-size: 15px; }
        .header p { margin: 0; font-size: 11px; opacity: 0.8; }
        .seccion { margin-bottom: 12px; }
        .seccion h3 { font-size: 10px; text-transform: uppercase; color: #888; margin: 0 0 6px 0; border-bottom: 1px solid #eee; padding-bottom: 3px; letter-spacing: 1px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
        .campo { font-size: 11px; padding: 2px 0; }
        .campo b { color: #0F2B5B; }
        .item-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f5f5f5; font-size: 11px; }
        .total { font-size: 15px; font-weight: bold; color: #F47B20; text-align: right; margin-top: 10px; padding-top: 8px; border-top: 2px solid #F47B20; }
        .logo-header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #0F2B5B; padding-bottom: 12px; }
        .logo-header h1 { color: #0F2B5B; margin: 0; font-size: 20px; }
        .logo-header p { color: #888; margin: 4px 0 0; font-size: 11px; }
        @media print { body { margin: 10px; } }
      </style></head><body>
      <div class="logo-header">
        <h1>BOOD SUPPLY</h1>
        <p>2900 N Richmond St, Chicago, IL 60618 · (312) 409-0106 · boodsupplies@gmail.com</p>
        <p style="margin-top:4px">Órdenes de Entrega — ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      ${pedidosSeleccionados.map(ped => {
        const cliente = getCliente(ped.cliente_id)
        return `
        <div class="orden">
          <div class="header">
            <div><h2>Pedido #${ped.id.slice(0,8).toUpperCase()}</h2></div>
            <div style="text-align:right"><p>${new Date(ped.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p><p>Estado: ${ped.estado.replace('_',' ')}</p></div>
          </div>
          <div class="seccion">
            <h3>Datos del Cliente</h3>
            <div class="grid2">
              <div class="campo"><b>Nombre:</b> ${cliente?.nombre || cliente?.email || 'N/A'}</div>
              <div class="campo"><b>Negocio:</b> ${cliente?.negocio || 'N/A'}</div>
              <div class="campo"><b>Teléfono:</b> ${cliente?.telefono || 'N/A'}</div>
              <div class="campo"><b>EIN:</b> ${cliente?.ein || 'N/A'}</div>
              <div class="campo" style="grid-column:span 2"><b>Dirección:</b> ${cliente?.direccion || 'N/A'}</div>
            </div>
          </div>
          <div class="seccion">
            <h3>Detalle del Pedido</h3>
            ${ped.pedido_items?.map((item: any) => `
              <div class="item-row">
                <span>${item.productos?.nombre || 'Producto'} &nbsp;<span style="color:#888">x${item.cantidad}</span></span>
                <span><b>$${(item.precio_unitario * item.cantidad).toFixed(2)}</b></span>
              </div>
            `).join('')}
          </div>
          <div class="total">Total del Pedido: $${ped.total?.toFixed(2)}</div>
        </div>`
      }).join('')}
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500) }
  }

  const totalGeneral = pedidos.reduce((sum, p) => sum + (p.total || 0), 0)

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pedidos totales', value: pedidos.length, color: 'text-brand-navy' },
            { label: 'Recibidos', value: pedidos.filter(p => p.estado === 'pendiente').length, color: 'text-yellow-600' },
            { label: 'Clientes', value: clientes.length, color: 'text-brand-orange' },
            { label: 'Total ventas', value: `$${totalGeneral.toFixed(2)}`, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center py-4">
              <div className={`font-heading text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-brand-gray-mid text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {[
            { key: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
            { key: 'clientes', label: 'Clientes', icon: Users },
            { key: 'productos', label: 'Productos', icon: Package },
            { key: 'categorias', label: 'Categorías', icon: Tag },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as any)} className={`font-heading font-semibold px-5 py-2.5 rounded-button transition-all flex items-center gap-2 ${tab === key ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy border border-gray-200 hover:border-brand-navy'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* PEDIDOS */}
        {tab === 'pedidos' && (
          <div>
            {seleccionados.length > 0 && (
              <div className="bg-brand-navy text-white px-6 py-3 rounded-xl mb-6 flex items-center justify-between">
                <span className="text-sm font-medium">{seleccionados.length} pedido(s) seleccionado(s)</span>
                <div className="flex gap-3">
                  <button onClick={imprimirOrdenes} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
                    🖨️ Imprimir Órdenes
                  </button>
                  <button onClick={() => setSeleccionados([])} className="text-sm text-blue-300 hover:text-white">Cancelar</button>
                </div>
              </div>
            )}

            {pedidos.length === 0 && (
              <div className="card text-center py-12 text-brand-gray-mid">
                <ShoppingBag size={40} className="mx-auto mb-3 opacity-25" />
                <p>No hay pedidos aún</p>
              </div>
            )}

            {GRUPOS.map(grupo => {
              const pedidosGrupo = pedidos.filter(p => grupo.key.includes(p.estado))
              if (pedidosGrupo.length === 0) return null
              const totalGrupo = pedidosGrupo.reduce((sum, p) => sum + (p.total || 0), 0)
              return (
                <div key={grupo.label} className={`mb-8 border-2 ${grupo.color} rounded-2xl p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-brand-navy text-lg flex items-center gap-2">
                      {grupo.label}
                      <span className="text-sm font-normal text-brand-gray-mid bg-white px-2 py-0.5 rounded-full border">{pedidosGrupo.length}</span>
                    </h2>
                    <span className="font-heading font-bold text-brand-orange">Subtotal: ${totalGrupo.toFixed(2)}</span>
                  </div>
                  <div className="space-y-3">
                    {pedidosGrupo.map(ped => {
                      const cliente = getCliente(ped.cliente_id)
                      const seleccionado = seleccionados.includes(ped.id)
                      return (
                        <div key={ped.id} className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all ${seleccionado ? 'border-brand-orange' : 'border-transparent'}`}>
                          <div className="flex items-start gap-3">
                            <button onClick={() => toggleSeleccion(ped.id)} className="mt-1 flex-shrink-0">
                              {seleccionado ? <CheckSquare size={18} className="text-brand-orange" /> : <Square size={18} className="text-gray-300" />}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                                <div>
                                  <p className="font-heading font-bold text-brand-navy">#{ped.id.slice(0,8).toUpperCase()}</p>
                                  <p className="text-xs text-brand-gray-mid">{new Date(ped.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-heading font-bold text-brand-orange text-lg">${ped.total?.toFixed(2)}</span>
                                  <select value={ped.estado} onChange={e => cambiarEstado(ped.id, e.target.value)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none ${estadoColor[ped.estado]}`}>
                                    {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_',' ').charAt(0).toUpperCase() + e.replace('_',' ').slice(1)}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-3 mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div><span className="text-brand-gray-mid">Nombre:</span> <span className="font-medium text-brand-navy">{cliente?.nombre || '—'}</span></div>
                                <div><span className="text-brand-gray-mid">Negocio:</span> <span className="font-medium text-brand-navy">{cliente?.negocio || '—'}</span></div>
                                <div><span className="text-brand-gray-mid">Teléfono:</span> <span className="font-medium text-brand-navy">{cliente?.telefono || '—'}</span></div>
                                <div><span className="text-brand-gray-mid">EIN:</span> <span className="font-medium text-brand-navy">{cliente?.ein || '—'}</span></div>
                                <div className="col-span-2"><span className="text-brand-gray-mid">Email:</span> <span className="font-medium text-brand-navy">{cliente?.email || '—'}</span></div>
                                <div className="col-span-2"><span className="text-brand-gray-mid">Dirección:</span> <span className="font-medium text-brand-navy">{cliente?.direccion || '—'}</span></div>
                              </div>
                              <div className="border-t pt-2 space-y-1">
                                {ped.pedido_items?.map((item: any) => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-brand-gray-dark">{item.productos?.nombre} <span className="text-brand-gray-mid">x{item.cantidad}</span></span>
                                    <span className="font-medium text-brand-navy">${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CLIENTES */}
        {tab === 'clientes' && (
          <div className="card">
            <h2 className="font-heading font-bold text-brand-navy text-xl mb-5">Clientes Registrados — {clientes.length}</h2>
            {clientes.length === 0 ? (
              <div className="text-center py-12 text-brand-gray-mid">
                <Users size={40} className="mx-auto mb-3 opacity-25" />
                <p>No hay clientes aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientes.map(c => {
                  const pedidosCliente = getPedidosCliente(c.id)
                  const ultimoPedido = pedidosCliente[0]
                  const totalGastado = pedidosCliente.reduce((sum, p) => sum + (p.total || 0), 0)
                  return (
                    <div key={c.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors">
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-navy text-white rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                            {(c.nombre || c.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-brand-navy">{c.nombre || '—'}</p>
                            <p className="text-xs text-brand-gray-mid">{c.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-right">
                          <div className="text-center">
                            <p className="font-heading font-bold text-brand-orange text-lg">{pedidosCliente.length}</p>
                            <p className="text-xs text-brand-gray-mid">pedidos</p>
                          </div>
                          <div className="text-center">
                            <p className="font-heading font-bold text-green-600 text-lg">${totalGastado.toFixed(2)}</p>
                            <p className="text-xs text-brand-gray-mid">total</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="bg-white rounded-lg p-2 border border-gray-100">
                          <p className="text-brand-gray-mid">Negocio</p>
                          <p className="font-medium text-brand-navy">{c.negocio || '—'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-100">
                          <p className="text-brand-gray-mid">Teléfono</p>
                          <p className="font-medium text-brand-navy">{c.telefono || '—'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-100">
                          <p className="text-brand-gray-mid">EIN</p>
                          <p className="font-medium text-brand-navy">{c.ein || '—'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-100 col-span-2">
                          <p className="text-brand-gray-mid">Dirección</p>
                          <p className="font-medium text-brand-navy">{c.direccion || '—'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-100">
                          <p className="text-brand-gray-mid">Último pedido</p>
                          <p className="font-medium text-brand-navy">{ultimoPedido ? new Date(ultimoPedido.created_at).toLocaleDateString('es-MX') : '—'}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTOS */}
        {tab === 'productos' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-brand-gray-mid text-sm">{productos.length} productos · {productos.filter(p => p.activo).length} activos</p>
              <button onClick={() => setShowFormProducto(!showFormProducto)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Agregar Producto
              </button>
            </div>
            {showFormProducto && (
              <div className="card mb-6 border-2 border-brand-orange/30">
                <h2 className="font-heading font-bold text-brand-navy text-lg mb-5">Nuevo Producto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Nombre *</label>
                    <input value={formProducto.nombre} onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} placeholder="Ej: Vaso 8oz" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Categoría *</label>
                    <select value={formProducto.categoria} onChange={e => setFormProducto({...formProducto, categoria: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white">
                      <option value="">Selecciona categoría</option>
                      {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Precio * (USD)</label>
                    <input value={formProducto.precio} onChange={e => setFormProducto({...formProducto, precio: e.target.value})} placeholder="Ej: 9.99" type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Unidad *</label>
                    <input value={formProducto.unidad} onChange={e => setFormProducto({...formProducto, unidad: e.target.value})} placeholder="Ej: paquete 100u" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Descripción</label>
                    <input value={formProducto.descripcion} onChange={e => setFormProducto({...formProducto, descripcion: e.target.value})} placeholder="Descripción breve" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={agregarProducto} disabled={guardando} className="btn-primary flex items-center gap-2">
                    {guardando ? 'Guardando...' : <><Plus size={16} /> Guardar</>}
                  </button>
                  <button onClick={() => setShowFormProducto(false)} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy">Cancelar</button>
                </div>
              </div>
            )}
            <div className="space-y-6">
              {categorias.map(cat => {
                const prods = productos.filter(p => p.categoria === cat)
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

        {/* CATEGORIAS */}
        {tab === 'categorias' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-brand-navy text-xl">Categorías</h2>
              <button onClick={() => setShowFormCategoria(!showFormCategoria)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Nueva Categoría
              </button>
            </div>
            {showFormCategoria && (
              <div className="border-2 border-brand-orange/30 rounded-xl p-4 mb-6">
                <label className="block text-sm font-medium text-brand-gray-dark mb-2">Nombre *</label>
                <div className="flex gap-3">
                  <input value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} placeholder="Ej: Empaques Especiales" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" onKeyDown={e => e.key === 'Enter' && agregarCategoria()} />
                  <button onClick={agregarCategoria} className="btn-primary flex items-center gap-2"><Plus size={16} /> Agregar</button>
                  <button onClick={() => setShowFormCategoria(false)} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy">Cancelar</button>
                </div>
              </div>
            )}
            {categorias.length === 0 ? (
              <div className="text-center py-12 text-brand-gray-mid">
                <Tag size={40} className="mx-auto mb-3 opacity-25" />
                <p>No hay categorías aún</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categorias.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Tag size={16} className="text-brand-orange" />
                      <span className="font-medium text-brand-navy">{cat}</span>
                      <span className="text-xs text-brand-gray-mid bg-white px-2 py-0.5 rounded-full border">{productos.filter(p => p.categoria === cat).length} productos</span>
                    </div>
                    <button onClick={() => eliminarCategoria(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}