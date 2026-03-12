'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await new Promise(r => setTimeout(r, 1000))
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center">
              <span className="font-heading font-bold text-white">BS</span>
            </div>
            <span className="font-heading font-bold text-brand-navy text-2xl">
              BOOD <span className="text-brand-orange">SUPPLY</span>
            </span>
          </Link>
          <h1 className="font-heading font-bold text-brand-navy text-2xl mt-6 mb-1">Iniciar Sesión</h1>
          <p className="text-brand-gray-mid text-sm">Accede a tu cuenta BOOD SUPPLY</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-button px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Correo electrónico</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="correo@turestaurante.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-mid hover:text-brand-navy"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/recuperar-contrasen