import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { direcciones } = await req.json()
    if (!direcciones || direcciones.length < 1) {
      return NextResponse.json({ error: 'Se necesita al menos 1 dirección' }, { status: 400 })
    }

    const origin = '2900 N Richmond St, Chicago, IL 60618'

    // Con una sola parada no hay optimización
    if (direcciones.length === 1) {
      return NextResponse.json({ orden: [0], direccionesOrdenadas: direcciones })
    }

    // La última dirección es el destino, las intermedias son las paradas
    const ultima = direcciones[direcciones.length - 1]
    const intermedias = direcciones.slice(0, -1)

    const body: any = {
      origin: { address: origin },
      destination: { address: ultima },
      travelMode: 'DRIVE',
      optimizeWaypointOrder: true,
    }

    if (intermedias.length > 0) {
      body.intermediates = intermedias.map((d: string) => ({ address: d }))
    }

    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_KEY!,
        'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex,routes.legs.distanceMeters,routes.legs.duration',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json({ error: 'No se pudo calcular la ruta' }, { status: 400 })
    }

    const route = data.routes[0]
    const ordenIntermedias = route.optimizedIntermediateWaypointIndex || intermedias.map((_: any, i: number) => i)
    
    // Reconstruir orden completo: intermedias optimizadas + última parada al final
    const ordenFinal = [...ordenIntermedias, direcciones.length - 1]

    return NextResponse.json({
      orden: ordenFinal,
      direccionesOrdenadas: ordenFinal.map((i: number) => direcciones[i]),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}