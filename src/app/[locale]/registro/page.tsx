"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegistroPage() {
  const [form, setForm] = useState({ email: '', password: '', nombre: '', negocio: '', telefono: '', direccion: '', ein: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleRegistro() {
    if (!form.email || !form.password || !form.nombre || !form.negocio) return setError('Llena todos los campos obligatorios')
    setLoading(true)
    setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        nombre: form.nombre,
        negocio: form.negocio,
        telefono: form.telefono,
        direccion: form.direccion,
        ein: form.ein,
      })
    }
    window.location.href = '/es/login?registered=true'
  }

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></h1>
          <p className="text-brand-gray-mid mt-2">Crea tu cuenta para hacer pedidos</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Nombre *</label>
              <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Tu nombre" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Negocio *</label>
              <input value={form.negocio} onChange={e => setForm({...form, negocio: e.target.value})} placeholder="Nombre del negocio" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="(312) 000-0000" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">EIN</label>
              <input value={form.ein} onChange={e => setForm({...form, ein: e.target.value})} placeholder="XX-XXXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Dirección</label>
            <input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Dirección del negocio" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Correo *</label>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" placeholder="tu@correo.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Contraseña *</label>
            <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} type="password" placeholder="Mínimo 6 caracteres" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <button onClick={handleRegistro} disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </div>
        <p className="text-center text-sm text-brand-gray-mid mt-6">
          ¿Ya tienes cuenta? <Link href="/es/login" className="text-brand-orange font-medium hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}