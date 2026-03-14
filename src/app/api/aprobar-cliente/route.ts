import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, nombre } = await req.json()

    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BOOD SUPPLY <no-reply@boodsupply.com>',
        to: [email],
        subject: '¡Tu perfil ha sido aprobado! — BOOD SUPPLY',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#0F2B5B;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
              <h1 style="color:white;margin:0;font-size:24px;">BOOD <span style="color:#F47B20;">SUPPLY</span></h1>
            </div>
            <h2 style="color:#0F2B5B;">¡Bienvenido a la familia, ${nombre || email}!</h2>
            <p style="color:#4A5568;font-size:16px;line-height:1.6;">
              Tu perfil ha sido aprobado. Ya puedes iniciar sesión y realizar tus pedidos.
            </p>
            <div style="background:#F5F6FA;border-radius:8px;padding:16px;margin:24px 0;text-align:center;">
              <a href="https://boodsupply.com/es/login" style="background:#F47B20;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                Entrar a mi cuenta
              </a>
            </div>
            <p style="color:#4A5568;font-size:14px;">
              ¿Preguntas? Contáctanos en <a href="mailto:boodsupplies@gmail.com" style="color:#F47B20;">boodsupplies@gmail.com</a> o al <strong>(312) 409-0106</strong>.
            </p>
            <div style="border-top:1px solid #E2E8F0;margin-top:24px;padding-top:16px;text-align:center;">
              <p style="color:#A0AEC0;font-size:12px;">2900 N Richmond St, Chicago, IL 60618</p>
            </div>
          </div>
        `,
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}