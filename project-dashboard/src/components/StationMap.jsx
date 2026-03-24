import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { getAQIColor, getAQILabel } from "../utils/aqiHelpers";

export default function StationMap({ stations, onSelect }) {
  return (
    <MapContainer
      center={[13.0, 101.0]}
      zoom={6}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap | Air4Thai กรมควบคุมมลพิษ"
      />
      {stations.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lng]}
          radius={8}
          pathOptions={{
            fillColor: getAQIColor(s.aqi),
            fillOpacity: 0.9,
            color: "#fff",
            weight: 1.5,
          }}
          eventHandlers={{ click: () => onSelect(s) }}
        >
          <Popup>
            <div
              style={{
                fontFamily: "Noto Sans Thai, sans-serif",
                minWidth: 160,
              }}
            >
              {/* ชื่อสถานี */}
              <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>
                {s.name}
              </p>

              {/* พื้นที่ */}
              <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 8px" }}>
                📍 {s.area}
              </p>

              {/* AQI badge */}
              <div
                style={{
                  background: getAQIColor(s.aqi),
                  borderRadius: 8,
                  padding: "6px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span style={{ color: "#fff", fontSize: 11 }}>AQI</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
                  {s.aqi}
                </span>
              </div>

              {/* Label สี */}
              <p
                style={{
                  fontSize: 11,
                  color: getAQIColor(s.aqi),
                  fontWeight: 600,
                  textAlign: "center",
                  margin: "0 0 8px",
                }}
              >
                {getAQILabel(s.aqi)}
              </p>

              {/* PM2.5 */}
              <p style={{ fontSize: 12, color: "#374151", margin: "0 0 8px" }}>
                PM2.5: <strong>{s.pm25}</strong> µg/m³
              </p>

              {/* ปุ่มดูรายละเอียด */}
              <button
                onClick={() => onSelect(s)}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "#1158e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ดูรายละเอียด →
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
