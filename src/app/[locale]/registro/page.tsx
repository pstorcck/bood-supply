'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, UserPlus } from 'lucide-react'

const BUSINESS_TYPES = [
  'Restaurante mexicano', 'Taquería', 'Cafetería', 'Cocina americana',
  'Fast food', 'Food truck', 'Catering', 'Otro'
]

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    business_name: '', contact_name: '', phone: '', email: '',
    billing_address: '', city: '', state: 'IL', zip: '',
    business_type: '', tax_id: '', password: '', confirm_password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.business_name) e.business_name = 'Requerido'
    if (!form.contact_name) e.contact_name = 'Requerido'
    if (!form.email) e.email = 'Requerido'
    if (!form.phone) e.phone = 'Requerido'
    if (!form.billing_address) e.billing_address = 'Requerido'
    if (!form.city) e.city = 'Requerido'
    if (!form.zip) e.zip = 'Requerido'
    if (!form.business_type) e.business_type = 'Requerido'
    if (!form.password || form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirm_password) e.confirm_password = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1200))
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-gray-light flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="font-heading font-bold text-brand-navy text-2xl mb-3">¡Registro Exitoso!</h2>
          <p className="text-brand-gray-mid mb-8">Revisaremos tu solicitud y te contactaremos pronto.</p>
          <Link href="/" className="btn-primary inline-flex">Volver al Inicio</Link>
        </div>
      </div>
    )
  }return (
    <div className="min-h-screen bg-brand-gray-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-brand-navy rounded-xl flex items-center justify-center">
              <span className="font-heading font-bold text-white text-sm">BS</span>
            </div>
            <span className="font-heading font-bold text-brand-navy text-xl">
              BOOD <span className="text-brand-orange">SUPPLY</span>
            </span>
          </Link>
          <h1 className="font-heading font-bold text-brand-navy text-3xl mb-2">Hazte Cliente</h1>
          <p className="text-brand-gray-mid">Crea tu cuenta comercial gratuita</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card mb-6">
            <h3 className="font-heading font-bold text-brand-navy text-lg mb-5 pb-3 border-b border-gray-100">Información del Negocio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Nombre del negocio <span className="text-red-500">*</span></label>
                <input type="text" className={`input-field ${errors.business_name ? 'border-red-400' : ''}`} placeholder="Mi Restaurante LLC" value={form.business_name} onChange={e => update('business_name', e.target.value)} />
                {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
              </div>
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Persona de contacto <span className="text-red-500">*</span></label>
                <input type="text" className={`input-field ${errors.contact_name ? 'border-red-400' : ''}`} placeholder="Juan García" value={form.contact_name} onChange={e => update('contact_name', e.target.value)} />
                {errors.contact_name && <p className="text-red-500 text-xs mt-1">{errors.contact_name}</p>}
              </div>
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Teléfono <span className="text-red-500">*</span></label>
                <input type="tel" className={`input-field ${errors.phone ? 'border-red-400' : ''}`} placeholder="+1 (312) 000-0000" value={form.phone} onChange={e => update('phone', e.target.value)} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Correo electrónico <span className="text-red-500">*</span></label>
                <input type="email" className={`input-field ${errors.email ? 'border-red-400' : ''}`} placeholder="juan@mirestaurante.com" value={form.email} onChange={e => update('email', e.target.value)} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Tipo de negocio <span className="text-red-500">*</span></label>
                <select className={`input-field ${errors.business_type ? 'border-red-400' : ''}`} value={form.business_type} onChange={e => update('business_type', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {BUSINESS_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
                {errors.business_type && <p className="text-red-500 text-xs mt-1">{errors.business_type}</p>}
              </div>
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Tax ID / EIN (opcional)</label>
                <input type="text" className="input-field" placeholder="XX-XXXXXXX" value={form.tax_id} onChange={e => update('tax_id', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="card mb-6">
            <h3 className="font-heading font-bold text-brand-navy text-lg mb-5 pb-3 border-b border-gray-100">Dirección</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Dirección <span className="text-red-500">*</span></label>
                <input type="text" className={`input-field ${errors.billing_address ? 'border-red-400' : ''}`} placeholder="2900 N Richmond St" value={form.billing_address} onChange={e => update('billing_address', e.target.value)} />
                {errors.billing_address && <p className="text-red-500 text-xs mt-1">{errors.billing_address}</p>}
              </div>
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Ciudad <span className="text-red-500">*</span></label>
                <input type="text" className={`input-field ${errors.city ? 'border-red-400' : ''}`} placeholder="Chicago" value={form.city} onChange={e => update('city', e.target.value)} />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Estado</label>
                <select className="input-field" value={form.state} onChange={e => update('state', e.target.value)}>
                  {['IL','IN','WI','MI','OH','MO','IA','MN'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">ZIP Code <span className="text-red-500">*</span></label>
                <input type="text" className={`input-field ${errors.zip ? 'border-red-400' : ''}`} placeholder="60618" value={form.zip} onChange={e => update('zip', e.target.value)} />
                {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
              </div>
            </div>
          </div>
          <div className="card mb-6">
            <h3 className="font-heading font-bold text-brand-navy text-lg mb-5 pb-3 border-b border-gray-100">Acceso a tu Cuenta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Contraseña <span className="text-red-500">*</span></label>
                <input type="password" className={`input-field ${errors.password ? 'border-red-400' : ''}`} placeholder="Mínimo 8 caracteres" value={form.password} onChange={e => update('password', e.target.value)} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block font-medium text-brand-gray-dark text-sm mb-1.5">Confirmar contraseña <span className="text-red-500">*</span></label>
                <input type="password" className={`input-field ${errors.confirm_password ? 'border-red-400' : ''}`} placeholder="Repite tu contraseña" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} />
                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4">
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <React.Fragment><UserPlus size={20} />Crear Cuenta</React.Fragment>
            )}
          </button>
          <p className="text-center text-brand-gray-mid text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-brand-orange font-medium hover:underline">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  )
}