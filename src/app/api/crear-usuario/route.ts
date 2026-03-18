import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, nombre, negocio, telefono, direccion, ein } = await req.json()

    if (!email || !nombre) {
      return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 })
    }

    // Crear usuario en Supabase Auth con contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // Crear perfil en la tabla profiles
    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email,
      nombre,
      negocio: negocio || '',
      telefono: telefono || '',
      direccion: direccion || '',
      ein: ein || '',
      aprobado: true,
      aprobado_at: new Date().toISOString(),
      must_change_password: true,
    })

    // Enviar email al cliente con credenciales y link para cambiar contraseña
    await resend.emails.send({
      from: 'BOOD SUPPLY <noreply@boodsupply.com>',
      to: email,
      subject: '¡Bienvenido a Bood Supply! — Activa tu cuenta',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#0F2B5B;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">BOOD <span style="color:#F47B20">SUPPLY</span></h1>
          </div>
          <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee;">
            <h2 style="color:#0F2B5B;">¡Hola ${nombre}!</h2>
            <p style="color:#555;">Tu cuenta en Bood Supply ha sido creada y está lista para usar.</p>
            <div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;color:#555;"><strong>Email:</strong> ${email}</p>
              <p style="margin:0;color:#555;"><strong>Contraseña temporal:</strong> ${tempPassword}</p>
            </div>
            <p style="color:#e53e3e;font-size:14px;">⚠️ Por seguridad, deberás cambiar tu contraseña al iniciar sesión por primera vez.</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="https://www.boodsupply.com/es/login" style="background:#F47B20;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
                Iniciar Sesión
              </a>
            </div>
            <p style="color:#888;font-size:12px;text-align:center;">2900 N Richmond St, Chicago, IL 60618 · (312) 409-0106</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, userId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}