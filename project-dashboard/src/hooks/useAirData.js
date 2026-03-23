import { useEffect, useState } from 'react'
import axios from 'axios'

export default function useAirData() {
  const [stations, setStations] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
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
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { stations, loading, error }
}