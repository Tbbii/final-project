import { useEffect, useState, useRef } from "react";
import { getAQIColor } from "../../utils/aqiHelpers";

const loadSnapshots = async (stationId) => {
  try {
    const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const res = await fetch(
      `http://localhost:3001/snapshots?station_id=${stationId}&hour_gte=${cutoff}`,
    );
    const data = await res.json();

    return data
      .sort((a, b) => a.hour.localeCompare(b.hour))
      .map((d) => ({
        hour: new Date(d.hour).getHours().toString().padStart(2, "0") + ":00",
        pm25: Number(d.pm25),
        aqi: Number(d.aqi),
      }));
  } catch {
    return [];
  }
};

export default function TrendChart({ stations = [] }) {
  const [selected, setSelected] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  // ตั้งค่า selected สถานีแรก
  useEffect(() => {
    if (stations.length && !selected) {
      const first = stations.find((s) => Number(s.aqi) > 0) ?? stations[0];
      setSelected(first);
    }
  }, [stations]);

  // โหลด snapshot เมื่อเปลี่ยนสถานี
  useEffect(() => {
    if (!selected) return;
    loadSnapshots(selected.id).then(setSnapshots);
  }, [selected?.id]);

  // คำนวณกราฟ
  const values = snapshots.map((s) => s.pm25).filter((v) => v > 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.max(Math.min(...values, maxVal) - 5, 0);
  const range = maxVal - minVal || 1;

  const W = 520;
  const H = 120;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

  const points = snapshots.map((s, i) => ({
    x:
      PAD.left +
      (i / Math.max(snapshots.length - 1, 1)) * (W - PAD.left - PAD.right),
    y: PAD.top + (1 - (s.pm25 - minVal) / range) * (H - PAD.top - PAD.bottom),
    ...s,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const peakIdx = values.length ? values.indexOf(Math.max(...values)) : -1;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        padding: "14px 16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>
          แนวโน้ม PM2.5 รายชั่วโมง (วันนี้)
        </p>
        <select
          value={selected?.id ?? ""}
          onChange={(e) => {
            const s = stations.find((st) => st.id === e.target.value);
            setSelected(s);
          }}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            fontSize: 12,
            fontFamily: "inherit",
            maxWidth: 200,
          }}
        >
          {stations
            .filter((s) => Number(s.aqi) > 0)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
      </div>

      {/* กราฟ */}
      {points.length > 1 ? (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block" }}
        >
          {[0, 0.5, 1].map((t) => {
            const y = PAD.top + t * (H - PAD.top - PAD.bottom);
            const v = maxVal - t * range;
            return (
              <g key={t}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={W - PAD.right}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 4}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  style={{ fontSize: 9, fill: "#9ca3af" }}
                >
                  {v.toFixed(0)}
                </text>
              </g>
            );
          })}

          <polyline
            points={polyline}
            fill="none"
            stroke="#ff7e00"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {peakIdx >= 0 && points[peakIdx] && (
            <g>
              <text
                x={points[peakIdx].x}
                y={points[peakIdx].y - 10}
                textAnchor="middle"
                style={{ fontSize: 9, fill: "#ef4444", fontWeight: 600 }}
              >
                สูงสุด
              </text>
              <circle
                cx={points[peakIdx].x}
                cy={points[peakIdx].y}
                r="5"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="2"
              />
            </g>
          )}

          {points.at(-1) && peakIdx !== points.length - 1 && (
            <circle
              cx={points.at(-1).x}
              cy={points.at(-1).y}
              r="4"
              fill={getAQIColor(points.at(-1).pm25)}
              stroke="#fff"
              strokeWidth="2"
            />
          )}

          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={H - 2}
              textAnchor="middle"
              style={{ fontSize: 9, fill: "#9ca3af" }}
            >
              {p.hour}
            </text>
          ))}
        </svg>
      ) : (
        <div
          style={{
            height: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: 13,
            gap: 4,
          }}
        >
          <span>⏳ รอเก็บข้อมูลรายชั่วโมง...</span>
          <span style={{ fontSize: 11 }}>
            ข้อมูลจะสะสมขึ้นเรื่อยๆ ตามเวลาที่ผ่านไป
          </span>
        </div>
      )}

      <p style={{ fontSize: 10, color: "#d1d5db", margin: "6px 0 0" }}>
        * ข้อมูลจาก Air4Thai · อัปเดตทุก 1 ชั่วโมง · {snapshots.length} จุด
      </p>
    </div>
  );
}
