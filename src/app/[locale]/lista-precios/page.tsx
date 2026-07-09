"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ListaPreciosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [descargando, setDescargando] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('categoria')
        .order('nombre')
      setProductos(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  async function descargarWord() {
    setDescargando(true)
    try {
      const res = await fetch('/api/lista-precios-docx')
      if (!res.ok) throw new Error('No se pudo generar el documento')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `BoodSupply_PriceList_${new Date().toISOString().slice(0, 10)}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Error generando el Word')
    } finally {
      setDescargando(false)
    }
  }

  if (loading) return <div style={{ fontFamily: 'Arial', padding: '40px', textAlign: 'center' }}>Cargando lista de precios...</div>

  const categorias = [...new Set(productos.map(p => p.categoria))].sort()
  const fecha = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box }
        body { font-family:'DM Sans',Arial,sans-serif; font-size:11px; color:#2D3748; background:#f5f5f5 }
        .page { background:white; max-width:1100px; margin:0 auto; padding:28px }
        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; padding-bottom:12px; border-bottom:3px solid #F47B20 }
        .company-name { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; line-height:1.05; color:#0F2B5B }
        .company-name span { display:block; color:#F47B20 }
        .company-tag { font-size:10px; color:#718096; margin-top:2px }
        .title-block { text-align:center; padding-top:4px }
        .title { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; color:#0F2B5B; letter-spacing:0.5px }
        .updated { font-size:10px; color:#718096; font-style:italic; margin-top:2px }
        .contact { font-size:10px; color:#2D3748; text-align:right; line-height:1.6 }
        .cat-header { background:#0F2B5B; color:white; padding:6px 12px; font-size:12px; font-weight:700; letter-spacing:0.5px; margin-top:16px; border-radius:4px; display:flex; align-items:center; gap:8px }
        .cat-count { font-size:9px; font-weight:400; opacity:0.75 }
        .cat-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:0; border:1px solid #E2E8F0; border-top:none }
        .prod-cell { display:flex; justify-content:space-between; align-items:baseline; gap:8px; padding:6px 10px; border-bottom:1px solid #EDF2F7; border-right:1px solid #EDF2F7 }
        .prod-cell:nth-child(3n) { border-right:none }
        .prod-name { font-size:10px; color:#1A202C; flex:1 }
        .prod-unit { font-size:9px; color:#A0AEC0; white-space:nowrap }
        .prod-price { font-size:11px; font-weight:700; color:#F47B20; white-space:nowrap }
        .footer-note { margin-top:20px; padding-top:10px; border-top:1px solid #E2E8F0; text-align:center; color:#718096; font-size:9px; font-style:italic }
        .actions { position:fixed; bottom:20px; right:20px; display:flex; gap:10px; z-index:10 }
        .btn { background:#F47B20; color:white; border:none; padding:10px 20px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(244,123,32,0.4); font-family:'DM Sans',sans-serif }
        .btn.secondary { background:#0F2B5B; box-shadow:0 4px 12px rgba(15,43,91,0.4) }
        .btn:disabled { opacity:0.6; cursor:not-allowed }
        @media print { .actions { display:none } body { background:white; -webkit-print-color-adjust:exact; print-color-adjust:exact } .page { padding:16px; max-width:100% } .cat-header { break-inside:avoid } .cat-grid { break-inside:avoid } }
      `}</style>

      <div className="actions">
        <button className="btn secondary" onClick={descargarWord} disabled={descargando}>{descargando ? 'Generando...' : '⬇ Descargar Word'}</button>
        <button className="btn" onClick={() => window.print()}>🖨 Imprimir / Guardar PDF</button>
      </div>

      <div className="page">
        <div className="header">
          <div>
            <div className="company-name">BOOD<span>SUPPLY</span></div>
            <div className="company-tag">Restaurant Supply Distributor</div>
          </div>
          <div className="title-block">
            <div className="title">PRICE LIST / LISTA DE PRECIOS</div>
            <div className="updated">Updated: {fecha}</div>
          </div>
          <div className="contact">
            (312) 409-0106<br/>
            boodsupplies@gmail.com<br/>
            www.boodsupply.com
          </div>
        </div>

        {categorias.map(cat => {
          const prods = productos.filter(p => p.categoria === cat)
          return (
            <div key={cat}>
              <div className="cat-header">{cat} <span className="cat-count">{prods.length} productos</span></div>
              <div className="cat-grid">
                {prods.map(p => (
                  <div className="prod-cell" key={p.id}>
                    <span className="prod-name">{p.nombre}</span>
                    <span className="prod-unit">{p.unidad}</span>
                    <span className="prod-price">${Number(p.precio).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <div className="footer-note">
          Chemicals &amp; Cleaning include 10.25% tax (IL) | Fuel Surcharge: $5.00 per delivery | Prices subject to change without notice
        </div>
      </div>
    </>
  )
}
