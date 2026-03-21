"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, LogOut, ShoppingBag, CheckCircle, Clock, Truck } from 'lucide-react'

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

export default function BodegaPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pedidos, setPedidos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [actualizando, setActualizando] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'activos' | 'todos'>('activos')
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/es/login'; return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'bodega' && user.email !== 'boodsupplies@gmail.com') { window.location.href = '/es/login'; return }
      setUser(user)
      await Promise.all([cargarPedidos(), cargarClientes()])
      setLoading(false)
    }
    init()

    // Auto-refresh cada 30 segundos
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

  function getCliente(cliente_id: string) { return clientes.find(c => c.id === cliente_id) }

  async function avanzarEstado(pedidoId: string, nuevoEstado: string) {
    setActualizando(pedidoId)
    await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', pedidoId)
    await cargarPedidos()
    setActualizando(null)
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
        {/* Contadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

        {/* Filtro */}
        <div className="flex gap-2 mb-6">
          <button onClick={()=>setFiltro('activos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtro==='activos'?'bg-brand-navy text-white':'bg-white border border-gray-200 text-brand-navy hover:border-brand-navy'}`}>Activos</button>
          <button onClick={()=>setFiltro('todos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtro==='todos'?'bg-brand-navy text-white':'bg-white border border-gray-200 text-brand-navy hover:border-brand-navy'}`}>Todos</button>
          <button onClick={cargarPedidos} className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-brand-navy hover:border-brand-orange transition-all">🔄 Actualizar</button>
        </div>

        {pedidosFiltrados.length===0&&(
          <div className="card text-center py-12 text-brand-gray-mid"><ShoppingBag size={40} className="mx-auto mb-3 opacity-25"/><p>No hay pedidos {filtro==='activos'?'activos':''}</p></div>
        )}

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
                        </div>
                        <span className="text-sm font-medium text-brand-navy">${(item.precio_unitario*item.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {accion && (
                  <button
                    onClick={()=>avanzarEstado(ped.id, accion.to)}
                    disabled={actualizando===ped.id}
                    className={`w-full ${accion.color} hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2`}
                  >
                    <accion.icon size={18}/>
                    {actualizando===ped.id ? 'Actualizando...' : accion.label}
                  </button>
                )}
                {ped.estado==='despachado'&&(
                  <div className="w-full bg-green-100 text-green-700 font-medium py-3 rounded-xl text-center text-sm">✅ Listo para despacho</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}