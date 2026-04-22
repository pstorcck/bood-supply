import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { pedido_id, cliente_id, creado_por, fuel_override } = await req.json()

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
      .select('*')
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
    const fuel = fuel_override !== undefined && fuel_override !== null ? parseFloat(fuel_override) : (pedido.fuel_surcharge || 5)

    const { data: invoice, error: invError } = await supabase.from('invoices').insert({
      numero,
      pedido_id,
      cliente_id,
      creado_por: creado_por || null,
      total: pedido.total,
      subtotal,
      tax,
      fuel_surcharge: fuel,
      metodo_pago: pedido.metodo_pago,
      pdf_url: null,
      datos_cliente: cliente,
      datos_items: pedido.pedido_items,
    }).select().single()

    if (invError) return NextResponse.json({ error: invError.message }, { status: 400 })

    // Rebajar stock de productos
    for (const item of pedido.pedido_items) {
      if (item.productos?.id) {
        const stockActual = item.productos.stock ?? 0
        const nuevoStock = Math.max(0, stockActual - item.cantidad)
        await supabase.from('productos').update({ stock: nuevoStock }).eq('id', item.productos.id)
      }
    }

    return NextResponse.json({ invoice })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}