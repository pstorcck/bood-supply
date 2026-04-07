import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, nombre, asunto, cuerpo } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

    const esMensajePersonalizado = asunto && cuerpo

    const subject = esMensajePersonalizado ? asunto : '¡Tu perfil ha sido aprobado! — Bood Supply'
    const html = esMensajePersonalizado ? `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;color:#2D3748;">
        <div style="background:#0F2B5B;padding:28px 24px;border-radius:12px;text-align:center;margin-bottom:32px;">
          <h1 style="color:white;margin:0;font-size:26px;letter-spacing:1px;">BOOD <span style="color:#F47B20;">SUPPLY</span></h1>
        </div>
        <p style="font-size:16px;margin-bottom:16px;">Hola, <strong>${nombre || email}</strong>:</p>
        <div style="font-size:16px;line-height:1.7;margin-bottom:28px;white-space:pre-wrap;">${cuerpo}</div>
        <p style="font-size:16px;font-weight:bold;color:#0F2B5B;margin-bottom:32px;">Equipo Bood Supply</p>
        <div style="border-top:1px solid #E2E8F0;padding-top:20px;text-align:center;">
          <p style="color:#A0AEC0;font-size:12px;margin:4px 0;">2900 N Richmond St, Chicago, IL 60618</p>
          <p style="color:#A0AEC0;font-size:12px;margin:4px 0;">+1 (312) 409-0106 · boodsupplies@gmail.com</p>
        </div>
      </div>
    ` : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;color:#2D3748;">
        <div style="background:#0F2B5B;padding:28px 24px;border-radius:12px;text-align:center;margin-bottom:32px;">
          <h1 style="color:white;margin:0;font-size:26px;letter-spacing:1px;">BOOD <span style="color:#F47B20;">SUPPLY</span></h1>
        </div>
        <p style="font-size:16px;margin-bottom:16px;">¡Hola, <strong>${nombre || email}</strong>!</p>
        <p style="font-size:16px;line-height:1.7;margin-bottom:16px;">
          ¡Bienvenido(a) a Bood Supply! Nos alegra mucho contarte que tu perfil ha sido aprobado exitosamente y que ya puedes comenzar a hacer tus pedidos, iniciando sesión aquí:
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="https://www.boodsupply.com/es/login" style="background:#F47B20;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
            Iniciar Sesión
          </a>
        </div>
        <p style="font-size:16px;line-height:1.7;margin-bottom:16px;">
          A partir de este momento tendrás acceso a nuestra plataforma para explorar productos, realizar tus compras y abastecer tu negocio de una manera más fácil, rápida y confiable.
        </p>
        <p style="font-size:16px;line-height:1.7;margin-bottom:28px;">
          En Bood Supply estamos listos para acompañarte y ayudarte a encontrar lo que necesitas para tu operación. Si en algún momento tienes dudas o necesitas apoyo, nuestro equipo estará encantado de ayudarte.
        </p>
        <p style="font-size:16px;line-height:1.7;margin-bottom:4px;">Gracias por registrarte con nosotros. ¡Estamos muy felices de tenerte como parte de Bood Supply!</p>
        <p style="font-size:16px;margin-bottom:8px;">Con entusiasmo,</p>
        <p style="font-size:16px;font-weight:bold;color:#0F2B5B;margin-bottom:32px;">Equipo Bood Supply</p>
        <div style="border-top:1px solid #E2E8F0;padding-top:20px;text-align:center;">
          <p style="color:#A0AEC0;font-size:12px;margin:4px 0;">2900 N Richmond St, Chicago, IL 60618</p>
          <p style="color:#A0AEC0;font-size:12px;margin:4px 0;">+1 (312) 409-0106 · boodsupplies@gmail.com</p>
          <p style="color:#A0AEC0;font-size:12px;margin:4px 0;">www.boodsupply.com</p>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || 're_UvyofaqK_6EZ3SmXkDrs99YbqZkRWYjnZ'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bood Supply <no-reply@boodsupply.com>',
        to: [email],
        subject,
        html,
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}