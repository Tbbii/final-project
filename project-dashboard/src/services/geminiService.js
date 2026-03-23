import { GoogleGenerativeAI } from "@google/generative-ai"

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(GEMINI_KEY)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",  // เปลี่ยนจาก gemini-2.0-flash-lite
  generationConfig: {
    temperature: 0.3,
    // maxOutputTokens: 1000,
  }
})

const cache = new Map()

const isRateLimitError = (error) =>
  error?.status === 429 ||
  error?.message?.includes("429") ||
  error?.message?.includes("quota") ||
  error?.message?.includes("rate") ||
  error?.message?.includes("RESOURCE_EXHAUSTED")

export const summarizeStation = async (station) => {
  const cacheKey = `${station.id}_${station.aqi}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านคุณภาพอากาศของประเทศไทย
วิเคราะห์และสรุปสถานการณ์คุณภาพอากาศเป็นภาษาไทยที่เข้าใจง่าย

ข้อมูลสถานี:
- ชื่อสถานี: ${station.name}
- พื้นที่: ${station.area}
- ค่า PM2.5: ${station.pm25} µg/m³
- ค่า AQI: ${station.aqi}
- ระดับ: ${station.aqiLabel}
- เวลาที่วัด: ${station.time}

กรุณาตอบในรูปแบบนี้เท่านั้น (ไม่ต้องมีหัวข้อหรือ bullet):
บรรทัดที่ 1: สรุปสถานการณ์ปัจจุบัน 1 ประโยค
บรรทัดที่ 2: คำแนะนำสำหรับประชาชน 1-2 ประโยค
บรรทัดที่ 3: แนวโน้มที่คาดการณ์ 1 ประโยค (ใช้คำว่า "แนวโน้ม:")
`

  const fetchWithRetry = async (retries = 2) => {
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      // log error จริงเพื่อ debug
      console.error("Gemini error:", error?.status, error?.message)

      if (isRateLimitError(error) && retries > 0) {
        await new Promise(r => setTimeout(r, 5000))
        return fetchWithRetry(retries - 1)
      }
      throw error
    }
  }

  try {
    const text = await fetchWithRetry()
    const result = {
      summary: text.trim(),
      cachedAt: new Date().toLocaleTimeString("th-TH"),
    }
    cache.set(cacheKey, result)
    setTimeout(() => cache.delete(cacheKey), 10 * 60 * 1000)
    return result

  } catch (err) {
    console.error("Gemini final error:", err)
    return {
      summary: `ไม่สามารถโหลดข้อมูล AI ได้ในขณะนี้\n(${isRateLimitError(err) ? "เกินขีดจำกัดการใช้งาน AI กรุณารอ 1 นาที" : "เกิดข้อผิดพลาดในการเชื่อมต่อ"})`,
      cachedAt: null,
    }
  }
}