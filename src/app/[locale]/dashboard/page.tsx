"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Clock, CheckCircle, DollarSign, Plus, LogOut, ShoppingCart, X, Minus } from 'lucide-react'

const CATEGORIAS = ['Todas', 'Vasos Desechables', 'Platos Desechables', 'Cubiertos', 'Bolsas y Contenedores', 'Servilletas', 'Papel para Baño', 'Papel', 'Palillos']

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState<any[]>([])
  const [categoria, setCategoria] = useState('Todas')
  const [carrito, setCarrito] = useState<any[]>([])
  const [showCarrito, setShowCarrito] = useState(false)
  const [tab, setTab] = useState<'catalogo' | 'pedidos'>('catalogo')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/es/login'); return }
      setUser(user)
      const { data } = await supabase.from('productos').select('*').eq('activo', true).order('categoria')
      setProductos(data || [])
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
  const productosFiltrados = categoria === 'Todas' ? productos : productos.filter(p => p.categoria === categoria)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/es')
  }

  async function enviarPedido() {
    if (carrito.length === 0) return
    const { data: pedido } = await supabase.from('pedidos').insert({ cliente_id: user.id, total, estado: 'pendiente' }).select().single()
    if (pedido) {
      await supabase.from('pedido_items').insert(carrito.map(i => ({ pedido_id: pedido.id, producto_id: i.id, cantidad: i.cantidad, precio_unitario: i.precio })))
      setCarrito([])
      setShowCarrito(false)
      alert('¡Pedido enviado! Te contactaremos pronto.')
    }
  }

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <nav className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <span className="font-heading font-bold text-xl text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></span>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowCarrito(true)} className="relative flex items-center gap-2 text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors">
            <ShoppingCart size={20} />
            {carrito.length > 0 && <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{carrito.reduce((s,i) => s+i.cantidad, 0)}</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button onClick={() => setTab('catalogo')} className={`font-heading font-semibold px-5 py-2 rounded-button transition-all ${tab === 'catalogo' ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy border border-gray-200'}`}>Catálogo</button>
          <button onClick={() => setTab('pedidos')} className={`font-heading font-semibold px-5 py-2 rounded-button transition-all ${tab === 'pedidos' ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy border border-gray-200'}`}>Mis Pedidos</button>
        </div>

        {tab === 'catalogo' && (
          <>
            <div className="flex gap-2 flex-wrap mb-6">
              {CATEGORIAS.map(cat => (
                <button key={cat} onClick={() => setCategoria(cat)} className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all ${categoria === cat ? 'bg-brand-orange text-white' : 'bg-white text-brand-gray-dark border border-gray-200 hover:border-brand-orange'}`}>{cat}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productosFiltrados.map(p => (
                <div key={p.id} className="card flex flex-col">
                  <div className="text-xs text-brand-orange font-semibold mb-1">{p.categoria}</div>
                  <h3 className="font-heading font-bold text-brand-navy text-base mb-1">{p.nombre}</h3>
                  <p className="text-brand-gray-mid text-xs mb-2 flex-1">{p.descripcion}</p>
                  <div className="text-xs text-brand-gray-mid mb-3">{p.unidad}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xl text-brand-navy">${p.precio}</span>
                    <button onClick={() => agregarAlCarrito(p)} className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1">
                      <Plus size={14} /> Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'pedidos' && (
          <div className="card">
            <h2 className="font-heading font-bold text-xl text-brand-navy mb-6">Mis Pedidos</h2>
            <div className="text-center py-12 text-brand-gray-mid">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tienes pedidos aún</p>
              <p className="text-sm mt-1">Haz tu primer pedido desde el catálogo</p>
            </div>
          </div>
        )}
      </div>

      {showCarrito && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowCarrito(false)} />
          <div className="w-full max-w-md bg-white flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-heading font-bold text-xl text-brand-navy">Tu Pedido</h2>
              <button onClick={() => setShowCarrito(false)}><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {carrito.length === 0 ? (
                <div className="text-center py-12 text-brand-gray-mid">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : carrito.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-brand-navy text-sm">{item.nombre}</p>
                    <p className="text-brand-gray-mid text-xs">${item.precio} / {item.unidad}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => cambiarCantidad(item.id, -1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-brand-orange"><Minus size={12} /></button>
                    <span className="font-bold text-sm w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.id, 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-brand-orange"><Plus size={12} /></button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${(item.precio * item.cantidad).toFixed(2)}</p>
                    <button onClick={() => quitarDelCarrito(item.id)} className="text-red-400 text-xs hover:text-red-600">Quitar</button>
                  </div>
                </div>
              ))}
            </div>
            {carrito.length > 0 && (
              <div className="px-6 py-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-heading font-bold text-brand-navy">Total</span>
                  <span className="font-heading font-bold text-xl text-brand-orange">${total.toFixed(2)}</span>
                </div>
                <button onClick={enviarPedido} className="btn-primary w-full py-3 text-base">Enviar Pedido</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}