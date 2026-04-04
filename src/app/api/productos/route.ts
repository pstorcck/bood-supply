import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { nombre, categoria, precio, unidad, descripcion, stock, costo, nombre_en, descripcion_en } = await req.json()
    if (!nombre || !precio || !unidad || !categoria) return NextResponse.json({ error: 'Nombre, precio, unidad y categoria son requeridos' }, { status: 400 })
    const { data, error } = await supabase.from('productos').insert({
      nombre, nombre_en: nombre_en || nombre, descripcion: descripcion || '',
      descripcion_en: descripcion_en || '', categoria, precio: parseFloat(precio),
      unidad, stock: parseInt(stock) || 0, costo: costo ? parseFloat(costo) : 0, activo: true,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ producto: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    if (updates.precio) updates.precio = parseFloat(updates.precio)
    if (updates.stock !== undefined) updates.stock = parseInt(updates.stock)
    if (updates.costo !== undefined) updates.costo = parseFloat(updates.costo)
    const { data, error } = await supabase.from('productos').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ producto: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
