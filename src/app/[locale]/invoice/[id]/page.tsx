"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

export default function InvoicePage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', params.id)
        .single()
      setInvoice(data)
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return <div style={{fontFamily:'Arial',padding:'40px',textAlign:'center'}}>Cargando invoice...</div>
  if (!invoice) return <div style={{fontFamily:'Arial',padding:'40px',textAlign:'center'}}>Invoice no encontrado</div>

  const cliente = invoice.datos_cliente
  const items = invoice.datos_items
  const fecha = new Date(invoice.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box }
        body { font-family:'DM Sans',Arial,sans-serif; font-size:13px; color:#2D3748; background:#f5f5f5 }
        .page { background:white; max-width:800px; margin:0 auto; padding:40px }
        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:24px; border-bottom:3px solid #0F2B5B }
        .logo { width:64px; height:64px; object-fit:contain }
        .logo-section { display:flex; align-items:center; gap:16px }
        .company-name { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#0F2B5B }
        .company-name span { color:#F47B20 }
        .company-info { font-size:11px; color:#718096; margin-top:4px; line-height:1.6 }
        .invoice-number { font-family:'Syne',sans-serif; font-size:24px; font-weight:700; color:#0F2B5B; text-align:right }
        .invoice-date { font-size:12px; color:#718096; text-align:right; margin-top:4px }
        .badge { background:#F47B20; color:white; font-size:10px; font-weight:600; padding:4px 12px; border-radius:20px; display:inline-block; margin-top:8px; letter-spacing:1px; text-transform:uppercase }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:28px }
        .info-box { background:#F7FAFC; border-radius:12px; padding:16px; border:1px solid #E2E8F0 }
        .label { font-size:10px; color:#A0AEC0; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px; margin-top:8px }
        .label:first-child { margin-top:0 }
        .value { font-size:13px; font-weight:500; color:#2D3748 }
        .name { font-size:16px; font-weight:600; color:#0F2B5B; margin-bottom:8px }
        .section-title { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:#A0AEC0; margin-bottom:12px }
        table { width:100%; border-collapse:collapse }
        thead tr { background:#0F2B5B; color:white }
        thead th { padding:10px 14px; text-align:left; font-size:11px; font-weight:600 }
        thead th:last-child { text-align:right }
        tbody tr { border-bottom:1px solid #EDF2F7 }
        tbody tr:nth-child(even) { background:#F7FAFC }
        tbody td { padding:10px 14px; font-size:12px }
        tbody td:last-child { text-align:right; font-weight:500 }
        .totals { margin-left:auto; width:260px; margin-top:16px }
        .total-row { display:flex; justify-content:space-between; padding:6px 0; font-size:12px; color:#4A5568; border-bottom:1px solid #EDF2F7 }
        .grand { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; color:#0F2B5B; border-top:2px solid #0F2B5B; border-bottom:none; padding-top:10px; margin-top:4px }
        .grand span:last-child { color:#F47B20 }
        .payment-badge { display:inline-flex; align-items:center; gap:6px; background:#EBF8FF; color:#2B6CB0; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:500; margin-top:8px }
        .footer { margin-top:40px; padding-top:20px; border-top:1px solid #E2E8F0; text-align:center; color:#A0AEC0; font-size:11px; line-height:1.8 }
        .print-btn { position:fixed; bottom:24px; right:24px; background:#F47B20; color:white; border:none; padding:14px 28px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(244,123,32,0.4); font-family:'DM Sans',sans-serif }
        .print-btn:hover { background:#e06a1a }
        @media print { .print-btn { display:none } body { background:white } .page { padding:20px } }
      `}</style>

      <button className="print-btn" onClick={() => window.print()}>Imprimir / Guardar PDF</button>

      <div className="page">
        <div className="header">
          <div className="logo-section">
            <img src="https://www.boodsupply.com/logo.png" alt="Bood Supply" className="logo"/>
            <div>
              <div className="company-name">BOOD <span>SUPPLY</span></div>
              <div className="company-info">
                2900 N Richmond St, Chicago, IL 60618<br/>
                Tel: (312) 409-0106<br/>
                boodsupplies@gmail.com<br/>
                www.boodsupply.com
              </div>
            </div>
          </div>
          <div>
            <div className="invoice-number">{invoice.numero}</div>
            <div className="invoice-date">{fecha}</div>
            <div style={{textAlign:'right'}}><span className="badge">Invoice</span></div>
          </div>
        </div>

        <div className="grid2">
          <div className="info-box">
            <div className="section-title">Facturado a</div>
            <div className="name">{cliente?.nombre || '—'}</div>
            {cliente?.negocio && <><div className="label">Negocio</div><div className="value">{cliente.negocio}</div></>}
            {cliente?.direccion && <><div className="label">Direccion</div><div className="value">{cliente.direccion}</div></>}
            {cliente?.telefono && <><div className="label">Telefono</div><div className="value">{cliente.telefono}</div></>}
            {cliente?.ein && <><div className="label">EIN</div><div className="value">{cliente.ein}</div></>}
            {cliente?.email && <><div className="label">Email</div><div className="value">{cliente.email}</div></>}
          </div>
          <div className="info-box">
            <div className="section-title">Detalles del pedido</div>
            <div className="label">Numero de pedido</div>
            <div className="value">#{invoice.pedido_id?.slice(0,8).toUpperCase()}</div>
            <div className="label">Fecha</div>
            <div className="value">{fecha}</div>
            <div className="label">Metodo de pago</div>
            <div className="value">{invoice.metodo_pago || '—'}</div>
          </div>
        </div>

        <div className="section-title">Productos</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Precio Unit.</th>
              <th>Cant.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: any, idx: number) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{item.productos?.nombre || '—'}</td>
                <td style={{color:'#718096'}}>{item.productos?.categoria || '—'}</td>
                <td>${item.precio_unitario?.toFixed(2)}</td>
                <td>{item.cantidad}</td>
                <td>${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="total-row"><span>Subtotal</span><span>${invoice.subtotal?.toFixed(2)}</span></div>
          {invoice.tax > 0 && <div className="total-row"><span>Tax Quimicos (10.25%)</span><span>${invoice.tax?.toFixed(2)}</span></div>}
          <div className="total-row"><span>Fuel Surcharge</span><span>${invoice.fuel_surcharge?.toFixed(2)}</span></div>
          <div className="total-row grand"><span>TOTAL</span><span>${invoice.total?.toFixed(2)}</span></div>
        </div>

        <div className="footer">
          BOOD SUPPLY · 2900 N Richmond St, Chicago, IL 60618<br/>
          Tel: (312) 409-0106 · boodsupplies@gmail.com · www.boodsupply.com<br/>
          Gracias por su preferencia
        </div>
      </div>
    </>
  )
}