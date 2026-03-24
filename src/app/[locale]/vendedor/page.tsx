"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, LogOut, Package, ShoppingBag, Users, Search, X, UserPlus, Receipt, Eye } from 'lucide-react'

export default function VendedorPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'nuevo_pedido' | 'mis_pedidos' | 'clientes' | 'invoices'>('nuevo_pedido')
  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [generandoInvoice, setGenerandoInvoice] = useState<string | null>(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const [carrito, setCarrito] = useState<any[]>([])
  const [metodoPago, setMetodoPago] = useState('Efectivo')
  const [enviando, setEnviando] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [showFormCliente, setShowFormCliente] = useState(false)
  const [formCliente, setFormCliente] = useState({ nombre: '', email: '', negocio: '', telefono: '', direccion: '', ein: '' })
  const [creandoCliente, setCreandoCliente] = useState(false)
  const [errorCliente, setErrorCliente] = useState('')
  const supabase = createClient()

  const FUEL_SURCHARGE = 5.00
  const TAX_RATE = 0.1025
  const CAT_QUIMICOS = 'Quimicos y Limpieza'

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/es/login'; return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'vendedor' && user.email !== 'boodsupplies@gmail.com') { window.location.href = '/es/login'; return }
      setUser(user)
      await Promise.all([cargarClientes(), cargarProductos(), cargarPedidos(), cargarInvoices()])
      setLoading(false)
    }
    init()
  }, [])

  async function cargarClientes() {
    const { data } = await supabase.from('profiles').select('*').eq('aprobado', true).order('nombre')
    setClientes(data || [])
  }

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').eq('activo', true).order('categoria').order('nombre')
    const prods = data || []
    setProductos(prods)
    const cats = [...new Set(prods.map((p: any) => p.categoria))].filter(Boolean) as string[]
    setCategorias(cats)
  }

  async function cargarPedidos() {
    const { data } = await supabase.from('pedidos').select('*, pedido_items(*, productos(*))').order('created_at', { ascending: false })
    setPedidos(data || [])
  }

  async function cargarInvoices() {
    const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false })
    setInvoices(data || [])
  }

  async function generarInvoice(ped: any) {
    setGenerandoInvoice(ped.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/crear-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido_id: ped.id, cliente_id: ped.cliente_id, creado_por: user?.id })
      })
      const data = await res.json()
      if (data.error) { alert('Error: ' + data.error); return }
      await cargarInvoices()
      window.open(`/es/invoice/${data.invoice.id}`, '_blank')
    } catch (e: any) { alert('Error: ' + e.message) }
    setGenerandoInvoice(null)
  }

  async function crearCliente() {
    if (!formCliente.nombre || !formCliente.email) return setErrorCliente('Nombre y email son requeridos')
    setCreandoCliente(true); setErrorCliente('')
    try {
      const res = await fetch('/api/crear-usuario', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCliente)
      })
      const data = await res.json()
      if (data.error) { setErrorCliente(data.error); setCreandoCliente(false); return }
      await cargarClientes()
      setFormCliente({ nombre: '', email: '', negocio: '', telefono: '', direccion: '', ein: '' })
      setShowFormCliente(false)
    } catch (e: any) { setErrorCliente(e.message) }
    setCreandoCliente(false)
  }

  function agregarAlCarrito(producto: any) {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id)
      if (existe) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id: string, cantidad: number) {
    if (cantidad <= 0) return setCarrito(prev => prev.filter(i => i.id !== id))
    setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i))
  }

  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const taxQuimicos = carrito.filter(i => i.categoria === CAT_QUIMICOS).reduce((sum, i) => sum + i.precio * i.cantidad * TAX_RATE, 0)
  const total = subtotal + taxQuimicos + FUEL_SURCHARGE

  async function enviarPedido() {
    if (!clienteSeleccionado) return alert('Selecciona un cliente')
    if (carrito.length === 0) return alert('Agrega productos al carrito')
    setEnviando(true)
    try {
      const { data: pedido, error } = await supabase.from('pedidos').insert({
        cliente_id: clienteSeleccionado.id,
        total: parseFloat(total.toFixed(2)),
        estado: 'pendiente',
        fuel_surcharge: FUEL_SURCHARGE,
        metodo_pago: metodoPago,
      }).select().single()
      if (error) throw error
      await supabase.from('pedido_items').insert(
        carrito.map(item => ({ pedido_id: pedido.id, producto_id: item.id, cantidad: item.cantidad, precio_unitario: item.precio }))
      )
      await fetch('/api/notificar-admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'pedido', clienteEmail: clienteSeleccionado.email, clienteNombre: clienteSeleccionado.nombre, total: total.toFixed(2) })
      })
      setCarrito([]); setClienteSeleccionado(null); setMetodoPago('Efectivo')
      setPedidoEnviado(true); setTimeout(() => setPedidoEnviado(false), 4000)
      await cargarPedidos()
      setTab('mis_pedidos')
    } catch (e: any) { alert('Error: ' + e.message) }
    setEnviando(false)
  }

  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaActiva === 'Todas' || p.categoria === categoriaActiva
    const matchBusq = !busquedaProducto || p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
    return matchCat && matchBusq
  })

  const clientesFiltrados = clientes.filter(c =>
    !busquedaCliente || c.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) || c.negocio?.toLowerCase().includes(busquedaCliente.toLowerCase()) || c.email?.toLowerCase().includes(busquedaCliente.toLowerCase())
  )

  const estadoColor: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    confirmado: 'bg-blue-100 text-blue-700',
    en_preparacion: 'bg-purple-100 text-purple-700',
    despachado: 'bg-orange-100 text-orange-700',
    entregado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

  return (
    <div className="min-h-screen bg-brand-gray-light">
      {pedidoEnviado && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium">Pedido enviado correctamente</div>}

      <nav className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3"><Package size={22} className="text-brand-orange"/><span className="font-heading font-bold text-lg">Vendedor - BOOD SUPPLY</span></div>
        <div className="flex items-center gap-4">
          <span className="text-blue-300 text-sm hidden md:block">{user?.email}</span>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white"><LogOut size={16}/> Salir</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 flex-wrap mb-8">
          {[{key:'nuevo_pedido',label:'Nuevo Pedido',icon:Plus},{key:'mis_pedidos',label:'Pedidos',icon:ShoppingBag},{key:'invoices',label:'Invoices',icon:Receipt},{key:'clientes',label:'Clientes',icon:Users}].map(({key,label,icon:Icon})=>(
            <button key={key} onClick={()=>setTab(key as any)} className={`font-heading font-semibold px-5 py-2.5 rounded-button transition-all flex items-center gap-2 ${tab===key?'bg-brand-navy text-white':'bg-white text-brand-navy border border-gray-200 hover:border-brand-navy'}`}>
              <Icon size={16}/> {label}
            </button>
          ))}
        </div>

        {/* NUEVO PEDIDO */}
        {tab === 'nuevo_pedido' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="card">
                <h2 className="font-heading font-bold text-brand-navy mb-3 flex items-center gap-2"><Users size={18}/> Cliente</h2>
                {clienteSeleccionado ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                    <div>
                      <p className="font-medium text-brand-navy">{clienteSeleccionado.nombre}</p>
                      <p className="text-xs text-brand-gray-mid">{clienteSeleccionado.negocio} · {clienteSeleccionado.email}</p>
                    </div>
                    <button onClick={()=>setClienteSeleccionado(null)} className="text-brand-gray-mid hover:text-red-400"><X size={18}/></button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-mid"/>
                      <input value={busquedaCliente} onChange={e=>setBusquedaCliente(e.target.value)} placeholder="Buscar cliente..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
                    </div>
                    <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl">
                      {clientesFiltrados.map(c=>(
                        <div key={c.id} onClick={()=>{setClienteSeleccionado(c);setBusquedaCliente('')}} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-orange-50 border-b last:border-0">
                          <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{(c.nombre||'?')[0].toUpperCase()}</div>
                          <div><p className="text-sm font-medium text-brand-navy">{c.nombre}</p><p className="text-xs text-brand-gray-mid">{c.negocio||c.email}</p></div>
                        </div>
                      ))}
                      {clientesFiltrados.length===0&&<div className="px-3 py-4 text-sm text-brand-gray-mid text-center">No se encontraron clientes</div>}
                    </div>
                  </div>
                )}
              </div>

              <div className="card">
                <h2 className="font-heading font-bold text-brand-navy mb-3 flex items-center gap-2"><Package size={18}/> Productos</h2>
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-mid"/>
                  <input value={busquedaProducto} onChange={e=>setBusquedaProducto(e.target.value)} placeholder="Buscar producto..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  {['Todas', ...categorias].map(cat=>(
                    <button key={cat} onClick={()=>setCategoriaActiva(cat)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${categoriaActiva===cat?'bg-brand-navy text-white':'bg-gray-100 text-brand-gray-dark hover:bg-gray-200'}`}>{cat}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {productosFiltrados.map(p=>{
                    const enCarrito = carrito.find(i=>i.id===p.id)
                    return(
                      <div key={p.id} onClick={()=>agregarAlCarrito(p)} className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all hover:border-brand-orange ${enCarrito?'border-brand-orange bg-orange-50':'border-gray-100 bg-white'}`}>
                        {p.imagen_url&&<img src={p.imagen_url} alt={p.nombre} className="w-full h-20 object-contain mb-2 rounded-lg"/>}
                        <p className="font-medium text-brand-navy text-xs leading-tight">{p.nombre}</p>
                        <p className="text-brand-orange font-bold text-sm mt-1">${p.precio}</p>
                        <p className="text-xs text-brand-gray-mid">{p.unidad}</p>
                        {enCarrito&&<div className="absolute top-2 right-2 bg-brand-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{enCarrito.cantidad}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="card h-fit sticky top-24">
              <h2 className="font-heading font-bold text-brand-navy mb-4 flex items-center gap-2"><ShoppingBag size={18}/> Carrito {carrito.length>0&&<span className="bg-brand-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{carrito.reduce((s,i)=>s+i.cantidad,0)}</span>}</h2>
              {carrito.length===0?(
                <div className="text-center py-8 text-brand-gray-mid"><ShoppingBag size={32} className="mx-auto mb-2 opacity-25"/><p className="text-sm">Carrito vacio</p></div>
              ):(
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {carrito.map(item=>(
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-brand-navy truncate">{item.nombre}</p><p className="text-xs text-brand-gray-mid">${item.precio} c/u</p></div>
                      <div className="flex items-center gap-1">
                        <button onClick={()=>cambiarCantidad(item.id,item.cantidad-1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-brand-navy flex items-center justify-center text-sm font-bold">-</button>
                        <span className="w-6 text-center text-sm font-medium">{item.cantidad}</span>
                        <button onClick={()=>cambiarCantidad(item.id,item.cantidad+1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-brand-navy flex items-center justify-center text-sm font-bold">+</button>
                      </div>
                      <span className="text-sm font-bold text-brand-navy w-14 text-right">${(item.precio*item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-3 space-y-1 text-sm mb-4">
                <div className="flex justify-between text-brand-gray-mid"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {taxQuimicos>0&&<div className="flex justify-between text-brand-gray-mid"><span>Tax Quimicos (10.25%)</span><span>${taxQuimicos.toFixed(2)}</span></div>}
                <div className="flex justify-between text-brand-gray-mid"><span>Fuel Surcharge</span><span>${FUEL_SURCHARGE.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-brand-navy text-base border-t pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-brand-gray-dark mb-1">Metodo de pago</label>
                <select value={metodoPago} onChange={e=>setMetodoPago(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white">
                  {['Efectivo','Zelle','Tarjeta de credito','Cheque'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button onClick={enviarPedido} disabled={enviando||carrito.length===0||!clienteSeleccionado} className="btn-primary w-full">{enviando?'Enviando...':'Enviar Pedido'}</button>
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {tab === 'mis_pedidos' && (
          <div className="space-y-3">
            <h2 className="font-heading font-bold text-brand-navy text-xl mb-4">Pedidos - {pedidos.length}</h2>
            {pedidos.length===0&&<div className="card text-center py-12 text-brand-gray-mid"><ShoppingBag size={40} className="mx-auto mb-3 opacity-25"/><p>No hay pedidos aun</p></div>}
            {pedidos.map(ped=>{
              const cliente = clientes.find(c=>c.id===ped.cliente_id)
              const invoiceExistente = invoices.find(inv=>inv.pedido_id===ped.id)
              return(
                <div key={ped.id} className="card">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <div>
                      <p className="font-heading font-bold text-brand-navy">#{ped.id.slice(0,8).toUpperCase()}</p>
                      <p className="text-xs text-brand-gray-mid">{new Date(ped.created_at).toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                      <p className="text-sm text-brand-gray-dark mt-1">{cliente?.nombre||'—'} · {cliente?.negocio||''}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-brand-orange text-lg">${ped.total?.toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${estadoColor[ped.estado]||'bg-gray-100 text-gray-600'}`}>{ped.estado.replace('_',' ')}</span>
                      <button onClick={()=>generarInvoice(ped)} disabled={generandoInvoice===ped.id} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${invoiceExistente?'bg-green-100 text-green-700 hover:bg-green-200':'bg-brand-navy text-white hover:bg-brand-navy/80'}`}>
                        <Receipt size={13}/> {generandoInvoice===ped.id?'Generando...':(invoiceExistente?invoiceExistente.numero:'Invoice')}
                      </button>
                      {invoiceExistente&&(
                        <a href={`/es/invoice/${invoiceExistente.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">
                          <Eye size={13}/> Ver
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-1">
                    {ped.pedido_items?.map((item:any)=>(
                      <div key={item.id} className="flex justify-between text-sm"><span className="text-brand-gray-dark">{item.productos?.nombre} <span className="text-brand-gray-mid">x{item.cantidad}</span></span><span className="font-medium text-brand-navy">${(item.precio_unitario*item.cantidad).toFixed(2)}</span></div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* INVOICES */}
        {tab === 'invoices' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-brand-navy text-xl">Invoices - {invoices.length}</h2>
              <a href="/es/invoice/nuevo" className="btn-primary flex items-center gap-2"><Receipt size={15}/> Nueva Invoice</a>
            </div>
            {invoices.length===0?(
              <div className="card text-center py-12 text-brand-gray-mid"><Receipt size={40} className="mx-auto mb-3 opacity-25"/><p>No hay invoices generados</p></div>
            ):(
              <div className="space-y-3">
                {invoices.map(inv=>{
                  const cliente = clientes.find(c=>c.id===inv.cliente_id)
                  return(
                    <div key={inv.id} className="card flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center flex-shrink-0"><Receipt size={18} className="text-brand-orange"/></div>
                        <div>
                          <p className="font-heading font-bold text-brand-navy">{inv.numero}</p>
                          <p className="text-xs text-brand-gray-mid">{cliente?.nombre||'—'} · {cliente?.negocio||'—'}</p>
                          <p className="text-xs text-brand-gray-mid">{new Date(inv.created_at).toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'})}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-heading font-bold text-brand-orange">${inv.total?.toFixed(2)}</p>
                          <p className="text-xs text-brand-gray-mid">{inv.metodo_pago}</p>
                        </div>
                        <a href={`/es/invoice/${inv.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy/80">
                          <Eye size={15}/> Ver Invoice
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* CLIENTES */}
        {tab === 'clientes' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading font-bold text-brand-navy text-xl">Clientes - {clientes.length}</h2>
              <button onClick={()=>setShowFormCliente(!showFormCliente)} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600"><UserPlus size={15}/> Nuevo Cliente</button>
            </div>

            {showFormCliente&&(
              <div className="card border-2 border-brand-orange/30 mb-4">
                <h3 className="font-heading font-bold text-brand-navy text-lg mb-4">Nuevo Cliente</h3>
                {errorCliente&&<div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{errorCliente}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Nombre *</label><input value={formCliente.nombre} onChange={e=>setFormCliente({...formCliente,nombre:e.target.value})} placeholder="Nombre completo" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Email *</label><input value={formCliente.email} onChange={e=>setFormCliente({...formCliente,email:e.target.value})} placeholder="correo@email.com" type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Negocio</label><input value={formCliente.negocio} onChange={e=>setFormCliente({...formCliente,negocio:e.target.value})} placeholder="Nombre del negocio" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Telefono</label><input value={formCliente.telefono} onChange={e=>setFormCliente({...formCliente,telefono:e.target.value})} placeholder="(312) 000-0000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">EIN</label><input value={formCliente.ein} onChange={e=>setFormCliente({...formCliente,ein:e.target.value})} placeholder="XX-XXXXXXX" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Direccion</label><input value={formCliente.direccion} onChange={e=>setFormCliente({...formCliente,direccion:e.target.value})} placeholder="Direccion" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={crearCliente} disabled={creandoCliente} className="btn-primary flex items-center gap-2"><UserPlus size={15}/> {creandoCliente?'Creando...':'Crear Cliente'}</button>
                  <button onClick={()=>setShowFormCliente(false)} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy">Cancelar</button>
                </div>
              </div>
            )}

            {clientes.map(c=>(
              <div key={c.id} className="card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{(c.nombre||'?')[0].toUpperCase()}</div>
                  <div className="flex-1">
                    <p className="font-heading font-bold text-brand-navy">{c.nombre||'—'}</p>
                    <p className="text-xs text-brand-gray-mid">{c.email} · {c.negocio||'—'}</p>
                    <p className="text-xs text-brand-gray-mid">📍 {c.direccion||'—'} · 📞 {c.telefono||'—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}