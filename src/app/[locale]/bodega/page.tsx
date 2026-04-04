"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, LogOut, ShoppingBag, CheckCircle, Clock, Truck, Plus, Trash2, Pencil, Save, X, AlertTriangle, ImageIcon } from 'lucide-react'

const ESTADOS_BODEGA = [
  { from: 'pendiente', to: 'confirmado', label: 'Confirmar Recepción', color: 'bg-blue-500', icon: CheckCircle },
  { from: 'confirmado', to: 'en_preparacion', label: 'Iniciar Preparación', color: 'bg-purple-500', icon: Clock },
  { from: 'en_preparacion', to: 'despachado', label: 'Marcar como Listo', color: 'bg-green-500', icon: Truck },
]

const estadoColor: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  confirmado: 'bg-blue-100 text-blue-700 border-blue-300',
  en_preparacion: 'bg-purple-100 text-purple-700 border-purple-300',
  despachado: 'bg-orange-100 text-orange-700 border-orange-300',
  entregado: 'bg-green-100 text-green-700 border-green-300',
  cancelado: 'bg-red-100 text-red-700 border-red-300',
}

const estadoLabel: Record<string, string> = {
  pendiente: '📥 Recibido',
  confirmado: '✅ Confirmado',
  en_preparacion: '⚙️ En Preparación',
  despachado: '🚚 Listo para Despacho',
  entregado: '✓ Entregado',
  cancelado: '✗ Cancelado',
}

const CATEGORIAS = ['Foam Containers, Cups and Lids', 'Bolsas, Cubiertos y papel', 'Aluminio', 'Especies para cocina', 'Quimicos y Limpieza', 'Guantes']

export default function BodegaPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pedidos' | 'inventario'>('pedidos')
  const [pedidos, setPedidos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [actualizando, setActualizando] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'activos' | 'todos'>('activos')

  // Inventario state
  const [editandoStock, setEditandoStock] = useState<string | null>(null)
  const [stockTemp, setStockTemp] = useState('')
  const [showFormProducto, setShowFormProducto] = useState(false)
  const [formProducto, setFormProducto] = useState({ nombre: '', categoria: CATEGORIAS[0], precio: '', unidad: '', descripcion: '', stock: '0' })
  const [guardando, setGuardando] = useState(false)
  const [errorProducto, setErrorProducto] = useState('')
  const [editandoProducto, setEditandoProducto] = useState<string | null>(null)
  const [formEdit, setFormEdit] = useState<any>({})

  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/es/login'; return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'bodega' && user.email !== 'boodsupplies@gmail.com') { window.location.href = '/es/login'; return }
      setUser(user)
      await Promise.all([cargarPedidos(), cargarClientes(), cargarProductos()])
      setLoading(false)
    }
    init()
    const interval = setInterval(() => cargarPedidos(), 30000)
    return () => clearInterval(interval)
  }, [])

  async function cargarPedidos() {
    const { data } = await supabase.from('pedidos').select('*, pedido_items(*, productos(*))').order('created_at', { ascending: false })
    setPedidos(data || [])
  }

  async function cargarClientes() {
    const { data } = await supabase.from('profiles').select('*')
    setClientes(data || [])
  }

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').order('categoria').order('nombre')
    setProductos(data || [])
  }

  function getCliente(cliente_id: string) { return clientes.find(c => c.id === cliente_id) }

  async function avanzarEstado(pedidoId: string, nuevoEstado: string) {
    setActualizando(pedidoId)
    await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', pedidoId)
    await cargarPedidos()
    setActualizando(null)
  }

  // ── Inventario ───────────────────────────────────────────────────────────────
  async function guardarStock(id: string) {
    const newStock = parseInt(stockTemp) || 0
    await fetch('/api/productos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stock: newStock })
    })
    setEditandoStock(null)
    await cargarProductos()
  }

  async function agregarProducto() {
    if (!formProducto.nombre || !formProducto.precio || !formProducto.unidad) {
      return setErrorProducto('Nombre, precio y unidad son requeridos')
    }
    setGuardando(true)
    setErrorProducto('')
    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formProducto)
      })
      const data = await res.json()
      if (data.error) { setErrorProducto(data.error); setGuardando(false); return }
      setFormProducto({ nombre: '', categoria: CATEGORIAS[0], precio: '', unidad: '', descripcion: '', stock: '0' })
      setShowFormProducto(false)
      await cargarProductos()
    } catch (e: any) { setErrorProducto(e.message) }
    setGuardando(false)
  }

  async function eliminarProducto(id: string) {
    if (!confirm('Eliminar este producto del inventario?')) return
    await fetch('/api/productos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    await cargarProductos()
  }

  async function guardarEdicion(id: string) {
    setGuardando(true)
    await fetch('/api/productos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...formEdit })
    })
    setEditandoProducto(null)
    await cargarProductos()
    setGuardando(false)
  }

  const pedidosFiltrados = filtro === 'activos'
    ? pedidos.filter(p => ['pendiente', 'confirmado', 'en_preparacion'].includes(p.estado))
    : pedidos

  const contadores = {
    pendiente: pedidos.filter(p => p.estado === 'pendiente').length,
    confirmado: pedidos.filter(p => p.estado === 'confirmado').length,
    en_preparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
    despachado: pedidos.filter(p => p.estado === 'despachado').length,
  }

  const productosStockBajo = productos.filter(p => p.activo && (p.stock ?? 0) <= 5)
  const productosSinStock = productos.filter(p => p.activo && (p.stock ?? 0) === 0)

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <nav className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3"><Package size={22} className="text-brand-orange"/><span className="font-heading font-bold text-lg">Bodega — BOOD SUPPLY</span></div>
        <div className="flex items-center gap-4">
          <span className="text-blue-300 text-sm hidden md:block">{user?.email}</span>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white"><LogOut size={16}/> Salir</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={()=>setTab('pedidos')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${tab==='pedidos'?'bg-brand-navy text-white':'bg-white text-brand-navy border border-gray-200 hover:border-brand-navy'}`}><ShoppingBag size={16}/> Pedidos</button>
          <button onClick={()=>setTab('inventario')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${tab==='inventario'?'bg-brand-navy text-white':'bg-white text-brand-navy border border-gray-200 hover:border-brand-navy'}`}>
            <Package size={16}/> Inventario
            {productosStockBajo.length > 0 && <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${tab==='inventario'?'bg-white text-brand-navy':'bg-yellow-500 text-white'}`}>{productosStockBajo.length}</span>}
          </button>
        </div>

        {/* PEDIDOS */}
        {tab === 'pedidos' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Por Confirmar', value: contadores.pendiente, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
                { label: 'Confirmados', value: contadores.confirmado, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                { label: 'En Preparación', value: contadores.en_preparacion, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
                { label: 'Listos', value: contadores.despachado, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
              ].map(({label,value,color,bg})=>(
                <div key={label} className={`card border-2 ${bg} text-center py-4`}>
                  <div className={`font-heading text-3xl font-bold ${color}`}>{value}</div>
                  <div className="text-brand-gray-mid text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-6">
              <button onClick={()=>setFiltro('activos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtro==='activos'?'bg-brand-navy text-white':'bg-white border border-gray-200 text-brand-navy hover:border-brand-navy'}`}>Activos</button>
              <button onClick={()=>setFiltro('todos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtro==='todos'?'bg-brand-navy text-white':'bg-white border border-gray-200 text-brand-navy hover:border-brand-navy'}`}>Todos</button>
              <button onClick={cargarPedidos} className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-brand-navy hover:border-brand-orange transition-all">🔄 Actualizar</button>
            </div>
            {pedidosFiltrados.length===0&&(<div className="card text-center py-12 text-brand-gray-mid"><ShoppingBag size={40} className="mx-auto mb-3 opacity-25"/><p>No hay pedidos {filtro==='activos'?'activos':''}</p></div>)}
            <div className="space-y-4">
              {pedidosFiltrados.map(ped=>{
                const cliente = getCliente(ped.cliente_id)
                const accion = ESTADOS_BODEGA.find(e => e.from === ped.estado)
                return(
                  <div key={ped.id} className={`card border-l-4 ${ped.estado==='pendiente'?'border-l-yellow-400':ped.estado==='confirmado'?'border-l-blue-400':ped.estado==='en_preparacion'?'border-l-purple-400':ped.estado==='despachado'?'border-l-green-400':'border-l-gray-300'}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-heading font-bold text-brand-navy text-lg">#{ped.id.slice(0,8).toUpperCase()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium border ${estadoColor[ped.estado]||'bg-gray-100 text-gray-600 border-gray-200'}`}>{estadoLabel[ped.estado]||ped.estado}</span>
                        </div>
                        <p className="text-xs text-brand-gray-mid mt-1">{new Date(ped.created_at).toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold text-brand-orange text-xl">${ped.total?.toFixed(2)}</p>
                        <p className="text-xs text-brand-gray-mid">{ped.metodo_pago}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-brand-gray-mid">Cliente:</span> <span className="font-medium text-brand-navy">{cliente?.nombre||'—'}</span></div>
                      <div><span className="text-brand-gray-mid">Negocio:</span> <span className="font-medium text-brand-navy">{cliente?.negocio||'—'}</span></div>
                      <div><span className="text-brand-gray-mid">Teléfono:</span> <span className="font-medium text-brand-navy">{cliente?.telefono||'—'}</span></div>
                      <div><span className="text-brand-gray-mid">Dirección:</span> <span className="font-medium text-brand-navy">{cliente?.direccion||'—'}</span></div>
                    </div>
                    <div className="border-t pt-3 mb-3">
                      <p className="text-xs font-medium text-brand-gray-mid mb-2">PRODUCTOS</p>
                      <div className="space-y-1">
                        {ped.pedido_items?.map((item:any)=>(
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-brand-orange text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">{item.cantidad}</span>
                              <span className="text-sm text-brand-navy">{item.productos?.nombre}</span>
                              {(item.productos?.stock ?? 0) === 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Out of Stock</span>}
                              {(item.productos?.stock ?? 0) > 0 && (item.productos?.stock ?? 0) <= 5 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Stock bajo ({item.productos?.stock})</span>}
                            </div>
                            <span className="text-sm font-medium text-brand-navy">${(item.precio_unitario*item.cantidad).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {accion && (
                      <button onClick={()=>avanzarEstado(ped.id, accion.to)} disabled={actualizando===ped.id} className={`w-full ${accion.color} hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2`}>
                        <accion.icon size={18}/>
                        {actualizando===ped.id ? 'Actualizando...' : accion.label}
                      </button>
                    )}
                    {ped.estado==='despachado'&&(<div className="w-full bg-green-100 text-green-700 font-medium py-3 rounded-xl text-center text-sm">✅ Listo para despacho</div>)}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* INVENTARIO */}
        {tab === 'inventario' && (
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-heading font-bold text-brand-navy text-xl">Inventario <span className="text-sm font-normal text-brand-gray-mid">({productos.filter(p=>p.activo).length} productos activos)</span></h2>
              <button onClick={()=>setShowFormProducto(!showFormProducto)} className="btn-primary flex items-center gap-2"><Plus size={16}/> Agregar Producto</button>
            </div>

            {/* Alertas */}
            {productosSinStock.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="font-semibold text-red-700 text-sm">Sin stock: {productosSinStock.length} producto(s)</p>
                  <p className="text-xs text-red-600 mt-0.5">{productosSinStock.map(p=>p.nombre).join(', ')}</p>
                </div>
              </div>
            )}
            {productosStockBajo.filter(p=>(p.stock??0)>0).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="font-semibold text-yellow-700 text-sm">Stock bajo: {productosStockBajo.filter(p=>(p.stock??0)>0).length} producto(s)</p>
                  <p className="text-xs text-yellow-600 mt-0.5">{productosStockBajo.filter(p=>(p.stock??0)>0).map(p=>`${p.nombre} (${p.stock})`).join(', ')}</p>
                </div>
              </div>
            )}

            {/* Formulario nuevo producto */}
            {showFormProducto && (
              <div className="card border-2 border-brand-orange/30 mb-5">
                <h4 className="font-heading font-semibold text-brand-navy mb-4">Nuevo Producto</h4>
                {errorProducto && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{errorProducto}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Nombre *</label><input value={formProducto.nombre} onChange={e=>setFormProducto({...formProducto,nombre:e.target.value})} placeholder="Ej: Foam Cup 16oz" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Categoria *</label>
                    <select value={formProducto.categoria} onChange={e=>setFormProducto({...formProducto,categoria:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white">
                      {CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Precio (USD) *</label><input value={formProducto.precio} onChange={e=>setFormProducto({...formProducto,precio:e.target.value})} placeholder="0.00" type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Unidad *</label><input value={formProducto.unidad} onChange={e=>setFormProducto({...formProducto,unidad:e.target.value})} placeholder="Ej: 500 Ct" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Stock inicial</label><input value={formProducto.stock} onChange={e=>setFormProducto({...formProducto,stock:e.target.value})} placeholder="0" type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Descripcion</label><input value={formProducto.descripcion} onChange={e=>setFormProducto({...formProducto,descripcion:e.target.value})} placeholder="Descripcion breve" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={agregarProducto} disabled={guardando} className="btn-primary flex items-center gap-2"><Save size={15}/> {guardando?'Guardando...':'Guardar Producto'}</button>
                  <button onClick={()=>{setShowFormProducto(false);setErrorProducto('')}} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy">Cancelar</button>
                </div>
              </div>
            )}

            {/* Lista de productos por categoria */}
            <div className="space-y-4">
              {CATEGORIAS.map(cat => {
                const prods = productos.filter(p => p.categoria === cat && p.activo)
                if (prods.length === 0) return null
                return (
                  <div key={cat} className="card">
                    <h3 className="font-heading font-semibold text-brand-navy mb-3 flex items-center gap-2">
                      {cat}
                      <span className="text-xs font-normal text-brand-gray-mid bg-gray-100 px-2 py-0.5 rounded-full">{prods.length}</span>
                    </h3>
                    <div className="space-y-2">
                      {prods.map(p => {
                        const sinStock = (p.stock ?? 0) === 0
                        const stockBajo = (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5
                        return (
                          <div key={p.id}>
                            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${sinStock?'border-red-200 bg-red-50':stockBajo?'border-yellow-200 bg-yellow-50':'border-gray-100 bg-gray-50'}`}>
                              {p.imagen_url
                                ? <img src={p.imagen_url} alt={p.nombre} className="w-10 h-10 rounded-lg object-contain bg-white flex-shrink-0"/>
                                : <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0"><ImageIcon size={16} className="text-gray-400"/></div>
                              }
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-brand-navy text-sm">{p.nombre}</span>
                                  {sinStock && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">OUT OF STOCK</span>}
                                  {stockBajo && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">Stock bajo</span>}
                                </div>
                                <p className="text-xs text-brand-gray-mid">{p.unidad} · ${p.precio}</p>
                              </div>

                              {/* Stock editable */}
                              {editandoStock === p.id ? (
                                <div className="flex items-center gap-1">
                                  <input value={stockTemp} onChange={e=>setStockTemp(e.target.value)} type="number" className="w-20 border border-brand-orange rounded-lg px-2 py-1 text-sm text-center focus:outline-none" autoFocus onKeyDown={e=>e.key==='Enter'&&guardarStock(p.id)}/>
                                  <button onClick={()=>guardarStock(p.id)} className="text-green-500 hover:text-green-700"><Save size={14}/></button>
                                  <button onClick={()=>setEditandoStock(null)} className="text-brand-gray-mid"><X size={14}/></button>
                                </div>
                              ) : (
                                <button onClick={()=>{setEditandoStock(p.id);setStockTemp(String(p.stock??0))}} className={`font-bold px-3 py-1 rounded-lg text-sm cursor-pointer hover:opacity-80 flex-shrink-0 ${sinStock?'bg-red-100 text-red-600':stockBajo?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>
                                  {p.stock ?? 0} u.
                                </button>
                              )}

                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={()=>{setEditandoProducto(p.id);setFormEdit({nombre:p.nombre,categoria:p.categoria,precio:String(p.precio),unidad:p.unidad,descripcion:p.descripcion||''})}} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-blue-400"><Pencil size={14}/></button>
                                <button onClick={()=>eliminarProducto(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 text-red-400"><Trash2 size={14}/></button>
                              </div>
                            </div>

                            {/* Edicion inline */}
                            {editandoProducto === p.id && (
                              <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="grid grid-cols-2 gap-3">
                                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Nombre</label><input value={formEdit.nombre} onChange={e=>setFormEdit({...formEdit,nombre:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Categoria</label><select value={formEdit.categoria} onChange={e=>setFormEdit({...formEdit,categoria:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white">{CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Precio (USD)</label><input value={formEdit.precio} onChange={e=>setFormEdit({...formEdit,precio:e.target.value})} type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Unidad</label><input value={formEdit.unidad} onChange={e=>setFormEdit({...formEdit,unidad:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                                </div>
                                <div className="flex gap-3 mt-3">
                                  <button onClick={()=>guardarEdicion(p.id)} disabled={guardando} className="flex items-center gap-1 text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"><Save size={14}/> {guardando?'Guardando...':'Guardar'}</button>
                                  <button onClick={()=>setEditandoProducto(null)} className="flex items-center gap-1 text-sm border border-gray-200 px-4 py-2 rounded-lg text-brand-gray-mid"><X size={14}/> Cancelar</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
