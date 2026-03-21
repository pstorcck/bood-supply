"use client"
import { useEffect, useRef } from 'react'

interface Props {
  paradas: any[]
}

export default function MapaRutas({ paradas }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    function initMap() {
      try {
        if (!mapRef.current) return
        if (!(window as any).google?.maps) return
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: 41.9281, lng: -87.7006 },
          zoom: 11,
        })
        mapInstanceRef.current = map
        if (paradas.length > 0) drawRoute(map, paradas)
      } catch (e) {
        console.error('Map init error:', e)
      }
    }

    if ((window as any).google?.maps) {
      setTimeout(initMap, 200)
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

  function drawRoute(map: any, paradas: any[]) {
    try {
      const google = (window as any).google
      const origen = '2900 N Richmond St, Chicago, IL 60618'
      const geocoder = new google.maps.Geocoder()

      // Marcador origen
      geocoder.geocode({ address: origen }, (results: any, status: any) => {
        if (status !== 'OK' || !mapRef.current) return
        try {
          new google.maps.Marker({
            map,
            position: results[0].geometry.location,
            title: 'Bood Supply',
            label: { text: '★', color: '#0F2B5B', fontSize: '16px' },
          })
        } catch(e) {}
      })

      // Marcadores paradas
      paradas.forEach((parada, idx) => {
        if (!parada.direccion) return
        geocoder.geocode({ address: parada.direccion + ', IL' }, (results: any, status: any) => {
          if (status !== 'OK' || !mapRef.current) return
          try {
            const marker = new google.maps.Marker({
              map,
              position: results[0].geometry.location,
              label: { text: String(idx + 1), color: 'white', fontWeight: 'bold' },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 18,
                fillColor: '#F47B20',
                fillOpacity: 1,
                strokeColor: '#0F2B5B',
                strokeWeight: 2,
              },
            })
            const iw = new google.maps.InfoWindow({
              content: `<div style="font-family:Arial;padding:8px"><strong>${idx+1}. ${parada.negocio||parada.nombre}</strong><br/>📍 ${parada.direccion}<br/>💳 ${parada.metodo_pago} · $${parada.total?.toFixed(2)}</div>`
            })
            marker.addListener('click', () => iw.open(map, marker))
          } catch(e) {}
        })
      })

      // Dibujar ruta sin regreso
      if (paradas.length >= 1) {
        const directionsService = new google.maps.DirectionsService()
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: { strokeColor: '#0F2B5B', strokeWeight: 4, strokeOpacity: 0.8 }
        })

        const destino = paradas[paradas.length - 1].direccion + ', IL'
        const waypoints = paradas.slice(0, -1).map((p: any) => ({
          location: p.direccion + ', IL',
          stopover: true
        }))

        directionsService.route({
          origin: origen,
          destination: destino,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        }, (result: any, status: any) => {
          try {
            if (status === 'OK') directionsRenderer.setDirections(result)
          } catch(e) {}
        })
      }
    } catch(e) {
      console.error('drawRoute error:', e)
    }
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}