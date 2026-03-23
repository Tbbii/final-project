import axios from 'axios'

const KEY = import.meta.env.VITE_OPENAQ_KEY
const headers = { 'X-API-Key': KEY }

// ดึงสถานีไทยทั้งหมดที่วัด PM2.5
export const fetchThaiLocations = async (limit = 100) => {
  const res = await axios.get('/openaq/v3/locations', {
    params: { countries_id: 111, parameters_id: 2, limit },
    headers
  })
  return res.data.results ?? []
}

// ดึงข้อมูลย้อนหลังจาก sensor ID
export const fetchSensorHistory = async (sensorId, days = 7) => {
  const today = new Date().toISOString()
  const past  = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const res = await axios.get(`/openaq/v3/sensors/${sensorId}/measurements`, {
    params: { date_from: past, date_to: today, limit: 200 },
    headers
  })

  // แปลงให้ใช้งานง่าย
  return (res.data.results ?? []).map(m => ({
    datetime: m.period?.datetimeFrom?.local ?? m.date?.local,
    value:    m.value,
  })).filter(m => m.value !== null).reverse() // เรียงเก่า→ใหม่
}

// หา PM2.5 sensor ID จาก location object
export const getPM25SensorId = (location) =>
  location?.sensors?.find(s => s.parameter?.id === 2)?.id ?? null