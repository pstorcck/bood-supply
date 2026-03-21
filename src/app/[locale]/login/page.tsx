"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('login')
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(t('error')); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('role, must_change_password').eq('id', data.user.id).single()
    const role = profile?.role || 'cliente'
    const mustChange = profile?.must_change_password

    if (mustChange) { router.push(`/${locale}/reset-password`); return }

    if (email === 'boodsupplies@gmail.com') {
      router.push(`/${locale}/admin`)
    } else if (role === 'vendedor') {
      router.push(`/${locale}/vendedor`)
    } else if (role === 'bodega') {
      router.push(`/${locale}/bodega`)
    } else {
      router.push(`/${locale}/dashboard`)
    }
    setLoading(false)
  }

  async function handleReset() {
    if (!resetEmail) return
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`
    })
    if (!error) setResetSent(true)
  }

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href={`/${locale}`}>
            <img src="/logo.png" alt="Bood Supply" className="h-16 mx-auto mb-4 object-contain"/>
          </a>
          <h1 className="font-heading font-bold text-2xl text-brand-navy">{t('title')}</h1>
        </div>
        <div className="card">
          {!showReset ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t('email')}</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="correo@email.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t('password')}</label>
                <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required placeholder="••••••••" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? t('loading') : t('submit')}</button>
              <button type="button" onClick={()=>setShowReset(true)} className="w-full text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">{t('forgot')}</button>
            </form>
          ) : (
            <div className="space-y-4">
              {resetSent ? (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{t('resetSent')}</div>
              ) : (
                <>
                  <p className="text-sm text-brand-gray-mid">{t('resetInstructions')}</p>
                  <input value={resetEmail} onChange={e=>setResetEmail(e.target.value)} type="email" placeholder="correo@email.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"/>
                  <button onClick={handleReset} className="btn-primary w-full">{t('resetButton')}</button>
                </>
              )}
              <button onClick={()=>setShowReset(false)} className="w-full text-sm text-brand-gray-mid hover:text-brand-orange">{t('back')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}