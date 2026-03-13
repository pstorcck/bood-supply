"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin() {
    if (!email || !password) return setError('Llena todos los campos')
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }
    if (email === 'boodsupplies@gmail.com') {
      window.location.href = '/es/admin'
    } else {
      window.location.href = '/es/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></h1>
          <p className="text-brand-gray-mid mt-2">Inicia sesión en tu cuenta</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Correo</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@correo.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Contraseña</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </div>
        <p className="text-center text-sm text-brand-gray-mid mt-6">
          ¿No tienes cuenta? <Link href="/es/registro" className="text-brand-orange font-medium hover:underline">Crear cuenta</Link>
        </p>
      </div>
    </div>
  )
}