"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, LogOut, ShoppingCart, X, Minus, Plus, Upload, Search } from 'lucide-react'

const FUEL_SURCHARGE = 5.00
const TAX_QUIMICOS = 0.1025

const TEXTS = {
  es: {
    welcome: 'Bienvenido',
    catalog: 'Catálogo',
    my_orders: 'Mis Pedidos',
    search: 'Buscar productos...',
    no_products: 'No se encontraron productos',
    add: 'Agregar',
    your_order: 'Tu Pedido',
    empty_cart: 'Tu carrito está vacío',
    subtotal: 'Subtotal',
    tax: 'Tax Químicos y Limpieza (10.25%)',
    fuel: 'Fuel Surcharge',
    total: 'Total',
    all: 'Todas',
    payment_method: 'Método de Pago *',
    proof: 'Comprobante de Pago *',
    proof_hint: '(PDF o imagen)',
    send_order: 'Enviar Pedido',
    sending: 'Enviando...',
    confirm_msg: 'Te contactaremos para confirmar la entrega',
    order_sent: '¡Pedido enviado! Te contactaremos pronto. ✓',
    no_orders: 'No tienes pedidos aún',
    view_catalog: 'Ver Catálogo',
    pending_title: 'Cuenta en revisión',
    pending_msg: 'Tu cuenta está siendo revisada por nuestro equipo.',
    pending_email: 'Te enviaremos un correo a',
    pending_when: 'cuando sea aprobada.',
    logout: 'Salir',
    remove: 'Quitar',
    payment: 'Pago',
    proof_link: '📄 Ver comprobante de pago',
    tax_note: '+10.25% tax',
    methods: ['Efectivo', 'Zelle', 'Cheque'],
    categorias_es: ['Vasos Desechables', 'Platos Desechables', 'Cubiertos', 'Bolsas y Contenedores', 'Servilletas', 'Papel para Baño', 'Papel', 'Palillos', 'Grocery', 'Químicos y Limpieza'],
    categorias_en: ['Disposable Cups', 'Disposable Plates', 'Cutlery', 'Bags & Containers', 'Napkins', 'Bathroom Paper', 'Paper', 'Toothpicks', 'Grocery', 'Chemicals & Cleaning'],
    zelle_info: 'Envía tu pago por Zelle al número registrado:',
    zelle_name: 'Nombre: Bood Supply',
    zelle_number: 'Número: (312) 409-0106',
    zelle_link: 'Pagar con Zelle',
    cheque_note: 'El cheque deberá ser entregado directamente al repartidor al momento de la entrega. Haz el cheque a nombre de: Bood Supply.',
    change_password_title: 'Cambio de contraseña requerido',
    change_password_msg: 'Por seguridad debes crear una nueva contraseña antes de continuar.',
    new_password: 'Nueva contraseña',
    confirm_password: 'Confirmar contraseña',
    password_placeholder: 'Mínimo 6 caracteres',
    confirm_placeholder: 'Repite la contraseña',
    save_password: 'Guardar Contraseña',
    saving: 'Guardando...',
    password_mismatch: 'Las contraseñas no coinciden',
    password_short: 'Mínimo 6 caracteres',
  },
  en: {
    welcome: 'Welcome',
    catalog: 'Catalog',
    my_orders: 'My Orders',
    search: 'Search products...',
    no_products: 'No products found',
    add: 'Add',
    your_order: 'Your Order',
    empty_cart: 'Your cart is empty',
    subtotal: 'Subtotal',
    tax: 'Chemicals & Cleaning Tax (10.25%)',
    fuel: 'Fuel Surcharge',
    total: 'Total',
    all: 'All',
    payment_method: 'Payment Method *',
    proof: 'Payment Proof *',
    proof_hint: '(PDF or image)',
    send_order: 'Send Order',
    sending: 'Sending...',
    confirm_msg: 'We will contact you to confirm delivery',
    order_sent: 'Order sent! We will contact you soon. ✓',
    no_orders: 'You have no orders yet',
    view_catalog: 'View Catalog',
    pending_title: 'Account under review',
    pending_msg: 'Your account is being reviewed by our team.',
    pending_email: 'We will send you an email to',
    pending_when: 'when it is approved.',
    logout: 'Sign Out',
    remove: 'Remove',
    payment: 'Payment',
    proof_link: '📄 View payment proof',
    tax_note: '+10.25% tax',
    methods: ['Cash', 'Zelle', 'Check'],
    categorias_es: ['Vasos Desechables', 'Platos Desechables', 'Cubiertos', 'Bolsas y Contenedores', 'Servilletas', 'Papel para Baño', 'Papel', 'Palillos', 'Grocery', 'Químicos y Limpieza'],
    categorias_en: ['Disposable Cups', 'Disposable Plates', 'Cutlery', 'Bags & Containers', 'Napkins', 'Bathroom Paper', 'Paper', 'Toothpicks', 'Grocery', 'Chemicals & Cleaning'],
    zelle_info: 'Send your payment via Zelle to the registered number:',
    zelle_name: 'Name: Bood Supply',
    zelle_number: 'Number: (312) 409-0106',
    zelle_link: 'Pay with Zelle',
    cheque_note: 'The check must be handed directly to the delivery driver at the time of delivery. Please make the check payable to: Bood Supply.',
    change_password_title: 'Password change required',
    change_password_msg: 'For security reasons you must create a new password before continuing.',
    new_password: 'New password',
    confirm_password: 'Confirm password',
    password_placeholder: 'Minimum 6 characters',
    confirm_placeholder: 'Repeat the password',
    save_password: 'Save Password',
    saving: 'Saving...',
    password_mismatch: 'Passwords do not match',
    password_short: 'Minimum 6 characters',
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aprobado, setAprobado] = useState<boolean | null>(null)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [categoriasDB, setCategoriasDB] = useState<string[]>([])
  const [categoria, setCategoria] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState<any[]>([])
  const [showCarrito, setShowCarrito] = useState(false)
  const [tab, setTab] = useState<'catalogo' | 'pedidos'>('catalogo')
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [metodoPago, setMetodoPago] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [productoModal, setProductoModal] = useState<any>(null)
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const supabase = createClient()
  const t = TEXTS[lang]

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/es/login'; return }
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!prof) { setAprobado(false); setLoading(false); return }
      setProfile(prof)
      if (prof.must_change_password) {
        setMustChangePassword(true)
        setLoading(false)
        return
      }
      const estaAprobado = prof.aprobado === true
      setAprobado(estaAprobado)
      if (estaAprobado) {
        const { data: prods } = await supabase.from('productos').select('*').eq('activo', true).order('categoria')
        setProductos(prods || [])
        const cats = [...new Set((prods || []).map((p: any) => p.categoria))].filter(Boolean) as string[]
        setCategoriasDB(cats)
        const { data: peds } = await supabase.from('pedidos').select('*, pedido_items(*, productos(*))').eq('cliente_id', user.id).order('created_at', { ascending: false })
        setPedidos(peds || [])
      }
      setLoading(false)
    }
    init()
  }, [])

  async function handleChangePassword() {
    if (newPassword.length < 6) return setPasswordError(t.password_short)
    if (newPassword !== confirmPassword) return setPasswordError(t.password_mismatch)
    setSavingPassword(true)
    setPasswordError('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPasswordError(error.message); setSavingPassword(false); return }
    await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)
    setMustChangePassword(false)
    const prof = { ...profile, must_change_password: false }
    setProfile(prof)
    const estaAprobado = prof.aprobado === true
    setAprobado(estaAprobado)
    if (estaAprobado) {
      const { data: prods } = await supabase.from('productos').select('*').eq('activo', true).order('categoria')
      setProductos(prods || [])
      const cats = [...new Set((prods || []).map((p: any) => p.categoria))].filter(Boolean) as string[]
      setCategoriasDB(cats)
      const { data: peds } = await supabase.from('pedidos').select('*, pedido_items(*, productos(*))').eq('cliente_id', user.id).order('created_at', { ascending: false })
      setPedidos(peds || [])
    }
    setSavingPassword(false)
  }

  function getNombreProducto(p: any) {
    if (lang === 'en' && p.nombre_en) return p.nombre_en
    return p.nombre
  }

  function getDescProducto(p: any) {
    if (lang === 'en' && p.descripcion_en) return p.descripcion_en
    return p.descripcion
  }

  function getCategoriaLabel(catES: string) {
    if (lang === 'en') {
      const idx = TEXTS.es.categorias_es.indexOf(catES)
      if (idx >= 0) return TEXTS.en.categorias_en[idx]
    }
    return catES
  }

  function agregarAlCarrito(producto: any) {
    if ((producto.stock ?? -1) === 0) return // bloquear sin stock
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
  const subtotalQuimicos = carrito.filter(i => i.categoria === 'Químicos y Limpieza').reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const taxQuimicos = subtotalQuimicos * TAX_QUIMICOS
  const total = subtotal + taxQuimicos + (carrito.length > 0 ? FUEL_SURCHARGE : 0)
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0)

  const productosFiltrados = productos.filter(p => {
    const catMatch = categoria === 0 ? true : p.categoria === categoriasDB[categoria - 1]
    const matchBusqueda = busqueda === '' ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.nombre_en && p.nombre_en.toLowerCase().includes(busqueda.toLowerCase())) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    return catMatch && matchBusqueda
  })

  const requiereComprobante = metodoPago && metodoPago !== 'Efectivo' && metodoPago !== 'Cash' && metodoPago !== 'Zelle' && metodoPago !== 'Cheque' && metodoPago !== 'Check'

  async function enviarPedido() {
    if (carrito.length === 0) return
    if (!metodoPago) return alert(lang === 'es' ? 'Selecciona un método de pago' : 'Select a payment method')
    if (requiereComprobante && !comprobante) return alert(lang === 'es' ? 'Debes adjuntar el comprobante de pago' : 'You must attach the payment proof')
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

  if (mustChangePassword) return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔑</div>
          <h1 className="font-heading text-3xl font-bold text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></h1>
          <h2 className="font-heading text-xl font-bold text-brand-navy mt-3">{t.change_password_title}</h2>
          <p className="text-brand-gray-mid mt-2 text-sm">{t.change_password_msg}</p>
        </div>
        {passwordError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{passwordError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.new_password}</label>
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder={t.password_placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.confirm_password}</label>
            <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder={t.confirm_placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" onKeyDown={e => e.key === 'Enter' && handleChangePassword()} />
          </div>
          <button onClick={handleChangePassword} disabled={savingPassword} className="btn-primary w-full py-3 text-base">
            {savingPassword ? t.saving : t.save_password}
          </button>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-xs text-brand-gray-mid hover:text-brand-orange">
            {lang === 'es' ? '🇺🇸 EN' : '🇲🇽 ES'}
          </button>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="text-xs text-brand-gray-mid hover:text-brand-orange">{t.logout}</button>
        </div>
      </div>
    </div>
  )

  if (aprobado === false) return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⏳</div>
        <h2 className="font-heading text-2xl font-bold text-brand-navy mb-2">{t.pending_title}</h2>
        <p className="text-brand-gray-mid mb-2">{t.pending_msg}</p>
        <p className="text-brand-gray-mid text-sm">{t.pending_email} <strong>{user?.email}</strong> {t.pending_when}</p>
        <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="mt-6 text-sm text-brand-gray-mid hover:text-brand-orange transition-colors block mx-auto">{t.logout}</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray-light">
      {pedidoEnviado && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium">
          {t.order_sent}
        </div>
      )}

      {productoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setProductoModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative" onClick={e => e.stopPropagation()}>
            {productoModal.imagen_url ? (
              <img src={productoModal.imagen_url} alt={getNombreProducto(productoModal)} className="w-full h-64 object-contain bg-gray-50" />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-6xl">📦</div>
            )}
            <div className="p-6">
              <div className="text-xs text-brand-orange font-semibold uppercase tracking-wide mb-1">{getCategoriaLabel(productoModal.categoria)}</div>
              <h2 className="font-heading font-bold text-brand-navy text-2xl mb-2">{getNombreProducto(productoModal)}</h2>
              <p className="text-brand-gray-mid mb-1">{getDescProducto(productoModal)}</p>
              <p className="text-sm text-gray-400 mb-4">{productoModal.unidad}</p>
              {productoModal.categoria === 'Químicos y Limpieza' && (
                <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg mb-4">⚠️ {t.tax_note}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-3xl text-brand-navy">${productoModal.precio}</span>
                <button onClick={() => { agregarAlCarrito(productoModal); setProductoModal(null) }} className="btn-primary flex items-center gap-2">
                  <Plus size={16} /> {t.add}
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
        <div className="flex items-center gap-3">
          <a href="https://www.facebook.com/profile.php?id=61582953226409" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 transition-colors hidden sm:flex items-center gap-1">
            📘 Facebook
          </a>
          <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:border-brand-orange transition-colors text-brand-gray-dark">
            {lang === 'es' ? '🇺🇸 EN' : '🇲🇽 ES'}
          </button>
          <button onClick={() => setShowCarrito(true)} className="relative flex items-center gap-2 text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors">
            <ShoppingCart size={22} />
            {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{totalItems}</span>}
          </button>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/es' }} className="flex items-center gap-2 text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-brand-navy">{t.welcome}, {profile?.nombre || user?.email}</h1>
          <p className="text-brand-gray-mid text-sm mt-0.5">{profile?.negocio}</p>
        </div>
        <div className="flex gap-3 mb-8">
          <button onClick={() => setTab('catalogo')} className={`font-heading font-semibold px-6 py-2.5 rounded-button transition-all ${tab === 'catalogo' ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy border border-gray-200'}`}>{t.catalog}</button>
          <button onClick={() => setTab('pedidos')} className={`font-heading font-semibold px-6 py-2.5 rounded-button transition-all flex items-center gap-2 ${tab === 'pedidos' ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy border border-gray-200'}`}>
            {t.my_orders}
            {pedidos.length > 0 && <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${tab === 'pedidos' ? 'bg-white text-brand-navy' : 'bg-brand-orange text-white'}`}>{pedidos.length}</span>}
          </button>
        </div>

        {tab === 'catalogo' && (
          <>
            <div className="relative mb-6">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-mid" />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder={t.search} className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div className="flex gap-2 flex-wrap mb-6">
              <button onClick={() => setCategoria(0)} className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all ${categoria === 0 ? 'bg-brand-orange text-white' : 'bg-white text-brand-gray-dark border border-gray-200 hover:border-brand-orange'}`}>
                {t.all}
              </button>
              {categoriasDB.map((cat, idx) => (
                <button key={cat} onClick={() => setCategoria(idx + 1)} className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all ${categoria === idx + 1 ? 'bg-brand-orange text-white' : 'bg-white text-brand-gray-dark border border-gray-200 hover:border-brand-orange'}`}>
                  {getCategoriaLabel(cat)}
                </button>
              ))}
            </div>
            {productosFiltrados.length === 0 && (
              <div className="text-center py-12 text-brand-gray-mid">
                <Search size={40} className="mx-auto mb-3 opacity-25" />
                <p>{t.no_products}</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productosFiltrados.map(p => {
                const enCarrito = carrito.find(i => i.id === p.id)
                const sinStock = (p.stock ?? -1) === 0
                return (
                  <div key={p.id} className={`bg-white rounded-2xl shadow-sm border flex flex-col hover:shadow-md transition-shadow overflow-hidden relative ${sinStock ? 'border-red-200 opacity-75' : 'border-gray-100'}`}>
                    {sinStock && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">OUT OF STOCK</div>
                    )}
                    <div className={sinStock ? 'cursor-default' : 'cursor-pointer'} onClick={() => !sinStock && setProductoModal(p)}>
                      {p.imagen_url ? (
                        <img src={p.imagen_url} alt={getNombreProducto(p)} className="w-full h-36 object-contain bg-gray-50 hover:opacity-90 transition-opacity" />
                      ) : (
                        <div className="w-full h-36 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="text-xs text-brand-orange font-semibold mb-1 uppercase tracking-wide">{getCategoriaLabel(p.categoria)}</div>
                      <h3 className="font-heading font-bold text-brand-navy text-base mb-1 cursor-pointer hover:text-brand-orange transition-colors" onClick={() => setProductoModal(p)}>{getNombreProducto(p)}</h3>
                      <p className="text-brand-gray-mid text-xs mb-1 flex-1">{getDescProducto(p)}</p>
                      <p className="text-xs text-gray-400 mb-1">{p.unidad}</p>
                      {p.categoria === 'Químicos y Limpieza' && <p className="text-xs text-yellow-600 mb-2">{t.tax_note}</p>}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-heading font-bold text-xl text-brand-navy">${p.precio}</span>
                        {enCarrito ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => cambiarCantidad(p.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50"><Minus size={12} /></button>
                            <span className="font-bold text-sm w-5 text-center">{enCarrito.cantidad}</span>
                            <button onClick={() => cambiarCantidad(p.id, 1)} className="w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center"><Plus size={12} /></button>
                          </div>
                        ) : (
                          <button onClick={() => agregarAlCarrito(p)} disabled={sinStock} className={`btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1 ${sinStock ? "opacity-50 cursor-not-allowed" : ""}`}>
                            <Plus size={14} /> {t.add}
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
                <p className="font-heading font-semibold text-lg">{t.no_orders}</p>
                <button onClick={() => setTab('catalogo')} className="btn-primary mt-6 inline-flex">{t.view_catalog}</button>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map(ped => (
                  <div key={ped.id} className="card">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div>
                        <p className="font-heading font-bold text-brand-navy">#{ped.id.slice(0,8).toUpperCase()}</p>
                        <p className="text-sm text-brand-gray-mid">{new Date(ped.created_at).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        {ped.metodo_pago && <p className="text-xs text-brand-gray-mid mt-0.5">{t.payment}: {ped.metodo_pago}</p>}
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
                          <span>{t.fuel}</span>
                          <span>${ped.fuel_surcharge?.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    {ped.comprobante_url && (
                      <div className="mt-3 pt-3 border-t">
                        <a href={ped.comprobante_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium">
                          {t.proof_link}
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
              <h2 className="font-heading font-bold text-xl text-brand-navy">{t.your_order}</h2>
              <button onClick={() => setShowCarrito(false)}><X size={22} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {carrito.length === 0 ? (
                <div className="text-center py-16 text-brand-gray-mid">
                  <ShoppingCart size={44} className="mx-auto mb-3 opacity-25" />
                  <p>{t.empty_cart}</p>
                </div>
              ) : (
                <>
                  {carrito.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-brand-navy text-sm">{getNombreProducto(item)}</p>
                        <p className="text-brand-gray-mid text-xs">{item.unidad}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => cambiarCantidad(item.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><Minus size={12} /></button>
                        <span className="font-bold text-sm w-5 text-center">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.id, 1)} className="w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center"><Plus size={12} /></button>
                      </div>
                      <div className="text-right min-w-16">
                        <p className="font-bold text-sm">${(item.precio * item.cantidad).toFixed(2)}</p>
                        <button onClick={() => quitarDelCarrito(item.id)} className="text-red-400 text-xs hover:text-red-600">{t.remove}</button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm text-brand-gray-mid">
                      <span>{t.subtotal}</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    {taxQuimicos > 0 && (
                      <div className="flex justify-between text-sm text-yellow-600">
                        <span>{t.tax}</span><span>${taxQuimicos.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-brand-gray-mid">
                      <span>{t.fuel}</span><span>${FUEL_SURCHARGE.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-gray-dark mb-2">{t.payment_method}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {t.methods.map(m => (
                          <button key={m} onClick={() => setMetodoPago(m)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${metodoPago === m ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-brand-gray-dark border-gray-200 hover:border-brand-navy'}`}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    {metodoPago === 'Zelle' && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-purple-800 mb-2">💜 {t.zelle_info}</p>
                        <p className="text-sm text-purple-700 font-bold">{t.zelle_name}</p>
                        <p className="text-sm text-purple-700 font-bold mb-3">{t.zelle_number}</p>
                        <a href="https://enroll.zellepay.com/qr-codes?data=ewogICJuYW1lIjogIkJPT0QgU1VQUExZIiwKICAidG9rZW4iOiAiMzEyNDA5MDEwNiIsCiAgImFjdGlvbiI6ICJwYXltZW50Igp9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                          💸 {t.zelle_link}
                        </a>
                      </div>
                    )}
                    {(metodoPago === 'Cheque' || metodoPago === 'Check') && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm text-amber-800">🧾 {t.cheque_note}</p>
                      </div>
                    )}
                    {requiereComprobante && (
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-dark mb-2">{t.proof} <span className="text-brand-gray-mid font-normal">{t.proof_hint}</span></label>
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
                  <span className="font-heading font-bold text-brand-navy text-lg">{t.total}</span>
                  <span className="font-heading font-bold text-2xl text-brand-orange">${total.toFixed(2)}</span>
                </div>
                <button onClick={enviarPedido} disabled={enviando} className="btn-primary w-full py-3 text-base">
                  {enviando ? t.sending : t.send_order}
                </button>
                <p className="text-xs text-center text-brand-gray-mid mt-3">{t.confirm_msg}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}