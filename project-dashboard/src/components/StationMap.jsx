import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { getAQIColor } from '../utils/aqiHelpers'

export default function StationMap({ stations, onSelect }) {
  return (
    <MapContainer
      center={[13.0, 101.0]}
      zoom={6}
      style={{ width:'100%', height:'100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap | Air4Thai กรมควบคุมมลพิษ"
      />
      {stations.map(s => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lng]}
          radius={8}
          pathOptions={{
            fillColor:   getAQIColor(s.aqi),
            fillOpacity: 0.9,
            color:       '#fff',
            weight:      1.5,
          }}
          eventHandlers={{ click: () => onSelect(s) }}
        >
          <Popup>
            <strong>{s.name}</strong><br/>
            AQI: {s.aqi} · PM2.5: {s.pm25} µg/m³
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}