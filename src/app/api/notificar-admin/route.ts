import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { tipo, datos } = await req.json()

    let subject = ''
    let html = ''

    if (tipo === 'pedido_nuevo') {
      subject = `🛒 Nuevo pedido #${datos.pedido_id} — Bood Supply`
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#2D3748;">
          <div style="background:#0F2B5B;padding:20px;border-radius:10px;text-align:center;margin-bottom:24px;">
            <h1 style="color:white;margin:0;font-size:22px;">BOOD <span style="color:#F47B20;">SUPPLY</span></h1>
          </div>
          <h2 style="color:#0F2B5B;">🛒 Nuevo Pedido Recibido</h2>
          <div style="background:#F5F6FA;border-radius:8px;padding:16px;margin-bottom:16px;">
            <p style="margin:4px 0;font-size:14px;"><b>Pedido:</b> #${datos.pedido_id}</p>
            <p style="margin:4px 0;font-size:14px;"><b>Cliente:</b> ${datos.cliente_nombre || datos.cliente_email}</p>
            <p style="margin:4px 0;font-size:14px;"><b>Negocio:</b> ${datos.negocio || '—'}</p>
            <p style="margin:4px 0;font-size:14px;"><b>Teléfono:</b> ${datos.telefono || '—'}</p>
            <p style="margin:4px 0;font-size:14px;"><b>Método de pago:</b> ${datos.metodo_pago || '—'}</p>
            <p style="margin:4px 0;font-size:14px;"><b>Total:</b> <span style="color:#F47B20;font-weight:bold;">$${datos.total}</span></p>
          </div>
          <div style="margin-bottom:16px;">
            <b style="font-size:14px;">Productos:</b>
            ${datos.items?.map((item: any) => `<p style="margin:4px 0;font-size:13px;color:#4A5568;">• ${item.nombre} x${item.cantidad} — $${item.subtotal}</p>`).join('') || ''}
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="https://www.boodsupply.com/es/admin" style="background:#F47B20;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Ver en Admin</a>
          </div>
        </div>
      `
    } else if (tipo === 'cliente_nuevo') {
      subject = `👤 Nuevo cliente registrado — Bood Supply`
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#2D3748;">
          <div style="background:#0F2B5B;padding:20px;border-radius:10px;text-align:center;margin-bottom:24px;">
            <h1 style="color:white;margin:0;font-size:22px;">BOOD <span style="color:#F47B20;">SUPPLY</span></h1>
          </div>
          <h2 style="color:#0F2B5B;">👤 Nuevo Cliente Registrado</h2>
          <div style="background:#F5F6FA;border-radius:8px;padding:16px;">
            <p style="margin:4px 0;font-size:14px;"><b>Nombre:</b> ${datos.nombre || '—'}</p>
            <p style="margin:4px 0;font-size:14px;"><b>Negocio:</b> ${datos.negocio || '—'}</p>
            <p style="margin:4px 0;font-size:14px;"><b>Email:</b> ${datos.email}</p>
            <p style="margin:4px 0;font-size:14px;"><b>Teléfono:</b> ${datos.telefono || '—'}</p>
            <p style="margin:4px 0;font-size:14px;"><b>Dirección:</b> ${datos.direccion || '—'}</p>
            <p style="margin:4px 0;font-size:14px;"><b>EIN:</b> ${datos.ein || '—'}</p>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="https://www.boodsupply.com/es/admin" style="background:#F47B20;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Ver en Admin</a>
          </div>
        </div>
      `
    }

    const apiKey = process.env.RESEND_API_KEY || 're_UvyofaqK_6EZ3SmXkDrs99YbqZkRWYjnZ'
    console.log('RESEND KEY:', apiKey.slice(0,15))
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || 're_UvyofaqK_6EZ3SmXkDrs99YbqZkRWYjnZ'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bood Supply <no-reply@boodsupply.com>',
        to: ['boodsupplies@gmail.com'],
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
}// resend fix Mon Apr  6 20:20:46 CST 2026
