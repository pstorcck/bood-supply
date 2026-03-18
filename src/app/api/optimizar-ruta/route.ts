import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { direcciones } = await req.json()
    if (!direcciones || direcciones.length < 2) {
      return NextResponse.json({ error: 'Se necesitan al menos 2 direcciones' }, { status: 400 })
    }

    const origin = '2900 N Richmond St, Chicago, IL 60618'
    const waypoints = direcciones.map((d: string) => ({ address: d }))

    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_KEY!,
        'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex,routes.legs.distanceMeters,routes.legs.duration,routes.legs.endLocation',
      },
      body: JSON.stringify({
        origin: { address: origin },
        destination: { address: origin },
        intermediates: waypoints,
        travelMode: 'DRIVE',
        optimizeWaypointOrder: true,
      }),
    })

    const data = await res.json()

    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json({ error: 'No se pudo calcular la ruta' }, { status: 400 })
    }

    const route = data.routes[0]
    const orden = route.optimizedIntermediateWaypointIndex || direcciones.map((_: any, i: number) => i)

    return NextResponse.json({
      orden,
      legs: route.legs,
      direccionesOrdenadas: orden.map((i: number) => direcciones[i]),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}