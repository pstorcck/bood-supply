"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const [sesionLista, setSesionLista] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Supabase envía el token como hash en la URL: #access_token=...
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          setSesionLista(true)
        })
      }
    } else {
      // También puede venir como query param con PKCE
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setSesionLista(true)
        else setError('Link inválido o expirado. Solicita uno nuevo.')
      })
    }
  }, [])

  async function handleReset() {
    if (!password || !confirm) return setError('Llena todos los campos')
    if (password !== confirm) return setError('Las contraseñas no coinciden')
    if (password.length < 6) return setError('Mínimo 6 caracteres')
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setListo(true)
    setTimeout(() => { window.location.href = '/es/login' }, 3000)
  }

  if (listo) return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
        <h2 className="font-heading text-2xl font-bold text-brand-navy mb-2">¡Contraseña actualizada!</h2>
        <p className="text-brand-gray-mid">Redirigiendo al login...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></h1>
          <p className="text-brand-gray-mid mt-2">Nueva contraseña</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        {!sesionLista && !error && (
          <div className="text-center text-brand-gray-mid py-8">Verificando link...</div>
        )}
        {sesionLista && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Nueva contraseña</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Confirmar contraseña</label>
              <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="Repite la contraseña" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" onKeyDown={e => e.key === 'Enter' && handleReset()} />
            </div>
            <button onClick={handleReset} disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
        )}
        <p className="text-center text-sm text-brand-gray-mid mt-6">
          <a href="/es/login" className="text-brand-orange hover:underline">Volver al login</a>
        </p>
      </div>
    </div>
  )
}