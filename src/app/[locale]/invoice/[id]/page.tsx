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
      const { data } = await supabase.from('invoices').select('*').eq('id', params.id).single()
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
        body { font-family:'DM Sans',Arial,sans-serif; font-size:11px; color:#2D3748; background:#f5f5f5 }
        .page { background:white; max-width:780px; margin:0 auto; padding:28px }
        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; padding-bottom:12px; border-bottom:3px solid #0F2B5B }
        .logo { width:48px; height:48px; object-fit:contain }
        .logo-section { display:flex; align-items:center; gap:10px }
        .company-name { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#0F2B5B }
        .company-name span { color:#F47B20 }
        .company-info { font-size:9px; color:#718096; margin-top:2px; line-height:1.4 }
        .invoice-number { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; color:#0F2B5B; text-align:right }
        .invoice-date { font-size:10px; color:#718096; text-align:right; margin-top:2px }
        .badge { background:#F47B20; color:white; font-size:8px; font-weight:600; padding:2px 8px; border-radius:20px; display:inline-block; margin-top:4px; letter-spacing:1px; text-transform:uppercase }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px }
        .info-box { background:#F7FAFC; border-radius:6px; padding:8px 10px; border:1px solid #E2E8F0 }
        .info-row { display:flex; gap:6px; align-items:baseline; padding:1px 0 }
        .info-label { font-size:8px; color:#A0AEC0; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; min-width:52px }
        .info-value { font-size:10px; font-weight:500; color:#2D3748 }
        .client-name { font-size:13px; font-weight:600; color:#0F2B5B; margin-bottom:4px }
        .section-title { font-size:8px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:#A0AEC0; margin-bottom:5px }
        table { width:100%; border-collapse:collapse }
        thead tr { background:#0F2B5B; color:white }
        thead th { padding:5px 8px; text-align:left; font-size:9px; font-weight:600 }
        thead th:last-child { text-align:right }
        tbody tr { border-bottom:1px solid #EDF2F7 }
        tbody tr:nth-child(even) { background:#F7FAFC }
        tbody td { padding:4px 8px; font-size:10px }
        tbody td:last-child { text-align:right; font-weight:500 }
        .totals { margin-left:auto; width:220px; margin-top:10px }
        .total-row { display:flex; justify-content:space-between; padding:3px 0; font-size:10px; color:#4A5568; border-bottom:1px solid #EDF2F7 }
        .grand { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#0F2B5B; border-top:2px solid #0F2B5B; border-bottom:none; padding-top:6px; margin-top:2px }
        .grand span:last-child { color:#F47B20 }
        .footer { margin-top:18px; padding-top:10px; border-top:1px solid #E2E8F0; text-align:center; color:#A0AEC0; font-size:9px; line-height:1.6 }
        .print-btn { position:fixed; bottom:20px; right:20px; background:#F47B20; color:white; border:none; padding:10px 22px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(244,123,32,0.4); font-family:'DM Sans',sans-serif }
        @media print { .print-btn { display:none } body { background:white } .page { padding:16px } }
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
                Tel: (312) 409-0106 · boodsupplies@gmail.com<br/>
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
            <div className="client-name">{cliente?.negocio || cliente?.nombre || '—'}</div>
            {cliente?.negocio && <div className="info-row"><span className="info-label">Negocio</span><span className="info-value">{cliente.negocio}</span></div>}
            {cliente?.direccion && <div className="info-row"><span className="info-label">Direccion</span><span className="info-value">{cliente.direccion}</span></div>}
            {cliente?.telefono && <div className="info-row"><span className="info-label">Tel</span><span className="info-value">{cliente.telefono}</span></div>}
            {cliente?.email && <div className="info-row"><span className="info-label">Email</span><span className="info-value">{cliente.email}</span></div>}
          </div>
          <div className="info-box">
            <div className="section-title">Detalles</div>
            <div className="info-row"><span className="info-label">Invoice</span><span className="info-value" style={{fontWeight:'700',color:'#0F2B5B'}}>{invoice.numero}</span></div>
            {invoice.pedido_id && <div className="info-row"><span className="info-label">Pedido</span><span className="info-value">#{invoice.pedido_id?.slice(0,8).toUpperCase()}</span></div>}
            <div className="info-row"><span className="info-label">Fecha</span><span className="info-value">{fecha}</span></div>
            <div className="info-row"><span className="info-label">Pago</span><span className="info-value">{invoice.metodo_pago || '—'}</span></div>
          </div>
        </div>

        <div className="section-title">Productos</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Descripcion</th>
              <th>Precio Unit.</th>
              <th>Cant.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: any, idx: number) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{item.descripcion || item.productos?.nombre || '—'}</td>
                <td>${Number(item.precio_unitario).toFixed(2)}</td>
                <td>{item.cantidad}</td>
                <td>${(Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="total-row"><span>Subtotal</span><span>${Number(invoice.subtotal).toFixed(2)}</span></div>
          {invoice.tax > 0 && <div className="total-row"><span>Tax (10.25%)</span><span>${Number(invoice.tax).toFixed(2)}</span></div>}
          {invoice.fuel_surcharge > 0 && <div className="total-row"><span>Fuel Surcharge</span><span>${Number(invoice.fuel_surcharge).toFixed(2)}</span></div>}
          <div className="total-row grand"><span>TOTAL</span><span>${Number(invoice.total).toFixed(2)}</span></div>
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