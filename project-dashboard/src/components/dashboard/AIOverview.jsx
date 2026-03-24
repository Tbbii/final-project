import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { temperature: 0.3 },
});

export default function AIOverview({ stats }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [analyzedAt, setAnalyzedAt] = useState(null);

  const handleAnalyze = async () => {
    if (loading) return;
    setLoading(true);

    const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านคุณภาพอากาศของประเทศไทย
วิเคราะห์ภาพรวมคุณภาพอากาศทั่วประเทศวันนี้เป็นภาษาไทยที่เข้าใจง่าย

ข้อมูลภาพรวม:
- สถานีทั้งหมด: ${stats.total} สถานี
- ค่าเฉลี่ย PM2.5: ${stats.avgPM25} µg/m³
- ระดับดีมาก (AQI ≤ 25): ${stats.good} สถานี
- ระดับดี (AQI 26-50): ${stats.moderate} สถานี
- ระดับปานกลาง (AQI 51-100): ${stats.unhealthy} สถานี
- ระดับมีผลต่อสุขภาพ (AQI > 100): ${stats.hazardous} สถานี
- สถานีแย่สุด: ${stats.worst?.name} (AQI: ${stats.worst?.aqi})
- สถานีดีสุด: ${stats.best?.name} (AQI: ${stats.best?.aqi})

กรุณาตอบ 3 บรรทัดสั้นๆ ให้จบในแต่ละบรรทัด ไม่มีหัวข้อ:
บรรทัดที่ 1: สรุปภาพรวมสถานการณ์วันนี้
บรรทัดที่ 2: พื้นที่ที่น่าเป็นห่วงและคำแนะนำ
บรรทัดที่ 3: ขึ้นต้นด้วย "แนวโน้ม:" แล้วคาดการณ์ช่วงที่เหลือของวัน
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setSummary(response.text().trim());
      setLoaded(true);
      setAnalyzedAt(new Date());
    } catch {
      setSummary("ไม่สามารถโหลดข้อมูล AI ได้ในขณะนี้");
      setLoaded(true);
      setAnalyzedAt(new Date());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#eef2ff",
        border: "1px solid #c7d2fe",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>✨</span>
        <p
          style={{ fontWeight: 600, fontSize: 13, color: "#4338ca", margin: 0 }}
        >
          AI วิเคราะห์ภาพรวมวันนี้
        </p>
      </div>

      {/* ปุ่มวิเคราะห์ */}
      {!loaded && !loading && (
        <button
          onClick={handleAnalyze}
          style={{
            width: "100%",
            padding: "7px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          วิเคราะห์ด้วย AI
        </button>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ fontSize: 13, color: "#6366f1", margin: 0 }}>
          ⏳ AI กำลังวิเคราะห์...
        </p>
      )}

      {/* ผลลัพธ์ */}
      {loaded && (
        <div>
          {summary
            .split("\n")
            .filter(Boolean)
            .map((line, i) => (
              <p
                key={i}
                style={{
                  fontSize: 13,
                  margin: "0 0 6px",
                  lineHeight: 1.6,
                  color: line.startsWith("แนวโน้ม:") ? "#4338ca" : "#374151",
                  fontWeight: line.startsWith("แนวโน้ม:") ? 600 : 400,
                }}
              >
                {line}
              </p>
            ))}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <button
              onClick={() => {
                setLoaded(false);
                setSummary("");
                setAnalyzedAt(null);
              }}
              style={{
                fontSize: 11,
                color: "#9ca3af",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              🔄 วิเคราะห์ใหม่
            </button>

            {analyzedAt && (
              <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>
                วิเคราะห์เมื่อ{" "}
                {analyzedAt.toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                น.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
