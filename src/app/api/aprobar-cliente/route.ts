import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, nombre } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BOOD SUPPLY <no-reply@boodsupply.com>',
      to: email,
      subject: '¡Tu perfil ha sido aprobado! — BOOD SUPPLY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0F2B5B; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">BOOD <span style="color: #F47B20;">SUPPLY</span></h1>
          </div>
          <h2 style="color: #0F2B5B;">¡Bienvenido a la familia, ${nombre || email}!</h2>
          <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
            Tu perfil ha sido aprobado. Ya puedes iniciar sesión y realizar tus pedidos desde tu perfil.
          </p>
          <div style="background: #F5F6FA; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #4A5568;">Entra a tu cuenta en:</p>
            <a href="https://boodsupply.com/es/login" style="color: #F47B20; font-weight: bold; font-size: 16px;">boodsupply.com/es/login</a>
          </div>
          <p style="color: #4A5568; font-size: 14px;">
            Si tienes preguntas contáctanos en <a href="mailto:boodsupplies@gmail.com" style="color: #F47B20;">boodsupplies@gmail.com</a> o al <strong>(312) 409-0106</strong>.
          </p>
          <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 16px; text-align: center;">
            <p style="color: #A0AEC0; font-size: 12px;">2900 N Richmond St, Chicago, IL 60618</p>
          </div>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}