import { useEffect, useState, useRef, useCallback } from "react";
import { getAQIColor } from "../../utils/aqiHelpers";

// ─── Config ────────────────────────────────────────────────────────────────────
const CHART = {
  W: 520,
  H: 130,
  PAD: { top: 18, right: 16, bottom: 30, left: 38 },
};
const REFRESH_MS = 10 * 60 * 1000; // auto-refresh ทุก 10 นาที

// ─── Custom Hook ───────────────────────────────────────────────────────────────
function useSnapshots(stationId) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (!stationId) return;

    // ยกเลิก fetch เก่าถ้ายังค้างอยู่
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      const res = await fetch(
        `http://localhost:3001/snapshots?station_id=${stationId}&hour_gte=${cutoff}`,
        { signal: abortRef.current.signal },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // sort ด้วย ISO string เต็ม รองรับข้ามวัน
      const sorted = [...data].sort((a, b) => a.hour.localeCompare(b.hour));

      setSnapshots(
        sorted.map((d) => ({
          iso: d.hour,
          hour: new Date(d.hour).getHours().toString().padStart(2, "0") + ":00",
          pm25: Number(d.pm25),
          aqi: Number(d.aqi),
        })),
      );
    } catch (err) {
      if (err.name !== "AbortError") setError("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      clearInterval(timer);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [load]);

  return { snapshots, loading, error, refresh: load };
}

// ─── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ point, chartW }) {
  if (!point) return null;
  const flip = point.x > chartW * 0.65;
  const tx = point.x + (flip ? -76 : 10);
  const ty = point.y - 30;
  return (
    <g>
      <rect
        x={tx}
        y={ty}
        width={66}
        height={28}
        rx={5}
        fill="#1f2937"
        opacity={0.92}
      />
      <text
        x={tx + 33}
        y={ty + 10}
        textAnchor="middle"
        style={{ fontSize: 9, fill: "#f9fafb", fontWeight: 700 }}
      >
        {point.hour}
      </text>
      <text
        x={tx + 33}
        y={ty + 22}
        textAnchor="middle"
        style={{ fontSize: 9, fill: "#fcd34d" }}
      >
        PM2.5: {point.pm25.toFixed(1)}
      </text>
    </g>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TrendChart({ stations = [] }) {
  const [selected, setSelected] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const { snapshots, loading, error, refresh } = useSnapshots(selected?.id);

  // ตั้งค่า selected — reset ถ้า station หายออกจาก list
  useEffect(() => {
    if (!stations.length) return;
    const stillExists = selected && stations.some((s) => s.id === selected.id);
    if (!stillExists) {
      const first = stations.find((s) => Number(s.aqi) > 0) ?? stations[0];
      setSelected(first);
    }
  }, [stations]);

  // ─── คำนวณกราฟ ──────────────────────────────────────────────────────────────
  const { W, H, PAD } = CHART;
  const values = snapshots.filter((s) => s.pm25 > 0).map((s) => s.pm25);
  const maxVal = values.length ? Math.max(...values) : 50;
  const minVal = values.length ? Math.max(Math.min(...values) - 5, 0) : 0;
  const range = maxVal - minVal || 1;

  const points = snapshots.map((s, i) => ({
    x:
      PAD.left +
      (i / Math.max(snapshots.length - 1, 1)) * (W - PAD.left - PAD.right),
    y: PAD.top + (1 - (s.pm25 - minVal) / range) * (H - PAD.top - PAD.bottom),
    ...s,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  // peakIdx — ใช้ findIndex บน snapshots โดยตรง ไม่ off-by-one
  const peakPm25 = values.length ? Math.max(...values) : -1;
  const peakIdx =
    peakPm25 >= 0 ? snapshots.findIndex((s) => s.pm25 === peakPm25) : -1;

  // x-axis: แสดง label ทุก N จุด ไม่ให้ซ้อนกัน
  const labelStep = Math.ceil(points.length / 8);

  const activeStations = stations.filter((s) => Number(s.aqi) > 0);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: "14px 16px",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: 13,
              margin: 0,
              color: "#111827",
            }}
          >
            แนวโน้ม PM2.5 รายชั่วโมง (วันนี้)
          </p>
          {loading && (
            <span
              style={{
                fontSize: 10,
                color: "#6b7280",
                background: "#f3f4f6",
                borderRadius: 4,
                padding: "2px 6px",
              }}
            >
              กำลังโหลด...
            </span>
          )}
          {error && (
            <span
              onClick={refresh}
              title="คลิกเพื่อลองใหม่"
              style={{
                fontSize: 10,
                color: "#ef4444",
                background: "#fef2f2",
                borderRadius: 4,
                padding: "2px 6px",
                cursor: "pointer",
              }}
            >
              ⚠ {error} · ลองใหม่
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <select
            value={selected?.id ?? ""}
            onChange={(e) =>
              setSelected(stations.find((s) => s.id === e.target.value) ?? null)
            }
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 12,
              fontFamily: "inherit",
              maxWidth: 200,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {activeStations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={refresh}
            disabled={loading}
            title="รีเฟรช"
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 13,
              background: "#fff",
              lineHeight: 1,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* Chart body */}
      {loading && points.length === 0 ? (
        <>
          <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          <div
            style={{
              height: H,
              borderRadius: 8,
              background:
                "linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
            }}
          />
        </>
      ) : points.length > 1 ? (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block", overflow: "visible" }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="tcAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7e00" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ff7e00" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines + y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = PAD.top + t * (H - PAD.top - PAD.bottom);
            const v = maxVal - t * range;
            return (
              <g key={t}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={W - PAD.right}
                  y2={y}
                  stroke={t === 0 || t === 1 ? "#e5e7eb" : "#f3f4f6"}
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

          {/* Area fill */}
          <polygon
            points={[
              `${points[0].x},${H - PAD.bottom}`,
              ...points.map((p) => `${p.x},${p.y}`),
              `${points.at(-1).x},${H - PAD.bottom}`,
            ].join(" ")}
            fill="url(#tcAreaGrad)"
          />

          {/* Line */}
          <polyline
            points={polyline}
            fill="none"
            stroke="#ff7e00"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Peak marker */}
          {peakIdx >= 0 && points[peakIdx] && (
            <g>
              <text
                x={points[peakIdx].x}
                y={points[peakIdx].y - 10}
                textAnchor="middle"
                style={{ fontSize: 9, fill: "#ef4444", fontWeight: 700 }}
              >
                สูงสุด {snapshots[peakIdx].pm25.toFixed(1)}
              </text>
              <circle
                cx={points[peakIdx].x}
                cy={points[peakIdx].y}
                r={5}
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Latest dot (ถ้าไม่ใช่ peak) */}
          {points.at(-1) && peakIdx !== points.length - 1 && (
            <circle
              cx={points.at(-1).x}
              cy={points.at(-1).y}
              r={4}
              fill={getAQIColor(points.at(-1).aqi)}
              stroke="#fff"
              strokeWidth="2"
            />
          )}

          {/* Hover crosshair + hit areas */}
          {points.map((p, i) => {
            const hitW =
              (W - PAD.left - PAD.right) / Math.max(points.length - 1, 1);
            return (
              <g key={i}>
                {hoveredIdx === i && (
                  <>
                    <line
                      x1={p.x}
                      y1={PAD.top}
                      x2={p.x}
                      y2={H - PAD.bottom}
                      stroke="#d1d5db"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={5}
                      fill="#ff7e00"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  </>
                )}
                <rect
                  x={p.x - hitW * 0.5}
                  y={PAD.top}
                  width={hitW}
                  height={H - PAD.top - PAD.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                />
              </g>
            );
          })}

          {/* Tooltip */}
          <Tooltip
            point={hoveredIdx !== null ? points[hoveredIdx] : null}
            chartW={W}
          />

          {/* x-axis labels — adaptive step */}
          {points.map((p, i) =>
            i % labelStep === 0 || i === points.length - 1 ? (
              <text
                key={i}
                x={p.x}
                y={H - 2}
                textAnchor="middle"
                style={{ fontSize: 9, fill: "#9ca3af" }}
              >
                {p.hour}
              </text>
            ) : null,
          )}
        </svg>
      ) : (
        <div
          style={{
            height: H,
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

      {/* Footer */}
      <p style={{ fontSize: 10, color: "#d1d5db", margin: "6px 0 0" }}>
        * ข้อมูลจาก Air4Thai · อัปเดตทุก 1 ชั่วโมง · {snapshots.length} จุด ·
        รีเฟรชอัตโนมัติทุก 10 นาที
      </p>
    </div>
  );
}
