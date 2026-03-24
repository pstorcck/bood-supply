"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Search, X, Receipt, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NuevoInvoicePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [metodoPago, setMetodoPago] = useState('Efectivo')
  const [notas, setNotas] = useState('')
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/es/login'; return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role
      if (role !== 'vendedor' && role !== 'admin' && user.email !== 'boodsupplies@gmail.com') {
        window.location.href = '/es/login'; return
      }
      setUser(user)
      const [{ data: clts }, { data: prods }] = await Promise.all([
        supabase.from('profiles').select('*').eq('aprobado', true).order('nombre'),
        supabase.from('productos').select('*').eq('activo', true).order('categoria').order('nombre'),
      ])
      setClientes(clts || [])
      setProductos(prods || [])
    }
    init()
  }, [])

  function agregarProducto(prod: any) {
    setItems(prev => {
      const existe = prev.find(i => i.producto_id === prod.id)
      if (existe) return prev.map(i => i.producto_id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto_id: prod.id, descripcion: prod.nombre, precio_unitario: prod.precio, cantidad: 1, esCustom: false, productos: prod }]
    })
    setBusquedaProducto('')
  }

  function agregarLineaCustom() {
    setItems(prev => [...prev, { producto_id: null, descripcion: '', precio_unitario: 0, cantidad: 1, esCustom: true, productos: null }])
  }

  function actualizarItem(idx: number, campo: string, valor: any) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [campo]: valor } : item))
  }

  function eliminarItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const subtotal = items.reduce((sum, i) => sum + Number(i.precio_unitario) * Number(i.cantidad), 0)
  const tax = items.filter(i => i.productos?.categoria === 'Quimicos y Limpieza').reduce((sum, i) => sum + Number(i.precio_unitario) * Number(i.cantidad) * 0.1025, 0)
  const total = subtotal + tax

  async function generarInvoice() {
    if (!clienteSeleccionado) return setError('Selecciona un cliente')
    if (items.length === 0) return setError('Agrega al menos un producto')
    if (items.some(i => !i.descripcion)) return setError('Todos los items deben tener descripcion')
    setGenerando(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: numero } = await supabase.rpc('get_next_invoice_number')

      const { data: invoice, error: invError } = await supabase.from('invoices').insert({
        numero,
        pedido_id: null,
        cliente_id: clienteSeleccionado.id,
        creado_por: user?.id,
        total,
        subtotal,
        tax,
        fuel_surcharge: 0,
        metodo_pago: metodoPago,
        pdf_url: null,
        datos_cliente: clienteSeleccionado,
        datos_items: items.map(i => ({
          descripcion: i.descripcion,
          precio_unitario: Number(i.precio_unitario),
          cantidad: Number(i.cantidad),
          productos: i.productos,
        })),
      }).select().single()

      if (invError) { setError(invError.message); setGenerando(false); return }
      router.push(`/es/invoice/${invoice.id}`)
    } catch (e: any) { setError(e.message) }
    setGenerando(false)
  }

  const clientesFiltrados = clientes.filter(c =>
    !busquedaCliente || c.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) || c.negocio?.toLowerCase().includes(busquedaCliente.toLowerCase())
  )

  const productosFiltrados = productos.filter(p =>
    busquedaProducto.length > 1 && (p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) || p.categoria?.toLowerCase().includes(busquedaProducto.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <nav className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Receipt size={22} className="text-brand-orange"/>
          <span className="font-heading font-bold text-lg">Nueva Invoice — BOOD SUPPLY</span>
        </div>
        <button onClick={() => window.history.back()} className="text-sm text-blue-300 hover:text-white">Volver</button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

        {/* Cliente */}
        <div className="card">
          <h2 className="font-heading font-bold text-brand-navy mb-3 flex items-center gap-2"><UserCheck size={18}/> Cliente</h2>
          {clienteSeleccionado ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
              <div>
                <p className="font-medium text-brand-navy">{clienteSeleccionado.nombre}</p>
                <p className="text-xs text-brand-gray-mid">{clienteSeleccionado.negocio} · {clienteSeleccionado.email}</p>
                <p className="text-xs text-brand-gray-mid">{clienteSeleccionado.direccion}</p>
              </div>
              <button onClick={() => setClienteSeleccionado(null)} className="text-brand-gray-mid hover:text-red-400"><X size={18}/></button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-mid"/>
                <input value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)} placeholder="Buscar cliente por nombre o negocio..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
              </div>
              {busquedaCliente && (
                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl">
                  {clientesFiltrados.map(c => (
                    <div key={c.id} onClick={() => { setClienteSeleccionado(c); setBusquedaCliente('') }} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-orange-50 border-b last:border-0">
                      <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-bold">{(c.nombre||'?')[0].toUpperCase()}</div>
                      <div><p className="text-sm font-medium text-brand-navy">{c.nombre}</p><p className="text-xs text-brand-gray-mid">{c.negocio||c.email}</p></div>
                    </div>
                  ))}
                  {clientesFiltrados.length === 0 && <div className="px-3 py-4 text-sm text-brand-gray-mid text-center">No se encontraron clientes</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Productos */}
        <div className="card">
          <h2 className="font-heading font-bold text-brand-navy mb-3 flex items-center gap-2"><Receipt size={18}/> Productos</h2>

          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-mid"/>
            <input value={busquedaProducto} onChange={e => setBusquedaProducto(e.target.value)} placeholder="Buscar producto del catalogo..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
          </div>

          {productosFiltrados.length > 0 && (
            <div className="border border-gray-100 rounded-xl mb-4 max-h-48 overflow-y-auto">
              {productosFiltrados.map(p => (
                <div key={p.id} onClick={() => agregarProducto(p)} className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-orange-50 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">{p.nombre}</p>
                    <p className="text-xs text-brand-gray-mid">{p.categoria} · {p.unidad}</p>
                  </div>
                  <span className="text-brand-orange font-bold text-sm">${p.precio}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabla de items */}
          {items.length > 0 && (
            <div className="mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs text-brand-gray-mid font-medium">Descripcion</th>
                    <th className="text-center py-2 text-xs text-brand-gray-mid font-medium w-20">Cant.</th>
                    <th className="text-right py-2 text-xs text-brand-gray-mid font-medium w-24">Precio</th>
                    <th className="text-right py-2 text-xs text-brand-gray-mid font-medium w-24">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2 pr-2">
                        {item.esCustom ? (
                          <input value={item.descripcion} onChange={e => actualizarItem(idx, 'descripcion', e.target.value)} placeholder="Descripcion del producto o servicio" className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-orange"/>
                        ) : (
                          <span className="text-brand-navy">{item.descripcion}</span>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min="1" value={item.cantidad} onChange={e => actualizarItem(idx, 'cantidad', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-brand-orange"/>
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min="0" step="0.01" value={item.precio_unitario} onChange={e => actualizarItem(idx, 'precio_unitario', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:border-brand-orange"/>
                      </td>
                      <td className="py-2 pl-2 text-right font-medium text-brand-navy text-xs">
                        ${(Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2)}
                      </td>
                      <td className="py-2 pl-2">
                        <button onClick={() => eliminarItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={agregarLineaCustom} className="flex items-center gap-2 text-sm text-brand-orange hover:underline">
            <Plus size={15}/> Agregar linea personalizada
          </button>
        </div>

        {/* Totales y pago */}
        <div className="card">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Metodo de pago</label>
              <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white">
                {['Efectivo','Zelle','Tarjeta de credito','Cheque'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-brand-gray-mid"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {tax > 0 && <div className="flex justify-between text-sm text-brand-gray-mid"><span>Tax Quimicos (10.25%)</span><span>${tax.toFixed(2)}</span></div>}
              <div className="flex justify-between text-base font-bold text-brand-navy border-t pt-2"><span>TOTAL</span><span className="text-brand-orange">${total.toFixed(2)}</span></div>
            </div>
          </div>
          <button onClick={generarInvoice} disabled={generando || !clienteSeleccionado || items.length === 0} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            <Receipt size={16}/> {generando ? 'Generando...' : 'Generar Invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}