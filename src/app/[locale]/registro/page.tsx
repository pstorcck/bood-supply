"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, LogOut, ShoppingCart, X, Minus, Plus } from 'lucide-react'

const CATEGORIAS = ['Todas', 'Vasos Desechables', 'Platos Desechables', 'Cubiertos', 'Bolsas y Contenedores', 'Servilletas', 'Papel para Baño', 'Papel', 'Palillos']

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [categoria, setCategoria] = useState('Todas')
  const [carrito, setCarrito] = useState<any[]>([])
  const [showCarrito, setShowCarrito] = useState(false)
  const [tab, setTab] = useState<'catalogo' | 'pedidos'>('catalogo')
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/es/login'; return }
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      if (prof?.aprobado) {
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

  const total = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0)
  const productosFiltrados = categoria === 'Todas' ? productos : productos.filter(p => p.categoria === categoria)

  async function enviarPedido() {
    if (carrito.length === 0) return
    const { data: pedido } = await supabase.from('pedidos').insert({ cliente_id: user.id, total, estado: 'pendiente' }).select().single()
    if (pedido) {
      await supabase.from('pedido_items').insert(carrito.map(i => ({ pedido_id: pedido.id, producto_id: i.id, cantidad: i.cantidad, precio_unitario: i.precio })))
      const { data: peds } = await supabase.from('pedidos').select('*, pedido_items(*, productos(*))').eq('cliente_id', user.id).order('created_at', { ascending: false })
      setPedidos(peds || [])
      setCarrito([])
      setShowCarrito(false)
      setPedidoEnviado(true)
      setTimeout(() => setPedidoEnviado(false), 4000)
    }
  }

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

  if (!profile?.aprobado) return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⏳</div>
        <h2 className="font-heading text-2xl font-bold text-brand-navy mb-2">Cuenta en revisión</h2>
        <p className="text-brand-gray-mid mb-2">Tu cuenta está siendo revisada por nuestro equipo.</p>
        <p className="text-brand-gray-mid text-sm">Te enviaremos un correo a <strong>{user?.email}</strong> cuando sea aprobada.</p>
        <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="mt-6 text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">Cerrar Sesión</button>
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
            <div className="flex gap-2 flex-wrap mb-6">
              {CATEGORIAS.map(cat => (
                <button key={cat} onClick={() => setCategoria(cat)} className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all ${categoria === cat ? 'bg-brand-orange text-white' : 'bg-white text-brand-gray-dark border border-gray-200 hover:border-brand-orange'}`}>{cat}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productosFiltrados.map(p => {
                const enCarrito = carrito.find(i => i.id === p.id)
                return (
                  <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                    <div className="text-xs text-brand-orange font-semibold mb-1 uppercase tracking-wide">{p.categoria}</div>
                    <h3 className="font-heading font-bold text-brand-navy text-base mb-1">{p.nombre}</h3>
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
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-heading font-bold text-brand-navy">Pedido #{ped.id.slice(0,8).toUpperCase()}</p>
                        <p className="text-sm text-brand-gray-mid">{new Date(ped.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                    </div>
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
              ) : carrito.map(item => (
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
            </div>
            {carrito.length > 0 && (
              <div className="px-6 py-5 border-t bg-gray-50">
                <div className="flex justify-between mb-4">
                  <span className="font-heading font-bold text-brand-navy text-lg">Total</span>
                  <span className="font-heading font-bold text-2xl text-brand-orange">${total.toFixed(2)}</span>
                </div>
                <button onClick={enviarPedido} className="btn-primary w-full py-3 text-base">Enviar Pedido</button>
                <p className="text-xs text-center text-brand-gray-mid mt-3">Te contactaremos para confirmar la entrega</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}