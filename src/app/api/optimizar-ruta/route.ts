import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { direcciones } = await req.json()
    if (!direcciones || direcciones.length < 1) {
      return NextResponse.json({ error: 'Se necesita al menos 1 dirección' }, { status: 400 })
    }

    if (direcciones.length === 1) {
      return NextResponse.json({ orden: [0], direccionesOrdenadas: direcciones })
    }

    const origin = '2900 N Richmond St, Chicago, IL 60618'

    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_KEY!,
        'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex',
      },
      body: JSON.stringify({
        origin: { address: origin },
        destination: { address: origin },
        intermediates: direcciones.map((d: string) => ({ address: d })),
        travelMode: 'DRIVE',
        optimizeWaypointOrder: true,
      }),
    })

    const data = await res.json()
    console.log('Routes API response:', JSON.stringify(data))

    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json({ error: 'No se pudo calcular la ruta' }, { status: 400 })
    }

    const orden = data.routes[0].optimizedIntermediateWaypointIndex || direcciones.map((_: any, i: number) => i)

    return NextResponse.json({
      orden,
      direccionesOrdenadas: orden.map((i: number) => direcciones[i]),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}