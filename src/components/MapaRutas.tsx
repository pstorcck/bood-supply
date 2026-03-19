"use client"
import { useEffect, useRef } from 'react'

interface Props {
  paradas: any[]
  onMounted?: (instance: any) => void
}

export default function MapaRutas({ paradas, onMounted }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)

  useEffect(() => {
    function initMap() {
      if (!mapRef.current) return
      if (!(window as any).google?.maps) return
      if (mapInstanceRef.current) return
      try {
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: 41.9281, lng: -87.7006 },
          zoom: 11,
        })
        mapInstanceRef.current = map
        if (onMounted) onMounted(map)
      } catch (e) { console.error('Map init error:', e) }
    }

    if ((window as any).google?.maps) {
      setTimeout(initMap, 100)
    } else if (!document.querySelector('script[data-gmaps]')) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&loading=async`
      script.setAttribute('data-gmaps', 'true')
      script.onload = () => setTimeout(initMap, 300)
      document.head.appendChild(script)
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.maps) {
          clearInterval(interval)
          setTimeout(initMap, 300)
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || paradas.length === 0) return
    const google = (window as any).google
    const map = mapInstanceRef.current

    if ((window as any)._marcadores) {
      ;(window as any)._marcadores.forEach((m: any) => { try { m.setMap(null) } catch(e){} })
    }
    ;(window as any)._marcadores = []

    if (rendererRef.current) {
      try { rendererRef.current.setMap(null) } catch(e){}
      rendererRef.current = null
    }

    const origen = '2900 N Richmond St, Chicago, IL 60618'
    const geocoder = new google.maps.Geocoder()

    geocoder.geocode({ address: origen }, (results: any, status: any) => {
      if (status === 'OK' && mapRef.current) {
        try {
          const marker = new google.maps.Marker({ map, position: results[0].geometry.location, title: 'Bood Supply', label: { text: '⭐', fontSize: '18px' } })
          ;(window as any)._marcadores.push(marker)
        } catch(e){}
      }
    })

    paradas.forEach((parada, idx) => {
      geocoder.geocode({ address: parada.direccion + ', Chicago, IL' }, (results: any, status: any) => {
        if (status === 'OK' && mapRef.current) {
          try {
            const marker = new google.maps.Marker({
              map,
              position: results[0].geometry.location,
              label: { text: String(idx + 1), color: 'white', fontWeight: 'bold' },
              icon: { path: google.maps.SymbolPath.CIRCLE, scale: 18, fillColor: '#F47B20', fillOpacity: 1, strokeColor: '#0F2B5B', strokeWeight: 2 },
              title: `${idx + 1}. ${parada.negocio || parada.nombre}`,
            })
            const iw = new google.maps.InfoWindow({
              content: `<div style="font-family:Arial;padding:8px;min-width:180px"><strong>${idx + 1}. ${parada.negocio || parada.nombre}</strong><br/>${parada.nombre}<br/>📍 ${parada.direccion}<br/>💳 ${parada.metodo_pago} · $${parada.total?.toFixed(2)}</div>`
            })
            marker.addListener('click', () => iw.open(map, marker))
            ;(window as any)._marcadores.push(marker)
          } catch(e){}
        }
      })
    })

    if (paradas.length > 0) {
      const directionsService = new google.maps.DirectionsService()
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map, suppressMarkers: true,
        polylineOptions: { strokeColor: '#0F2B5B', strokeWeight: 4, strokeOpacity: 0.8 }
      })
      rendererRef.current = directionsRenderer

      directionsService.route({
        origin: origen, destination: origen,
        waypoints: paradas.map((p: any) => ({ location: p.direccion + ', Chicago, IL', stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result: any, status: any) => {
        try { if (status === 'OK') directionsRenderer.setDirections(result) } catch(e){}
      })
    }
  }, [paradas])

  return <div ref={mapRef} className="w-full h-full rounded-2xl" />
}