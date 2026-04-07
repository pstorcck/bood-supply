import { NextRequest, NextResponse } from 'next/server'

const ESTADOS: Record<string, { emoji: string, titulo: string, mensaje: string, color: string }> = {
  confirmado: {
    emoji: '✅',
    titulo: 'Pedido Confirmado',
    mensaje: 'Tu pedido ha sido confirmado y está en cola para preparación.',
    color: '#3B82F6'
  },
  en_preparacion: {
    emoji: '📦',
    titulo: 'Preparando tu Pedido',
    mensaje: 'Estamos preparando tu pedido con cuidado. Te avisaremos cuando esté listo para salir.',
    color: '#8B5CF6'
  },
  despachado: {
    emoji: '🚚',
    titulo: 'Pedido en Camino',
    mensaje: 'Tu pedido está en camino. Nuestro equipo lo entregará pronto en tu negocio.',
    color: '#F47B20'
  },
  entregado: {
    emoji: '🎉',
    titulo: 'Pedido Entregado',
    mensaje: '¡Tu pedido fue entregado! Gracias por confiar en Bood Supply. Esperamos verte pronto.',
    color: '#10B981'
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pedido_id, pedido_numero, estado, cliente_email, cliente_nombre, items, total } = await req.json()

    const info = ESTADOS[estado]
    if (!info) return NextResponse.json({ ok: true, skipped: true })
    if (!cliente_email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

    const itemsHtml = items?.map((item: any) =>
      `<tr>
        <td style="padding:6px 8px;font-size:13px;color:#4A5568;">${item.nombre}</td>
        <td style="padding:6px 8px;font-size:13px;text-align:center;color:#4A5568;">x${item.cantidad}</td>
        <td style="padding:6px 8px;font-size:13px;text-align:right;color:#2D3748;font-weight:600;">$${item.subtotal}</td>
      </tr>`
    ).join('') || ''

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#2D3748;background:#f5f5f5;">
        <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="background:#0F2B5B;padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">BOOD <span style="color:#F47B20;">SUPPLY</span></h1>
            <p style="color:#93C5FD;margin:4px 0 0;font-size:12px;">2900 N Richmond St, Chicago, IL 60618</p>
          </div>
          <div style="padding:32px 24px;text-align:center;border-bottom:1px solid #E2E8F0;">
            <div style="font-size:48px;margin-bottom:12px;">${info.emoji}</div>
            <h2 style="color:${info.color};margin:0 0 8px;font-size:22px;">${info.titulo}</h2>
            <p style="color:#718096;margin:0;font-size:14px;max-width:400px;margin:0 auto;">${info.mensaje}</p>
          </div>
          <div style="padding:24px;">
            <div style="background:#F7FAFC;border-radius:8px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 4px;font-size:13px;color:#A0AEC0;text-transform:uppercase;letter-spacing:1px;">Número de Pedido</p>
              <p style="margin:0;font-size:20px;font-weight:800;color:#0F2B5B;">${pedido_numero || '#' + pedido_id?.slice(0,8).toUpperCase()}</p>
            </div>
            ${itemsHtml ? `
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
              <thead>
                <tr style="background:#0F2B5B;">
                  <th style="padding:8px;text-align:left;font-size:11px;color:white;">Producto</th>
                  <th style="padding:8px;text-align:center;font-size:11px;color:white;">Cant.</th>
                  <th style="padding:8px;text-align:right;font-size:11px;color:white;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>` : ''}
            ${total ? `
            <div style="text-align:right;padding:12px;background:#FFF7ED;border-radius:8px;border:1px solid #FED7AA;">
              <span style="font-size:14px;color:#9A3412;">Total: </span>
              <span style="font-size:20px;font-weight:800;color:#F47B20;">$${total}</span>
            </div>` : ''}
          </div>
          <div style="padding:20px 24px;background:#F7FAFC;text-align:center;border-top:1px solid #E2E8F0;">
            <p style="margin:0;font-size:13px;color:#718096;">¿Preguntas? Contáctanos:</p>
            <p style="margin:4px 0 0;font-size:13px;"><a href="tel:+13124090106" style="color:#F47B20;">+1 (312) 409-0106</a> · <a href="mailto:boodsupplies@gmail.com" style="color:#F47B20;">boodsupplies@gmail.com</a></p>
          </div>
        </div>
        <p style="text-align:center;font-size:11px;color:#A0AEC0;margin-top:16px;">© 2025 Bood Supply · Chicago, IL</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
                'Authorization': 'Bearer re_9PkH1nq2_LWdq1CHqC6CAUaQRB7TNX3qo',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bood Supply <no-reply@boodsupply.com>',
        to: [cliente_email],
        subject: `${info.emoji} ${info.titulo} — ${pedido_numero || '#' + pedido_id?.slice(0,8).toUpperCase()}`,
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
