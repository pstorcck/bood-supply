"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, LogOut, ShoppingCart, X, Minus, Plus, Upload, Search } from 'lucide-react'

const CATEGORIAS = ['Todas', 'Vasos Desechables', 'Platos Desechables', 'Cubiertos', 'Bolsas y Contenedores', 'Servilletas', 'Papel para Baño', 'Papel', 'Palillos', 'Grocery', 'Químicos y Limpieza']
const METODOS_PAGO = ['Efectivo', 'ACH', 'Tarjeta de crédito', 'Cheque']
const FUEL_SURCHARGE = 5.00

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aprobado, setAprobado] = useState<boolean | null>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [categoria, setCategoria] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState<any[]>([])
  const [showCarrito, setShowCarrito] = useState(false)
  const [tab, setTab] = useState<'catalogo' | 'pedidos'>('catalogo')
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [metodoPago, setMetodoPago] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [productoModal, setProductoModal] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/es/login'; return }
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!prof) { setAprobado(false); setLoading(false); return }
      setProfile(prof)
      const estaAprobado = prof.aprobado === true
      setAprobado(estaAprobado)
      if (estaAprobado) {
        const { data: prods } = await supabase.from('productos').select('*').eq('activo', true).order('categoria')
        setProductos(prods || [])
        const { data: peds } = await supabase.from('pedidos').select('*, pedido_items(*, productos(*))').eq('cliente_id', user.id).order('created_at', { ascending: false })
        setPedidos(peds || [])
      }
      setLoading(false)
    }
    init()
  }, [])

  function agregarAlCarrito(producto: any) {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id)
      if (existe) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id: string, delta: number) {
    setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i))
  }

  function quitarDelCarrito(id: string) {
    setCarrito(prev => prev.filter(i => i.id !== id))
  }

  const subtotal = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const total = subtotal + (carrito.length > 0 ? FUEL_SURCHARGE : 0)
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0)

  const productosFiltrados = productos.filter(p => {
    const matchCat = categoria === 'Todas' || p.categoria === categoria
    const matchBusqueda = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchBusqueda
  })

  const requiereComprobante = metodoPago && metodoPago !== 'Efectivo'

  async function enviarPedido() {
    if (carrito.length === 0) return
    if (!metodoPago) return alert('Selecciona un método de pago')
    if (requiereComprobante && !comprobante) return alert('Debes adjuntar el comprobante de pago')
    setEnviando(true)

    let comprobante_url = null
    if (comprobante && user) {
      const ext = comprobante.name.split('.').pop()
      const path = `comprobantes/${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('documentos').upload(path, comprobante, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
        comprobante_url = urlData.publicUrl
      }
    }

    const { data: pedido } = await supabase.from('pedidos').insert({
      cliente_id: user.id, total, fuel_surcharge: FUEL_SURCHARGE,
      metodo_pago: metodoPago, comprobante_url, estado: 'pendiente'
    }).select().single()

    if (pedido) {
      await supabase.from('pedido_items').insert(carrito.map(i => ({ pedido_id: pedido.id, producto_id: i.id, cantidad: i.cantidad, precio_unitario: i.precio })))

      // Notificar admin
      try {
        await fetch('/api/notificar-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'pedido_nuevo',
            datos: {
              pedido_id: pedido.id.slice(0,8).toUpperCase(),
              cliente_nombre: profile?.nombre,
              cliente_email: user.email,
              negocio: profile?.negocio,
              telefono: profile?.telefono,
              metodo_pago: metodoPago,
              total: total.toFixed(2),
              items: carrito.map(i => ({ nombre: i.nombre, cantidad: i.cantidad, subtotal: (i.precio * i.cantidad).toFixed(2) }))
            }
          })
        })
      } catch (e) { console.error('Notif error:', e) }

      const { data: peds } = await supabase.from('pedidos').select('*, pedido_items(*, productos(*))').eq('cliente_id', user.id).order('created_at', { ascending: false })
      setPedidos(peds || [])
      setCarrito([])
      setMetodoPago('')
      setComprobante(null)
      setShowCarrito(false)
      setPedidoEnviado(true)
      setTimeout(() => setPedidoEnviado(false), 4000)
    }
    setEnviando(false)
  }

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

  if (aprobado === false) return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⏳</div>
        <h2 className="font-heading text-2xl font-bold text-brand-navy mb-2">Cuenta en revisión</h2>
        <p className="text-brand-gray-mid mb-2">Tu cuenta está siendo revisada por nuestro equipo.</p>
        <p className="text-brand-gray-mid text-sm">Te enviaremos un correo a <strong>{user?.email}</strong> cuando sea aprobada.</p>
        <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="mt-6 text-sm text-brand-gray-mid hover:text-brand-orange transition-colors block mx-auto">Cerrar Sesión</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray-light">
      {pedidoEnviado && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium">
          ¡Pedido enviado! Te contactaremos pronto. ✓
        </div>
      )}

      {productoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setProductoModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative" onClick={e => e.stopPropagation()}>
            {productoModal.imagen_url ? (
              <img src={productoModal.imagen_url} alt={productoModal.nombre} className="w-full h-64 object-contain bg-gray-50" />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-6xl">📦</div>
            )}
            <div className="p-6">
              <div className="text-xs text-brand-orange font-semibold uppercase tracking-wide mb-1">{productoModal.categoria}</div>
              <h2 className="font-heading font-bold text-brand-navy text-2xl mb-2">{productoModal.nombre}</h2>
              <p className="text-brand-gray-mid mb-1">{productoModal.descripcion}</p>
              <p className="text-sm text-gray-400 mb-4">{productoModal.unidad}</p>
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-3xl text-brand-navy">${productoModal.precio}</span>
                <button onClick={() => { agregarAlCarrito(productoModal); setProductoModal(null) }} className="btn-primary flex items-center gap-2">
                  <Plus size={16} /> Agregar al carrito
                </button>
              </div>
            </div>
            <button onClick={() => setProductoModal(null)} className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <span className="font-heading font-bold text-xl text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></span>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowCarrito(true)} className="relative flex items-center gap-2 text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors">
            <ShoppingCart size={22} />
            {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{totalItems}</span>}
          </button>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="flex items-center gap-2 text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-brand-navy">Bienvenido, {profile?.nombre || user?.email}</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">{profile?.negocio}</p>
        </div>
        <div className="flex gap-3 mb-8">
          <button onClick={() => setTab('catalogo')} className={`font-heading font-semibold px-6 py-2.5 rounded-button transition-all ${tab === 'catalogo' ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy border border-gray-200'}`}>Catálogo</button>
          <button onClick={() => setTab('pedidos')} className={`font-heading font-semibold px-6 py-2.5 rounded-button transition-all flex items-center gap-2 ${tab === 'pedidos' ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy border border-gray-200'}`}>
            Mis Pedidos
            {pedidos.length > 0 && <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${tab === 'pedidos' ? 'bg-white text-brand-navy' : 'bg-brand-orange text-white'}`}>{pedidos.length}</span>}
          </button>
        </div>

        {tab === 'catalogo' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-mid" />
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar productos..." className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mb-6">
              {CATEGORIAS.map(cat => (
                <button key={cat} onClick={() => setCategoria(cat)} className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all ${categoria === cat ? 'bg-brand-orange text-white' : 'bg-white text-brand-gray-dark border border-gray-200 hover:border-brand-orange'}`}>{cat}</button>
              ))}
            </div>
            {productosFiltrados.length === 0 && (
              <div className="text-center py-12 text-brand-gray-mid">
                <Search size={40} className="mx-auto mb-3 opacity-25" />
                <p>No se encontraron productos</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productosFiltrados.map(p => {
                const enCarrito = carrito.find(i => i.id === p.id)
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow overflow-hidden">
                    <div className="cursor-pointer" onClick={() => setProductoModal(p)}>
                      {p.imagen_url ? (
                        <img src={p.imagen_url} alt={p.nombre} className="w-full h-36 object-contain bg-gray-50 hover:opacity-90 transition-opacity" />
                      ) : (
                        <div className="w-full h-36 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="text-xs text-brand-orange font-semibold mb-1 uppercase tracking-wide">{p.categoria}</div>
                      <h3 className="font-heading font-bold text-brand-navy text-base mb-1 cursor-pointer hover:text-brand-orange transition-colors" onClick={() => setProductoModal(p)}>{p.nombre}</h3>
                      <p className="text-brand-gray-mid text-xs mb-1 flex-1">{p.descripcion}</p>
                      <p className="text-xs text-gray-400 mb-3">{p.unidad}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-heading font-bold text-xl text-brand-navy">${p.precio}</span>
                        {enCarrito ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => cambiarCantidad(p.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50"><Minus size={12} /></button>
                            <span className="font-bold text-sm w-5 text-center">{enCarrito.cantidad}</span>
                            <button onClick={() => cambiarCantidad(p.id, 1)} className="w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center"><Plus size={12} /></button>
                          </div>
                        ) : (
                          <button onClick={() => agregarAlCarrito(p)} className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1">
                            <Plus size={14} /> Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {tab === 'pedidos' && (
          <div>
            {pedidos.length === 0 ? (
              <div className="card text-center py-16 text-brand-gray-mid">
                <ShoppingBag size={44} className="mx-auto mb-3 opacity-25" />
                <p className="font-heading font-semibold text-lg">No tienes pedidos aún</p>
                <button onClick={() => setTab('catalogo')} className="btn-primary mt-6 inline-flex">Ver Catálogo</button>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map(ped => (
                  <div key={ped.id} className="card">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div>
                        <p className="font-heading font-bold text-brand-navy">Pedido #{ped.id.slice(0,8).toUpperCase()}</p>
                        <p className="text-sm text-brand-gray-mid">{new Date(ped.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        {ped.metodo_pago && <p className="text-xs text-brand-gray-mid mt-0.5">Pago: {ped.metodo_pago}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${ped.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : ped.estado === 'entregado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {ped.estado.charAt(0).toUpperCase() + ped.estado.slice(1)}
                        </span>
                        <p className="font-heading font-bold text-brand-orange text-lg mt-1">${ped.total?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="border-t pt-3 space-y-1">
                      {ped.pedido_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-brand-gray-dark">{item.productos?.nombre} <span className="text-brand-gray-mid">x{item.cantidad}</span></span>
                          <span className="font-medium">${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                      {ped.fuel_surcharge > 0 && (
                        <div className="flex justify-between text-sm text-brand-gray-mid border-t pt-1 mt-1">
                          <span>Fuel Surcharge</span>
                          <span>${ped.fuel_surcharge?.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    {ped.comprobante_url && (
                      <div className="mt-3 pt-3 border-t">
                        <a href={ped.comprobante_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium">
                          📄 Ver comprobante de pago
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCarrito && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowCarrito(false)} />
          <div className="w-full max-w-md bg-white flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-heading font-bold text-xl text-brand-navy">Tu Pedido</h2>
              <button onClick={() => setShowCarrito(false)}><X size={22} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {carrito.length === 0 ? (
                <div className="text-center py-16 text-brand-gray-mid">
                  <ShoppingCart size={44} className="mx-auto mb-3 opacity-25" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  {carrito.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-brand-navy text-sm">{item.nombre}</p>
                        <p className="text-brand-gray-mid text-xs">{item.unidad}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => cambiarCantidad(item.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><Minus size={12} /></button>
                        <span className="font-bold text-sm w-5 text-center">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.id, 1)} className="w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center"><Plus size={12} /></button>
                      </div>
                      <div className="text-right min-w-16">
                        <p className="font-bold text-sm">${(item.precio * item.cantidad).toFixed(2)}</p>
                        <button onClick={() => quitarDelCarrito(item.id)} className="text-red-400 text-xs hover:text-red-600">Quitar</button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm text-brand-gray-mid">
                      <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-brand-gray-mid">
                      <span>Fuel Surcharge</span><span>${FUEL_SURCHARGE.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-gray-dark mb-2">Método de Pago *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {METODOS_PAGO.map(m => (
                          <button key={m} onClick={() => setMetodoPago(m)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${metodoPago === m ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-brand-gray-dark border-gray-200 hover:border-brand-navy'}`}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    {requiereComprobante && (
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-dark mb-2">Comprobante de Pago * <span className="text-brand-gray-mid font-normal">(PDF o imagen)</span></label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-brand-orange transition-colors">
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setComprobante(e.target.files?.[0] || null)} className="w-full text-sm text-brand-gray-mid file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-orange file:text-white cursor-pointer" />
                          {comprobante && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Upload size={10} /> {comprobante.name}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {carrito.length > 0 && (
              <div className="px-6 py-5 border-t bg-gray-50">
                <div className="flex justify-between mb-4">
                  <span className="font-heading font-bold text-brand-navy text-lg">Total</span>
                  <span className="font-heading font-bold text-2xl text-brand-orange">${total.toFixed(2)}</span>
                </div>
                <button onClick={enviarPedido} disabled={enviando} className="btn-primary w-full py-3 text-base">
                  {enviando ? 'Enviando...' : 'Enviar Pedido'}
                </button>
                <p className="text-xs text-center text-brand-gray-mid mt-3">Te contactaremos para confirmar la entrega</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}