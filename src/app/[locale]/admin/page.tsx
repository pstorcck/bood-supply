"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, LogOut, Package, Eye, EyeOff, Users, ShoppingBag, Tag, CheckSquare, Square, Pencil, X, Save, Download, CheckCircle, XCircle, FileText, ImageIcon, Mail, UserPlus, Map, Receipt, TrendingUp, TrendingDown, DollarSign, BarChart2, AlertTriangle } from 'lucide-react'
import MapaRutas from '@/components/MapaRutas'

const ADMIN_EMAIL = 'boodsupplies@gmail.com'
const ESTADOS = ['esperando_stock', 'pendiente', 'confirmado', 'en_preparacion', 'despachado', 'entregado', 'cancelado']

const GRUPOS = [
  { key: ['esperando_stock'], label: '⏱ Esperando Stock (48hrs)', color: 'border-yellow-400 bg-yellow-50' },
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

const CATEGORIAS_GASTO = ['Proveedores', 'Renta', 'Gasolina', 'Sueldos', 'Servicios', 'Mantenimiento', 'Otros']

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
  const [tab, setTab] = useState<'pedidos' | 'clientes' | 'productos' | 'categorias' | 'mensajes' | 'rutas' | 'invoices' | 'finanzas' | 'analytics'>('clientes')
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [gastos, setGastos] = useState<any[]>([])
  const [generandoInvoice, setGenerandoInvoice] = useState<string | null>(null)
  const [filtroInvEstado, setFiltroInvEstado] = useState<'todos'|'pagados'|'pendientes'|'vencidos'|'void'>('todos')
  const [showNuevoPedido, setShowNuevoPedido] = useState(false)
  const [npCliente, setNpCliente] = useState('')
  const [npItems, setNpItems] = useState<{producto_id:string,nombre:string,precio:number,costo:number,cantidad:number,stock:number}[]>([])
  const [npExtras, setNpExtras] = useState<{nombre:string,precio:number,cantidad:number}[]>([])
  const [npFuel, setNpFuel] = useState(5)
  const [npMetodo, setNpMetodo] = useState('Efectivo')
  const [npCreando, setNpCreando] = useState(false)
  const [filtroInvDesde, setFiltroInvDesde] = useState('')
  const [filtroInvHasta, setFiltroInvHasta] = useState('')
  const [fuelOverride, setFuelOverride] = useState<Record<string, number>>({})
  const [preciosEditados, setPreciosEditados] = useState<Record<string, number>>({})
  const [showContabilidad, setShowContabilidad] = useState<string | null>(null)
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [editandoCliente, setEditandoCliente] = useState<string | null>(null)
  const [formCliente, setFormCliente] = useState<any>({})
  const [archivoEditTax, setArchivoEditTax] = useState<File | null>(null)
  const [archivoEditId, setArchivoEditId] = useState<File | null>(null)
  const [archivoEditCrt, setArchivoEditCrt] = useState<File | null>(null)
  const [showFormProducto, setShowFormProducto] = useState(false)
  const [showFormCategoria, setShowFormCategoria] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null)
  const [categoriaEditNombre, setCategoriaEditNombre] = useState('')
  const [formProducto, setFormProducto] = useState({ nombre: '', descripcion: '', categoria: '', precio: '', unidad: '' })
  const [imagenProducto, setImagenProducto] = useState<File | null>(null)
  const [editandoProducto, setEditandoProducto] = useState<string | null>(null)
  const [formEditProducto, setFormEditProducto] = useState<any>({})
  const [aprobando, setAprobando] = useState<string | null>(null)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [mensajeAsunto, setMensajeAsunto] = useState('')
  const [mensajeCuerpo, setMensajeCuerpo] = useState('')
  const [destinatarios, setDestinatarios] = useState<string[]>([])
  const [enviandoMensaje, setEnviandoMensaje] = useState(false)
  const [mensajeEnviado, setMensajeEnviado] = useState(false)
  const [showFormUsuario, setShowFormUsuario] = useState(false)
  const [formUsuario, setFormUsuario] = useState({ email: '', nombre: '', negocio: '', telefono: '', direccion: '', ein: '', fecha_nacimiento: '' })
  const [archivoTaxUsuario, setArchivoTaxUsuario] = useState<File | null>(null)
  const [archivoIdUsuario, setArchivoIdUsuario] = useState<File | null>(null)
  const [archivoCRTUsuario, setArchivoCRTUsuario] = useState<File | null>(null)
  const [creandoUsuario, setCreandoUsuario] = useState(false)
  const [usuarioCreado, setUsuarioCreado] = useState(false)
  const [errorUsuario, setErrorUsuario] = useState('')
  const [pedidosRuta, setPedidosRuta] = useState<string[]>([])
  const [optimizando, setOptimizando] = useState(false)
  const [rutaOptimizada, setRutaOptimizada] = useState<any[]>([])
  const [rutaKey, setRutaKey] = useState(0)
  const [errorRuta, setErrorRuta] = useState('')

  // Finanzas state
  const [finanzasTab, setFinanzasTab] = useState<'resumen' | 'gastos' | 'inventario'>('resumen')
  const [finanzasPeriodo, setFinanzasPeriodo] = useState<'dia' | 'semana' | 'mes' | 'anio'>('mes')
  const [fechaFinDesde, setFechaFinDesde] = useState('')
  const [fechaFinHasta, setFechaFinHasta] = useState('')
  const [showFormGasto, setShowFormGasto] = useState(false)
  const [formGasto, setFormGasto] = useState({ categoria: 'Proveedores', proveedor: '', monto: '', fecha: new Date().toISOString().slice(0,10), nota: '' })
  const [guardandoGasto, setGuardandoGasto] = useState(false)
  const [errorGasto, setErrorGasto] = useState('')
  const [editandoStock, setEditandoStock] = useState<string | null>(null)
  const [editandoCosto, setEditandoCosto] = useState<string | null>(null)
  const [stockTemp, setStockTemp] = useState('')
  const [costoTemp, setCostoTemp] = useState('')

  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [errorAnalytics, setErrorAnalytics] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { window.location.href = '/es/login'; return }
      setUser(user)
      await Promise.all([cargarProductos(), cargarPedidos(), cargarClientes(), cargarInvoices()])
      await cargarGastos()
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (tab === 'finanzas') calcularRangoFechas(finanzasPeriodo)
  }, [tab])

  function calcularRangoFechas(periodo: string) {
    const hoy = new Date()
    let desde = new Date()
    if (periodo === 'dia') { desde = new Date(hoy) }
    else if (periodo === 'semana') { desde = new Date(hoy); desde.setDate(hoy.getDate() - 7) }
    else if (periodo === 'mes') { desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1) }
    else if (periodo === 'anio') { desde = new Date(hoy.getFullYear(), 0, 1) }
    setFechaFinDesde(desde.toISOString().slice(0,10))
    setFechaFinHasta(hoy.toISOString().slice(0,10))
    setFinanzasPeriodo(periodo as any)
  }

  async function cargarGastos() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('gastos').select('*').order('fecha', { ascending: false })
    setGastos(data || [])
  }

  async function cargarInvoices() {
    const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false })
    setInvoices(data || [])
  }

  async function actualizarPrecioItem(itemId: string, nuevoPrecio: number, costoMinimo: number, esAdmin: boolean) {
    if (!esAdmin && nuevoPrecio < costoMinimo) {
      alert(`⚠️ No puedes poner un precio menor al costo ($${costoMinimo.toFixed(2)})`)
      return false
    }
    if (nuevoPrecio < 0) return false
    await supabase.from('pedido_items').update({ precio_unitario: nuevoPrecio }).eq('id', itemId)
    // Recalcular total del pedido
    const { data: items } = await supabase.from('pedido_items').select('precio_unitario, cantidad').eq('id', itemId)
    await cargarPedidos()
    return true
  }

  async function crearPedidoAdmin() {
    if (!npCliente) { alert('Selecciona un cliente'); return }
    if (npItems.length === 0 && npExtras.length === 0) { alert('Agrega al menos un producto'); return }
    setNpCreando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const itemsSubtotal = npItems.reduce((s, i) => s + i.precio * i.cantidad, 0)
      const extrasSubtotal = npExtras.reduce((s, i) => s + i.precio * i.cantidad, 0)
      const total = itemsSubtotal + extrasSubtotal + npFuel

      const { data: pedido } = await supabase.from('pedidos').insert({
        cliente_id: npCliente,
        total,
        fuel_surcharge: npFuel,
        metodo_pago: npMetodo,
        estado: 'en_preparacion',
        creado_por_admin: true
      }).select().single()

      if (!pedido) { alert('Error creando pedido'); setNpCreando(false); return }

      // Insertar items del catálogo
      if (npItems.length > 0) {
        await supabase.from('pedido_items').insert(
          npItems.map(i => ({ pedido_id: pedido.id, producto_id: i.producto_id, cantidad: i.cantidad, precio_unitario: i.precio }))
        )
        // Rebajar stock
        for (const item of npItems) {
          const nuevoStock = Math.max(0, (item.stock ?? 0) - item.cantidad)
          await supabase.from('productos').update({ stock: nuevoStock }).eq('id', item.producto_id)
        }
      }

      // Insertar extras (sin producto_id)
      if (npExtras.length > 0) {
        await supabase.from('pedido_items').insert(
          npExtras.map(i => ({ pedido_id: pedido.id, cantidad: i.cantidad, precio_unitario: i.precio, descripcion: i.nombre }))
        )
      }

      // Generar invoice directo
      await fetch('/api/crear-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido_id: pedido.id, cliente_id: npCliente, creado_por: user?.id || null, fuel_override: npFuel })
      })

      await cargarPedidos()
      await cargarInvoices()
      setShowNuevoPedido(false)
      setNpCliente(''); setNpItems([]); setNpExtras([]); setNpFuel(5); setNpMetodo('Efectivo')
      alert('✅ Pedido e invoice creados correctamente')
    } catch(e: any) { alert('Error: ' + e.message) }
    setNpCreando(false)
  }

  async function marcarPagado(invId: string, pagado: boolean) {
    await supabase.from('invoices').update({
      pagado,
      fecha_pago: pagado ? new Date().toISOString() : null
    }).eq('id', invId)
    await cargarInvoices()
  }

  async function marcarAnulado(invId: string, anulado: boolean) {
    await supabase.from('invoices').update({ anulado }).eq('id', invId)
    await cargarInvoices()
  }

  async function generarInvoice(ped: any) {
    setGenerandoInvoice(ped.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/crear-invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pedido_id: ped.id, cliente_id: ped.cliente_id, creado_por: user?.id || null, fuel_override: fuelOverride[ped.id] }) })
      const data = await res.json()
      if (data.error) { alert('Error: ' + data.error); return }
      await cargarInvoices()
      window.open(`/es/invoice/${data.invoice.id}`, '_blank')
    } catch (e: any) { alert('Error: ' + e.message) }
    setGenerandoInvoice(null)
  }

  async function optimizarRuta() {
    if (pedidosRuta.length < 1) return setErrorRuta('Selecciona al menos 1 pedido')
    setOptimizando(true); setErrorRuta(''); setRutaOptimizada([])
    const pedidosSeleccionados = pedidos.filter(p => pedidosRuta.includes(p.id))
    const paradas = pedidosSeleccionados.map(ped => {
      const cliente = getCliente(ped.cliente_id)
      return { pedidoId: '#' + ped.id.slice(0,8).toUpperCase(), nombre: cliente?.nombre || '—', negocio: cliente?.negocio || '—', telefono: cliente?.telefono || '—', direccion: cliente?.direccion || '', total: ped.total, metodo_pago: ped.metodo_pago, items: ped.pedido_items }
    }).filter(p => p.direccion)
    if (paradas.length === 0) { setErrorRuta('Los pedidos no tienen direccion registrada'); setOptimizando(false); return }
    try {
      const res = await fetch('/api/optimizar-ruta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direcciones: paradas.map((p: any) => p.direccion + ', Chicago, IL') }) })
      const data = await res.json()
      if (data.error) { setErrorRuta(data.error); setOptimizando(false); return }
      setRutaOptimizada(data.orden.map((i: number) => paradas[i]))
      setRutaKey(prev => prev + 1)
    } catch (e: any) { setErrorRuta(e.message) }
    setOptimizando(false)
  }

  function abrirEnGoogleMaps() {
    if (rutaOptimizada.length === 0) return
    const origen = '2900+N+Richmond+St,+Chicago,+IL+60618'
    const paradas = rutaOptimizada.map(p => encodeURIComponent(p.direccion + ', Chicago, IL')).join('/')
    window.open(`https://www.google.com/maps/dir/${origen}/${paradas}`, '_blank')
  }

  function imprimirRuta() {
    const html = `<html><head><title>Ruta de Entrega - BOOD SUPPLY</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px;color:#2D3748}.header{background:#0F2B5B;color:white;padding:16px;border-radius:8px;margin-bottom:20px;text-align:center}.parada{border:1px solid #ccc;border-radius:8px;padding:12px;margin-bottom:12px;page-break-inside:avoid}.num{background:#F47B20;color:white;width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;margin-right:8px}.items{margin-top:8px;padding-top:8px;border-top:1px solid #eee;font-size:11px}</style></head><body><div class="header"><h2 style="margin:0">BOOD SUPPLY - Ruta de Entrega</h2><p style="margin:4px 0 0">${new Date().toLocaleDateString('es-MX',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p><p style="margin:4px 0 0">Origen: 2900 N Richmond St, Chicago, IL 60618</p></div>${rutaOptimizada.map((p,i)=>`<div class="parada"><div style="display:flex;align-items:center;margin-bottom:6px"><span class="num">${i+1}</span><strong>${p.negocio||p.nombre}</strong></div><p style="margin:2px 0">👤 ${p.nombre}</p><p style="margin:2px 0">📍 ${p.direccion}</p><p style="margin:2px 0">📞 ${p.telefono}</p><p style="margin:2px 0">💳 Pago: ${p.metodo_pago} · Total: $${p.total?.toFixed(2)}</p><p style="margin:2px 0">📦 Pedido: ${p.pedidoId}</p><div class="items">${p.items?.map((item:any)=>`<div>${item.productos?.nombre} x${item.cantidad}</div>`).join('')||''}</div></div>`).join('')}</body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500) }
  }

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

  function getCliente(cliente_id: string) { return clientes.find(c => c.id === cliente_id) }
  function getPedidosCliente(cliente_id: string) { return pedidos.filter(p => p.cliente_id === cliente_id) }

  const pedidosFiltrados = pedidos.filter(p => {
    if (!fechaDesde && !fechaHasta) return true
    const fecha = new Date(p.created_at)
    if (fechaDesde && fecha < new Date(fechaDesde)) return false
    if (fechaHasta && fecha > new Date(fechaHasta + 'T23:59:59')) return false
    return true
  })

  const totalVentasFiltradas = pedidosFiltrados.filter(p => p.estado !== 'cancelado').reduce((sum, p) => sum + (p.total || 0), 0)
  const totalVentas = pedidos.filter(p => p.estado !== 'cancelado').reduce((sum, p) => sum + (p.total || 0), 0)

  const pedidosFinanzas = pedidos.filter(p => {
    if (p.estado === 'cancelado') return false
    if (!fechaFinDesde && !fechaFinHasta) return true
    const fecha = new Date(p.created_at)
    if (fechaFinDesde && fecha < new Date(fechaFinDesde)) return false
    if (fechaFinHasta && fecha > new Date(fechaFinHasta + 'T23:59:59')) return false
    return true
  })

  const gastosFinanzas = gastos.filter(g => {
    if (!fechaFinDesde && !fechaFinHasta) return true
    const fecha = new Date(g.fecha + 'T12:00:00')
    if (fechaFinDesde && fecha < new Date(fechaFinDesde + 'T00:00:00')) return false
    if (fechaFinHasta && fecha > new Date(fechaFinHasta + 'T23:59:59')) return false
    return true
  })

  const invoicesFinanzas = invoices.filter(inv => {
    if (inv.anulado) return false
    const fecha = new Date(inv.created_at)
    if (fechaFinDesde && fecha < new Date(fechaFinDesde + 'T00:00:00')) return false
    if (fechaFinHasta && fecha > new Date(fechaFinHasta + 'T23:59:59')) return false
    return true
  })
  const totalInvoicesSinPedido = invoicesFinanzas
    .filter(inv => !pedidosFinanzas.find((p: any) => p.id === inv.pedido_id))
    .reduce((sum, inv) => sum + (inv.total || 0), 0)
  const invoicesFiltrados = invoices.filter(inv => {
    const diasDesde = Math.floor((Date.now() - new Date(inv.created_at).getTime()) / (1000*60*60*24))
    const diasCredito = inv.dias_credito || 30
    const vencido = !inv.pagado && !inv.anulado && diasDesde > diasCredito
    if (filtroInvEstado === 'pagados' && !inv.pagado) return false
    if (filtroInvEstado === 'pendientes' && (inv.pagado || inv.anulado || vencido)) return false
    if (filtroInvEstado === 'vencidos' && !vencido) return false
    if (filtroInvEstado === 'void' && !inv.anulado) return false
    if (filtroInvDesde && new Date(inv.created_at) < new Date(filtroInvDesde + 'T00:00:00')) return false
    if (filtroInvHasta && new Date(inv.created_at) > new Date(filtroInvHasta + 'T23:59:59')) return false
    return true
  })

  const totalIngresos = pedidosFinanzas.reduce((sum, p) => sum + (p.total || 0), 0) + totalInvoicesSinPedido
  const totalEgresos = gastosFinanzas.reduce((sum, g) => sum + (g.monto || 0), 0)
  const resultado = totalIngresos - totalEgresos
  const margenPct = totalIngresos > 0 ? (resultado / totalIngresos * 100) : 0

  const egresosPorCategoria = CATEGORIAS_GASTO.map(cat => ({
    cat,
    total: gastosFinanzas.filter(g => g.categoria === cat).reduce((sum, g) => sum + (g.monto || 0), 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  // ── Gastos via API route v2 ─────────────────────────────────────────────────────
  async function guardarGasto() {
    if (!formGasto.monto || !formGasto.fecha) return alert('Monto y fecha son requeridos')
    setGuardandoGasto(true)
    setErrorGasto('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formGasto, creado_por: user?.id })
      })
      const data = await res.json()
      if (data.error) { setErrorGasto(data.error); setGuardandoGasto(false); return }
      setFormGasto({ categoria: 'Proveedores', proveedor: '', monto: '', fecha: new Date().toISOString().slice(0,10), nota: '' })
      setShowFormGasto(false)
      await cargarGastos()
    } catch (e: any) { setErrorGasto(e.message) }
    setGuardandoGasto(false)
  }

  async function eliminarGasto(id: string) {
    if (!confirm('Eliminar este gasto?')) return
    await fetch('/api/gastos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await cargarGastos()
  }

  // ── Inventario ───────────────────────────────────────────────────────────────
  async function guardarStock(id: string) {
    await supabase.from('productos').update({ stock: parseInt(stockTemp) || 0 }).eq('id', id)
    setEditandoStock(null)
    await cargarProductos()
  }

  async function guardarCosto(id: string) {
    await supabase.from('productos').update({ costo: parseFloat(costoTemp) || 0 }).eq('id', id)
    setEditandoCosto(null)
    await cargarProductos()
  }

  function exportarGastos() {
    const headers = ['Fecha', 'Categoria', 'Proveedor', 'Monto', 'Nota']
    const filas = gastosFinanzas.map(g => [g.fecha, g.categoria, g.proveedor || '—', `$${g.monto?.toFixed(2)}`, g.nota || '—'])
    descargarCSV('gastos-bood-supply', filas, headers)
  }

  async function crearUsuario() {
    if (!formUsuario.email || !formUsuario.nombre) return setErrorUsuario('Email y nombre son requeridos')
    setCreandoUsuario(true); setErrorUsuario('')
    try {
      const res = await fetch('/api/crear-usuario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formUsuario) })
      const data = await res.json()
      if (data.error) { setErrorUsuario(data.error); setCreandoUsuario(false); return }
      const userId = data.userId
      let sales_tax_url = null, id_foto_url = null, crt61_url = null
      if (archivoTaxUsuario) { const ext = archivoTaxUsuario.name.split('.').pop(); const { error: ue } = await supabase.storage.from('documentos').upload(`sales-tax/${userId}.${ext}`, archivoTaxUsuario, { upsert: true }); if (!ue) { const { data: ud } = supabase.storage.from('documentos').getPublicUrl(`sales-tax/${userId}.${ext}`); sales_tax_url = ud.publicUrl } }
      if (archivoIdUsuario) { const ext = archivoIdUsuario.name.split('.').pop(); const { error: ue } = await supabase.storage.from('documentos').upload(`ids/${userId}.${ext}`, archivoIdUsuario, { upsert: true }); if (!ue) { const { data: ud } = supabase.storage.from('documentos').getPublicUrl(`ids/${userId}.${ext}`); id_foto_url = ud.publicUrl } }
      if (archivoCRTUsuario) { const ext = archivoCRTUsuario.name.split('.').pop(); const { error: ue } = await supabase.storage.from('documentos').upload(`crt61/${userId}.${ext}`, archivoCRTUsuario, { upsert: true }); if (!ue) { const { data: ud } = supabase.storage.from('documentos').getPublicUrl(`crt61/${userId}.${ext}`); crt61_url = ud.publicUrl } }
      await supabase.from('profiles').update({ fecha_nacimiento: formUsuario.fecha_nacimiento || null, sales_tax_url, id_foto_url, crt61_url }).eq('id', userId)
      setUsuarioCreado(true)
      setFormUsuario({ email: '', nombre: '', negocio: '', telefono: '', direccion: '', ein: '', fecha_nacimiento: '' })
      setArchivoTaxUsuario(null); setArchivoIdUsuario(null); setArchivoCRTUsuario(null)
      setShowFormUsuario(false)
      setTimeout(() => setUsuarioCreado(false), 4000)
      await cargarClientes()
    } catch (e: any) { setErrorUsuario(e.message) }
    setCreandoUsuario(false)
  }

  async function aprobarCliente(c: any, aprobar: boolean) {
    setAprobando(c.id)
    await supabase.from('profiles').update({ aprobado: aprobar, aprobado_at: aprobar ? new Date().toISOString() : null }).eq('id', c.id)
    if (aprobar) { try { await fetch('/api/aprobar-cliente', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: c.email, nombre: c.nombre }) }) } catch (e) { console.error('Email error:', e) } }
    await cargarClientes(); setAprobando(null)
  }

  async function cargarAnalytics() {
    setLoadingAnalytics(true)
    setErrorAnalytics('')
    try {
      const res = await fetch('/api/analytics')
      const data = await res.json()
      if (data.error) { setErrorAnalytics(data.error); setLoadingAnalytics(false); return }
      setAnalyticsData(data)
    } catch(e: any) { setErrorAnalytics(e.message) }
    setLoadingAnalytics(false)
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from('pedidos').update({ estado }).eq('id', id)
    await cargarPedidos()
    // Notificar al cliente por email
    const ped = pedidos.find(p => p.id === id)
    const cliente = ped ? getCliente(ped.cliente_id) : null
    if (cliente?.email && ['confirmado','en_preparacion','despachado','entregado'].includes(estado)) {
      const invoice = invoices.find(inv => inv.pedido_id === id)
      // Verificar si algún precio cambió
      const itemsConPrecio = ped?.pedido_items || []
      const preciosCambiados = itemsConPrecio.filter((item: any) => {
        const precioActual = item.productos?.precio
        const precioOriginal = item.precio_unitario
        return precioActual && precioOriginal && Math.abs(precioActual - precioOriginal) > 0.01
      })
      if (preciosCambiados.length > 0) {
        const listaPrecios = preciosCambiados.map((item: any) =>
          `${item.productos?.nombre}: $${item.precio_unitario} → $${item.productos?.precio}`
        ).join(', ')
        fetch('/api/notificar-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'pedido_nuevo',
            datos: {
              pedido_id: pedidoId + ' ⚠️ PRECIOS CAMBIADOS: ' + listaPrecios,
              cliente_nombre: ped?.clientes?.nombre || '',
              negocio: ped?.clientes?.negocio || '',
              telefono: ped?.clientes?.telefono || '',
              metodo_pago: ped?.metodo_pago || '',
              total: ped?.total || 0,
              items: []
            }
          })
        })
      }
      fetch('/api/notificar-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: id,
          pedido_numero: invoice?.numero || null,
          estado,
          cliente_email: cliente.email,
          cliente_nombre: cliente.nombre,
          items: ped?.pedido_items?.map((i: any) => ({ nombre: i.productos?.nombre, cantidad: i.cantidad, subtotal: (i.precio_unitario * i.cantidad).toFixed(2) })),
          total: ped?.total?.toFixed(2)
        })
      }).catch(console.error)
    }
  }

  async function eliminarPedido(id: string) {
    if (!confirm('Eliminar este pedido?')) return
    await supabase.from('pedido_items').delete().eq('pedido_id', id)
    await supabase.from('pedidos').delete().eq('id', id)
    await cargarPedidos()
  }

  async function eliminarCliente(id: string, email: string) {
    if (!confirm(`Eliminar cliente ${email}?`)) return
    const pedidosCliente = pedidos.filter(p => p.cliente_id === id)
    for (const ped of pedidosCliente) { await supabase.from('pedido_items').delete().eq('pedido_id', ped.id) }
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
    let extraUpdates: any = {}
    if (archivoEditTax) { const ext = archivoEditTax.name.split('.').pop(); const { error: ue } = await supabase.storage.from('documentos').upload(`sales-tax/${id}.${ext}`, archivoEditTax, { upsert: true }); if (!ue) { const { data: ud } = supabase.storage.from('documentos').getPublicUrl(`sales-tax/${id}.${ext}`); extraUpdates.sales_tax_url = ud.publicUrl } }
    if (archivoEditId) { const ext = archivoEditId.name.split('.').pop(); const { error: ue } = await supabase.storage.from('documentos').upload(`ids/${id}.${ext}`, archivoEditId, { upsert: true }); if (!ue) { const { data: ud } = supabase.storage.from('documentos').getPublicUrl(`ids/${id}.${ext}`); extraUpdates.id_foto_url = ud.publicUrl } }
    if (archivoEditCrt) { const ext = archivoEditCrt.name.split('.').pop(); const { error: ue } = await supabase.storage.from('documentos').upload(`crt61/${id}.${ext}`, archivoEditCrt, { upsert: true }); if (!ue) { const { data: ud } = supabase.storage.from('documentos').getPublicUrl(`crt61/${id}.${ext}`); extraUpdates.crt61_url = ud.publicUrl } }
    await supabase.from('profiles').update({ ...formCliente, ...extraUpdates }).eq('id', id)
    setArchivoEditTax(null); setArchivoEditId(null); setArchivoEditCrt(null)
    await cargarClientes(); setEditandoCliente(null); setGuardando(false)
  }

  async function enviarMensaje() {
    if (!mensajeAsunto || !mensajeCuerpo) return alert('Llena asunto y mensaje')
    if (destinatarios.length === 0) return alert('Selecciona al menos un destinatario')
    setEnviandoMensaje(true)
    try {
      for (const email of destinatarios) {
        const cliente = clientes.find(c => c.email === email)
        await fetch('/api/aprobar-cliente', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, nombre: cliente?.nombre || email, asunto: mensajeAsunto, cuerpo: mensajeCuerpo }) })
      }
      setMensajeEnviado(true); setMensajeAsunto(''); setMensajeCuerpo(''); setDestinatarios([])
      setTimeout(() => setMensajeEnviado(false), 3000)
    } catch (e) { console.error('Error:', e) }
    setEnviandoMensaje(false)
  }

  async function traducirTexto(texto: string): Promise<string> {
    try {
      const res = await fetch('/api/traducir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto, idioma: 'EN' }) })
      const data = await res.json()
      return data.traduccion || texto
    } catch { return texto }
  }

  async function agregarProducto() {
    if (!formProducto.nombre || !formProducto.precio || !formProducto.unidad || !formProducto.categoria) return alert('Llena todos los campos')
    setGuardando(true)
    let imagen_url = null
    if (imagenProducto) {
      const ext = imagenProducto.name.split('.').pop()
      const path = `productos/${Date.now()}.${ext}`
      const { error: ue } = await supabase.storage.from('documentos').upload(path, imagenProducto, { upsert: true })
      if (!ue) { const { data: ud } = supabase.storage.from('documentos').getPublicUrl(path); imagen_url = ud.publicUrl }
    }
    const nombre_en = await traducirTexto(formProducto.nombre)
    const descripcion_en = formProducto.descripcion ? await traducirTexto(formProducto.descripcion) : ''
    await supabase.from('productos').insert({ ...formProducto, precio: parseFloat(formProducto.precio), activo: true, imagen_url, nombre_en, descripcion_en })
    setFormProducto({ nombre: '', descripcion: '', categoria: '', precio: '', unidad: '' }); setImagenProducto(null); setShowFormProducto(false)
    await cargarProductos(); setGuardando(false)
  }

  function iniciarEdicionProducto(p: any) {
    setEditandoProducto(p.id)
    setFormEditProducto({ nombre: p.nombre || '', descripcion: p.descripcion || '', categoria: p.categoria || '', precio: String(p.precio || ''), unidad: p.unidad || '', nombre_en: p.nombre_en || '', descripcion_en: p.descripcion_en || '' })
  }

  async function guardarProducto(id: string) {
    setGuardando(true)
    await supabase.from('productos').update({ nombre: formEditProducto.nombre, descripcion: formEditProducto.descripcion, categoria: formEditProducto.categoria, precio: parseFloat(formEditProducto.precio), unidad: formEditProducto.unidad, nombre_en: formEditProducto.nombre_en, descripcion_en: formEditProducto.descripcion_en }).eq('id', id)
    setEditandoProducto(null); await cargarProductos(); setGuardando(false)
  }

  async function actualizarImagenProducto(id: string, file: File) {
    try {
      const ext = file.name.split('.').pop()
      const path = `productos/${id}-${Date.now()}.${ext}`
      const { error: ue } = await supabase.storage.from('documentos').upload(path, file, { upsert: true })
      if (ue) { alert('Error subiendo imagen: ' + ue.message); return }
      const { data: ud } = supabase.storage.from('documentos').getPublicUrl(path)
      await supabase.from('productos').update({ imagen_url: ud.publicUrl }).eq('id', id)
      await cargarProductos()
    } catch (e: any) { alert('Error: ' + e.message) }
  }

  function seleccionarImagen(id: string) {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.jpg,.jpeg,.png,.webp'
    input.onchange = (e: any) => { if (e.target.files?.[0]) actualizarImagenProducto(id, e.target.files[0]) }
    input.click()
  }

  async function agregarCategoria() {
    if (!nuevaCategoria.trim()) return alert('Escribe un nombre')
    if (categorias.includes(nuevaCategoria.trim())) return alert('Ya existe esa categoria')
    setCategorias(prev => [...prev, nuevaCategoria.trim()]); setNuevaCategoria(''); setShowFormCategoria(false)
  }

  async function guardarCategoria(catAntigua: string) {
    if (!categoriaEditNombre.trim()) return alert('Escribe un nombre')
    if (categoriaEditNombre === catAntigua) { setEditandoCategoria(null); return }
    setGuardando(true)
    await supabase.from('productos').update({ categoria: categoriaEditNombre.trim() }).eq('categoria', catAntigua)
    await cargarProductos(); setEditandoCategoria(null); setGuardando(false)
  }

  async function eliminarCategoria(cat: string) {
    if (!confirm(`Eliminar categoria "${cat}"?`)) return
    await supabase.from('productos').update({ categoria: '' }).eq('categoria', cat)
    await cargarProductos()
  }

  async function toggleActivo(id: string, activo: boolean) {
    await supabase.from('productos').update({ activo: !activo }).eq('id', id); await cargarProductos()
  }

  async function eliminarProducto(id: string) {
    if (!confirm('Eliminar este producto?')) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) { alert('Error al eliminar: ' + error.message); return }
    await cargarProductos()
  }

  function toggleSeleccion(id: string) { setSeleccionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]) }
  function togglePedidoRuta(id: string) { setPedidosRuta(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]) }
  function toggleDestinatario(email: string) { setDestinatarios(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]) }

  function exportarVentas() {
    const headers = ['# Pedido', 'Fecha', 'Cliente', 'Negocio', 'Email', 'Direccion', 'EIN', 'Metodo Pago', 'Productos', 'Subtotal', 'Fuel Surcharge', 'Total', 'Estado']
    const filas = pedidosFiltrados.map(ped => {
      const cliente = getCliente(ped.cliente_id)
      const prods = ped.pedido_items?.map((i: any) => `${i.productos?.nombre} x${i.cantidad}`).join(' | ') || ''
      const subtotal = (ped.total || 0) - (ped.fuel_surcharge || 0)
      return [ped.id.slice(0,8).toUpperCase(), new Date(ped.created_at).toLocaleDateString('es-MX'), cliente?.nombre || '—', cliente?.negocio || '—', cliente?.email || '—', cliente?.direccion || '—', cliente?.ein || '—', ped.metodo_pago || '—', prods, `$${subtotal.toFixed(2)}`, `$${(ped.fuel_surcharge||0).toFixed(2)}`, `$${ped.total?.toFixed(2)}`, ped.estado]
    })
    descargarCSV('ventas-bood-supply', filas, headers)
  }

  function exportarClientes() {
    const headers = ['Nombre', 'Negocio', 'Email', 'Telefono', 'Direccion', 'EIN', 'Fecha Nacimiento', 'Aprobado', 'Pedidos', 'Total Gastado', 'Ultimo Pedido', 'Registro']
    const filas = clientes.map(c => {
      const pedidosC = getPedidosCliente(c.id)
      const totalGastado = pedidosC.filter(p => p.estado !== 'cancelado').reduce((sum, p) => sum + (p.total || 0), 0)
      const ultimoPedido = pedidosC[0]
      return [c.nombre || '—', c.negocio || '—', c.email || '—', c.telefono || '—', c.direccion || '—', c.ein || '—', c.fecha_nacimiento || '—', c.aprobado ? 'Si' : 'No', String(pedidosC.length), `$${totalGastado.toFixed(2)}`, ultimoPedido ? new Date(ultimoPedido.created_at).toLocaleDateString('es-MX') : '—', new Date(c.created_at).toLocaleDateString('es-MX')]
    })
    descargarCSV('clientes-bood-supply', filas, headers)
  }

  function imprimirOrdenes() {
    const pedidosSeleccionados = pedidos.filter(p => seleccionados.includes(p.id))
    const html = `<html><head><title>Ordenes - BOOD SUPPLY</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px;color:#2D3748}.orden{border:1px solid #ccc;padding:16px;margin-bottom:28px;page-break-inside:avoid;border-radius:8px}.header{background:#0F2B5B;color:white;padding:10px 16px;border-radius:6px;margin-bottom:14px;display:flex;justify-content:space-between}.header h2{margin:0;font-size:15px}.header p{margin:0;font-size:11px;opacity:.8}.seccion{margin-bottom:12px}.seccion h3{font-size:10px;text-transform:uppercase;color:#888;margin:0 0 6px;border-bottom:1px solid #eee;padding-bottom:3px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px}.campo{font-size:11px;padding:2px 0}.campo b{color:#0F2B5B}.item-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f5f5f5;font-size:11px}.total{font-size:15px;font-weight:bold;color:#F47B20;text-align:right;margin-top:10px;padding-top:8px;border-top:2px solid #F47B20}.logo-header{text-align:center;margin-bottom:24px;border-bottom:2px solid #0F2B5B;padding-bottom:12px}.logo-header h1{color:#0F2B5B;margin:0;font-size:20px}</style></head><body><div class="logo-header"><h1>BOOD SUPPLY</h1><p>2900 N Richmond St, Chicago, IL 60618 · (312) 409-0106 · boodsupplies@gmail.com</p><p>Ordenes de Entrega - ${new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})}</p></div>${pedidosSeleccionados.map(ped=>{const cliente=getCliente(ped.cliente_id);const subtotal=(ped.total||0)-(ped.fuel_surcharge||0);return`<div class="orden"><div class="header"><div><h2>Pedido #${ped.id.slice(0,8).toUpperCase()}</h2></div><div style="text-align:right"><p>${new Date(ped.created_at).toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})}</p><p>Estado: ${ped.estado.replace('_',' ')} · Pago: ${ped.metodo_pago||'N/A'}</p></div></div><div class="seccion"><h3>Datos del Cliente</h3><div class="grid2"><div class="campo"><b>Nombre:</b> ${cliente?.nombre||'N/A'}</div><div class="campo"><b>Negocio:</b> ${cliente?.negocio||'N/A'}</div><div class="campo"><b>Telefono:</b> ${cliente?.telefono||'N/A'}</div><div class="campo"><b>EIN:</b> ${cliente?.ein||'N/A'}</div><div class="campo" style="grid-column:span 2"><b>Direccion:</b> ${cliente?.direccion||'N/A'}</div></div></div><div class="seccion"><h3>Detalle del Pedido</h3>${ped.pedido_items?.map((item:any)=>`<div class="item-row"><span>${item.productos?.nombre||'Producto'} x${item.cantidad}</span><span><b>$${(item.precio_unitario*item.cantidad).toFixed(2)}</b></span></div>`).join('')}<div class="item-row" style="color:#888"><span>Fuel Surcharge</span><span>$${(ped.fuel_surcharge||0).toFixed(2)}</span></div></div><div class="total">Total: $${ped.total?.toFixed(2)}</div></div>`}).join('')}</body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500) }
  }

  const pendientesAprobacion = clientes.filter(c => !c.aprobado).length
  const pedidosParaRuta = pedidos.filter(p => ['pendiente', 'confirmado', 'en_preparacion'].includes(p.estado))

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

  return (
    <div className="min-h-screen bg-brand-gray-light">
      {usuarioCreado && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium">Usuario creado y correo enviado</div>}

      <nav className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3"><Package size={22} className="text-brand-orange"/><span className="font-heading font-bold text-lg">Admin - BOOD SUPPLY</span></div>
        <div className="flex items-center gap-4">
          <a href="https://www.facebook.com/profile.php?id=61582953226409" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-colors text-sm">Facebook</a>
          <span className="text-blue-300 text-sm hidden md:block">{user?.email}</span>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors"><LogOut size={16}/> Salir</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{label:'Pedidos totales',value:pedidos.length,color:'text-brand-navy'},{label:'Recibidos',value:pedidos.filter(p=>p.estado==='pendiente').length,color:'text-yellow-600'},{label:'Clientes',value:clientes.length,color:'text-brand-orange'},{label:'Total ventas',value:`$${totalVentas.toFixed(2)}`,color:'text-green-600'}].map(({label,value,color})=>(
            <div key={label} className="card text-center py-4"><div className={`font-heading text-2xl font-bold ${color}`}>{value}</div><div className="text-brand-gray-mid text-sm mt-1">{label}</div></div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {[
            {key:'clientes',label:'Clientes',icon:Users,badge:pendientesAprobacion},
            {key:'pedidos',label:'Pedidos',icon:ShoppingBag,badge:0},
            {key:'invoices',label:'Invoices',icon:Receipt,badge:0},
            {key:'finanzas',label:'Finanzas',icon:BarChart2,badge:0},
            {key:'analytics',label:'Analytics',icon:TrendingUp,badge:0},
            {key:'rutas',label:'Rutas',icon:Map,badge:0},
            {key:'mensajes',label:'Mensajes',icon:Mail,badge:0},
            {key:'productos',label:'Productos',icon:Package,badge:0},
            {key:'categorias',label:'Categorias',icon:Tag,badge:0}
          ].map(({key,label,icon:Icon,badge})=>(
            <button key={key} onClick={()=>setTab(key as any)} className={`font-heading font-semibold px-5 py-2.5 rounded-button transition-all flex items-center gap-2 ${tab===key?'bg-brand-navy text-white':'bg-white text-brand-navy border border-gray-200 hover:border-brand-navy'}`}>
              <Icon size={16}/> {label}
              {badge>0&&<span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${tab===key?'bg-white text-brand-navy':'bg-red-500 text-white'}`}>{badge}</span>}
            </button>
          ))}
        </div>

        {/* FINANZAS */}
        {tab === 'finanzas' && (
          <div>
            <div className="flex gap-2 mb-6">
              {[{key:'resumen',label:'📊 Resumen'},{key:'gastos',label:'💸 Gastos'},{key:'inventario',label:'📦 Inventario'}].map(({key,label})=>(
                <button key={key} onClick={()=>setFinanzasTab(key as any)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${finanzasTab===key?'bg-brand-orange text-white':'bg-white text-brand-navy border border-gray-200 hover:border-brand-orange'}`}>{label}</button>
              ))}
            </div>
            <div className="card mb-6">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex gap-2">
                  {[{key:'dia',label:'Hoy'},{key:'semana',label:'7 días'},{key:'mes',label:'Este mes'},{key:'anio',label:'Este año'}].map(({key,label})=>(
                    <button key={key} onClick={()=>calcularRangoFechas(key)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${finanzasPeriodo===key?'bg-brand-navy text-white':'bg-gray-100 text-brand-navy hover:bg-gray-200'}`}>{label}</button>
                  ))}
                </div>
                <div className="flex items-end gap-2 ml-auto">
                  <div><label className="block text-xs text-brand-gray-mid mb-1">Desde</label><input type="date" value={fechaFinDesde} onChange={e=>setFechaFinDesde(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs text-brand-gray-mid mb-1">Hasta</label><input type="date" value={fechaFinHasta} onChange={e=>setFechaFinHasta(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-orange"/></div>
                </div>
              </div>
            </div>

            {finanzasTab === 'resumen' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="card border-l-4 border-l-green-400"><div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-green-500"/><span className="text-xs text-brand-gray-mid font-medium">Ingresos</span></div><div className="font-heading font-bold text-2xl text-green-600">${totalIngresos.toFixed(2)}</div><div className="text-xs text-brand-gray-mid mt-1">{pedidosFinanzas.length} pedidos</div></div>
                  <div className="card border-l-4 border-l-red-400"><div className="flex items-center gap-2 mb-1"><TrendingDown size={16} className="text-red-500"/><span className="text-xs text-brand-gray-mid font-medium">Egresos</span></div><div className="font-heading font-bold text-2xl text-red-500">${totalEgresos.toFixed(2)}</div><div className="text-xs text-brand-gray-mid mt-1">{gastosFinanzas.length} gastos</div></div>
                  <div className={`card border-l-4 ${resultado >= 0 ? 'border-l-brand-navy' : 'border-l-red-500'}`}><div className="flex items-center gap-2 mb-1"><DollarSign size={16} className={resultado >= 0 ? 'text-brand-navy' : 'text-red-500'}/><span className="text-xs text-brand-gray-mid font-medium">Resultado</span></div><div className={`font-heading font-bold text-2xl ${resultado >= 0 ? 'text-brand-navy' : 'text-red-500'}`}>{resultado >= 0 ? '+' : ''}${resultado.toFixed(2)}</div><div className="text-xs text-brand-gray-mid mt-1">{resultado >= 0 ? 'Ganancia' : 'Perdida'}</div></div>
                  <div className="card border-l-4 border-l-brand-orange"><div className="flex items-center gap-2 mb-1"><BarChart2 size={16} className="text-brand-orange"/><span className="text-xs text-brand-gray-mid font-medium">Margen</span></div><div className={`font-heading font-bold text-2xl ${margenPct >= 0 ? 'text-brand-orange' : 'text-red-500'}`}>{margenPct.toFixed(1)}%</div><div className="text-xs text-brand-gray-mid mt-1">Sobre ingresos</div></div>
                </div>
                {totalIngresos > 0 && (
                  <div className="card">
                    <h3 className="font-heading font-semibold text-brand-navy mb-4">Ingresos vs Egresos</h3>
                    <div className="space-y-3">
                      <div><div className="flex justify-between text-xs mb-1"><span className="text-green-600 font-medium">Ingresos</span><span className="text-green-600 font-bold">${totalIngresos.toFixed(2)}</span></div><div className="w-full bg-gray-100 rounded-full h-4"><div className="bg-green-500 h-4 rounded-full" style={{width:'100%'}}/></div></div>
                      <div><div className="flex justify-between text-xs mb-1"><span className="text-red-500 font-medium">Egresos</span><span className="text-red-500 font-bold">${totalEgresos.toFixed(2)}</span></div><div className="w-full bg-gray-100 rounded-full h-4"><div className="bg-red-400 h-4 rounded-full" style={{width:`${Math.min((totalEgresos/totalIngresos)*100,100)}%`}}/></div></div>
                      <div><div className="flex justify-between text-xs mb-1"><span className={resultado>=0?'text-brand-navy font-medium':'text-red-600 font-medium'}>Resultado neto</span><span className={resultado>=0?'text-brand-navy font-bold':'text-red-600 font-bold'}>${resultado.toFixed(2)}</span></div><div className="w-full bg-gray-100 rounded-full h-4"><div className={`h-4 rounded-full ${resultado>=0?'bg-brand-navy':'bg-red-600'}`} style={{width:`${Math.min(Math.abs(resultado/totalIngresos)*100,100)}%`}}/></div></div>
                    </div>
                  </div>
                )}
                {egresosPorCategoria.length > 0 && (
                  <div className="card">
                    <h3 className="font-heading font-semibold text-brand-navy mb-4">Egresos por Categoria</h3>
                    <div className="space-y-3">
                      {egresosPorCategoria.map(({cat, total}) => (
                        <div key={cat}>
                          <div className="flex justify-between text-xs mb-1"><span className="text-brand-gray-dark font-medium">{cat}</span><span className="text-brand-navy font-bold">${total.toFixed(2)} <span className="text-brand-gray-mid font-normal">({totalEgresos>0?(total/totalEgresos*100).toFixed(0):0}%)</span></span></div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-brand-orange h-2.5 rounded-full" style={{width:`${totalEgresos>0?(total/totalEgresos*100):0}%`}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {totalIngresos === 0 && totalEgresos === 0 && (
                  <div className="card text-center py-16 text-brand-gray-mid"><BarChart2 size={48} className="mx-auto mb-3 opacity-20"/><p className="font-medium">No hay datos en este periodo</p><p className="text-sm mt-1">Selecciona un rango de fechas diferente o agrega gastos</p></div>
                )}
              </div>
            )}

            {finanzasTab === 'gastos' && (
              <div>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h3 className="font-heading font-bold text-brand-navy text-lg">Registro de Gastos <span className="text-sm font-normal text-brand-gray-mid">({gastosFinanzas.length} en periodo · Total: ${totalEgresos.toFixed(2)})</span></h3>
                  <div className="flex gap-2">
                    <button onClick={()=>setShowFormGasto(!showFormGasto)} className="btn-primary flex items-center gap-2"><Plus size={15}/> Agregar Gasto</button>
                    {gastosFinanzas.length > 0 && <button onClick={exportarGastos} className="flex items-center gap-2 bg-white border border-gray-200 text-brand-navy px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-orange"><Download size={15}/> CSV</button>}
                  </div>
                </div>
                {showFormGasto && (
                  <div className="card border-2 border-brand-orange/30 mb-5">
                    <h4 className="font-heading font-semibold text-brand-navy mb-4">Nuevo Gasto</h4>
                    {errorGasto && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{errorGasto}</div>}
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Categoria *</label>
                        <select value={formGasto.categoria} onChange={e=>setFormGasto({...formGasto,categoria:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white">
                          {CATEGORIAS_GASTO.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Proveedor / Descripcion</label><input value={formGasto.proveedor} onChange={e=>setFormGasto({...formGasto,proveedor:e.target.value})} placeholder="Ej: Sysco Foods" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                      <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Monto (USD) *</label><input value={formGasto.monto} onChange={e=>setFormGasto({...formGasto,monto:e.target.value})} placeholder="0.00" type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                      <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Fecha *</label><input value={formGasto.fecha} onChange={e=>setFormGasto({...formGasto,fecha:e.target.value})} type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                      <div className="col-span-2"><label className="block text-xs font-medium text-brand-gray-dark mb-1">Nota</label><input value={formGasto.nota} onChange={e=>setFormGasto({...formGasto,nota:e.target.value})} placeholder="Nota adicional (opcional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={guardarGasto} disabled={guardandoGasto} className="btn-primary flex items-center gap-2"><Save size={15}/> {guardandoGasto?'Guardando...':'Guardar Gasto'}</button>
                      <button onClick={()=>{setShowFormGasto(false);setErrorGasto('')}} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy">Cancelar</button>
                    </div>
                  </div>
                )}
                {gastosFinanzas.length === 0 ? (
                  <div className="card text-center py-16 text-brand-gray-mid"><TrendingDown size={48} className="mx-auto mb-3 opacity-20"/><p className="font-medium">No hay gastos en este periodo</p><p className="text-sm mt-1">Haz clic en "Agregar Gasto" para registrar uno</p></div>
                ) : (
                  <div className="space-y-2">
                    {gastosFinanzas.map(g => (
                      <div key={g.id} className="card flex items-center justify-between flex-wrap gap-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0"><TrendingDown size={16} className="text-red-500"/></div>
                          <div>
                            <div className="flex items-center gap-2"><span className="font-medium text-brand-navy text-sm">{g.proveedor || g.categoria}</span><span className="text-xs bg-gray-100 text-brand-gray-mid px-2 py-0.5 rounded-full">{g.categoria}</span></div>
                            <p className="text-xs text-brand-gray-mid">{new Date(g.fecha + 'T12:00:00').toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'})}{g.nota && <span> · {g.nota}</span>}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-heading font-bold text-red-500">${g.monto?.toFixed(2)}</span>
                          <button onClick={()=>eliminarGasto(g.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 text-red-400"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {finanzasTab === 'inventario' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading font-bold text-brand-navy text-lg">Inventario y Margenes</h3>
                  <p className="text-xs text-brand-gray-mid">Haz clic en el costo o stock para editarlo</p>
                </div>
                {productos.filter(p => p.activo && (p.stock ?? 0) <= 5).length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5"/>
                    <div><p className="font-semibold text-yellow-700 text-sm">Stock bajo en {productos.filter(p=>p.activo&&(p.stock??0)<=5).length} producto(s)</p><p className="text-xs text-yellow-600 mt-0.5">{productos.filter(p=>p.activo&&(p.stock??0)<=5).map(p=>p.nombre).join(', ')}</p></div>
                  </div>
                )}
                <div className="card overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-3 px-3 text-xs font-semibold text-brand-gray-mid">Producto</th>
                        <th className="text-center py-3 px-3 text-xs font-semibold text-brand-gray-mid">Stock</th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-brand-gray-mid">Costo</th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-brand-gray-mid">Precio venta</th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-brand-gray-mid">Ganancia/u</th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-brand-gray-mid"><span className="block">Margen s/costo</span><span className="text-[10px] font-normal">(ganancia ÷ costo)</span></th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-brand-gray-mid"><span className="block">Margen s/precio</span><span className="text-[10px] font-normal">(ganancia ÷ precio)</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.filter(p => p.activo).map(p => {
                        const costo = p.costo || 0; const precio = p.precio || 0; const ganancia = precio - costo
                        const margenSCosto = costo > 0 ? (ganancia / costo * 100) : 0
                        const margenSPrecio = precio > 0 ? (ganancia / precio * 100) : 0
                        const stockBajo = (p.stock ?? 0) <= 5; const tieneCosto = costo > 0
                        const colorSCosto = margenSCosto >= 50 ? 'bg-green-100 text-green-700' : margenSCosto >= 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
                        const colorSPrecio = margenSPrecio >= 30 ? 'bg-green-100 text-green-700' : margenSPrecio >= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
                        return (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-3"><div className="flex items-center gap-2">{p.imagen_url?<img src={p.imagen_url} alt={p.nombre} className="w-9 h-9 rounded-lg object-contain bg-gray-100 flex-shrink-0"/>:<div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><Package size={14} className="text-gray-400"/></div>}<div><p className="font-semibold text-brand-navy">{p.nombre}</p><p className="text-xs text-brand-gray-mid">{p.categoria} · {p.unidad}</p></div></div></td>
                            <td className="py-3 px-3 text-center">{editandoStock===p.id?(<div className="flex items-center gap-1 justify-center"><input value={stockTemp} onChange={e=>setStockTemp(e.target.value)} type="number" className="w-20 border border-brand-orange rounded-lg px-2 py-1 text-sm text-center focus:outline-none" autoFocus onKeyDown={e=>e.key==='Enter'&&guardarStock(p.id)}/><button onClick={()=>guardarStock(p.id)} className="text-green-500 hover:text-green-700"><Save size={14}/></button><button onClick={()=>setEditandoStock(null)} className="text-brand-gray-mid hover:text-brand-navy"><X size={14}/></button></div>):(<button onClick={()=>{setEditandoStock(p.id);setStockTemp(String(p.stock??0))}} className={`font-bold px-3 py-1 rounded-lg text-sm cursor-pointer hover:opacity-80 ${stockBajo?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{p.stock??0}{stockBajo&&' ⚠️'}</button>)}</td>
                            <td className="py-3 px-3 text-right">{editandoCosto===p.id?(<div className="flex items-center gap-1 justify-end"><input value={costoTemp} onChange={e=>setCostoTemp(e.target.value)} type="number" step="0.01" className="w-24 border border-brand-orange rounded-lg px-2 py-1 text-sm text-right focus:outline-none" autoFocus onKeyDown={e=>e.key==='Enter'&&guardarCosto(p.id)}/><button onClick={()=>guardarCosto(p.id)} className="text-green-500 hover:text-green-700"><Save size={14}/></button><button onClick={()=>setEditandoCosto(null)} className="text-brand-gray-mid hover:text-brand-navy"><X size={14}/></button></div>):(<button onClick={()=>{setEditandoCosto(p.id);setCostoTemp(String(p.costo??0))}} className="font-medium text-brand-gray-dark hover:text-brand-navy cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors">{tieneCosto?`$${costo.toFixed(2)}`:<span className="text-brand-orange text-xs italic font-semibold">+ Agregar</span>}</button>)}</td>
                            <td className="py-3 px-3 text-right font-semibold text-brand-navy">${precio.toFixed(2)}</td>
                            <td className="py-3 px-3 text-right">{tieneCosto?<span className={`font-bold ${ganancia>=0?'text-green-600':'text-red-500'}`}>${ganancia.toFixed(2)}</span>:<span className="text-brand-gray-mid text-xs">—</span>}</td>
                            <td className="py-3 px-3 text-right">{tieneCosto?<span className={`font-bold text-xs px-2 py-1 rounded-full ${colorSCosto}`}>{margenSCosto.toFixed(1)}%</span>:<span className="text-brand-gray-mid text-xs">—</span>}</td>
                            <td className="py-3 px-3 text-right">{tieneCosto?<span className={`font-bold text-xs px-2 py-1 rounded-full ${colorSPrecio}`}>{margenSPrecio.toFixed(1)}%</span>:<span className="text-brand-gray-mid text-xs">—</span>}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-xs font-semibold text-brand-gray-dark mb-2">Margen sobre costo (markup)</p><div className="flex gap-3 text-xs text-brand-gray-mid"><span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-200 inline-block"/> ≥50% bueno</span><span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-200 inline-block"/> 20–50% medio</span><span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-200 inline-block"/> &lt;20% bajo</span></div></div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-xs font-semibold text-brand-gray-dark mb-2">Margen sobre precio (margen bruto)</p><div className="flex gap-3 text-xs text-brand-gray-mid"><span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-200 inline-block"/> ≥30% bueno</span><span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-200 inline-block"/> 10–30% medio</span><span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-200 inline-block"/> &lt;10% bajo</span></div></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-heading font-bold text-brand-navy text-xl">Analytics — Bood Supply</h2>
                <p className="text-brand-gray-mid text-sm mt-1">Datos de los últimos 30 días de boodsupply.com</p>
              </div>
              <button onClick={cargarAnalytics} disabled={loadingAnalytics} className="btn-primary flex items-center gap-2">
                {loadingAnalytics ? 'Cargando...' : '🔄 Actualizar datos'}
              </button>
            </div>

            {errorAnalytics && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{errorAnalytics}</div>}

            {!analyticsData && !loadingAnalytics && (
              <div className="card text-center py-16 text-brand-gray-mid">
                <TrendingUp size={48} className="mx-auto mb-3 opacity-20"/>
                <p className="font-medium text-lg">Dashboard de Analytics</p>
                <p className="text-sm mt-2 mb-6">Haz clic en "Actualizar datos" para cargar las métricas de Google Analytics</p>
                <button onClick={cargarAnalytics} className="btn-primary">Cargar Analytics</button>
              </div>
            )}

            {loadingAnalytics && (
              <div className="card text-center py-16 text-brand-gray-mid">
                <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full mx-auto mb-4"/>
                <p className="font-medium">Cargando datos de Google Analytics...</p>
              </div>
            )}

            {analyticsData && !loadingAnalytics && (() => {
              // Parse sesiones generales
              const ses = analyticsData.sesionesData?.rows?.[0]
              const sesPrev = analyticsData.sesionesData?.rows?.[1]
              const usuarios = parseInt(ses?.metricValues?.[0]?.value || '0')
              const sesiones = parseInt(ses?.metricValues?.[1]?.value || '0')
              const vistas = parseInt(ses?.metricValues?.[2]?.value || '0')
              const bounceRate = parseFloat(ses?.metricValues?.[3]?.value || '0')
              const avgDuration = parseFloat(ses?.metricValues?.[4]?.value || '0')
              const nuevos = parseInt(ses?.metricValues?.[5]?.value || '0')
              const usuariosPrev = parseInt(sesPrev?.metricValues?.[0]?.value || '0')
              const pct = usuariosPrev > 0 ? Math.round((usuarios - usuariosPrev) / usuariosPrev * 100) : 0

              // Realtime
              const realtimeUsers = analyticsData.realtimeData?.rows?.reduce((sum: number, r: any) => sum + parseInt(r.metricValues?.[0]?.value || '0'), 0) || 0

              // Dispositivos
              const dispositivos = analyticsData.dispositivosData?.rows?.map((r: any) => ({
                tipo: r.dimensionValues?.[0]?.value,
                usuarios: parseInt(r.metricValues?.[0]?.value || '0')
              })) || []
              const totalDisp = dispositivos.reduce((s: number, d: any) => s + d.usuarios, 0)

              // Páginas
              const paginas = analyticsData.paginasData?.rows?.slice(0, 8).map((r: any) => ({
                path: r.dimensionValues?.[0]?.value,
                vistas: parseInt(r.metricValues?.[0]?.value || '0')
              })) || []
              const maxVistas = paginas[0]?.vistas || 1

              // Países
              const paises = analyticsData.paisesData?.rows?.slice(0, 6).map((r: any) => ({
                pais: r.dimensionValues?.[0]?.value,
                usuarios: parseInt(r.metricValues?.[0]?.value || '0')
              })) || []

              // Canales
              const canales = analyticsData.canalesData?.rows?.map((r: any) => ({
                canal: r.dimensionValues?.[0]?.value,
                sesiones: parseInt(r.metricValues?.[0]?.value || '0')
              })) || []
              const totalCanales = canales.reduce((s: number, c: any) => s + c.sesiones, 0)

              // Tendencia diaria
              const tendencia = analyticsData.usuariosData?.rows?.slice(-14).map((r: any) => ({
                fecha: r.dimensionValues?.[0]?.value?.slice(4),
                usuarios: parseInt(r.metricValues?.[0]?.value || '0'),
                vistas: parseInt(r.metricValues?.[2]?.value || '0')
              })) || []
              const maxTend = Math.max(...tendencia.map((t: any) => t.vistas), 1)

              return (
                <div className="space-y-6">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card border-l-4 border-l-green-400">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-brand-gray-mid font-medium">Usuarios activos</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{pct >= 0 ? '+' : ''}{pct}%</span>
                      </div>
                      <div className="font-heading font-bold text-2xl text-green-600">{usuarios.toLocaleString()}</div>
                      <div className="text-xs text-brand-gray-mid mt-1">últimos 30 días</div>
                    </div>
                    <div className="card border-l-4 border-l-blue-400">
                      <div className="text-xs text-brand-gray-mid font-medium mb-1">Sesiones</div>
                      <div className="font-heading font-bold text-2xl text-blue-600">{sesiones.toLocaleString()}</div>
                      <div className="text-xs text-brand-gray-mid mt-1">Bounce: {(bounceRate * 100).toFixed(0)}%</div>
                    </div>
                    <div className="card border-l-4 border-l-brand-orange">
                      <div className="text-xs text-brand-gray-mid font-medium mb-1">Vistas de página</div>
                      <div className="font-heading font-bold text-2xl text-brand-orange">{vistas.toLocaleString()}</div>
                      <div className="text-xs text-brand-gray-mid mt-1">{nuevos.toLocaleString()} nuevos usuarios</div>
                    </div>
                    <div className="card border-l-4 border-l-brand-navy">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-brand-gray-mid font-medium">En tiempo real</span>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                      </div>
                      <div className="font-heading font-bold text-2xl text-brand-navy">{realtimeUsers}</div>
                      <div className="text-xs text-brand-gray-mid mt-1">usuarios ahora</div>
                    </div>
                  </div>

                  {/* Tendencia + Dispositivos */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="card md:col-span-2">
                      <h3 className="font-heading font-semibold text-brand-navy mb-4">Vistas por día (últimas 2 semanas)</h3>
                      <div className="flex items-end gap-1 h-32">
                        {tendencia.map((t: any, i: number) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-brand-orange rounded-t hover:opacity-80 transition-opacity"
                              style={{ height: `${(t.vistas / maxTend) * 100}%`, minHeight: t.vistas > 0 ? '4px' : '2px' }}
                              title={`${t.fecha}: ${t.vistas} vistas`}
                            />
                            <span className="text-[9px] text-brand-gray-mid">{t.fecha?.slice(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card">
                      <h3 className="font-heading font-semibold text-brand-navy mb-4">Dispositivos</h3>
                      <div className="space-y-3">
                        {dispositivos.map((d: any) => (
                          <div key={d.tipo}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-brand-gray-dark capitalize">{d.tipo === 'desktop' ? '🖥️ Desktop' : d.tipo === 'mobile' ? '📱 Móvil' : '📱 Tablet'}</span>
                              <span className="font-bold text-brand-navy">{d.usuarios} ({totalDisp > 0 ? Math.round(d.usuarios/totalDisp*100) : 0}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-brand-navy h-2 rounded-full" style={{ width: `${totalDisp > 0 ? (d.usuarios/totalDisp*100) : 0}%` }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-brand-gray-mid">Duración promedio</div>
                        <div className="font-heading font-bold text-brand-navy">{Math.floor(avgDuration/60)}m {Math.floor(avgDuration%60)}s</div>
                      </div>
                    </div>
                  </div>

                  {/* Páginas + Países + Canales */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="card">
                      <h3 className="font-heading font-semibold text-brand-navy mb-4">Páginas más vistas</h3>
                      <div className="space-y-2">
                        {paginas.map((p: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-brand-gray-dark truncate max-w-[140px]" title={p.path}>{p.path}</span>
                              <span className="font-bold text-brand-navy ml-1">{p.vistas}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="bg-brand-orange h-1.5 rounded-full" style={{ width: `${(p.vistas/maxVistas*100)}%` }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card">
                      <h3 className="font-heading font-semibold text-brand-navy mb-4">Países</h3>
                      <div className="space-y-2">
                        {paises.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                            <span className="text-sm text-brand-gray-dark">{p.pais}</span>
                            <span className="font-bold text-brand-navy text-sm">{p.usuarios}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card">
                      <h3 className="font-heading font-semibold text-brand-navy mb-4">Canales de tráfico</h3>
                      <div className="space-y-2">
                        {canales.map((c: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-brand-gray-dark truncate max-w-[140px]">{c.canal || 'Direct'}</span>
                              <span className="font-bold text-brand-navy">{c.sesiones}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${totalCanales > 0 ? (c.sesiones/totalCanales*100) : 0}%` }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* CLIENTES */}}
        {tab === 'clientes' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
              <h2 className="font-heading font-bold text-brand-navy text-xl">Clientes - {clientes.length}{pendientesAprobacion>0&&<span className="ml-2 text-sm font-normal text-red-500">{pendientesAprobacion} pendiente(s)</span>}</h2>
              <div className="flex gap-2">
                <button onClick={()=>setShowFormUsuario(!showFormUsuario)} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"><UserPlus size={15}/> Crear Usuario</button>
                <button onClick={exportarClientes} className="flex items-center gap-2 bg-white border border-gray-200 text-brand-navy px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-orange transition-colors"><Download size={15}/> Exportar CSV</button>
              </div>
            </div>
            {showFormUsuario && (
              <div className="card border-2 border-brand-orange/30 mb-4">
                <h3 className="font-heading font-bold text-brand-navy text-lg mb-4 flex items-center gap-2"><UserPlus size={18} className="text-brand-orange"/> Crear Nuevo Usuario</h3>
                {errorUsuario && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{errorUsuario}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Nombre Completo *</label><input value={formUsuario.nombre} onChange={e=>setFormUsuario({...formUsuario,nombre:e.target.value})} placeholder="Nombre completo" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Email *</label><input value={formUsuario.email} onChange={e=>setFormUsuario({...formUsuario,email:e.target.value})} placeholder="correo@email.com" type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Negocio</label><input value={formUsuario.negocio} onChange={e=>setFormUsuario({...formUsuario,negocio:e.target.value})} placeholder="Nombre del negocio" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Telefono</label><input value={formUsuario.telefono} onChange={e=>setFormUsuario({...formUsuario,telefono:e.target.value})} placeholder="(312) 000-0000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">EIN</label><input value={formUsuario.ein} onChange={e=>setFormUsuario({...formUsuario,ein:e.target.value})} placeholder="XX-XXXXXXX" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Fecha de Nacimiento</label><input value={formUsuario.fecha_nacimiento} onChange={e=>setFormUsuario({...formUsuario,fecha_nacimiento:e.target.value})} type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div className="col-span-2"><label className="block text-xs font-medium text-brand-gray-dark mb-1">Direccion</label><input value={formUsuario.direccion} onChange={e=>setFormUsuario({...formUsuario,direccion:e.target.value})} placeholder="Direccion del negocio" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Sales Tax Permit</label><div className="border-2 border-dashed border-gray-200 rounded-xl px-3 py-2 hover:border-brand-orange transition-colors"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setArchivoTaxUsuario(e.target.files?.[0]||null)} className="w-full text-xs text-brand-gray-mid file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-orange file:text-white cursor-pointer"/>{archivoTaxUsuario&&<p className="text-xs text-green-600 mt-1">✓ {archivoTaxUsuario.name}</p>}</div></div>
                  <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Foto de ID</label><div className="border-2 border-dashed border-gray-200 rounded-xl px-3 py-2 hover:border-brand-orange transition-colors"><input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e=>setArchivoIdUsuario(e.target.files?.[0]||null)} className="w-full text-xs text-brand-gray-mid file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-orange file:text-white cursor-pointer"/>{archivoIdUsuario&&<p className="text-xs text-green-600 mt-1">✓ {archivoIdUsuario.name}</p>}</div></div>
                  <div className="col-span-2"><label className="block text-xs font-medium text-brand-gray-dark mb-1">CRT-61 Firmado</label><div className="border-2 border-dashed border-gray-200 rounded-xl px-3 py-2 hover:border-brand-orange transition-colors"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setArchivoCRTUsuario(e.target.files?.[0]||null)} className="w-full text-xs text-brand-gray-mid file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-orange file:text-white cursor-pointer"/>{archivoCRTUsuario&&<p className="text-xs text-green-600 mt-1">✓ {archivoCRTUsuario.name}</p>}</div></div>
                </div>
                <p className="text-xs text-brand-gray-mid mt-3">El usuario recibira un correo con sus credenciales y debera cambiar su contrasena al primer inicio de sesion.</p>
                <div className="flex gap-3 mt-4">
                  <button onClick={crearUsuario} disabled={creandoUsuario} className="btn-primary flex items-center gap-2"><UserPlus size={15}/> {creandoUsuario?'Creando...':'Crear y Enviar Correo'}</button>
                  <button onClick={()=>{setShowFormUsuario(false);setErrorUsuario('')}} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy">Cancelar</button>
                </div>
              </div>
            )}
            {clientes.map(c => {
              const pedidosCliente = getPedidosCliente(c.id)
              const ultimoPedido = pedidosCliente[0]
              const totalGastado = pedidosCliente.filter(p=>p.estado!=='cancelado').reduce((sum,p)=>sum+(p.total||0),0)
              const editando = editandoCliente === c.id
              return (
                <div key={c.id} className={`card border-l-4 ${c.aprobado?'border-l-green-400':'border-l-yellow-400'}`}>
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0 ${c.aprobado?'bg-green-500 text-white':'bg-yellow-400 text-white'}`}>{(c.nombre||c.email||'?')[0].toUpperCase()}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-heading font-bold text-brand-navy">{c.nombre||'—'}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.aprobado?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{c.aprobado?'Aprobado':'Pendiente'}</span>
                          {c.must_change_password&&<span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">Debe cambiar contrasena</span>}
                        </div>
                        <p className="text-xs text-brand-gray-mid">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-center"><p className="font-heading font-bold text-brand-orange">{pedidosCliente.length}</p><p className="text-xs text-brand-gray-mid">pedidos</p></div>
                      <div className="text-center"><p className="font-heading font-bold text-green-600">${totalGastado.toFixed(2)}</p><p className="text-xs text-brand-gray-mid">total</p></div>
                      {!c.aprobado?<button onClick={()=>aprobarCliente(c,true)} disabled={aprobando===c.id} className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600"><CheckCircle size={14}/> {aprobando===c.id?'Aprobando...':'Aprobar'}</button>:<button onClick={()=>aprobarCliente(c,false)} disabled={aprobando===c.id} className="flex items-center gap-1 text-sm bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600"><XCircle size={14}/> Revocar</button>}
                      {!editando?<button onClick={()=>iniciarEdicionCliente(c)} className="flex items-center gap-1 text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-brand-gray-dark hover:border-brand-orange"><Pencil size={14}/> Editar</button>:<div className="flex gap-2"><button onClick={()=>guardarCliente(c.id)} disabled={guardando} className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600"><Save size={14}/> {guardando?'Guardando...':'Guardar'}</button><button onClick={()=>setEditandoCliente(null)} className="flex items-center gap-1 text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-brand-gray-mid"><X size={14}/> Cancelar</button></div>}
                      <button onClick={()=>eliminarCliente(c.id,c.email)} className="flex items-center gap-1 text-sm border border-red-200 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  {(c.sales_tax_url||c.id_foto_url||c.crt61_url)&&(
                    <div className="flex flex-wrap gap-2 mb-3">
                      {c.sales_tax_url&&<div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100 flex-1 min-w-48"><FileText size={15} className="text-blue-500 flex-shrink-0"/><span className="text-xs text-blue-700 flex-1">Sales Tax Permit</span><a href={c.sales_tax_url} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">Ver</a></div>}
                      {c.id_foto_url&&<div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100 flex-1 min-w-48"><FileText size={15} className="text-purple-500 flex-shrink-0"/><span className="text-xs text-purple-700 flex-1">ID / Identificacion</span><a href={c.id_foto_url} target="_blank" rel="noopener noreferrer" className="text-xs bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600">Ver</a></div>}
                      {c.crt61_url&&<div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100 flex-1 min-w-48"><FileText size={15} className="text-green-500 flex-shrink-0"/><span className="text-xs text-green-700 flex-1">CRT-61 Firmado</span><a href={c.crt61_url} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600">Ver</a></div>}
                    </div>
                  )}
                  {editando?(
                    <div className="grid grid-cols-2 gap-3 mt-3 border-t pt-3">
                      {[{key:'nombre',label:'Nombre',ph:'Nombre completo'},{key:'negocio',label:'Negocio',ph:'Nombre del negocio'},{key:'telefono',label:'Telefono',ph:'(312) 000-0000'},{key:'ein',label:'EIN',ph:'XX-XXXXXXX'}].map(({key,label,ph})=>(
                        <div key={key}><label className="block text-xs font-medium text-brand-gray-dark mb-1">{label}</label><input value={formCliente[key]||''} onChange={e=>setFormCliente({...formCliente,[key]:e.target.value})} placeholder={ph} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                      ))}
                      <div className="col-span-2"><label className="block text-xs font-medium text-brand-gray-dark mb-1">Direccion</label><input value={formCliente.direccion||''} onChange={e=>setFormCliente({...formCliente,direccion:e.target.value})} placeholder="Direccion del negocio" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                      <div className="col-span-2 border-t pt-3 mt-1">
                        <p className="text-xs font-semibold text-brand-navy mb-2">📎 Documentos</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div><label className="block text-xs text-brand-gray-mid mb-1">Sales Tax Permit</label><input type="file" accept="image/*,.pdf" onChange={e=>setArchivoEditTax(e.target.files?.[0]||null)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1"/></div>
                          <div><label className="block text-xs text-brand-gray-mid mb-1">ID / Identificacion</label><input type="file" accept="image/*,.pdf" onChange={e=>setArchivoEditId(e.target.files?.[0]||null)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1"/></div>
                          <div><label className="block text-xs text-brand-gray-mid mb-1">CRT-61 Firmado</label><input type="file" accept="image/*,.pdf" onChange={e=>setArchivoEditCrt(e.target.files?.[0]||null)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1"/></div>
                        </div>
                      </div>
                    </div>
                  ):(
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mt-3 border-t pt-3">
                      {[{label:'Negocio',value:c.negocio},{label:'Telefono',value:c.telefono},{label:'EIN',value:c.ein},{label:'Fecha Nacimiento',value:c.fecha_nacimiento?new Date(c.fecha_nacimiento).toLocaleDateString('es-MX',{timeZone:'UTC'}):null},{label:'Direccion',value:c.direccion,full:true},{label:'Ultimo pedido',value:ultimoPedido?new Date(ultimoPedido.created_at).toLocaleDateString('es-MX'):null},{label:'Registro',value:new Date(c.created_at).toLocaleDateString('es-MX')}].map(({label,value,full}:any)=>(
                        <div key={label} className={`bg-gray-50 rounded-lg p-2 border border-gray-100 ${full?'col-span-2':''}`}><p className="text-brand-gray-mid">{label}</p><p className="font-medium text-brand-navy">{value||'—'}</p></div>
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
                <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Desde</label><input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Hasta</label><input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                <button onClick={()=>{setFechaDesde('');setFechaHasta('')}} className="text-sm text-brand-gray-mid hover:text-brand-orange transition-colors px-3 py-2">Limpiar</button>
                <div className="ml-auto flex items-center gap-3">
                  <div className="text-right"><p className="text-xs text-brand-gray-mid">Total periodo</p><p className="font-heading font-bold text-xl text-green-600">${totalVentasFiltradas.toFixed(2)}</p></div>
                  <button onClick={exportarVentas} className="flex items-center gap-2 bg-white border border-gray-200 text-brand-navy px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-orange transition-colors"><Download size={15}/> Exportar CSV</button>
                </div>
              </div>
            </div>
            {seleccionados.length>0&&(<div className="bg-brand-navy text-white px-6 py-3 rounded-xl mb-6 flex items-center justify-between"><span className="text-sm font-medium">{seleccionados.length} pedido(s) seleccionado(s)</span><div className="flex gap-3"><button onClick={imprimirOrdenes} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">Imprimir Ordenes</button><button onClick={()=>setSeleccionados([])} className="text-sm text-blue-300 hover:text-white">Cancelar</button></div></div>)}
            {pedidosFiltrados.length===0&&<div className="card text-center py-12 text-brand-gray-mid"><ShoppingBag size={40} className="mx-auto mb-3 opacity-25"/><p>No hay pedidos en este periodo</p></div>}
            {GRUPOS.map(grupo=>{
              const pedidosGrupo=pedidosFiltrados.filter(p=>grupo.key.includes(p.estado))
              if(pedidosGrupo.length===0) return null
              const totalGrupo=pedidosGrupo.reduce((sum,p)=>sum+(p.total||0),0)
              return(
                <div key={grupo.label} className={`mb-8 border-2 ${grupo.color} rounded-2xl p-5`}>
                  <div className="flex items-center justify-between mb-4"><h2 className="font-heading font-bold text-brand-navy text-lg flex items-center gap-2">{grupo.label}<span className="text-sm font-normal text-brand-gray-mid bg-white px-2 py-0.5 rounded-full border">{pedidosGrupo.length}</span></h2><span className="font-heading font-bold text-brand-orange">Subtotal: ${totalGrupo.toFixed(2)}</span></div>
                  <div className="space-y-3">
                    {pedidosGrupo.map(ped=>{
                      const cliente=getCliente(ped.cliente_id); const seleccionado=seleccionados.includes(ped.id); const subtotal=(ped.total||0)-(ped.fuel_surcharge||0); const invoiceExistente=invoices.find(inv=>inv.pedido_id===ped.id)
                      return(
                        <div key={ped.id} className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all ${seleccionado?'border-brand-orange':'border-transparent'}`}>
                          <div className="flex items-start gap-3">
                            <button onClick={()=>toggleSeleccion(ped.id)} className="mt-1 flex-shrink-0">{seleccionado?<CheckSquare size={18} className="text-brand-orange"/>:<Square size={18} className="text-gray-300"/>}</button>
                            <div className="flex-1">
                              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                                <div><p className="font-heading font-bold text-brand-navy">#{ped.id.slice(0,8).toUpperCase()}</p><p className="text-xs text-brand-gray-mid">{new Date(ped.created_at).toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p></div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-heading font-bold text-brand-orange text-lg">${ped.total?.toFixed(2)}</span>
                                  <select value={ped.estado} onChange={e=>cambiarEstado(ped.id,e.target.value)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none ${estadoColor[ped.estado]}`}>{ESTADOS.map(e=><option key={e} value={e}>{e.replace('_',' ').charAt(0).toUpperCase()+e.replace('_',' ').slice(1)}</option>)}</select>
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-brand-gray-mid">Fuel $</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="5.00"
                                        value={fuelOverride[ped.id] ?? ''}
                                        onChange={e => setFuelOverride((prev: any) => ({ ...prev, [ped.id]: parseFloat(e.target.value) || 0 }))}
                                        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-brand-navy"
                                      />
                                    </div>
                                    <button onClick={()=>generarInvoice(ped)} disabled={generandoInvoice===ped.id} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${invoiceExistente?'bg-green-100 text-green-700 hover:bg-green-200':'bg-brand-navy text-white hover:bg-brand-navy/80'}`}><Receipt size={13}/> {generandoInvoice===ped.id?'Generando...':(invoiceExistente?invoiceExistente.numero:'Invoice')}</button>
                                    <button
                                      onClick={() => setShowContabilidad((prev: any) => prev === ped.id ? null : ped.id)}
                                      className="text-xs text-brand-navy underline hover:text-brand-orange transition-colors text-left"
                                    >
                                      {showContabilidad === ped.id ? 'Ocultar contabilidad' : '📊 Contabilidad'}
                                    </button>
                                    {showContabilidad === ped.id && (() => {
                                      const subtotal = ped.pedido_items?.reduce((s: number, i: any) => s + i.precio_unitario * i.cantidad, 0) || 0
                                      const fuel = fuelOverride[ped.id] ?? ped.fuel_surcharge ?? 5
                                      const total = subtotal + fuel
                                      const costoEst = ped.pedido_items?.reduce((s: number, i: any) => s + (i.productos?.costo || i.precio_unitario * 0.72) * i.cantidad, 0) || 0
                                      const ganancia = subtotal - costoEst
                                      const margen = subtotal > 0 ? (ganancia / subtotal * 100).toFixed(1) : '0'
                                      return (
                                        <div className="mt-1 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs space-y-1 w-56">
                                          <p className="font-semibold text-brand-navy mb-1">📊 Contabilidad Interna</p>
                                          <div className="flex justify-between"><span className="text-brand-gray-mid">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                          <div className="flex justify-between"><span className="text-brand-gray-mid">Fuel</span><span>${fuel.toFixed(2)}</span></div>
                                          <div className="flex justify-between font-semibold border-t border-blue-200 pt-1"><span>Total cobrado</span><span className="text-brand-navy">${total.toFixed(2)}</span></div>
                                          <div className="flex justify-between mt-1"><span className="text-brand-gray-mid">Costo est. (72%)</span><span className="text-red-500">${costoEst.toFixed(2)}</span></div>
                                          <div className="flex justify-between"><span className="text-brand-gray-mid">Ganancia bruta</span><span className="text-green-600 font-semibold">${ganancia.toFixed(2)}</span></div>
                                          <div className="flex justify-between"><span className="text-brand-gray-mid">Margen</span><span className={parseFloat(margen) >= 20 ? 'text-green-600' : 'text-yellow-600'}>{margen}%</span></div>
                                          <div className="mt-2 pt-2 border-t border-blue-200">
                                            <p className="text-brand-gray-mid mb-1">Gastos extras</p>
                                            <input
                                              type="number"
                                              placeholder="gasolina, taxes..."
                                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs mb-1"
                                              onChange={e => {
                                                const gastos = parseFloat(e.target.value) || 0
                                                const neta = ganancia - gastos
                                                const el = document.getElementById('neta-' + ped.id)
                                                if (el) el.textContent = 'Ganancia neta: $' + neta.toFixed(2)
                                              }}
                                            />
                                            <p id={'neta-' + ped.id} className="text-green-700 font-semibold">Ganancia neta: ${ganancia.toFixed(2)}</p>
                                          </div>
                                        </div>
                                      )
                                    })()}
                                  </div>
                                  {invoiceExistente&&(<a href={`/es/invoice/${invoiceExistente.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"><Eye size={13}/> Ver</a>)}
                                  <button onClick={()=>eliminarPedido(ped.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 text-red-400"><Trash2 size={15}/></button>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-3 mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div><span className="text-brand-gray-mid">Nombre:</span> <span className="font-medium text-brand-navy">{cliente?.nombre||'—'}</span></div>
                                <div><span className="text-brand-gray-mid">Negocio:</span> <span className="font-medium text-brand-navy">{cliente?.negocio||'—'}</span></div>
                                <div><span className="text-brand-gray-mid">Telefono:</span> <span className="font-medium text-brand-navy">{cliente?.telefono||'—'}</span></div>
                                <div><span className="text-brand-gray-mid">EIN:</span> <span className="font-medium text-brand-navy">{cliente?.ein||'—'}</span></div>
                                <div><span className="text-brand-gray-mid">Email:</span> <span className="font-medium text-brand-navy">{cliente?.email||'—'}</span></div>
                                <div><span className="text-brand-gray-mid">Direccion:</span> <span className="font-medium text-brand-navy">{cliente?.direccion||'—'}</span></div>
                                <div className="col-span-2 flex items-center justify-between mt-1 pt-1 border-t border-blue-100"><div><span className="text-brand-gray-mid">Metodo de pago:</span> <span className="font-medium text-brand-navy">{ped.metodo_pago||'—'}</span></div>{ped.comprobante_url&&<a href={ped.comprobante_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"><FileText size={11}/> Ver comprobante</a>}</div>
                              </div>
                              <div className="border-t pt-2 space-y-1">
                                {ped.pedido_items?.map((item:any)=>{
                                  const costoMin = item.productos?.costo || 0
                                  const precioActual = preciosEditados[item.id] ?? item.precio_unitario
                                  const puedeEditar = !invoiceExistente
                                  return (
                                    <div key={item.id} className="flex items-center justify-between text-sm gap-2">
                                      <span className="text-brand-gray-dark flex-1">{item.productos?.nombre} <span className="text-brand-gray-mid">x{item.cantidad}</span></span>
                                      {puedeEditar ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-brand-gray-mid">$</span>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min={esAdmin ? 0 : costoMin}
                                            value={preciosEditados[item.id] ?? item.precio_unitario}
                                            onChange={e => setPreciosEditados(prev => ({...prev, [item.id]: parseFloat(e.target.value) || 0}))}
                                            onBlur={async e => {
                                              const nuevo = parseFloat(e.target.value) || 0
                                              const ok = await actualizarPrecioItem(item.id, nuevo, costoMin, esAdmin)
                                              if (!ok) setPreciosEditados(prev => ({...prev, [item.id]: item.precio_unitario}))
                                            }}
                                            className={`w-20 border rounded-lg px-2 py-0.5 text-xs text-right ${!esAdmin && precioActual < costoMin ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                          />
                                          <span className="font-medium text-brand-navy text-xs">${(precioActual*item.cantidad).toFixed(2)}</span>
                                          {costoMin > 0 && <span className="text-xs text-brand-gray-mid">min ${costoMin.toFixed(2)}</span>}
                                        </div>
                                      ) : (
                                        <span className="font-medium text-brand-navy">${(item.precio_unitario*item.cantidad).toFixed(2)}</span>
                                      )}
                                    </div>
                                  )
                                })}
                                <div className="flex justify-between text-xs text-brand-gray-mid border-t pt-1 mt-1"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-xs text-brand-gray-mid"><span>Fuel Surcharge</span><span>${(ped.fuel_surcharge||0).toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm font-bold text-brand-navy border-t pt-1"><span>Total</span><span>${ped.total?.toFixed(2)}</span></div>
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

        {/* INVOICES */}
        {tab === 'invoices' && (
          <div>
            <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-brand-navy text-xl">Invoices - {invoices.length}</h2>
              <a href="/es/invoice/nuevo" className="btn-primary flex items-center gap-2"><Receipt size={15}/> Nueva Invoice</a>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-brand-gray-mid mb-1">Estado</label>
                <select value={filtroInvEstado} onChange={e=>setFiltroInvEstado(e.target.value as any)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-orange">
                  <option value="todos">Todos</option>
                  <option value="pagados">✓ Pagados</option>
                  <option value="pendientes">⏳ Pendientes</option>
                  <option value="vencidos">⚠ Vencidos</option>
                  <option value="void">✕ VOID</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-brand-gray-mid mb-1">Desde</label>
                <input type="date" value={filtroInvDesde} onChange={e=>setFiltroInvDesde(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
              </div>
              <div>
                <label className="block text-xs text-brand-gray-mid mb-1">Hasta</label>
                <input type="date" value={filtroInvHasta} onChange={e=>setFiltroInvHasta(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
              </div>
              <button onClick={()=>{setFiltroInvEstado('todos');setFiltroInvDesde('');setFiltroInvHasta('')}} className="text-xs text-brand-gray-mid hover:text-brand-orange underline">Limpiar</button>
              <button onClick={()=>{
                const filtered = invoicesFiltrados
                const csv = ['Numero,Cliente,Negocio,Total,Metodo Pago,Estado,Fecha,Fecha Pago']
                filtered.forEach(inv=>{
                  const cl = clientes.find(c=>c.id===inv.cliente_id)
                  const estado = inv.anulado?'VOID':inv.pagado?'Pagado':'Pendiente'
                  csv.push(`${inv.numero},"${cl?.nombre||''}","${cl?.negocio||''}",${inv.total},${inv.metodo_pago||''},${estado},${new Date(inv.created_at).toLocaleDateString('es-MX')},${inv.fecha_pago?new Date(inv.fecha_pago).toLocaleDateString('es-MX'):''}`)
                })
                const blob = new Blob([csv.join('\n')],{type:'text/csv'})
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href=url; a.download=`invoices-reporte-${new Date().toISOString().slice(0,10)}.csv`; a.click()
              }} className="flex items-center gap-1 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy/80">
                ↓ Exportar CSV
              </button>
              <div className="ml-auto text-right">
                <p className="text-xs text-brand-gray-mid">Total filtrado</p>
                <p className="font-heading font-bold text-brand-orange text-lg">${invoicesFiltrados.reduce((s,i)=>s+(i.total||0),0).toFixed(2)}</p>
              </div>
            </div>
          </div>
            {invoices.length===0?(<div className="card text-center py-12 text-brand-gray-mid"><Receipt size={40} className="mx-auto mb-3 opacity-25"/><p>No hay invoices generados</p></div>):(
              <div className="space-y-3">
                {invoicesFiltrados.map(inv=>{
                  const cliente = clientes.find(c=>c.id===inv.cliente_id)
                  const diasDesde = Math.floor((Date.now() - new Date(inv.created_at).getTime()) / (1000*60*60*24))
                    const diasCredito = inv.dias_credito || 30
                    const vencido = !inv.pagado && diasDesde > diasCredito
                    const porVencer = !inv.pagado && diasDesde >= diasCredito - 5 && !vencido
                    return(<div key={inv.id} className="card flex flex-col gap-3" style={{borderLeft: `4px solid ${inv.anulado ? '#9ca3af' : inv.pagado ? '#4ade80' : vencido ? '#f87171' : porVencer ? '#facc15' : '#0F2B5B'}`, opacity: inv.anulado ? 0.6 : 1}}>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${inv.pagado ? 'bg-green-100' : vencido ? 'bg-red-100' : 'bg-brand-navy'}`}>
                            <Receipt size={18} className={inv.pagado ? 'text-green-600' : vencido ? 'text-red-600' : 'text-brand-orange'}/>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-heading font-bold text-brand-navy">{inv.numero}</p>
                              {inv.anulado && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium line-through">VOID</span>}
                              {!inv.anulado && inv.pagado && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Pagado</span>}
                              {vencido && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">⚠ Vencido {diasDesde - diasCredito}d</span>}
                              {porVencer && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">⏰ Vence pronto</span>}
                              {!inv.pagado && !vencido && !porVencer && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Día {diasDesde}/{diasCredito}</span>}
                            </div>
                            <p className="text-xs text-brand-gray-mid">{cliente?.negocio || cliente?.nombre || '—'}</p>
                            <p className="text-xs text-brand-gray-mid">{new Date(inv.created_at).toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'})}</p>
                            {inv.pagado && inv.fecha_pago && <p className="text-xs text-green-600">Pagado: {new Date(inv.fecha_pago).toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'})}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-heading font-bold text-brand-orange">${inv.total?.toFixed(2)}</p>
                            <p className="text-xs text-brand-gray-mid">{inv.metodo_pago}</p>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <a href={`/es/invoice/${inv.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy/80"><Eye size={15}/> Ver</a>
                            {!inv.anulado && (
                              <button
                                onClick={() => marcarPagado(inv.id, !inv.pagado)}
                                className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${inv.pagado ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                              >
                                {inv.pagado ? '↩ Desmarcar' : '✓ Marcar pagado'}
                              </button>
                            )}
                            <button
                              onClick={() => marcarAnulado(inv.id, !inv.anulado)}
                              className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${inv.anulado ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                            >
                              {inv.anulado ? '↩ Reactivar' : '✕ VOID'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>)
                })}
              </div>
            )}
          </div>
        )}

        {/* RUTAS */}
        {tab === 'rutas' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div><h2 className="font-heading font-bold text-brand-navy text-xl">Optimizacion de Rutas</h2><p className="text-brand-gray-mid text-sm mt-1">Selecciona los pedidos del dia y calcula la ruta mas eficiente</p></div>
              <div className="flex gap-3 flex-wrap">
                {rutaOptimizada.length>0&&(<><button onClick={abrirEnGoogleMaps} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">Abrir en Google Maps</button><button onClick={imprimirRuta} className="flex items-center gap-2 bg-white border border-gray-200 text-brand-navy px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-orange transition-colors">Imprimir Ruta</button></>)}
                <button onClick={optimizarRuta} disabled={optimizando||pedidosRuta.length===0} className="btn-primary flex items-center gap-2"><Map size={16}/> {optimizando?'Calculando...':'Optimizar Ruta'}</button>
              </div>
            </div>
            {errorRuta&&<div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{errorRuta}</div>}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-heading font-semibold text-brand-navy mb-3 flex items-center gap-2">Pedidos Activos<span className="text-xs font-normal text-brand-gray-mid bg-gray-100 px-2 py-0.5 rounded-full">{pedidosParaRuta.length}</span>{pedidosRuta.length>0&&<span className="text-xs font-normal text-brand-orange bg-orange-50 px-2 py-0.5 rounded-full">{pedidosRuta.length} seleccionados</span>}</h3>
                <div className="flex gap-2 mb-3"><button onClick={()=>setPedidosRuta(pedidosParaRuta.map(p=>p.id))} className="text-xs text-brand-orange hover:underline">Seleccionar todos</button><span className="text-brand-gray-mid text-xs">·</span><button onClick={()=>setPedidosRuta([])} className="text-xs text-brand-gray-mid hover:underline">Limpiar</button></div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pedidosParaRuta.length===0?(<div className="card text-center py-8 text-brand-gray-mid"><p>No hay pedidos activos para entregar</p></div>):(
                    pedidosParaRuta.map(ped=>{const cliente=getCliente(ped.cliente_id); const enRuta=pedidosRuta.includes(ped.id); return(<div key={ped.id} onClick={()=>togglePedidoRuta(ped.id)} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${enRuta?'border-brand-orange bg-orange-50':'border-gray-100 bg-white hover:border-gray-300'}`}><div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${enRuta?'bg-brand-orange border-brand-orange':'border-gray-300'}`}>{enRuta&&<span className="text-white text-xs font-bold">✓</span>}</div><div className="flex-1 min-w-0"><p className="font-medium text-brand-navy text-sm truncate">{cliente?.negocio||cliente?.nombre||'—'}</p><p className="text-xs text-brand-gray-mid truncate">📍 {cliente?.direccion||'Sin direccion'}</p><p className="text-xs text-brand-gray-mid">#{ped.id.slice(0,8).toUpperCase()} · ${ped.total?.toFixed(2)}</p></div><span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${estadoColor[ped.estado]}`}>{ped.estado.replace('_',' ')}</span></div>)})
                  )}
                </div>
              </div>
              <div>
                {rutaOptimizada.length>0&&(<div className="mb-4"><h3 className="font-heading font-semibold text-brand-navy mb-3 flex items-center gap-2">Ruta Optima<span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{rutaOptimizada.length} paradas</span></h3><div className="space-y-2 mb-4"><div className="flex items-center gap-3 p-2 bg-brand-navy/5 rounded-lg"><div className="w-7 h-7 bg-brand-navy rounded-full flex items-center justify-center text-white text-xs">🏭</div><div><p className="font-medium text-brand-navy text-sm">Origen - Bood Supply</p><p className="text-xs text-brand-gray-mid">2900 N Richmond St, Chicago</p></div></div>{rutaOptimizada.map((parada,idx)=>(<div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100"><div className="w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{idx+1}</div><div className="flex-1 min-w-0"><p className="font-medium text-brand-navy text-sm truncate">{parada.negocio||parada.nombre}</p><p className="text-xs text-brand-gray-mid truncate">📍 {parada.direccion}</p><p className="text-xs text-brand-gray-mid">📞 {parada.telefono} · 💳 {parada.metodo_pago} · ${parada.total?.toFixed(2)}</p></div></div>))}</div></div>)}
                <div className="w-full rounded-2xl border border-gray-200 overflow-hidden" style={{height:'400px'}}>{rutaOptimizada.length>0?(<MapaRutas key={rutaKey} paradas={rutaOptimizada}/>):(<div className="w-full h-full bg-gray-100 flex items-center justify-center text-brand-gray-mid"><div className="text-center"><Map size={40} className="mx-auto mb-2 opacity-25"/><p className="text-sm">Selecciona pedidos y optimiza la ruta</p></div></div>)}</div>
              </div>
            </div>
          </div>
        )}

        {/* MENSAJES */}
        {tab === 'mensajes' && (
          <div className="card">
            <h2 className="font-heading font-bold text-brand-navy text-xl mb-6">Enviar Mensaje a Clientes</h2>
            {mensajeEnviado&&<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">Mensaje enviado correctamente</div>}
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-brand-gray-dark mb-1">Asunto *</label><input value={mensajeAsunto} onChange={e=>setMensajeAsunto(e.target.value)} placeholder="Asunto del mensaje" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
              <div><label className="block text-sm font-medium text-brand-gray-dark mb-1">Mensaje *</label><textarea value={mensajeCuerpo} onChange={e=>setMensajeCuerpo(e.target.value)} placeholder="Escribe tu mensaje aqui..." rows={6} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange resize-none"/></div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="block text-sm font-medium text-brand-gray-dark">Destinatarios *</label><button onClick={()=>setDestinatarios(clientes.filter(c=>c.aprobado).map(c=>c.email))} className="text-xs text-brand-orange hover:underline">Seleccionar todos los aprobados</button></div>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {clientes.map(c=>(<div key={c.id} onClick={()=>toggleDestinatario(c.email)} className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b last:border-0 ${destinatarios.includes(c.email)?'bg-blue-50':''}`}><div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${destinatarios.includes(c.email)?'bg-brand-orange border-brand-orange':'border-gray-300'}`}>{destinatarios.includes(c.email)&&<span className="text-white text-xs">✓</span>}</div><div className="flex-1"><p className="text-sm font-medium text-brand-navy">{c.nombre||c.email}</p><p className="text-xs text-brand-gray-mid">{c.email}</p></div><span className={`text-xs px-2 py-0.5 rounded-full ${c.aprobado?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{c.aprobado?'Aprobado':'Pendiente'}</span></div>))}
                </div>
                {destinatarios.length>0&&<p className="text-xs text-brand-gray-mid mt-1">{destinatarios.length} destinatario(s) seleccionado(s)</p>}
              </div>
              <button onClick={enviarMensaje} disabled={enviandoMensaje} className="btn-primary flex items-center gap-2"><Mail size={16}/> {enviandoMensaje?'Enviando...':'Enviar Mensaje'}</button>
            </div>
          </div>
        )}

        {/* PRODUCTOS */}
        {tab === 'productos' && (
          <>
            <div className="flex items-center justify-between mb-6"><p className="text-brand-gray-mid text-sm">{productos.length} productos · {productos.filter(p=>p.activo).length} activos</p><button onClick={()=>setShowFormProducto(!showFormProducto)} className="btn-primary flex items-center gap-2"><Plus size={18}/> Agregar Producto</button></div>
            {showFormProducto&&(
              <div className="card mb-6 border-2 border-brand-orange/30">
                <h2 className="font-heading font-bold text-brand-navy text-lg mb-5">Nuevo Producto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-brand-gray-dark mb-1">Nombre *</label><input value={formProducto.nombre} onChange={e=>setFormProducto({...formProducto,nombre:e.target.value})} placeholder="Ej: Vaso 8oz" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-sm font-medium text-brand-gray-dark mb-1">Categoria *</label><select value={formProducto.categoria} onChange={e=>setFormProducto({...formProducto,categoria:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white"><option value="">Selecciona categoria</option>{categorias.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-brand-gray-dark mb-1">Precio * (USD)</label><input value={formProducto.precio} onChange={e=>setFormProducto({...formProducto,precio:e.target.value})} placeholder="Ej: 9.99" type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div><label className="block text-sm font-medium text-brand-gray-dark mb-1">Unidad *</label><input value={formProducto.unidad} onChange={e=>setFormProducto({...formProducto,unidad:e.target.value})} placeholder="Ej: paquete 100u" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-brand-gray-dark mb-1">Descripcion</label><input value={formProducto.descripcion} onChange={e=>setFormProducto({...formProducto,descripcion:e.target.value})} placeholder="Descripcion breve" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-brand-gray-dark mb-1">Imagen</label><div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-brand-orange transition-colors"><input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e=>setImagenProducto(e.target.files?.[0]||null)} className="w-full text-sm text-brand-gray-mid file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-orange file:text-white hover:file:bg-orange-600 cursor-pointer"/>{imagenProducto&&<p className="text-xs text-green-600 mt-2">✓ {imagenProducto.name}</p>}</div></div>
                </div>
                <div className="flex gap-3 mt-5"><button onClick={agregarProducto} disabled={guardando} className="btn-primary flex items-center gap-2">{guardando?'Guardando y traduciendo...':<><Plus size={16}/> Guardar</>}</button><button onClick={()=>setShowFormProducto(false)} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy">Cancelar</button></div>
              </div>
            )}
            <div className="space-y-6">
              {categorias.map(cat=>{
                const prods=productos.filter(p=>p.categoria===cat)
                if(prods.length===0) return null
                return(
                  <div key={cat} className="card">
                    <h2 className="font-heading font-bold text-brand-navy mb-4 flex items-center gap-2">{cat} <span className="text-xs font-normal text-brand-gray-mid bg-gray-100 px-2 py-0.5 rounded-full">{prods.length}</span></h2>
                    <div className="space-y-2">
                      {prods.map(p=>(
                        <div key={p.id}>
                          <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${p.activo?'border-gray-100 bg-gray-50':'border-red-100 bg-red-50 opacity-60'}`}>
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">{p.imagen_url?<img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain"/>:<ImageIcon size={20} className="text-gray-400"/>}</div>
                            <div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium text-brand-navy text-sm">{p.nombre}</span>{p.nombre_en&&<span className="text-xs text-gray-400">/ {p.nombre_en}</span>}{!p.activo&&<span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactivo</span>}</div><div className="text-xs text-brand-gray-mid mt-0.5">{p.descripcion} · {p.unidad}</div></div>
                            <div className="font-heading font-bold text-brand-navy">${p.precio}</div>
                            <div className="flex items-center gap-1">
                              <button onClick={()=>iniciarEdicionProducto(p)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 transition-colors text-yellow-500"><Pencil size={15}/></button>
                              <button onClick={()=>seleccionarImagen(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors text-blue-400"><ImageIcon size={15}/></button>
                              <button onClick={()=>toggleActivo(p.id,p.activo)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-brand-gray-mid">{p.activo?<Eye size={15}/>:<EyeOff size={15}/>}</button>
                              <button onClick={()=>eliminarProducto(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors text-red-400"><Trash2 size={15}/></button>
                            </div>
                          </div>
                          {editandoProducto===p.id&&(
                            <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                              <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Nombre (ES)</label><input value={formEditProducto.nombre} onChange={e=>setFormEditProducto({...formEditProducto,nombre:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                                <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Name (EN)</label><input value={formEditProducto.nombre_en} onChange={e=>setFormEditProducto({...formEditProducto,nombre_en:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                                <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Descripcion (ES)</label><input value={formEditProducto.descripcion} onChange={e=>setFormEditProducto({...formEditProducto,descripcion:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                                <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Description (EN)</label><input value={formEditProducto.descripcion_en} onChange={e=>setFormEditProducto({...formEditProducto,descripcion_en:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                                <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Precio (USD)</label><input value={formEditProducto.precio} onChange={e=>setFormEditProducto({...formEditProducto,precio:e.target.value})} type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                                <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Unidad</label><input value={formEditProducto.unidad} onChange={e=>setFormEditProducto({...formEditProducto,unidad:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/></div>
                                <div><label className="block text-xs font-medium text-brand-gray-dark mb-1">Categoria</label><select value={formEditProducto.categoria} onChange={e=>setFormEditProducto({...formEditProducto,categoria:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white">{categorias.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                              </div>
                              <div className="flex gap-3 mt-4"><button onClick={()=>guardarProducto(p.id)} disabled={guardando} className="flex items-center gap-1 text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"><Save size={14}/> {guardando?'Guardando...':'Guardar'}</button><button onClick={()=>setEditandoProducto(null)} className="flex items-center gap-1 text-sm border border-gray-200 px-4 py-2 rounded-lg text-brand-gray-mid hover:text-brand-navy"><X size={14}/> Cancelar</button></div>
                            </div>
                          )}
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
            <div className="flex items-center justify-between mb-6"><h2 className="font-heading font-bold text-brand-navy text-xl">Categorias</h2><button onClick={()=>setShowFormCategoria(!showFormCategoria)} className="btn-primary flex items-center gap-2"><Plus size={18}/> Nueva Categoria</button></div>
            {showFormCategoria&&(<div className="border-2 border-brand-orange/30 rounded-xl p-4 mb-6"><label className="block text-sm font-medium text-brand-gray-dark mb-2">Nombre *</label><div className="flex gap-3"><input value={nuevaCategoria} onChange={e=>setNuevaCategoria(e.target.value)} placeholder="Ej: Empaques Especiales" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" onKeyDown={e=>e.key==='Enter'&&agregarCategoria()}/><button onClick={agregarCategoria} className="btn-primary flex items-center gap-2"><Plus size={16}/> Agregar</button><button onClick={()=>setShowFormCategoria(false)} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy">Cancelar</button></div></div>)}
            {categorias.length===0?(<div className="text-center py-12 text-brand-gray-mid"><Tag size={40} className="mx-auto mb-3 opacity-25"/><p>No hay categorias aun</p></div>):(
              <div className="space-y-2">
                {categorias.map(cat=>(
                  <div key={cat}>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3 flex-1"><Tag size={16} className="text-brand-orange"/>{editandoCategoria===cat?<input value={categoriaEditNombre} onChange={e=>setCategoriaEditNombre(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-orange" onKeyDown={e=>e.key==='Enter'&&guardarCategoria(cat)} autoFocus/>:<span className="font-medium text-brand-navy">{cat}</span>}<span className="text-xs text-brand-gray-mid bg-white px-2 py-0.5 rounded-full border">{productos.filter(p=>p.categoria===cat).length} productos</span></div>
                      <div className="flex items-center gap-1">{editandoCategoria===cat?(<><button onClick={()=>guardarCategoria(cat)} disabled={guardando} className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600"><Save size={13}/> {guardando?'...':'Guardar'}</button><button onClick={()=>setEditandoCategoria(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 text-brand-gray-mid"><X size={15}/></button></>):(<><button onClick={()=>{setEditandoCategoria(cat);setCategoriaEditNombre(cat)}} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 transition-colors text-yellow-500"><Pencil size={15}/></button><button onClick={()=>eliminarCategoria(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors text-red-400"><Trash2 size={15}/></button></>)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      {/* MODAL NUEVO PEDIDO */}
      {showNuevoPedido && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)setShowNuevoPedido(false)}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-brand-navy text-xl">🛒 Nuevo Pedido</h2>
              <button onClick={()=>setShowNuevoPedido(false)} className="text-brand-gray-mid hover:text-brand-navy">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">Cliente *</label>
                <select value={npCliente} onChange={e=>setNpCliente(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange">
                  <option value="">Seleccionar cliente...</option>
                  {clientes.filter(c=>c.aprobado).map(c=><option key={c.id} value={c.id}>{c.negocio||c.nombre} — {c.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">Método de Pago</label>
                <select value={npMetodo} onChange={e=>setNpMetodo(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange">
                  {['Efectivo','Cheque','Zelle','Tarjeta de crédito'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-brand-navy">Productos del catálogo</label>
                  <select onChange={e=>{
                    const p = productos.find(p=>p.id===e.target.value)
                    if(p && !npItems.find(i=>i.producto_id===p.id)) setNpItems(prev=>[...prev,{producto_id:p.id,nombre:p.nombre,precio:p.precio,costo:p.costo||0,cantidad:1,stock:p.stock??0}])
                    e.target.value=''
                  }} className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-brand-orange">
                    <option value="">+ Agregar producto</option>
                    {productos.filter(p=>p.activo!==false).map(p=><option key={p.id} value={p.id}>{p.nombre} — ${p.precio}</option>)}
                  </select>
                </div>
                {npItems.length > 0 && (
                  <div className="space-y-1 border border-gray-100 rounded-xl p-2">
                    {npItems.map((item,i)=>(
                      <div key={item.producto_id} className="flex items-center gap-2 text-sm">
                        <span className="flex-1 text-brand-gray-dark">{item.nombre}</span>
                        <span className="text-xs text-brand-gray-mid">${item.precio}</span>
                        <input type="number" min={1} value={item.cantidad} onChange={e=>setNpItems(prev=>prev.map((x,j)=>j===i?{...x,cantidad:parseInt(e.target.value)||1}:x))} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"/>
                        <span className="text-xs font-semibold text-brand-orange">${(item.precio*item.cantidad).toFixed(2)}</span>
                        <button onClick={()=>setNpItems(prev=>prev.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-brand-navy">Extras (tomates, cilantro, etc.)</label>
                  <button onClick={()=>setNpExtras(prev=>[...prev,{nombre:'',precio:0,cantidad:1}])} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg">+ Agregar extra</button>
                </div>
                {npExtras.map((ex,i)=>(
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input placeholder="Descripción" value={ex.nombre} onChange={e=>setNpExtras(prev=>prev.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"/>
                    <span className="text-xs text-brand-gray-mid">$</span>
                    <input type="number" placeholder="0.00" value={ex.precio||''} onChange={e=>setNpExtras(prev=>prev.map((x,j)=>j===i?{...x,precio:parseFloat(e.target.value)||0}:x))} className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs"/>
                    <input type="number" min={1} value={ex.cantidad} onChange={e=>setNpExtras(prev=>prev.map((x,j)=>j===i?{...x,cantidad:parseInt(e.target.value)||1}:x))} className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"/>
                    <button onClick={()=>setNpExtras(prev=>prev.filter((_,j)=>j!==i))} className="text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-brand-navy">Fuel Surcharge $</label>
                <input type="number" step="0.01" min={0} value={npFuel} onChange={e=>setNpFuel(parseFloat(e.target.value)||0)} className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
              </div>

              <div className="bg-brand-navy/5 rounded-xl p-3 text-sm">
                <div className="flex justify-between"><span className="text-brand-gray-mid">Productos</span><span>${(npItems.reduce((s,i)=>s+i.precio*i.cantidad,0)+npExtras.reduce((s,i)=>s+i.precio*i.cantidad,0)).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-brand-gray-mid">Fuel</span><span>${npFuel.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-brand-navy border-t pt-1 mt-1"><span>Total</span><span>${(npItems.reduce((s,i)=>s+i.precio*i.cantidad,0)+npExtras.reduce((s,i)=>s+i.precio*i.cantidad,0)+npFuel).toFixed(2)}</span></div>
              </div>

              <button onClick={crearPedidoAdmin} disabled={npCreando} className="w-full btn-primary py-3 text-base font-bold disabled:opacity-50">
                {npCreando ? 'Creando...' : '✅ Crear Pedido y Generar Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
  )
}
