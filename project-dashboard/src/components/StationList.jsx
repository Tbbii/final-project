import { getAQIColor, getAQILabel } from "../utils/aqiHelpers";

export default function StationList({ stations, selected, onSelect }) {
  if (stations.length === 0)
    return (
      <div
        style={{
          padding: 16,
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 13,
        }}
      >
        ไม่พบสถานีที่ค้นหา
      </div>
    );

  const sorted = [...stations].sort((a, b) => Number(b.aqi) - Number(a.aqi));

  return (
    <div style={{ overflowY: "auto", flex: 1 }}>
      {/* Header แสดงจำนวน + วิธีเรียง */}
      <div
        style={{
          padding: "6px 16px",
          background: "#f9fafb",
          borderBottom: "1px solid #f3f4f6",
          fontSize: 11,
          color: "#6b7280",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        แสดง {stations.length} สถานี · เรียงตาม AQI มากสุด
      </div>

      {sorted.map((s) => (
        <div
          key={s.id}
          onClick={() => onSelect(s)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            cursor: "pointer",
            borderBottom: "1px solid #f3f4f6",
            background: selected?.id === s.id ? "#eff6ff" : "#fff",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (selected?.id !== s.id)
              e.currentTarget.style.background = "#f9fafb";
          }}
          onMouseLeave={(e) => {
            if (selected?.id !== s.id)
              e.currentTarget.style.background = "#fff";
          }}
        >
          {/* AQI dot */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: getAQIColor(s.aqi),
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {Number(s.aqi) > 0 ? s.aqi : "?"}
          </div>

          {/* Info */}
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {s.name}
            </p>
            <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>
              PM2.5: {s.pm25} µg/m³ · {getAQILabel(s.aqi).replace(/^\S+\s/, "")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
