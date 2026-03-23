import { getAQIColor, getAQILabel } from '../../utils/aqiHelpers'

export default function TopStations({ stats }) {
  const pct = Math.round(
    ((stats.good + stats.moderate) / stats.total) * 100
  )

  return (
    <div style={{ background:'#fff', borderRadius:10, border:'1px solid #e5e7eb', padding:'14px 16px' }}>
      <p style={{ fontWeight:600, fontSize:13, margin:'0 0 12px' }}>สถานีที่น่าสนใจ</p>

      {/* แย่สุด */}
      <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 6px' }}>แย่ที่สุดวันนี้</p>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:600, margin:0 }}>{stats.worst?.name}</p>
          <p style={{ fontSize:11, color:'#6b7280', margin:'2px 0 0' }}>
            PM2.5: {stats.worst?.pm25} µg/m³
          </p>
        </div>
        <span style={{
          background: getAQIColor(stats.worst?.aqi),
          color:'#fff', fontWeight:700, fontSize:14,
          padding:'4px 10px', borderRadius:8
        }}>
          {stats.worst?.aqi}
        </span>
      </div>

      {/* ดีสุด */}
      <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 6px', borderTop:'1px solid #f3f4f6', paddingTop:10 }}>
        ดีที่สุดวันนี้
      </p>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:600, margin:0 }}>{stats.best?.name}</p>
          <p style={{ fontSize:11, color:'#6b7280', margin:'2px 0 0' }}>
            PM2.5: {stats.best?.pm25} µg/m³
          </p>
        </div>
        <span style={{
          background: getAQIColor(stats.best?.aqi),
          color:'#fff', fontWeight:700, fontSize:14,
          padding:'4px 10px', borderRadius:8
        }}>
          {stats.best?.aqi}
        </span>
      </div>

      {/* % ปลอดภัย */}
      <div style={{ borderTop:'1px solid #f3f4f6', paddingTop:10 }}>
        <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 6px' }}>% สถานีปลอดภัย (AQI ≤ 50)</p>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, height:10, background:'#f3f4f6', borderRadius:5, overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', background:'#00c853', borderRadius:5 }}/>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:'#00c853' }}>{pct}%</span>
        </div>
      </div>
    </div>
  )
}