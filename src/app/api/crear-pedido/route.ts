import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { cliente_id, total, fuel_surcharge, metodo_pago, items, extras } = await req.json()

    const { data: pedido, error } = await supabase
      .from('pedidos')
      .insert({ cliente_id, total, fuel_surcharge, metodo_pago, estado: 'en_preparacion' })
      .select().single()

    if (error || !pedido) return NextResponse.json({ error: error?.message || 'Error' }, { status: 400 })

    if (items?.length > 0) {
      await supabase.from('pedido_items').insert(
        items.map((i: any) => ({ pedido_id: pedido.id, producto_id: i.producto_id, cantidad: i.cantidad, precio_unitario: i.precio }))
      )
      for (const item of items) {
        await supabase.from('productos').update({ stock: Math.max(0, (item.stock ?? 0) - item.cantidad) }).eq('id', item.producto_id)
      }
    }

    if (extras?.length > 0) {
      await supabase.from('pedido_items').insert(
        extras.map((i: any) => ({ pedido_id: pedido.id, producto_id: null, cantidad: i.cantidad, precio_unitario: i.precio, descripcion: i.nombre }))
      )
    }

    return NextResponse.json({ pedido })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}