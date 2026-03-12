'use client'

import { useState } from 'react'
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
            <CheckCircle2 size={32} class