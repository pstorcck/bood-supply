"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const TEXTS = {
  es: {
    title: 'Inicia sesión en tu cuenta',
    recover_title: 'Recuperar contraseña',
    email: 'Correo',
    password: 'Contraseña',
    email_ph: 'tu@correo.com',
    password_ph: '••••••••',
    submit: 'Iniciar Sesión',
    submitting: 'Procesando...',
    recover_btn: 'Enviar instrucciones',
    forgot: '¿Olvidaste tu contraseña?',
    back_login: 'Volver al login',
    no_account: '¿No tienes cuenta?',
    create: 'Crear cuenta',
    sent_title: 'Correo enviado',
    sent_msg: 'Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu contraseña.',
    back_btn: 'Volver al Login',
    error_fields: 'Llena todos los campos',
    error_login: 'Correo o contraseña incorrectos',
    error_email: 'Ingresa tu correo',
  },
  en: {
    title: 'Sign in to your account',
    recover_title: 'Recover password',
    email: 'Email',
    password: 'Password',
    email_ph: 'your@email.com',
    password_ph: '••••••••',
    submit: 'Sign In',
    submitting: 'Processing...',
    recover_btn: 'Send instructions',
    forgot: 'Forgot your password?',
    back_login: 'Back to login',
    no_account: "Don't have an account?",
    create: 'Create account',
    sent_title: 'Email sent',
    sent_msg: 'Check your inbox and follow the instructions to recover your password.',
    back_btn: 'Back to Login',
    error_fields: 'Fill in all fields',
    error_login: 'Incorrect email or password',
    error_email: 'Enter your email',
  }
}

export default function LoginPage() {
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<'login' | 'recuperar'>('login')
  const [enviado, setEnviado] = useState(false)
  const supabase = createClient()
  const t = TEXTS[lang]

  async function handleLogin() {
    if (!email || !password) return setError(t.error_fields)
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError(t.error_login); setLoading(false); return }
    if (email === 'boodsupplies@gmail.com') {
      window.location.href = '/es/admin'
    } else {
      window.location.href = '/es/dashboard'
    }
  }

  async function handleRecuperar() {
    if (!email) return setError(t.error_email)
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
        <h2 className="font-heading text-2xl font-bold text-brand-navy mb-2">{t.sent_title}</h2>
        <p className="text-brand-gray-mid mb-6">{t.sent_msg}</p>
        <button onClick={() => { setModo('login'); setEnviado(false) }} className="btn-primary inline-block">{t.back_btn}</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-2">
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:border-brand-orange transition-colors text-brand-gray-dark">
              {lang === 'es' ? '🇺🇸 EN' : '🇲🇽 ES'}
            </button>
          </div>
          <h1 className="font-heading text-3xl font-bold text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></h1>
          <p className="text-brand-gray-mid mt-2">{modo === 'login' ? t.title : t.recover_title}</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.email}</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder={t.email_ph} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          {modo === 'login' && (
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.password}</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder={t.password_ph} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
          )}
          <button onClick={modo === 'login' ? handleLogin : handleRecuperar} disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? t.submitting : modo === 'login' ? t.submit : t.recover_btn}
          </button>
        </div>
        <div className="text-center mt-4">
          {modo === 'login' ? (
            <button onClick={() => { setModo('recuperar'); setError('') }} className="text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">
              {t.forgot}
            </button>
          ) : (
            <button onClick={() => { setModo('login'); setError('') }} className="text-sm text-brand-gray-mid hover:text-brand-orange transition-colors">
              {t.back_login}
            </button>
          )}
        </div>
        <p className="text-center text-sm text-brand-gray-mid mt-4">
          {t.no_account} <Link href="/es/registro" className="text-brand-orange font-medium hover:underline">{t.create}</Link>
        </p>
      </div>
    </div>
  )
}