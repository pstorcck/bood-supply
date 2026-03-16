"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<'login' | 'recuperar'>('login')
  const [enviado, setEnviado] = useState(false)
  const supabase = createClient()

  async function handleLogin() {
    if (!email || !password) return setError('Llena todos los campos')
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError('Correo o contraseña incorrectos'); setLoading(false); return }
    if (email === 'boodsupplies@gmail.com') {
      window.location.href = '/es/admin'
    } else {
      window.location.href = '/es/dashboard'
    }
  }

  async function handleRecuperar() {
    if (!email) return setError('Ingresa tu correo')
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.boodsupply.com/es/reset-password',
    })
    if (error) { setError(error.message); setLoading(false); return }
    setEnviado(true)
    setLoading(false)
  }

  if (enviado) return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✉️</div>
        <h2 className="font-heading text-2xl font-bold text-brand-navy mb-2">Correo enviado</h2>
        <p className="text-brand-gray-mid mb-6">Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu contraseña.</p>
        <button onClick={() => { setModo('login'); setEnviado(false) }} className="btn-primary inline-block">Volver al Login</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></h1>
          <p className="text-brand-gray-mid mt-2">{modo === 'login' ? 'Inicia sesión en tu cuenta' : 'Recuperar contraseña'}</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Correo</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@correo.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          {modo === 'login' && (
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Contraseña</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
          )}
          <button onClick={modo === 'login' ? handleLogin : handleRecuperar} disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? 'Procesando...' : modo === 'login' ? 'Iniciar Sesión' : 'Enviar instrucciones'}
          </button>
        </div>
        <div className="text-center mt-4">
          {modo === 'login' ? (
            <button onClick={() => { setModo('recuperar'); setError('') }} className="text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          ) : (
            <button onClick={() => { setModo('login'); setError('') }} className="text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">
              Volver al login
            </button>
          )}
        </div>
        <p className="text-center text-sm text-brand-gray-mid mt-4">
          ¿No tienes cuenta? <Link href="/es/registro" className="text-brand-orange font-medium hover:underline">Crear cuenta</Link>
        </p>
      </div>
    </div>
  )
}