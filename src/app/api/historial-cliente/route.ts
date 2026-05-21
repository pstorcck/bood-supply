import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const clienteId = req.nextUrl.searchParams.get('cliente_id')
  if (!clienteId) return NextResponse.json({ items: [] })

  const { data: peds } = await supabase
    .from('pedidos')
    .select('pedido_items(descripcion, precio_unitario, producto_id, productos(nombre))')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
    .limit(5)

  const todos = peds?.flatMap((p: any) => p.pedido_items || []) || []
  const unicos = todos.filter((item: any, idx: number, arr: any[]) =>
    arr.findIndex(x => (x.producto_id || x.descripcion) === (item.producto_id || item.descripcion)) === idx
  ).slice(0, 8)

  return NextResponse.json({ items: unicos })
}