"use client"
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
  const [form, setForm] = useState({ email: '', password: '', nombre: '', negocio: '', telefono: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nombre: form.nombre, negocio: form.negocio, telefono: form.telefono } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/es/dashboard') }
  }

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/es">
            <Image src="/logo.png" alt="BOOD SUPPLY" width={120} height={60} className="object-contain mx-auto mb-4" />
          </Link>
          <h1 className="font-heading text-3xl font-bold text-brand-navy">Crear Cuenta</h1>
          <p className="text-brand-gray-mid mt-2">Empieza a pedir con BOOD SUPPLY</p>
        </div>
        <div className="card">
          <form onSubmit={handleRegistro} className="space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1.5">Nombre completo</label>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} required placeholder="Juan Garcia" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1.5">Nombre del negocio</label>
              <input name="negocio" type="text" value={form.negocio} onChange={handleChange} required placeholder="Restaurante El Buen Sabor" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1.5">Telefono</label>
              <input name="telefono" type="tel" value={form.telefono} onChange={handleChange} placeholder="(312) 555-0000" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1.5">Correo electronico</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="tu@restaurante.com" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1.5">Contrasena</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Minimo 6 caracteres" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-60">
              {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
            </button>
          </form>
          <p className="text-center text-sm text-brand-gray-mid mt-6">
            Ya tienes cuenta?{' '}
            <Link href="/es/login" className="text-brand-orange font-semibold hover:underline">Inicia sesion</Link>
          </p>
        </div>
      </div>
    </div>
  )
}