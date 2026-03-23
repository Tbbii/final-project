export default function AQIBarChart({ stats }) {
  const total = stats.total
  const bars = [
    { label:'ดีมาก',          count: stats.good,      color:'#00e400' },
    { label:'ดี',              count: stats.moderate,  color:'#ffcc00' },
    { label:'ปานกลาง',        count: stats.unhealthy, color:'#ff7e00' },
    { label:'มีผลต่อสุขภาพ', count: stats.hazardous, color:'#ff0000' },
  ]

  return (
    <div style={{ background:'#fff', borderRadius:10, border:'1px solid #e5e7eb', padding:'14px 16px' }}>
      <p style={{ fontWeight:600, fontSize:13, margin:'0 0 12px' }}>
        สัดส่วนระดับคุณภาพอากาศ
      </p>
      {bars.map(b => (
        <div key={b.label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <span style={{ fontSize:12, color:'#374151', width:120, flexShrink:0 }}>{b.label}</span>
          <div style={{
            flex:1, height:10, background:'#f3f4f6',
            borderRadius:5, overflow:'hidden'
          }}>
            <div style={{
              width: `${(b.count/total)*100}%`,
              height:'100%', background:b.color,
              borderRadius:5, transition:'width 0.5s'
            }}/>
          </div>
          <span style={{ fontSize:12, fontWeight:600, color:'#111827', width:28, textAlign:'right' }}>
            {b.count}
          </span>
        </div>
      ))}
    </div>
  )
}