"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, LogOut, Package, ShoppingBag, Users, Search, X, UserPlus, Receipt, Eye, AlertTriangle, Menu} from 'lucide-react'

export default function VendedorPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tab, setTab] = useState<'nuevo_pedido' | 'mis_pedidos' | 'clientes' | 'invoices'>('nuevo_pedido')
  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [generandoInvoice, setGenerandoInvoice] = useState<string | null>(null)
  const [showNuevoPedido, setShowNuevoPedido] = useState(false)
  const [npCliente, setNpCliente] = useState('')
  const [npItems, setNpItems] = useState<{producto_id:string,nombre:string,precio:number,costo:number,cantidad:number,stock:number}[]>([])
  const [npExtras, setNpExtras] = useState<{nombre:string,precio:number,cantidad:number}[]>([])
  const [npFuel, setNpFuel] = useState(5)
  const [npMetodo, setNpMetodo] = useState('Efectivo')
  const [npCreando, setNpCreando] = useState(false)
  const [npBusqueda, setNpBusqueda] = useState('')
  const [npHistorial, setNpHistorial] = useState<any[]>([])
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

  async function crearPedidoVendedor() {
    if (!npCliente) { alert('Selecciona un cliente'); return }
    if (npItems.length === 0 && npExtras.length === 0) { alert('Agrega al menos un producto'); return }
    setNpCreando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const itemsSubtotal = npItems.reduce((s, i) => s + i.precio * i.cantidad, 0)
      const extrasSubtotal = npExtras.reduce((s, i) => s + i.precio * i.cantidad, 0)
      const total = itemsSubtotal + extrasSubtotal + npFuel
      const resPedido = await fetch('/api/crear-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: npCliente, total, fuel_surcharge: npFuel, metodo_pago: npMetodo, items: npItems, extras: npExtras })
      })
      const { pedido, error: pedidoError } = await resPedido.json()
      if (pedidoError || !pedido) { alert('Error: ' + (pedidoError || 'Error creando pedido')); setNpCreando(false); return }
      await fetch('/api/crear-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido_id: pedido.id, cliente_id: npCliente, creado_por: user?.id || null, fuel_override: npFuel })
      })
      await cargarPedidos()
      await cargarInvoices()
      setShowNuevoPedido(false)
      setNpCliente(''); setNpItems([]); setNpExtras([]); setNpFuel(5); setNpMetodo('Efectivo')
      setTab('mis_pedidos')
    } catch(e: any) { alert('Error: ' + e.message) }
    setNpCreando(false)
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
    // Bloquear si stock es 0
    if ((producto.stock ?? -1) === 0) return
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id)
      if (existe) {
        // No permitir agregar más del stock disponible
        if (producto.stock !== null && producto.stock !== undefined && existe.cantidad >= producto.stock) return prev
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id: string, cantidad: number) {
    if (cantidad <= 0) return setCarrito(prev => prev.filter(i => i.id !== id))
    const producto = productos.find(p => p.id === id)
    // No permitir más del stock disponible
    if (producto?.stock !== null && producto?.stock !== undefined && cantidad > producto.stock) return
    setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i))
  }

  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const taxQuimicos = carrito.filter(i => i.categoria === CAT_QUIMICOS).reduce((sum, i) => sum + i.precio * i.cantidad * TAX_RATE, 0)
  const total = subtotal + taxQuimicos + FUEL_SURCHARGE

  async function enviarPedido() {
    if (!clienteSeleccionado) return alert('Selecciona un cliente')
    if (carrito.length === 0) return alert('Agrega productos al carrito')

    // Validar stock antes de enviar
    const sinStock = carrito.filter(item => (item.stock ?? -1) === 0)
    if (sinStock.length > 0) {
      return alert(`Sin stock: ${sinStock.map(i => i.nombre).join(', ')}. Retíralos del carrito antes de enviar.`)
    }

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

  // Productos con stock 0 en el carrito
  const itemsSinStock = carrito.filter(i => (i.stock ?? -1) === 0)

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

  return (
    <div className="min-h-screen flex bg-[#F0F2F5]">
      {pedidoEnviado && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium">Pedido enviado correctamente</div>}

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen?'w-56':'w-0'} min-h-screen bg-[#0A1F3D] flex flex-col fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 overflow-hidden`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center flex-shrink-0">
              <Package size={16} className="text-white"/>
            </div>
            <div>
              {sidebarOpen && <><div className="font-heading font-bold text-white text-sm tracking-wide">BOOD <span className="text-brand-orange">SUPPLY</span></div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Distribution Platform</div></>}
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="text-[9px] text-white/30 uppercase tracking-widest px-2 mb-2">Menu</div>
          {[
            {key:'nuevo_pedido',label:'Nuevo Pedido',icon:Plus},
            {key:'mis_pedidos',label:'Pedidos',icon:ShoppingBag},
            {key:'invoices',label:'Invoices',icon:Receipt},
            {key:'clientes',label:'Clientes',icon:Users},
          ].map(({key,label,icon:Icon})=>(
            <button key={key} onClick={()=>setTab(key as any)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 transition-all text-left ${tab===key?'bg-brand-orange text-white':'text-white/60 hover:bg-white/6 hover:text-white'}`}>
              <Icon size={15}/><span className="text-[13px] font-medium">{label}</span>
            </button>
          ))}
          <a href="/es/lista-precios" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 transition-all text-left text-white/60 hover:bg-white/6 hover:text-white">
            <Package size={15}/><span className="text-[13px] font-medium">Lista de Precios</span>
          </a>
        </nav>
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(user?.email||'V')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[12px] font-medium truncate">{user?.email?.split('@')[0]}</div>
            <div className="text-white/35 text-[10px]">Vendedor</div>
          </div>
          <button onClick={()=>{supabase.auth.signOut();window.location.href='/es'}} className="text-white/25 hover:text-white/70 transition-colors"><LogOut size={14}/></button>
        </div>
      </aside>

      {/* MAIN */}
      <div className={`flex-1 ${sidebarOpen?'ml-56':'ml-0'} min-h-screen flex flex-col transition-all duration-300`}>
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <button onClick={()=>setSidebarOpen(o=>!o)} className="flex flex-col gap-1.5 mr-4 group">
            <span className="block w-5 h-0.5 bg-brand-navy group-hover:bg-brand-orange transition-colors"></span>
            <span className="block w-5 h-0.5 bg-brand-navy group-hover:bg-brand-orange transition-colors"></span>
            <span className="block w-5 h-0.5 bg-brand-navy group-hover:bg-brand-orange transition-colors"></span>
          </button>
          <h1 className="font-heading font-bold text-brand-navy text-lg capitalize">{tab.replace('_',' ')}</h1>
          <button onClick={()=>setShowNuevoPedido(true)} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-orange/90">
            <ShoppingBag size={16}/> Nuevo Pedido
          </button>
        </header>
        <div className="flex-1 p-6">

        {/* NUEVO PEDIDO */}

        {tab === 'nuevo_pedido' && (
          <div className="max-w-2xl mx-auto">
            <div className="card space-y-4">
              <h2 className="font-heading font-bold text-brand-navy text-xl">🛒 Nuevo Pedido</h2>

              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">Cliente *</label>
                <select value={npCliente} onChange={async e=>{
                  setNpCliente(e.target.value)
                  if (e.target.value) {
                    const res = await fetch('/api/historial-cliente?cliente_id=' + e.target.value)
                    const { items } = await res.json()
                    setNpHistorial(items || [])
                  } else { setNpHistorial([]) }
                }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange">
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(cl=><option key={cl.id} value={cl.id}>{cl.negocio||cl.nombre} — {cl.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">Método de Pago</label>
                <select value={npMetodo} onChange={e=>setNpMetodo(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange">
                  {['Efectivo','Cheque','Zelle','Tarjeta de crédito'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {npHistorial.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-brand-navy mb-1">📋 Últimos productos de este cliente</p>
                  <div className="flex flex-wrap gap-1">
                    {npHistorial.map((item:any,i:number)=>(
                      <button key={i} onClick={()=>{
                        const prod = productos.find(p=>p.id===item.producto_id)
                        if(prod && !npItems.find(x=>x.producto_id===prod.id)) setNpItems(prev=>[...prev,{producto_id:prod.id,nombre:prod.nombre,precio:prod.precio,costo:prod.costo||0,cantidad:1,stock:prod.stock??0}])
                        else if(!item.producto_id && item.descripcion && !npExtras.find(x=>x.nombre===item.descripcion)) setNpExtras(prev=>[...prev,{nombre:item.descripcion,precio:item.precio_unitario||0,cantidad:1}])
                      }} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg">
                        {item.productos?.nombre||item.descripcion||'—'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-brand-navy mb-1 block">Productos del catálogo</label>
                <input type="text" placeholder="🔍 Buscar producto..." value={npBusqueda} onChange={e=>setNpBusqueda(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-orange w-full mb-1"/>
                {npBusqueda && (
                  <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto mb-2">
                    {productos.filter(p=>p.activo!==false && p.nombre.toLowerCase().includes(npBusqueda.toLowerCase())).slice(0,10).map(p=>(
                      <div key={p.id} onClick={()=>{
                        if(!npItems.find(i=>i.producto_id===p.id)) setNpItems(prev=>[...prev,{producto_id:p.id,nombre:p.nombre,precio:p.precio,costo:p.costo||0,cantidad:1,stock:p.stock??0}])
                        setNpBusqueda('')
                      }} className="px-3 py-2 text-xs hover:bg-brand-orange/10 cursor-pointer flex justify-between items-center border-b last:border-0">
                        <span>{p.nombre}</span><span className="text-brand-orange font-semibold ml-2">${p.precio}</span>
                      </div>
                    ))}
                    {productos.filter(p=>p.activo!==false && p.nombre.toLowerCase().includes(npBusqueda.toLowerCase())).length===0 && <div className="px-3 py-2 text-xs text-brand-gray-mid">Sin resultados</div>}
                  </div>
                )}
                {npItems.length > 0 && (
                  <div className="space-y-1 border border-gray-100 rounded-xl p-2 mt-1">
                    {npItems.map((item,i)=>(
                      <div key={item.producto_id} className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="flex-1 text-brand-gray-dark">{item.nombre}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-brand-gray-mid">$</span>
                          <input type="number" step="0.01" min={item.costo||0} value={item.precio}
                            onChange={e=>{const v=parseFloat(e.target.value)||0; if(v>=(item.costo||0)) setNpItems(prev=>prev.map((x,j)=>j===i?{...x,precio:v}:x))}}
                            className="w-20 border border-gray-200 rounded-lg px-2 py-0.5 text-xs text-right"/>
                          {item.costo>0&&<span className="text-xs text-brand-gray-mid">min ${item.costo.toFixed(2)}</span>}
                        </div>
                        <input type="number" min={1} value={item.cantidad} onChange={e=>setNpItems(prev=>prev.map((x,j)=>j===i?{...x,cantidad:parseInt(e.target.value)||1}:x))} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"/>
                        <span className="text-xs font-semibold text-brand-orange">${(item.precio*item.cantidad).toFixed(2)}</span>
                        <button onClick={()=>setNpItems(prev=>prev.filter((_,j)=>j!==i))} className="text-red-400 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-brand-navy">Extras</label>
                  <button onClick={()=>setNpExtras(prev=>[...prev,{nombre:'',precio:0,cantidad:1}])} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg">+ Agregar extra</button>
                </div>
                {npExtras.map((ex,i)=>(
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input placeholder="Descripción" value={ex.nombre} onChange={e=>setNpExtras(prev=>prev.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"/>
                    <span className="text-xs">$</span>
                    <input type="number" placeholder="0.00" value={ex.precio||''} onChange={e=>setNpExtras(prev=>prev.map((x,j)=>j===i?{...x,precio:parseFloat(e.target.value)||0}:x))} className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs"/>
                    <input type="number" min={1} value={ex.cantidad} onChange={e=>setNpExtras(prev=>prev.map((x,j)=>j===i?{...x,cantidad:parseInt(e.target.value)||1}:x))} className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"/>
                    <button onClick={()=>setNpExtras(prev=>prev.filter((_,j)=>j!==i))} className="text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-brand-navy">Fuel Surcharge $</label>
                <input type="number" step="0.01" min={0} value={npFuel} onChange={e=>setNpFuel(parseFloat(e.target.value)||0)} className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm"/>
              </div>

              <div className="bg-brand-navy/5 rounded-xl p-3 text-sm">
                <div className="flex justify-between"><span className="text-brand-gray-mid">Productos</span><span>${(npItems.reduce((s,i)=>s+i.precio*i.cantidad,0)+npExtras.reduce((s,i)=>s+i.precio*i.cantidad,0)).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-brand-gray-mid">Fuel</span><span>${npFuel.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-brand-navy border-t pt-1 mt-1"><span>Total</span><span>${(npItems.reduce((s,i)=>s+i.precio*i.cantidad,0)+npExtras.reduce((s,i)=>s+i.precio*i.cantidad,0)+npFuel).toFixed(2)}</span></div>
              </div>

              <button onClick={crearPedidoVendedor} disabled={npCreando} className="w-full bg-brand-orange text-white py-3 rounded-xl text-base font-bold disabled:opacity-50 hover:bg-brand-orange/90">
                {npCreando ? 'Creando...' : '✅ Crear Pedido y Generar Invoice'}
              </button>
            </div>
          </div>
        )}

        {/* PEDIDOS */}
}
        {tab === 'mis_pedidos' && (
          <div className="space-y-3">
            <h2 className="font-heading font-bold text-brand-navy text-xl mb-4">Pedidos - {pedidos.length}</h2>
            {pedidos.length === 0 && <div className="card text-center py-12 text-brand-gray-mid"><ShoppingBag size={40} className="mx-auto mb-3 opacity-25"/><p>No hay pedidos aun</p></div>}
            {pedidos.map(ped => {
              const cliente = clientes.find(c => c.id === ped.cliente_id)
              const invoiceExistente = invoices.find(inv => inv.pedido_id === ped.id)
              return (
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
                      {invoiceExistente && (
                        <a href={`/es/invoice/${invoiceExistente.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">
                          <Eye size={13}/> Ver
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-1">
                    {ped.pedido_items?.map((item:any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-brand-gray-dark">{item.productos?.nombre} <span className="text-brand-gray-mid">x{item.cantidad}</span></span>
                        <span className="font-medium text-brand-navy">${(item.precio_unitario*item.cantidad).toFixed(2)}</span>
                      </div>
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
            {invoices.length === 0 ? (
              <div className="card text-center py-12 text-brand-gray-mid"><Receipt size={40} className="mx-auto mb-3 opacity-25"/><p>No hay invoices generados</p></div>
            ) : (
              <div className="space-y-3">
                {invoices.map(inv => {
                  const cliente = clientes.find(c => c.id === inv.cliente_id)
                  return (
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
            {showFormCliente && (
              <div className="card border-2 border-brand-orange/30 mb-4">
                <h3 className="font-heading font-bold text-brand-navy text-lg mb-4">Nuevo Cliente</h3>
                {errorCliente && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{errorCliente}</div>}
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
            {clientes.map(c => (
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
      
      {showNuevoPedido && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)setShowNuevoPedido(false)}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-brand-navy text-xl">🛒 Nuevo Pedido</h2>
              <button onClick={()=>setShowNuevoPedido(false)} className="text-brand-gray-mid hover:text-brand-navy text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">Cliente *</label>
                <select value={npCliente} onChange={async e=>{
                  setNpCliente(e.target.value)
                  if (e.target.value) {
                    const res = await fetch('/api/historial-cliente?cliente_id=' + e.target.value)
                    const { items } = await res.json()
                    setNpHistorial(items || [])
                  }
                }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange">
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.negocio||c.nombre} — {c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">Método de Pago</label>
                <select value={npMetodo} onChange={e=>setNpMetodo(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange">
                  {['Efectivo','Cheque','Zelle','Tarjeta de crédito'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {npHistorial.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-brand-navy mb-1">📋 Últimos productos de este cliente</p>
                  <div className="flex flex-wrap gap-1">
                    {npHistorial.map((item:any,i:number)=>(
                      <button key={i} onClick={()=>{
                        const prod = productos.find(p=>p.id===item.producto_id)
                        if(prod && !npItems.find(x=>x.producto_id===prod.id)) setNpItems(prev=>[...prev,{producto_id:prod.id,nombre:prod.nombre,precio:prod.precio,costo:prod.costo||0,cantidad:1,stock:prod.stock??0}])
                        else if(!item.producto_id && item.descripcion && !npExtras.find(x=>x.nombre===item.descripcion)) setNpExtras(prev=>[...prev,{nombre:item.descripcion,precio:item.precio_unitario||0,cantidad:1}])
                      }} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg">
                        {item.productos?.nombre||item.descripcion||'—'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-brand-navy">Productos del catálogo</label>
                </div>
                <input type="text" placeholder="🔍 Buscar producto..." value={npBusqueda} onChange={e=>setNpBusqueda(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-orange w-full mb-1"/>
                {npBusqueda && (
                  <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto mb-2">
                    {productos.filter(p=>p.activo!==false && p.nombre.toLowerCase().includes(npBusqueda.toLowerCase())).slice(0,10).map(p=>(
                      <div key={p.id} onClick={()=>{
                        if(!npItems.find(i=>i.producto_id===p.id)) setNpItems(prev=>[...prev,{producto_id:p.id,nombre:p.nombre,precio:p.precio,costo:p.costo||0,cantidad:1,stock:p.stock??0}])
                        setNpBusqueda('')
                      }} className="px-3 py-1.5 text-xs hover:bg-brand-orange/10 cursor-pointer flex justify-between">
                        <span>{p.nombre}</span><span className="text-brand-orange font-semibold">${p.precio}</span>
                      </div>
                    ))}
                  </div>
                )}
                {npItems.length > 0 && (
                  <div className="space-y-1 border border-gray-100 rounded-xl p-2">
                    {npItems.map((item,i)=>(
                      <div key={item.producto_id} className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="flex-1 text-brand-gray-dark">{item.nombre}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-brand-gray-mid">$</span>
                          <input type="number" step="0.01" min={item.costo||0} value={item.precio}
                            onChange={e=>{const v=parseFloat(e.target.value)||0; if(v>=(item.costo||0)) setNpItems(prev=>prev.map((x,j)=>j===i?{...x,precio:v}:x))}}
                            className="w-20 border border-gray-200 rounded-lg px-2 py-0.5 text-xs text-right"/>
                          {item.costo>0&&<span className="text-xs text-brand-gray-mid">min ${item.costo.toFixed(2)}</span>}
                        </div>
                        <input type="number" min={1} value={item.cantidad} onChange={e=>setNpItems(prev=>prev.map((x,j)=>j===i?{...x,cantidad:parseInt(e.target.value)||1}:x))} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"/>
                        <span className="text-xs font-semibold text-brand-orange">${(item.precio*item.cantidad).toFixed(2)}</span>
                        <button onClick={()=>setNpItems(prev=>prev.filter((_,j)=>j!==i))} className="text-red-400 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-brand-navy">Extras</label>
                  <button onClick={()=>setNpExtras(prev=>[...prev,{nombre:'',precio:0,cantidad:1}])} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg">+ Agregar extra</button>
                </div>
                {npExtras.map((ex,i)=>(
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input placeholder="Descripción" value={ex.nombre} onChange={e=>setNpExtras(prev=>prev.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"/>
                    <span className="text-xs">$</span>
                    <input type="number" placeholder="0.00" value={ex.precio||''} onChange={e=>setNpExtras(prev=>prev.map((x,j)=>j===i?{...x,precio:parseFloat(e.target.value)||0}:x))} className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs"/>
                    <input type="number" min={1} value={ex.cantidad} onChange={e=>setNpExtras(prev=>prev.map((x,j)=>j===i?{...x,cantidad:parseInt(e.target.value)||1}:x))} className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"/>
                    <button onClick={()=>setNpExtras(prev=>prev.filter((_,j)=>j!==i))} className="text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-brand-navy">Fuel Surcharge $</label>
                <input type="number" step="0.01" min={0} value={npFuel} onChange={e=>setNpFuel(parseFloat(e.target.value)||0)} className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div className="bg-brand-navy/5 rounded-xl p-3 text-sm">
                <div className="flex justify-between"><span className="text-brand-gray-mid">Productos</span><span>${(npItems.reduce((s,i)=>s+i.precio*i.cantidad,0)+npExtras.reduce((s,i)=>s+i.precio*i.cantidad,0)).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-brand-gray-mid">Fuel</span><span>${npFuel.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-brand-navy border-t pt-1 mt-1"><span>Total</span><span>${(npItems.reduce((s,i)=>s+i.precio*i.cantidad,0)+npExtras.reduce((s,i)=>s+i.precio*i.cantidad,0)+npFuel).toFixed(2)}</span></div>
              </div>
              <button onClick={crearPedidoVendedor} disabled={npCreando} className="w-full bg-brand-orange text-white py-3 rounded-xl text-base font-bold disabled:opacity-50 hover:bg-brand-orange/90">
                {npCreando ? 'Creando...' : '✅ Crear Pedido y Generar Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}