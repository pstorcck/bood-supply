"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Clock, CheckCircle, DollarSign, Plus, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/es/login'); return }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/es')
  }

  if (loading) return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center">
      <div className="text-brand-gray-mid">Cargando...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <nav className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <span className="font-heading font-bold text-xl text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></span>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-brand-navy">Bienvenido</h1>
          <p className="text-brand-gray-mid mt-1">{user?.email}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Pedidos este mes', value: '0', icon: ShoppingBag, color: 'text-brand-blue' },
            { label: 'Pendientes', value: '0', icon: Clock, color: 'text-yellow-500' },
            { label: 'Entregados', value: '0', icon: CheckCircle, color: 'text-green-500' },
            { label: 'Total gastado', value: '$0.00', icon: DollarSign, color: 'text-brand-orange' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className="flex items-center gap-3 mb-2">
                <Icon size={18} className={color} />
                <span className="text-brand-gray-mid text-sm">{label}</span>
              </div>
              <div className="font-heading font-bold text-2xl text-brand-navy">{value}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-xl text-brand-navy">Pedidos Recientes</h2>
            <button className="btn-primary flex items-center gap-2 !py-2 !px-4 text-sm">
              <Plus size={16} /> Nuevo Pedido
            </button>
          </div>
          <div className="text-center py-12 text-brand-gray-mid">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tienes pedidos aún</p>
            <p className="text-sm mt-1">Haz tu primer pedido para empezar</p>
          </div>
        </div>
      </div>
    </div>
  )
}