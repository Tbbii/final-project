import { useEffect, useState } from 'react'
import axios from 'axios'

export default function HistoryTest() {
  const [locations, setLocations] = useState([])
  const [history, setHistory]     = useState(null)
  const [error, setError]         = useState(null)

  const KEY = import.meta.env.VITE_OPENAQ_KEY

  useEffect(() => {
    axios.get('/openaq/v3/locations', {
      params: {
        countries_id: 111,
        parameters_id: 2,
        limit: 10,
      },
      headers: { 'X-API-Key': KEY }
    })
    .then(res => {
      const results = res.data.results ?? []
      setLocations(results)

      const firstLocation = results[0]
      console.log('สถานีแรก:', firstLocation?.name)
      console.log('sensors:', firstLocation?.sensors)

      // หา sensor ที่วัด PM2.5 (parameter id = 2)
      const sensorId = firstLocation?.sensors?.find(
        s => s.parameter?.id === 2
      )?.id

      console.log('PM2.5 sensor ID:', sensorId)
      if (!sensorId) return

      const today = new Date().toISOString()
      const past  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      return axios.get(`/openaq/v3/sensors/${sensorId}/measurements`, {
        params: {
          date_from: past,
          date_to:   today,
          limit: 100,
        },
        headers: { 'X-API-Key': KEY }
      })
    })
    .then(res => {
      if (res) {
        console.log('history:', res.data)
        setHistory(res.data)
      }
    })
    .catch(err => setError(err.message))
  }, [])

  if (error) return <p style={{padding:20,color:'red'}}>❌ {error}</p>

  return (
    <div style={{padding:20}}>
      <h2>✅ OpenAQ สถานีไทย</h2>
      <p>พบ {locations.length} สถานี</p>

      {locations.length > 0 && (
        <div style={{marginBottom:12}}>
          <p style={{fontWeight:600}}>สถานีแรก: {locations[0]?.name}</p>
          <p style={{fontSize:12,color:'#6b7280'}}>ID: {locations[0]?.id}</p>
        </div>
      )}

      {history ? (
        <>
          <p style={{fontWeight:600}}>
            ข้อมูลย้อนหลัง 7 วัน: {history.meta?.found} รายการ
          </p>
          <pre style={{fontSize:11,background:'#f3f4f6',padding:12,borderRadius:8,overflow:'auto',maxHeight:300}}>
            {JSON.stringify(history.results?.[0], null, 2)}
          </pre>
        </>
      ) : (
        <p style={{color:'#9ca3af'}}>⏳ กำลังโหลดข้อมูลย้อนหลัง...</p>
      )}
    </div>
  )
}