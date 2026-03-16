"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const CRT61_URL = 'https://kfftpcsihfqdhdiezeix.supabase.co/storage/v1/object/public/documentos/forms/CRT-61.pdf'

export default function RegistroPage() {
  const [form, setForm] = useState({ email: '', password: '', nombre: '', negocio: '', telefono: '', direccion: '', ein: '', fecha_nacimiento: '' })
  const [archivoTax, setArchivoTax] = useState<File | null>(null)
  const [archivoId, setArchivoId] = useState<File | null>(null)
  const [archivoCRT, setArchivoCRT] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [exitoso, setExitoso] = useState(false)
  const supabase = createClient()

  // removed auto signout

  async function handleRegistro() {
    if (!form.email || !form.password || !form.nombre || !form.negocio || !form.telefono || !form.direccion || !form.ein || !form.fecha_nacimiento) {
      return setError('Todos los campos son obligatorios')
    }
    if (!archivoTax) return setError('Debes subir tu Sales Tax Permit')
    if (!archivoId) return setError('Debes subir una foto de tu ID')
    if (!archivoCRT) return setError('Debes subir el formulario CRT-61 firmado')
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
        const path = `sales-tax/${data.user.id}.${ext}`
        const { error: uploadError } = await supabase.storage.from('documentos').upload(path, archivoTax, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
          sales_tax_url = urlData.publicUrl
        }
      }
      if (archivoId) {
        const ext = archivoId.name.split('.').pop()
        const path = `ids/${data.user.id}.${ext}`
        const { error: uploadError } = await supabase.storage.from('documentos').upload(path, archivoId, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
          id_foto_url = urlData.publicUrl
        }
      }
      if (archivoCRT) {
        const ext = archivoCRT.name.split('.').pop()
        const path = `crt61/${data.user.id}.${ext}`
        const { error: uploadError } = await supabase.storage.from('documentos').upload(path, archivoCRT, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
          crt61_url = urlData.publicUrl
        }
      }

      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        nombre: form.nombre,
        negocio: form.negocio,
        telefono: form.telefono,
        direccion: form.direccion,
        ein: form.ein,
        fecha_nacimiento: form.fecha_nacimiento,
        sales_tax_url,
        id_foto_url,
        crt61_url,
        aprobado: false,
      })

      try {
        await fetch('/api/notificar-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'cliente_nuevo',
            datos: { nombre: form.nombre, negocio: form.negocio, email: form.email, telefono: form.telefono, direccion: form.direccion, ein: form.ein }
          })
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
        <h2 className="font-heading text-2xl font-bold text-brand-navy mb-2">¡Registro exitoso!</h2>
        <p className="text-brand-gray-mid mb-6">Tu cuenta está siendo revisada. Te enviaremos un correo cuando sea aprobada.</p>
        <Link href="/es/login" className="btn-primary inline-block">Ir al Login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-brand-navy">BOOD <span className="text-brand-orange">SUPPLY</span></h1>
          <p className="text-brand-gray-mid mt-2">Crea tu cuenta para hacer pedidos</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Nombre Completo *</label>
            <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Tu nombre completo" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Negocio *</label>
              <input value={form.negocio} onChange={e => setForm({...form, negocio: e.target.value})} placeholder="Nombre del negocio" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">EIN *</label>
              <input value={form.ein} onChange={e => setForm({...form, ein: e.target.value})} placeholder="XX-XXXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Teléfono *</label>
              <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="(312) 000-0000" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-dark mb-1">Fecha de Nacimiento *</label>
              <input value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Dirección del Negocio *</label>
            <input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Dirección completa" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>

          {/* CRT-61 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-brand-navy text-sm">Formulario CRT-61 — Certificado de Reventa</p>
                <p className="text-xs text-brand-gray-mid mt-0.5">Descarga el formulario, llénalo, fírmalo y súbelo aquí.</p>
              </div>
            </div>
            <a href={CRT61_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-navy text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors mb-3">
              ⬇️ Descargar CRT-61
            </a>
            <div className="border-2 border-dashed border-blue-200 rounded-xl px-4 py-3 hover:border-brand-orange transition-colors">
              <p className="text-xs text-brand-gray-mid mb-2">Sube el CRT-61 llenado y firmado *</p>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setArchivoCRT(e.target.files?.[0] || null)} className="w-full text-sm text-brand-gray-mid file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-orange file:text-white hover:file:bg-orange-600 cursor-pointer" />
              {archivoCRT && <p className="text-xs text-green-600 mt-2">✓ {archivoCRT.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Sales Tax Permit * <span className="text-brand-gray-mid font-normal">(PDF o imagen)</span></label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-brand-orange transition-colors">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setArchivoTax(e.target.files?.[0] || null)} className="w-full text-sm text-brand-gray-mid file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-orange file:text-white hover:file:bg-orange-600 cursor-pointer" />
              {archivoTax && <p className="text-xs text-green-600 mt-2">✓ {archivoTax.name}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Foto de ID * <span className="text-brand-gray-mid font-normal">(licencia o pasaporte)</span></label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-brand-orange transition-colors">
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setArchivoId(e.target.files?.[0] || null)} className="w-full text-sm text-brand-gray-mid file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-orange file:text-white hover:file:bg-orange-600 cursor-pointer" />
              {archivoId && <p className="text-xs text-green-600 mt-2">✓ {archivoId.name}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Correo *</label>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" placeholder="tu@correo.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Contraseña *</label>
            <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} type="password" placeholder="Mínimo 6 caracteres" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
          </div>
          <button onClick={handleRegistro} disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </div>
        <p className="text-center text-sm text-brand-gray-mid mt-6">
          ¿Ya tienes cuenta? <Link href="/es/login" className="text-brand-orange font-medium hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}