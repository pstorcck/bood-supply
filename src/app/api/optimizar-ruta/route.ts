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

    // Obtener distancia de cada parada al origen usando Distance Matrix
    const destinos = direcciones.join('|')
    const distanceRes = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destinos)}&mode=driving&key=${process.env.GOOGLE_MAPS_KEY}`
    )
    const distanceData = await distanceRes.json()

    // Extraer distancias en metros
    const distancias = distanceData.rows?.[0]?.elements?.map((el: any, idx: number) => ({
      idx,
      metros: el.distance?.value ?? 999999
    })) || direcciones.map((_: any, idx: number) => ({ idx, metros: idx }))

    // Ordenar de más cercano a más lejano (sin regreso al origen)
    distancias.sort((a: any, b: any) => a.metros - b.metros)
    const orden = distancias.map((d: any) => d.idx)

    return NextResponse.json({
      orden,
      direccionesOrdenadas: orden.map((i: number) => direcciones[i]),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}