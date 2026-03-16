"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const CRT61_URL = 'https://kfftpcsihfqdhdiezeix.supabase.co/storage/v1/object/public/documentos/forms/CRT-61.pdf'

const TEXTS = {
  es: {
    title: 'Crea tu cuenta para hacer pedidos',
    nombre: 'Nombre Completo *',
    negocio: 'Negocio *',
    ein: 'EIN *',
    telefono: 'Teléfono *',
    nacimiento: 'Fecha de Nacimiento *',
    direccion: 'Dirección del Negocio *',
    crt_title: 'Formulario CRT-61 — Certificado de Reventa',
    crt_desc: 'Descarga el formulario, llénalo, fírmalo y súbelo aquí.',
    crt_download: '⬇️ Descargar CRT-61',
    crt_upload: 'Sube el CRT-61 llenado y firmado *',
    tax_label: 'Sales Tax Permit *',
    tax_hint: '(PDF o imagen)',
    id_label: 'Foto de ID *',
    id_hint: '(licencia o pasaporte)',
    email: 'Correo *',
    password: 'Contraseña *',
    password_hint: 'Mínimo 6 caracteres',
    submit: 'Crear Cuenta',
    submitting: 'Creando cuenta...',
    have_account: '¿Ya tienes cuenta?',
    login: 'Iniciar sesión',
    success_title: '¡Registro exitoso!',
    success_msg: 'Tu cuenta está siendo revisada. Te enviaremos un correo cuando sea aprobada.',
    success_btn: 'Ir al Login',
    error_fields: 'Todos los campos son obligatorios',
    error_tax: 'Debes subir tu Sales Tax Permit',
    error_id: 'Debes subir una foto de tu ID',
    error_crt: 'Debes subir el formulario CRT-61 firmado',
    nombre_ph: 'Tu nombre completo',
    negocio_ph: 'Nombre del negocio',
    ein_ph: 'XX-XXXXXXX',
    telefono_ph: '(312) 000-0000',
    direccion_ph: 'Dirección completa',
    email_ph: 'tu@correo.com',
  },
  en: {
    title: 'Create your account to place orders',
    nombre: 'Full Name *',
    negocio: 'Business *',
    ein: 'EIN *',
    telefono: 'Phone *',
    nacimiento: 'Date of Birth *',
    direccion: 'Business Address *',
    crt_title: 'CRT-61 Form — Certificate of Resale',
    crt_desc: 'Download the form, fill it out, sign it and upload it here.',
    crt_download: '⬇️ Download CRT-61',
    crt_upload: 'Upload completed and signed CRT-61 *',
    tax_label: 'Sales Tax Permit *',
    tax_hint: '(PDF or image)',
    id_label: 'ID Photo *',
    id_hint: '(license or passport)',
    email: 'Email *',
    password: 'Password *',
    password_hint: 'Minimum 6 characters',
    submit: 'Create Account',
    submitting: 'Creating account...',
    have_account: 'Already have an account?',
    login: 'Sign in',
    success_title: 'Registration successful!',
    success_msg: 'Your account is being reviewed. We will send you an email when it is approved.',
    success_btn: 'Go to Login',
    error_fields: 'All fields are required',
    error_tax: 'You must upload your Sales Tax Permit',
    error_id: 'You must upload a photo of your ID',
    error_crt: 'You must upload the signed CRT-61 form',
    nombre_ph: 'Your full name',
    negocio_ph: 'Business name',
    ein_ph: 'XX-XXXXXXX',
    telefono_ph: '(312) 000-0000',
    direccion_ph: 'Full address',
    email_ph: 'your@email.com',
  }
}

export default function RegistroPage() {
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const [form, setForm] = useState({ email: '', password: '', nombre: '', negocio: '', telefono: '', direccion: '', ein: '', fecha_nacimiento: '' })
  const [archivoTax, setArchivoTax] = useState<File | null>(null)
  const [archivoId, setArchivoId] = useState<File | null>(null)
  const [archivoCRT, setArchivoCRT] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [exitoso, setExitoso] = useState(false)
  const supabase = createClient()
  const t = TEXTS[lang]

  useEffect(() => { supabase.auth.signOut() }, [])

  async function handleRegistro() {
    if (!form.email || !form.password || !form.nombre || !form.negocio || !form.telefono || !form.direccion || !form.ein || !form.fecha_nacimiento) {
      return setError(t.error_fields)
    }
    if (!archivoTax) return setError(t.error_tax)
    if (!archivoId) return setError(t.error_id)
    if (!archivoCRT) return setError(t.error_crt)
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    let sales_tax_url = null
    let id_foto_url = null
    let crt61_url = null

    if (data.user) {
      if (archivoTax) {
        const ext = archivoTax.name.split('.').pop()
        const { error: uploadError } = await supabase.storage.from('documentos').upload(`sales-tax/${data.user.id}.${ext}`, archivoTax, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(`sales-tax/${data.user.id}.${ext}`)
          sales_tax_url = urlData.publicUrl
        }
      }
      if (archivoId) {
        const ext = archivoId.name.split('.').pop()
        const { error: uploadError } = await supabase.storage.from('documentos').upload(`ids/${data.user.id}.${ext}`, archivoId, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(`ids/${data.user.id}.${ext}`)
          id_foto_url = urlData.publicUrl
        }
      }
      if (archivoCRT) {
        const ext = archivoCRT.name.split('.').pop()
        const { error: uploadError } = await supabase.storage.from('documentos').upload(`crt61/${data.user.id}.${ext}`, archivoCRT, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(`crt61/${data.user.id}.${ext}`)
          crt61_url = urlData.publicUrl
        }
      }

      await supabase.from('profiles').upsert({
        id: data.user.id, email: form.email, nombre: form.nombre, negocio: form.negocio,
        telefono: form.telefono, direccion: form.direccion, ein: form.ein,
        fecha_nacimiento: form.fecha_nacimiento, sales_tax_url, id_foto_url, crt61_url, aprobado: false,
      })

      try {
        await fetch('/api/notificar-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'cliente_nuevo', datos: { nombre: form.nombre, negocio: form.negocio, email: form.email, telefono: form.telefono, direccion: form.direccion, ein: form.ein } })
        })
      } catch (e) { console.error('Notif error:', e) }
    }

    setExitoso(true)
    setLoading(false)
  }

  if (exitoso) return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
        <h2 className="font-heading text-2xl font-bold text-brand-navy mb-2">{t.success_title}</h2>
        <p className="text-brand-gray-mid mb-6">{t.success_msg}</p>
        <Link href="/es/login" className="btn-primary inline-block">{t.success_btn}</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-2">
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:border-brand-orange transition-colors text-brand-gray-dark">
              {lang === 'es' ? '🇺🇸 EN' : '🇲🇽 ES'}
            </button>
          </div>
          <h1 className="font-heading text-3xl font-bold text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></h1>
          <p className="text-brand-gray-mid mt-2">{t.title}</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.nombre}</label>
            <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder={t.nombre_ph} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.negocio}</label>
              <input value={form.negocio} onChange={e => setForm({...form, negocio: e.target.value})} placeholder={t.negocio_ph} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.ein}</label>
              <input value={form.ein} onChange={e => setForm({...form, ein: e.target.value})} placeholder={t.ein_ph} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.telefono}</label>
              <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder={t.telefono_ph} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.nacimiento}</label>
              <input value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.direccion}</label>
            <input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder={t.direccion_ph} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-brand-navy text-sm">{t.crt_title}</p>
                <p className="text-xs text-brand-gray-mid mt-0.5">{t.crt_desc}</p>
              </div>
            </div>
            <a href={CRT61_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-navy text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors mb-3">
              {t.crt_download}
            </a>
            <div className="border-2 border-dashed border-blue-200 rounded-xl px-4 py-3 hover:border-brand-orange transition-colors">
              <p className="text-xs text-brand-gray-mid mb-2">{t.crt_upload}</p>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setArchivoCRT(e.target.files?.[0] || null)} className="w-full text-sm text-brand-gray-mid file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-orange file:text-white hover:file:bg-orange-600 cursor-pointer" />
              {archivoCRT && <p className="text-xs text-green-600 mt-2">✓ {archivoCRT.name}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.tax_label} <span className="text-brand-gray-mid font-normal">{t.tax_hint}</span></label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-brand-orange transition-colors">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setArchivoTax(e.target.files?.[0] || null)} className="w-full text-sm text-brand-gray-mid file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-orange file:text-white hover:file:bg-orange-600 cursor-pointer" />
              {archivoTax && <p className="text-xs text-green-600 mt-2">✓ {archivoTax.name}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.id_label} <span className="text-brand-gray-mid font-normal">{t.id_hint}</span></label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-brand-orange transition-colors">
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setArchivoId(e.target.files?.[0] || null)} className="w-full text-sm text-brand-gray-mid file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-orange file:text-white hover:file:bg-orange-600 cursor-pointer" />
              {archivoId && <p className="text-xs text-green-600 mt-2">✓ {archivoId.name}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.email}</label>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" placeholder={t.email_ph} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">{t.password}</label>
            <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} type="password" placeholder={t.password_hint} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <button onClick={handleRegistro} disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? t.submitting : t.submit}
          </button>
        </div>
        <p className="text-center text-sm text-brand-gray-mid mt-6">
          {t.have_account} <Link href="/es/login" className="text-brand-orange font-medium hover:underline">{t.login}</Link>
        </p>
      </div>
    </div>
  )
}