import { useState } from "react";
import { summarizeStation } from "../services/geminiService";
import { getAQILabel } from "../utils/aqiHelpers";

export default function AICard({ station }) {
  const [summary, setSummary] = useState("");
  const [cachedAt, setCachedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = async () => {
    if (loading) return;
    setLoading(true);
    setSummary("");
    setLoaded(false);

    // รอ 1 วินาทีก่อนเรียก API ป้องกัน spam
    await new Promise((r) => setTimeout(r, 1000));

    const result = await summarizeStation({
      ...station,
      aqiLabel: getAQILabel(station.aqi).replace(/^\S+\s/, ""),
    });
    setSummary(result.summary);
    setCachedAt(result.cachedAt);
    setLoading(false);
    setLoaded(true);
  };

  if (!station) return null;

  return (
    <div
      style={{
        marginTop: 12,
        border: "1px solid #e0e7ff",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#eef2ff",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#4338ca" }}>
            AI วิเคราะห์สถานการณ์
          </span>
        </div>
        {cachedAt && (
          <span style={{ fontSize: 10, color: "#818cf8" }}>
            cache {cachedAt}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "10px 12px", background: "#fff" }}>
        {!loaded && !loading && (
          <button
            onClick={handleLoad}
            style={{
              width: "100%",
              padding: "8px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🤖 วิเคราะห์ด้วย AI
          </button>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <p
              style={{
                fontSize: 13,
                color: "#6366f1",
                animation: "pulse 1.5s infinite",
              }}
            >
              ⏳ AI กำลังวิเคราะห์...
            </p>
          </div>
        )}

        {loaded && !loading && (
          <div>
            {summary
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 13,
                    color: line.startsWith("แนวโน้ม:") ? "#4338ca" : "#374151",
                    fontWeight: line.startsWith("แนวโน้ม:") ? 600 : 400,
                    margin: "0 0 6px",
                    lineHeight: 1.6,
                  }}
                >
                  {line}
                </p>
              ))}
            <button
              onClick={() => {
                setLoaded(false);
                setSummary("");
              }}
              style={{
                marginTop: 6,
                fontSize: 11,
                color: "#9ca3af",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              🔄 วิเคราะห์ใหม่
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
