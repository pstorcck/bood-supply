import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { pedido_id, cliente_id, creado_por } = await req.json()

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('*, pedido_items(*, productos(*))')
      .eq('id', pedido_id)
      .single()
    if (pedidoError) return NextResponse.json({ error: pedidoError.message }, { status: 400 })

    const { data: cliente } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', cliente_id)
      .single()

    const { data: existente } = await supabase
      .from('invoices')
      .select('id, numero, pdf_url')
      .eq('pedido_id', pedido_id)
      .single()

    if (existente) {
      return NextResponse.json({ invoice: existente, yaExistia: true })
    }

    const { data: numero } = await supabase.rpc('get_next_invoice_number')

    const subtotal = pedido.pedido_items.reduce((sum: number, item: any) => sum + item.precio_unitario * item.cantidad, 0)
    const tax = pedido.pedido_items
      .filter((i: any) => i.productos?.categoria === 'Quimicos y Limpieza')
      .reduce((sum: number, i: any) => sum + i.precio_unitario * i.cantidad * 0.1025, 0)

    const html = generarHTML({ numero, pedido, cliente, subtotal, tax })
    const htmlBuffer = Buffer.from(html, 'utf-8')
    const path = `invoices/${numero}.html`

    await supabase.storage.from('documentos').upload(path, htmlBuffer, {
      contentType: 'text/html; charset=utf-8',
      upsert: true
    })
    const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)

    const { data: invoice, error: invError } = await supabase.from('invoices').insert({
      numero,
      pedido_id,
      cliente_id,
      creado_por,
      total: pedido.total,
      subtotal,
      tax,
      fuel_surcharge: pedido.fuel_surcharge || 5,
      metodo_pago: pedido.metodo_pago,
      pdf_url: urlData.publicUrl,
      datos_cliente: cliente,
      datos_items: pedido.pedido_items,
    }).select().single()

    if (invError) return NextResponse.json({ error: invError.message }, { status: 400 })

    return NextResponse.json({ invoice })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function generarHTML({ numero, pedido, cliente, subtotal, tax }: any) {
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  const total = pedido.total
  const fuel = pedido.fuel_surcharge || 5

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Invoice ${numero} - BOOD SUPPLY</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#2D3748;background:white;padding:40px;max-width:800px;margin:0 auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:3px solid #0F2B5B}
  .logo-section{display:flex;align-items:center;gap:16px}
  .logo{width:64px;height:64px;object-fit:contain}
  .company-name{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#0F2B5B}
  .company-name span{color:#F47B20}
  .company-info{font-size:11px;color:#718096;margin-top:4px;line-height:1.6}
  .invoice-meta{text-align:right}
  .invoice-number{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;color:#0F2B5B}
  .invoice-date{font-size:12px;color:#718096;margin-top:4px}
  .invoice-badge{background:#F47B20;color:white;font-size:10px;font-weight:600;padding:4px 12px;border-radius:20px;display:inline-block;margin-top:8px;letter-spacing:1px;text-transform:uppercase}
  .section{margin-bottom:28px}
  .section-title{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#A0AEC0;margin-bottom:12px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .info-box{background:#F7FAFC;border-radius:12px;padding:16px;border:1px solid #E2E8F0}
  .info-box .label{font-size:10px;color:#A0AEC0;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
  .info-box .value{font-size:13px;font-weight:500;color:#2D3748}
  .info-box .name{font-size:16px;font-weight:600;color:#0F2B5B;margin-bottom:8px}
  table{width:100%;border-collapse:collapse}
  thead tr{background:#0F2B5B;color:white}
  thead th{padding:10px 14px;text-align:left;font-size:11px;font-weight:600;letter-spacing:0.5px}
  thead th:last-child{text-align:right}
  tbody tr{border-bottom:1px solid #EDF2F7}
  tbody tr:nth-child(even){background:#F7FAFC}
  tbody td{padding:10px 14px;font-size:12px}
  tbody td:last-child{text-align:right;font-weight:500}
  .totals{margin-left:auto;width:260px;margin-top:16px}
  .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:12px;color:#4A5568;border-bottom:1px solid #EDF2F7}
  .total-row.grand{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:#0F2B5B;border-top:2px solid #0F2B5B;border-bottom:none;padding-top:10px;margin-top:4px}
  .total-row.grand span:last-child{color:#F47B20}
  .payment-badge{display:inline-flex;align-items:center;gap:6px;background:#EBF8FF;color:#2B6CB0;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:500;margin-top:8px}
  .footer{margin-top:40px;padding-top:20px;border-top:1px solid #E2E8F0;text-align:center;color:#A0AEC0;font-size:11px;line-height:1.8}
  @media print{body{padding:20px}.no-print{display:none}}
  .print-btn{position:fixed;bottom:24px;right:24px;background:#F47B20;color:white;border:none;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(244,123,32,0.4);font-family:'DM Sans',sans-serif}
  .print-btn:hover{background:#e06a1a}
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">Imprimir / Guardar PDF</button>
<div class="header">
  <div class="logo-section">
    <img src="https://www.boodsupply.com/logo.png" alt="Bood Supply" class="logo"/>
    <div>
      <div class="company-name">BOOD <span>SUPPLY</span></div>
      <div class="company-info">2900 N Richmond St, Chicago, IL 60618<br/>Tel: (312) 409-0106<br/>boodsupplies@gmail.com<br/>www.boodsupply.com</div>
    </div>
  </div>
  <div class="invoice-meta">
    <div class="invoice-number">${numero}</div>
    <div class="invoice-date">${fecha}</div>
    <div class="invoice-badge">Invoice</div>
  </div>
</div>
<div class="grid2 section">
  <div class="info-box">
    <div class="section-title">Facturado a</div>
    <div class="name">${cliente?.nombre || '-'}</div>
    ${cliente?.negocio ? `<div class="label">Negocio</div><div class="value">${cliente.negocio}</div>` : ''}
    ${cliente?.direccion ? `<div class="label" style="margin-top:6px">Direccion</div><div class="value">${cliente.direccion}</div>` : ''}
    ${cliente?.telefono ? `<div class="label" style="margin-top:6px">Telefono</div><div class="value">${cliente.telefono}</div>` : ''}
    ${cliente?.ein ? `<div class="label" style="margin-top:6px">EIN</div><div class="value">${cliente.ein}</div>` : ''}
    ${cliente?.email ? `<div class="label" style="margin-top:6px">Email</div><div class="value">${cliente.email}</div>` : ''}
  </div>
  <div class="info-box">
    <div class="section-title">Detalles del pedido</div>
    <div class="label">Numero de pedido</div>
    <div class="value">#${pedido.id.slice(0,8).toUpperCase()}</div>
    <div class="label" style="margin-top:8px">Fecha del pedido</div>
    <div class="value">${new Date(pedido.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    <div class="label" style="margin-top:8px">Estado</div>
    <div class="value">${pedido.estado.replace('_', ' ').charAt(0).toUpperCase() + pedido.estado.replace('_', ' ').slice(1)}</div>
    <div style="margin-top:8px"><span class="payment-badge">Pago: ${pedido.metodo_pago || '-'}</span></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Productos</div>
  <table>
    <thead><tr><th>#</th><th>Producto</th><th>Categoria</th><th>Precio Unit.</th><th>Cant.</th><th>Total</th></tr></thead>
    <tbody>
      ${pedido.pedido_items.map((item: any, idx: number) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${item.productos?.nombre || '-'}</td>
        <td style="color:#718096">${item.productos?.categoria || '-'}</td>
        <td>$${item.precio_unitario.toFixed(2)}</td>
        <td>${item.cantidad}</td>
        <td>$${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    ${tax > 0 ? `<div class="total-row"><span>Tax Quimicos (10.25%)</span><span>$${tax.toFixed(2)}</span></div>` : ''}
    <div class="total-row"><span>Fuel Surcharge</span><span>$${fuel.toFixed(2)}</span></div>
    <div class="total-row grand"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
  </div>
</div>
<div class="footer">
  BOOD SUPPLY - 2900 N Richmond St, Chicago, IL 60618<br/>
  Tel: (312) 409-0106 - boodsupplies@gmail.com - www.boodsupply.com<br/>
  Gracias por su preferencia
</div>
</body>
</html>`
}