import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function construirCatalogo() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: productos } = await supabase
    .from('productos')
    .select('nombre, categoria, precio, unidad')
    .eq('activo', true)
    .order('categoria')
    .order('nombre')

  if (!productos || productos.length === 0) return ''

  const categorias = [...new Set(productos.map(p => p.categoria))]

  return categorias.map(cat => {
    const items = productos
      .filter(p => p.categoria === cat)
      .map(p => `${p.nombre} $${Number(p.precio).toFixed(2)}${p.unidad ? '/' + p.unidad : ''}`)
      .join(', ')
    return `${cat}:\n${items}`
  }).join('\n\n')
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const catalogo = await construirCatalogo()

    const systemPrompt = `Eres Bood, el asistente virtual y super vendedor de BOOD SUPPLY, una distribuidora de suministros para restaurantes en Chicago, Illinois. Eres cordial, profesional, conocedor y siempre buscas facilitar la venta.

INFORMACIÓN DEL NEGOCIO:
- Empresa: Bood Supply - Restaurant Supply Distributor
- Teléfono: (312) 409-0106
- Email: boodsupplies@gmail.com
- Website: www.boodsupply.com
- Instagram: @boodsupplies
- Área de servicio: Chicago y área metropolitana
- Fuel Surcharge: $5.00 por entrega
- Químicos y Limpieza incluyen 10.25% tax (Illinois)
- Métodos de pago: Efectivo, Cheque, Zelle, Tarjeta de crédito
- Los clientes se pueden registrar en www.boodsupply.com para hacer pedidos online

CATÁLOGO COMPLETO CON PRECIOS (actualizado en tiempo real desde el inventario):

${catalogo}

INSTRUCCIONES DE COMPORTAMIENTO:
- Responde en el mismo idioma del cliente (español o inglés)
- Sé cordial, entusiasta y profesional
- Da precios exactos cuando pregunten
- Sugiere productos relacionados para aumentar la venta
- Siempre invita a registrarse en www.boodsupply.com o llamar al (312) 409-0106
- Si no sabes algo, ofrece conectarlos con el equipo
- Usa emojis ocasionalmente para ser amigable
- Respuestas concisas pero completas
- Tu objetivo principal es facilitar y cerrar ventas`

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    const data = await response.json()
    if (!response.ok) return NextResponse.json({ error: data.error?.message }, { status: 500 })
    return NextResponse.json({ message: data.choices[0].message.content })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
