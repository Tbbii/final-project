import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

const REFRESH_INTERVAL = 60 * 60 * 1000 // 1 ชั่วโมง

export default function useAirData() {
  const [stations, setStations] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null) // เพิ่ม: รู้ว่าอัปเดตล่าสุดเมื่อไหร่

  const fetchData = useCallback(() => {
    axios.get('/air4thai/services/getNewAQI_JSON.php')
      .then(res => {
        const data = (res.data?.stations ?? [])
          .filter(s => s.lat && s.long)
          .map(s => ({
            id:   s.stationID,
            name: s.nameTH,
            area: s.areaTH,
            lat:  parseFloat(s.lat),
            lng:  parseFloat(s.long),
            pm25: s.AQILast?.PM25?.value ?? '-',
            aqi:  s.AQILast?.AQI?.aqi   ?? '-',
            time: `${s.AQILast?.date ?? ''} ${s.AQILast?.time ?? ''}`.trim(),
          }))
        setStations(data)
        setLastUpdated(new Date())
        setLoading(false)
        setError(null)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval) // cleanup
  }, [fetchData])

  return { stations, loading, error, lastUpdated, refetch: fetchData }
}