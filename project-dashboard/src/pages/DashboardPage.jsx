import { useMemo } from 'react'
import useAirData from '../hooks/useAirData'
import KPICards   from '../components/dashboard/KPICards'
import AQIBarChart from '../components/dashboard/AQIBarChart'
import TopStations from '../components/dashboard/TopStations'
import TrendChart  from '../components/dashboard/TrendChart'

export default function DashboardPage() {
  const { stations, loading } = useAirData()

  const stats = useMemo(() => {
    if (!stations.length) return null
    const values = stations.map(s => Number(s.aqi)).filter(v => v > 0)
    return {
      total:     stations.length,
      avgPM25:   (stations.map(s => Number(s.pm25)).filter(v => v > 0)
                   .reduce((a, b) => a + b, 0) / stations.length).toFixed(1),
      good:      values.filter(v => v <= 25).length,
      moderate:  values.filter(v => v > 25 && v <= 50).length,
      unhealthy: values.filter(v => v > 50 && v <= 100).length,
      hazardous: values.filter(v => v > 100).length,
      worst:     [...stations].sort((a, b) => Number(b.aqi) - Number(a.aqi))[0],
      best:      [...stations].filter(s => Number(s.aqi) > 0)
                              .sort((a, b) => Number(a.aqi) - Number(b.aqi))[0],
    }
  }, [stations])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <p>⏳ กำลังโหลดข้อมูล...</p>
    </div>
  )

  if (!stats) return null

  return (
    <div style={{
      height: '100vh', overflowY: 'auto',
      background: '#f5f6fa', fontFamily: 'Noto Sans Thai, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '12px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <p style={{ fontWeight:700, fontSize:15, margin:0 }}>
            แดชบอร์ดคุณภาพอากาศไทย
          </p>
          <p style={{ fontSize:12, color:'#6b7280', margin:'2px 0 0' }}>
            Air4Thai · อัปเดต {new Date().toLocaleDateString('th-TH', {
              year:'numeric', month:'long', day:'numeric'
            })}
          </p>
        </div>
        <span style={{
          background:'#d1fae5', color:'#065f46',
          fontSize:12, padding:'4px 10px', borderRadius:20,
          border:'1px solid #6ee7b7'
        }}>
          Live
        </span>
      </div>

      {/* Content */}
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:16 }}>
        <KPICards stats={stats} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <AQIBarChart stats={stats} />
          <TopStations stats={stats} />
        </div>

        <TrendChart />
      </div>
    </div>
  )
}