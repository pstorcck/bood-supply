cat > ~/Desktop/bood-supply/src/app/\[locale\]/admin/page.tsx << 'ENDOFFILE'
"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, LogOut, Package, Eye, EyeOff } from 'lucide-react'

const CATEGORIAS = ['Vasos Desechables', 'Platos Desechables', 'Cubiertos', 'Bolsas y Contenedores', 'Servilletas', 'Papel para Baño', 'Papel', 'Palillos']
const ADMIN_EMAIL = 'boodsupplies@gmail.com'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', categoria: CATEGORIAS[0], precio: '', unidad: '' })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/es/login'); return }
      setUser(user)
      await cargarProductos()
      setLoading(false)
    }
    init()
  }, [])

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').order('categoria').order('nombre')
    setProductos(data || [])
  }

  async function agregarProducto() {
    if (!form.nombre || !form.precio || !form.unidad) return alert('Llena todos los campos')
    setGuardando(true)
    await supabase.from('productos').insert({ ...form, precio: parseFloat(form.precio), activo: true })
    setForm({ nombre: '', descripcion: '', categoria: CATEGORIAS[0], precio: '', unidad: '' })
    setShowForm(false)
    await cargarProductos()
    setGuardando(false)
  }

  async function toggleActivo(id: string, activo: boolean) {
    await supabase.from('productos').update({ activo: !activo }).eq('id', id)
    await cargarProductos()
  }

  async function eliminarProducto(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    await cargarProductos()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/es')
  }

  if (loading) return <div className="min-h-screen bg-brand-gray-light flex items-center justify-center"><div className="text-brand-gray-mid">Cargando...</div></div>

  const porCategoria = CATEGORIAS.reduce((acc, cat) => {
    acc[cat] = productos.filter(p => p.categoria === cat)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <nav className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Package size={22} className="text-brand-orange" />
          <span className="font-heading font-bold text-lg">Admin — BOOD SUPPLY</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-300 text-sm hidden md:block">{user?.email}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-navy">Productos</h1>
            <p className="text-brand-gray-mid text-sm mt-0.5">{productos.length} productos · {productos.filter(p => p.activo).length} activos</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Agregar Producto
          </button>
        </div>

        {showForm && (
          <div className="card mb-8 border-2 border-brand-orange/30">
            <h2 className="font-heading font-bold text-brand-navy text-lg mb-5">Nuevo Producto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-gray-dark mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Vaso 8oz" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray-dark mb-1">Categoría *</label>
                <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange bg-white">
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray-dark mb-1">Precio * (USD)</label>
                <input value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} placeholder="Ej: 9.99" type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray-dark mb-1">Unidad *</label>
                <input value={form.unidad} onChange={e => setForm({...form, unidad: e.target.value})} placeholder="Ej: paquete 100u" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-brand-gray-dark mb-1">Descripción</label>
                <input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción breve del producto" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={agregarProducto} disabled={guardando} className="btn-primary flex items-center gap-2">
                {guardando ? 'Guardando...' : <><Plus size={16} /> Guardar Producto</>}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-brand-gray-mid hover:text-brand-navy transition-colors">Cancelar</button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {CATEGORIAS.map(cat => {
            const prods = porCategoria[cat]
            if (prods.length === 0) return null
            return (
              <div key={cat} className="card">
                <h2 className="font-heading font-bold text-brand-navy mb-4 flex items-center gap-2">
                  {cat}
                  <span className="text-xs font-normal text-brand-gray-mid bg-gray-100 px-2 py-0.5 rounded-full">{prods.length}</span>
                </h2>
                <div className="space-y-2">
                  {prods.map(p => (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${p.activo ? 'border-gray-100 bg-gray-50' : 'border-red-100 bg-red-50 opacity-60'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-brand-navy text-sm">{p.nombre}</span>
                          {!p.activo && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactivo</span>}
                        </div>
                        <div className="text-xs text-brand-gray-mid mt-0.5">{p.descripcion} · {p.unidad}</div>
                      </div>
                      <div className="font-heading font-bold text-brand-navy">${p.precio}</div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleActivo(p.id, p.activo)} title={p.activo ? 'Ocultar' : 'Mostrar'} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-brand-gray-mid">
                          {p.activo ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button onClick={() => eliminarProducto(p.id)} title="Eliminar" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors text-red-400 hover:text-red-600">
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
      </div>
    </div>
  )
}
ENDOFFILE