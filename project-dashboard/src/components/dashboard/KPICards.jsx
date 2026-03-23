export default function KPICards({ stats }) {
  const cards = [
    { label:'สถานีทั้งหมด', value: stats.total,     unit:'สถานี',          color:'#1158e5' },
    { label:'ค่าเฉลี่ย PM2.5', value: stats.avgPM25, unit:'µg/m³ · ปานกลาง', color:'#ff7e00' },
    { label:'สถานีวิกฤต',    value: stats.hazardous, unit:'มีผลต่อสุขภาพ+',  color:'#ff0000' },
    { label:'สถานีดีมาก',    value: stats.good,      unit:'AQI ≤ 25',        color:'#00c853' },
  ]

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background:'#fff', borderRadius:10,
          border:'1px solid #e5e7eb', padding:'12px 16px'
        }}>
          <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 4px' }}>{c.label}</p>
          <p style={{ fontSize:26, fontWeight:700, color:c.color, margin:0, lineHeight:1 }}>
            {c.value}
          </p>
          <p style={{ fontSize:11, color:c.color, margin:'4px 0 0', opacity:0.8 }}>{c.unit}</p>
        </div>
      ))}
    </div>
  )
}