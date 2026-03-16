"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, LogOut, Package, Eye, EyeOff, Users, ShoppingBag, Tag, CheckSquare, Square, Pencil, X, Save, Download, CheckCircle, XCircle, FileText, ImageIcon, Mail, Calendar } from 'lucide-react'

const ADMIN_EMAIL = 'boodsupplies@gmail.com'
const ESTADOS = ['pendiente', 'confirmado', 'en_preparacion', 'despachado', 'entregado', 'cancelado']

const GRUPOS = [
  { key: ['pendiente'], label: '📥 Recibidos', color: 'border-yellow-300 bg-yellow-50' },
  { key: ['confirmado', 'en_preparacion'], label: '⏳ En Proceso', color: 'border-blue-300 bg-blue-50' },
  { key: ['despachado'], label: '🚚 Despachados', color: 'border-orange-300 bg-orange-50' },
  { key: ['entregado'], label: '✅ Entregados', color: 'border-green-300 bg-green-50' },
  { key: ['cancelado'], label: '❌ Cancelados', color: 'border-red-300 bg-red-50' },
]

const estadoColor: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmado: 'bg-blue-100 text-blue-700',
  en_preparacion: 'bg-purple-100 text-purple-700',
  despachado: 'bg-orange-100 text-orange-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

function descargarCSV(nombre: string, filas: string[][], headers: string[]) {
  const contenido = [headers, ...filas].map(r => r.map(c => `"${(c||'').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nombre}-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pedidos' | 'clientes' | 'productos' | 'categorias' | 'mensajes'>('clientes')
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [editandoCliente, setEditandoCliente] = useState<string | null>(null)
  const [formCliente, setFormCliente] = useState<any>({})
  const [showFormProducto, setShowFormProducto] = useState(false)
  const [showFormCategoria, setShowFormCategoria] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [formProducto, setFormProducto] = useState({ nombre: '', descripcion: '', categoria: '', precio: '', unidad: '' })
  const [imagenProducto, setImagenProducto] = useState<File | null>(null)
  const [aprobando, setAprobando] = useState<string | null>(null)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [mensajeAsunto, setMensajeAsunto] = useState('')
  const [mensajeCuerpo, setMensajeCuerpo] = useState('')
  const [destinatarios, setDestinatarios] = useState<string[]>([])
  const [enviandoMensaje, setEnviandoMensaje] = useState(false)
  const [mensajeEnviado, setMensajeEnviado] = useState(false)
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
    const { data } = await supabase.from('pedidos').select('*, pedido_items(*, productos(*))').order('created_at', { ascending: false })
    setPedidos(data || [])
  }

  async function cargarClientes() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setClientes(data || [])
  }

  function getCliente(cliente_id: string) {
    return clientes.find(c => c.id === cliente_id)
  }

  function getPedidosCliente(cliente_id: string) {
    return pedidos.filter(p => p.cliente_id === cliente_id)
  }

  const pedidosFiltrados = pedidos.filter(p => {
    if (!fechaDesde && !fechaHasta) return true
    const fecha = new Date(p.created_at)
    if (fechaDesde && fecha < new Date(fechaDesde)) return false
    if (fechaHasta && fecha > new Date(fechaHasta + 'T23:59:59')) return false
    return true
  })

  const totalVentasFiltradas = pedidosFiltrados.filter(p => p.estado !== 'cancelado').reduce((sum, p) => sum + (p.total || 0), 0)
  const totalVentas = pedidos.filter(p => p.estado !== 'cancelado').reduce((sum, p) => sum + (p.total || 0), 0)

  async function aprobarCliente(c: any, aprobar: boolean) {
    setAprobando(c.id)
    await supabase.from('profiles').update({ aprobado: aprobar, aprobado_at: aprobar ? new Date().toISOString() : null }).eq('id', c.id)
    if (aprobar) {
      try {
        await fetch('/api/aprobar-cliente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: c.email, nombre: c.nombre }),
        })
      } catch (e) { console.error('Email error:', e) }
    }
    await cargarClientes()
    setAprobando(null)
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from('pedidos').update({ estado }).eq('id', id)
    await cargarPedidos()
  }

  async function eliminarPedido(id: string) {
    if (!confirm('¿Eliminar este pedido?')) return
    await supabase.from('pedido_items').delete().eq('pedido_id', id)
    await supabase.from('pedidos').delete().eq('id', id)
    await cargarPedidos()
  }

  async function eliminarCliente(id: string, email: string) {
    if (!confirm(`¿Eliminar cliente ${email}? Se eliminarán también sus pedidos.`)) return
    const pedidosCliente = pedidos.filter(p => p.cliente_id === id)
    for (const ped of pedidosCliente) {
      await supabase.from('pedido_items').delete().eq('pedido_id', ped.id)
    }
    await supabase.from('pedidos').delete().eq('cliente_id', id)
    await supabase.from('profiles').delete().eq('id', id)
    await Promise.all([cargarPedidos(), cargarClientes()])
  }

  function iniciarEdicionCliente(c: any) {
    setEditandoCliente(c.id)
    setFormCliente({ nombre: c.nombre || '', negocio: c.negocio || '', telefono: c.telefono || '', direccion: c.direccion || '', ein: c.ein || '' })
  }

  async function guardarCliente(id: string) {
    setGuardando(true)
    await supabase.from('profiles').update(formCliente).eq('id', id)
    await cargarClientes()
    setEditandoCliente(null)
    setGuardando(false)
  }

  async function enviarMensaje() {
    if (!mensajeAsunto || !mensajeCuerpo) return alert('Llena asunto y mensaje')
    if (destinatarios.length === 0) return alert('Selecciona al menos un destinatario')
    setEnviandoMensaje(true)
    try {
      for (const email of destinatarios) {
        const cliente = clientes.find(c => c.email === email)
        await fetch('/api/aprobar-cliente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            nombre: cliente?.nombre || email,
            asunto: mensajeAsunto,
            cuerpo: mensajeCuerpo,
          }),
        })
      }
      setMensajeEnviado(true)
      setMensajeAsunto('')
      setMensajeCuerpo('')
      setDestinatarios([])
      setTimeout(() => setMensajeEnviado(false), 3000)
    } catch (e) { console.error('Error:', e) }
    setEnviandoMensaje(false)
  }

  async function agregarProducto() {
    if (!formProducto.nombre || !formProducto.precio || !formProducto.unidad || !formProducto.categoria) return alert('Llena todos los campos')
    setGuardando(true)
    let imagen_url = null
    if (imagenProducto) {
      const ext = imagenProducto.name.split('.').pop()
      const path = `productos/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('documentos').upload(path, imagenProducto, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
        imagen_url = urlData.publicUrl
      }
    }
    await supabase.from('productos').insert({ ...formProducto, precio: parseFloat(formProducto.precio), activo: true, imagen_url })
    setFormProducto({ nombre: '', descripcion: '', categoria: '', precio: '', unidad: '' })
    setImagenProducto(null)
    setShowFormProducto(false)
    await cargarProductos()
    setGuardando(false)
  }

  async function actualizarImagenProducto(id: string, file: File) {
    try {
      const ext = file.name.split('.').pop()
      const path = `productos/${id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('documentos').upload(path, file, { upsert: true })
      if (uploadError) { alert('Error subiendo imagen: ' + uploadError.message); return }
      const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
      const { error: updateError } = await supabase.from('productos').update({ imagen_url: urlData.publicUrl }).eq('id', id)
      if (updateError) { alert('Error actualizando producto: ' + updateError.message); return }
      await cargarProductos()
    } catch (e: any) { alert('Error: ' + e.message) }
  }

  function seleccionarImagen(id: string) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.jpg,.jpeg,.png,.webp'
    input.onchange = (e: any) => {
      if (e.target.files?.[0]) actualizarImagenProducto(id, e.target.files[0])
    }
    input.click()
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
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) { alert('Error al eliminar: ' + error.message); return }
    await cargarProductos()
  }

  function toggleSeleccion(id: string) {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function toggleDestinatario(email: string) {
    setDestinatarios(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])
  }

  function exportarVentas() {
    const headers = ['# Pedido', 'Fecha', 'Cliente', 'Negocio', 'Email', 'Dirección', 'EIN', 'Método Pago', 'Productos', 'Subtotal', 'Fuel Surcharge', 'Total', 'Estado']
    const filas = pedidosFiltrados.map(ped => {
      const cliente = getCliente(ped.cliente_id)
      const prods = ped.pedido_items?.map((i: any) => `${i.productos?.nombre} x${i.cantidad}`).join(' | ') || ''
      const subtotal = (ped.total || 0) - (ped.fuel_surcharge || 0)
      return [ped.id.slice(0,8).toUpperCase(), new Date(ped.created_at).toLocaleDateString('es-MX'), cliente?.nombre || '—', cliente?.negocio || '—', cliente?.email || '—', cliente?.direccion || '—', cliente?.ein || '—', ped.metodo_pago || '—', prods, `$${subtotal.toFixed(2)}`, `$${(ped.fuel_surcharge||0).toFixed(2)}`, `$${ped.total?.toFixed(2)}`, ped.estado]
    })
    descargarCSV('ventas-bood-supply', filas, headers)
  }

  function exportarClientes() {
    const headers = ['Nombre', 'Negocio', 'Email', 'Teléfono', 'Dirección', 'EIN', 'Fecha Nacimiento', 'Aprobado', 'Pedidos', 'Total Gastado', 'Último Pedido', 'Registro']
    const filas = clientes.map(c => {
      const pedidosC = getPedidosCliente(c.id)
      const totalGastado = pedidosC.filter(p => p.estado !== 'cancelado').reduce((sum, p) => sum + (p.total || 0), 0)
      const ultimoPedido = pedidosC[0]
      return [c.nombre || '—', c.negocio || '—', c.email || '—', c.telefono || '—', c.direccion || '—', c.ein || '—', c.fecha_nacimiento || '—', c.aprobado ? 'Sí' : 'No', String(pedidosC.length), `$${totalGastado.toFixed(2)}`, ultimoPedido ? new Date(ultimoPedido.created_at).toLocaleDateString('es-MX') : '—', new Date(c.created_at).toLocaleDateString('es-MX')]
    })
    descargarCSV('clientes-bood-supply', filas, headers)
  }

  function imprimirOrdenes() {
    const pedidosSeleccionados = pedidos.filter(p => seleccionados.includes(p.id))
    const html = `<html><head><title>Órdenes — BOOD SUPPLY</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;margin:20px;color:#2D3748}
      .orden{border:1px solid #ccc;padding:16px;margin-bottom:28px;page-break-inside:avoid;border-radius:8px}
      .header{background:#0F2B5B;color:white;padding:10px 16px;border-radius:6px;margin-bottom:14px;display:flex;justify-content:space-between}
      .header h2{margin:0;font-size:15px}.header p{margin:0;font-size:11px;opacity:.8}
      .seccion{margin-bottom:12px}.seccion h3{font-size:10px;text-transform:uppercase;color:#888;margin:0 0 6px;border-bottom:1px solid #eee;padding-bottom:3px}
      .grid2{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px}.campo{font-size:11px;padding:2px 0}.campo b{color:#0F2B5B}
      .item-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f5f5f5;font-size:11px}
      .total{font-size:15px;font-weight:bold;color:#F47B20;text-align:right;margin-top:10px;padding-top:8px;border-top:2px solid #F47B20}
      .logo-header{text-align:center;margin-bottom:24px;border-bottom:2px solid #0F2B5B;padding-bottom:12px}
      .logo-header h1{color:#0F2B5B;margin:0;font-size:20px}
    </style></head><body>
    <div class="logo-header"><h1>BOOD SUPPLY</h1>
    <p>2900 N Richmond St, Chicago, IL 60618 · (312) 409-0106 · boodsupplies@gmail.com</p>
    <p>Órdenes de Entrega — ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
    ${pedidosSeleccionados.map(ped => {
      const cliente = getCliente(ped.cliente_id)
      const subtotal = (ped.total || 0) - (ped.fuel_surcharge || 0)
      return `<div class="orden">
        <div class="header"><div><h2>Pedido #${ped.id.slice(0,8).toUpperCase()}</h2></div>
        <div style="text-align:right"><p>${new Date(ped.created_at).toLocaleDateString('es-MX', {year:'numeric',month:'long',day:'numeric'})}</p><p>Estado: ${ped.estado.replace('_',' ')} · Pago: ${ped.metodo_pago||'N/A'}</p></div></div>
        <div class="seccion"><h3>Datos del Cliente</h3><div class="grid2">
        <div class="campo"><b>Nombre:</b> ${cliente?.nombre||cliente?.email||'N/A'}</div>
        <div class="campo"><b>Negocio:</b> ${cliente?.negocio||'N/A'}</div>
        <div class="campo"><b>Teléfono:</b> ${cliente?.telefono||'N/A'}</div>
        <div class="campo"><b>EIN:</b> ${cliente?.ein||'N/A'}</div>
        <div class="campo" style="grid-column:span 2"><b>Dirección:</b> ${cliente?.direccion||'N/A'}</div>
        </div></div>
        <div class="seccion"><h3>Detalle del Pedido</h3>
        ${ped.pedido_items?.map((item: any) => `<div class="item-row"><span>${item.productos?.nombre||'Producto'} x${item.cantidad}</span><span><b>$${(item.precio_unitario*item.cantidad).toFixed(2)}</b></span></div>`).join('')}
        <div class="item-row" style="color:#888"><span>Fuel Surcharge</span><span>$${(ped.fuel_surcharge||0).toFixed(2)}</span></div>
        </div><div class="total">Total: $${ped.total?.toFixed(2)}</div></div>`
    }).join('')}
    </body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500) }
  }

  const pendientesAprobacion = clientes.filter(c => !c.aprobado).length

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
            { label: 'Total ventas', value: `$${totalVentas.toFixed(2)}`, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center py-4">
              <div className={`font-heading text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-brand-gray-mid text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {[
            { key: 'clientes', label: 'Clientes', icon: Users, badge: pendientesAprobacion },
            { key: 'pedidos', label: 'Pedidos', icon: ShoppingBag, badge: 0 },
            { key: 'mensajes', label: 'Mensajes', icon: Mail, badge: 0 },
            { key: 'productos', label: 'Productos', icon: Package, badge: 0 },
            { key: 'categorias', label: 'Categorías', icon: Tag, badge: 0 },
          ].map(({ key, label, icon: Icon, badge }) => (
            <button key={key} onClick={() => setTab(key as any)} className={`font-heading font-semibold px-5 py-2.5 rounded-button transition-all flex items-center gap-2 ${tab === key ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy border border-gray-200 hover:border-brand-navy'}`}>
              <Icon size={16} /> {label}
              {badge > 0 && <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${tab === key ? 'bg-white text-brand-navy' : 'bg-red-500 text-white'}`}>{badge}</span>}
            </button>
          ))}
        </div>

        {/* CLIENTES */}
        {tab === 'clientes' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-heading font-bold text-brand-navy text-xl">
                Clientes — {clientes.length}
                {pendientesAprobacion > 0 && <span className="ml-2 text-sm font-normal text-red-500">{pendientesAprobacion} pendiente(s)</span>}
              </h2>
              <button onClick={exportarClientes} className="flex items-center gap-2 bg-white border border-gray-200 text-brand-navy px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-orange transition-colors">
                <Download size={15} /> Exportar CSV
              </button>
            </div>
            {clientes.map(c => {
              const pedidosCliente = getPedidosCliente(c.id)
              const ultimoPedido = pedidosCliente[0]
              const totalGastado = pedidosCliente.filter(p => p.estado !== 'cancelado').reduce((sum, p) => sum + (p.total || 0), 0)
              const editando = editandoCliente === c.id
              return (
                <div key={c.id} className={`card border-l-4 ${c.aprobado ? 'border-l-green-400' : 'border-l-yellow-400'}`}>
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0 ${c.aprobado ? 'bg-green-500 text-white' : 'bg-yellow-400 text-white'}`}>
                        {(c.nombre || c.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-heading font-bold text-brand-navy">{c.nombre || '—'}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.aprobado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {c.aprobado ? '✓ Aprobado' : '⏳ Pendiente'}
                          </span>
                        </div>
                        <p className="text-xs text-brand-gray-mid">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-center">
                        <p className="font-heading font-bold text-brand-orange">{pedidosCliente.length}</p>
                        <p className="text-xs text-brand-gray-mid">pedidos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-heading font-bold text-green-600">${totalGastado.toFixed(2)}</p>
                        <p className="text-xs text-brand-gray-mid">total</p>
                      </div>
                      {!c.aprobado ? (
                        <button onClick={() => aprobarCliente(c, true)} disabled={aprobando === c.id} className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600">
                          <CheckCircle size={14} /> {aprobando === c.id ? 'Aprobando...' : 'Aprobar'}
                        </button>
                      ) : (
                        <button onClick={() => aprobarCliente(c, false)} disabled={aprobando === c.id} className="flex items-center gap-1 text-sm bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600">
                          <XCircle size={14} /> Revocar
                        </button>
                      )}
                      {!editando ? (
                        <button onClick={() => iniciarEdicionCliente(c)} className="flex items-center gap-1 text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-brand-gray-dark hover:border-brand-orange">
                          <Pencil size={14} /> Editar
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => guardarCliente(c.id)} disabled={guardando} className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600">
                            <Save size={14} /> {guardando ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button onClick={() => setEditandoCliente(null)} className="flex items-center gap-1 text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-brand-gray-mid">
                            <X size={14} /> Cancelar
                          </button>
                        </div>
                      )}
                      <button onClick={() => eliminarCliente(c.id, c.email)} className="flex items-center gap-1 text-sm border border-red-200 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {(c.sales_tax_url || c.id_foto_url) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {c.sales_tax_url && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100 flex-1 min-w-48">
                          <FileText size={15} className="text-blue-500 flex-shrink-0" />
                          <span className="text-xs text-blue-700 flex-1">Sales Tax Permit</span>
                          <a href={c.sales_tax_url} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">Ver</a>
                        </div>
                      )}
                      {c.id_foto_url && (
                        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100 flex-1 min-w-48">
                          <FileText size={15} className="text-purple-500 flex-shrink-0" />
                          <span className="text-xs text-purple-700 flex-1">ID / Identificación</span>
                          <a href={c.id_foto_url} target="_blank" rel="noopener noreferrer" className="text-xs bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600">Ver</a>
                        </div>
                      )}
                    </div>
                  )}
                  {editando ? (
                    <div className="grid grid-cols-2 gap-3 mt-3 border-t pt-3">
                      {[
                        { key: 'nombre', label: 'Nombre', placeholder: 'Nombre completo' },
                        { key: 'negocio', label: 'Negocio', placeholder: 'Nombre del negocio' },
                        { key: 'telefono', label: 'Teléfono', placeholder: '(312) 000-0000' },
                        { key: 'ein', label: 'EIN', placeholder: 'XX-XXXXXXX' },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-brand-gray-dark mb-1">{label}</label>
                          <input value={formCliente[key] || ''} onChange={e => setFormCliente({...formCliente, [key]: e.target.value})} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                        </div>
                      ))}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-brand-gray-dark mb-1">Dirección</label>
                        <input value={formCliente.direccion || ''} onChange={e => setFormCliente({...formCliente, direccion: e.target.value})} placeholder="Dirección del negocio" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mt-3 border-t pt-3">
                      {[
                        { label: 'Negocio', value: c.negocio },
                        { label: 'Teléfono', value: c.telefono },
                        { label: 'EIN', value: c.ein },
                        { label: 'Fecha Nacimiento', value: c.fecha_nacimiento ? new Date(c.fecha_nacimiento).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : null },
                        { label: 'Dirección', value: c.direccion, full: true },
                        { label: 'Último pedido', value: ultimoPedido ? new Date(ultimoPedido.created_at).toLocaleDateString('es-MX') : null },
                        { label: 'Registro', value: new Date(c.created_at).toLocaleDateString('es-MX') },
                      ].map(({ label, value, full }: any) => (
                        <div key={label} className={`bg-gray-50 rounded-lg p-2 border border-gray-100 ${full ? 'col-span-2' : ''}`}>
                          <p className="text-brand-gray-mid">{label}</p>
                          <p className="font-medium text-brand-navy">{value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* PEDIDOS */}
        {tab === 'pedidos' && (
          <div>
            <div className="card mb-6">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-gray-dark mb-1">Desde</label>
                  <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-gray-dark mb-1">Hasta</label>
                  <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
                <button onClick={() => { setFechaDesde(''); setFechaHasta('') }} className="text-sm text-brand-gray-mid hover:text-brand-orange transition-colors px-3 py-2">Limpiar</button>
                <div className="ml-auto flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-brand-gray-mid">Total período</p>
                    <p className="font-heading font-bold text-xl text-green-600">${totalVentasFiltradas.toFixed(2)}</p>
                  </div>
                  <button onClick={exportarVentas} className="flex items-center gap-2 bg-white border border-gray-200 text-brand-navy px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-orange transition-colors">
                    <Download size={15} /> Exportar CSV
                  </button>
                </div>
              </div>
            </div>

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

            {pedidosFiltrados.length === 0 && (
              <div className="card text-center py-12 text-brand-gray-mid">
                <ShoppingBag size={40} className="mx-auto mb-3 opacity-25" />
                <p>No hay pedidos en este período</p>
              </div>
            )}

            {GRUPOS.map(grupo => {
              const pedidosGrupo = pedidosFiltrados.filter(p => grupo.key.includes(p.estado))
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
                      const subtotal = (ped.total || 0) - (ped.fuel_surcharge || 0)
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
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-heading font-bold text-brand-orange text-lg">${ped.total?.toFixed(2)}</span>
                                  <select value={ped.estado} onChange={e => cambiarEstado(ped.id, e.target.value)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none ${estadoColor[ped.estado]}`}>
                                    {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_',' ').charAt(0).toUpperCase() + e.replace('_',' ').slice(1)}</option>)}
                                  </select>
                                  <button onClick={() => eliminarPedido(ped.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 text-red-400">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-3 mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div><span className="text-brand-gray-mid">Nombre:</span> <span className="font-medium text-brand-navy">{cliente?.nombre || '—'}</span></div>
                                <div><span className="text-brand-gray-mid">Negocio:</span> <span className="font-medium text-brand-navy">{cliente?.negocio || '—'}</span></div>
                                <div><span className="text-brand-gray-mid">Teléfono:</span> <span className="font-medium text-brand-navy">{cliente?.telefono || '—'}</span></div>
                                <div><span className="text-brand-gray-mid">EIN:</span> <span className="font-medium text-brand-navy">{cliente?.ein || '—'}</span></div>
                                <div><span className="text-brand-gray-mid">Email:</span> <span className="font-medium text-brand-navy">{cliente?.email || '—'}</span></div>
                                <div><span className="text-brand-gray-mid">Dirección:</span> <span className="font-medium text-brand-navy">{cliente?.direccion || '—'}</span></div>
                                <div className="col-span-2 flex items-center justify-between mt-1 pt-1 border-t border-blue-100">
                                  <div><span className="text-brand-gray-mid">Método de pago:</span> <span className="font-medium text-brand-navy">{ped.metodo_pago || '—'}</span></div>
                                  {ped.comprobante_url && (
                                    <a href={ped.comprobante_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600">
                                      <FileText size={11} /> Ver comprobante
                                    </a>
                                  )}
                                </div>
                              </div>
                              <div className="border-t pt-2 space-y-1">
                                {ped.pedido_items?.map((item: any) => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-brand-gray-dark">{item.productos?.nombre} <span className="text-brand-gray-mid">x{item.cantidad}</span></span>
                                    <span className="font-medium text-brand-navy">${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between text-xs text-brand-gray-mid border-t pt-1 mt-1">
                                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-brand-gray-mid">
                                  <span>Fuel Surcharge</span><span>${(ped.fuel_surcharge||0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-brand-navy border-t pt-1">
                                  <span>Total</span><span>${ped.total?.toFixed(2)}</span>
                                </div>
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

        {/* MENSAJES */}
        {tab === 'mensajes' && (
          <div className="card">
            <h2 className="font-heading font-bold text-brand-navy text-xl mb-6">Enviar Mensaje a Clientes</h2>
            {mensajeEnviado && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
                ✓ Mensaje enviado correctamente
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-gray-dark mb-1">Asunto *</label>
                <input value={mensajeAsunto} onChange={e => setMensajeAsunto(e.target.value)} placeholder="Asunto del mensaje" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray-dark mb-1">Mensaje *</label>
                <textarea value={mensajeCuerpo} onChange={e => setMensajeCuerpo(e.target.value)} placeholder="Escribe tu mensaje aquí..." rows={6} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange resize-none" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-brand-gray-dark">Destinatarios *</label>
                  <button onClick={() => setDestinatarios(clientes.filter(c => c.aprobado).map(c => c.email))} className="text-xs text-brand-orange hover:underline">
                    Seleccionar todos los aprobados
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {clientes.map(c => (
                    <div key={c.id} onClick={() => toggleDestinatario(c.email)} className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b last:border-0 ${destinatarios.includes(c.email) ? 'bg-blue-50' : ''}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${destinatarios.includes(c.email) ? 'bg-brand-orange border-brand-orange' : 'border-gray-300'}`}>
                        {destinatarios.includes(c.email) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-navy">{c.nombre || c.email}</p>
                        <p className="text-xs text-brand-gray-mid">{c.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.aprobado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {c.aprobado ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
                {destinatarios.length > 0 && <p className="text-xs text-brand-gray-mid mt-1">{destinatarios.length} destinatario(s) seleccionado(s)</p>}
              </div>
              <button onClick={enviarMensaje} disabled={enviandoMensaje} className="btn-primary flex items-center gap-2">
                <Mail size={16} /> {enviandoMensaje ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </div>
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Imagen <span className="text-brand-gray-mid font-normal">(JPG, PNG)</span></label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-brand-orange transition-colors">
                      <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setImagenProducto(e.target.files?.[0] || null)} className="w-full text-sm text-brand-gray-mid file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-orange file:text-white hover:file:bg-orange-600 cursor-pointer" />
                      {imagenProducto && <p className="text-xs text-green-600 mt-2">✓ {imagenProducto.name}</p>}
                    </div>
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
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                            {p.imagen_url ? (
                              <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-brand-navy text-sm">{p.nombre}</span>
                              {!p.activo && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactivo</span>}
                            </div>
                            <div className="text-xs text-brand-gray-mid mt-0.5">{p.descripcion} · {p.unidad}</div>
                          </div>
                          <div className="font-heading font-bold text-brand-navy">${p.precio}</div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => seleccionarImagen(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors text-blue-400" title="Cambiar imagen">
                              <ImageIcon size={15} />
                            </button>
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