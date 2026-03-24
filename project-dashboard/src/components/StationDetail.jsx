import { getAQIColor, getAQILabel } from "../utils/aqiHelpers";
import AICard from "./AICard";

export default function StationDetail({ station, onBack }) {
  if (!station)
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <p style={{ fontSize: 32 }}>🗺️</p>
        <p style={{ fontSize: 14, color: "#9ca3af" }}>
          กดที่จุดบนแผนที่
          <br />
          เพื่อดูรายละเอียดสถานี
        </p>
      </div>
    );

  return (
    <div>
      {/* ปุ่มกลับ — แสดงเฉพาะเมื่อมี onBack */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            fontSize: 12,
            cursor: "pointer",
            padding: "0 0 10px",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← กลับรายการ
        </button>
      )}

      <p
        style={{
          fontWeight: 700,
          fontSize: 15,
          margin: "0 0 4px",
          color: "#111827",
        }}
      >
        {station.name}
      </p>
      <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 16px" }}>
        📍 {station.area}
      </p>

      {/* AQI Badge */}
      <div
        style={{
          background: getAQIColor(station.aqi),
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 36, fontWeight: 700, color: "#fff", margin: 0 }}>
          {station.aqi}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#fff",
            margin: "4px 0 0",
            opacity: 0.9,
          }}
        >
          {getAQILabel(station.aqi)}
        </p>
      </div>

      {/* PM2.5 */}
      <div
        style={{
          background: "#f9fafb",
          borderRadius: 8,
          padding: "10px 14px",
          border: "1px solid #e5e7eb",
          marginBottom: 8,
        }}
      >
        <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 2px" }}>
          PM2.5
        </p>
        <p
          style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}
        >
          {station.pm25}
          <span style={{ fontSize: 13, fontWeight: 400 }}> µg/m³</span>
        </p>
      </div>

      <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>
        🕐 อัปเดต: {station.time}
      </p>

      {/* AI Card */}
      <AICard station={station} />
    </div>
  );
}
