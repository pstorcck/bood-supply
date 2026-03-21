"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sesionLista, setSesionLista] = useState(false)
  const [listo, setListo] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      // Verificar si hay sesión activa (must_change_password flow)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) { setSesionLista(true); return }

      // Procesar token desde URL hash
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.replace('#', '?'))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (!error) { setSesionLista(true); return }
        }
      }

      // Procesar token desde query params
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { setSesionLista(true); return }
      }
    }
    init()
  }, [])

  async function handleReset() {
    if (!password || password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    if (password !== confirm) return setError('Las contraseñas no coinciden')
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)
    await supabase.auth.signOut()
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
          <a href="/es"><img src="/logo.png" alt="Bood Supply" className="h-16 mx-auto mb-4 object-contain"/></a>
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Cambiar Contraseña</h1>
          <p className="text-brand-gray-mid text-sm mt-1">Crea tu nueva contraseña de acceso</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        {!sesionLista ? (
          <div className="text-center text-brand-gray-mid py-8">Verificando link...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Nueva contraseña</label>
              <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Confirmar contraseña</label>
              <input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" placeholder="Repite la contraseña" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" onKeyDown={e=>e.key==='Enter'&&handleReset()}/>
            </div>
            <button onClick={handleReset} disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading?'Actualizando...':'Actualizar contraseña'}
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