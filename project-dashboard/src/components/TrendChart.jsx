import { useEffect, useState } from 'react'
import { fetchThaiLocations, fetchSensorHistory, getPM25SensorId } from '../services/openaqService'

export default function TrendChart() {
  const [locations, setLocations] = useState([])
  const [selected, setSelected]   = useState(null)
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(false)

  // โหลดสถานีตอนแรก
  useEffect(() => {
    fetchThaiLocations(50).then(locs => {
      setLocations(locs)
      setSelected(locs[0] ?? null)
    })
  }, [])

  // โหลด history เมื่อเลือกสถานี
  useEffect(() => {
    if (!selected) return
    const sensorId = getPM25SensorId(selected)
    if (!sensorId) return

    setLoading(true)
    fetchSensorHistory(sensorId, 7)
      .then(data => { setHistory(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selected])

  // คำนวณ min/max สำหรับ scale กราฟ
  const values  = history.map(h => h.value)
  const maxVal  = Math.max(...values, 1)
  const minVal  = Math.min(...values, 0)
  const range   = maxVal - minVal || 1

  const W = 560
  const H = 160
  const PAD = { top: 20, right: 20, bottom: 30, left: 40 }

  const points = history.map((h, i) => {
    const x = PAD.left + (i / Math.max(history.length - 1, 1)) * (W - PAD.left - PAD.right)
    const y = PAD.top + (1 - (h.value - minVal) / range) * (H - PAD.top - PAD.bottom)
    return { x, y, ...h }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  const getColor = (v) => {
    if (v <= 25)  return '#00e400'
    if (v <= 50)  return '#ffcc00'
    if (v <= 100) return '#ff7e00'
    if (v <= 200) return '#ff0000'
    return '#8f3f97'
  }

  return (
    <div style={{padding: 20, fontFamily: 'Noto Sans Thai, sans-serif'}}>
      <h2 style={{fontSize: 16, marginBottom: 12}}>กราฟแนวโน้ม PM2.5 ย้อนหลัง 7 วัน</h2>

      {/* เลือกสถานี */}
      <select
        value={selected?.id ?? ''}
        onChange={e => setSelected(locations.find(l => l.id === Number(e.target.value)))}
        style={{
          marginBottom: 16, padding: '6px 10px',
          borderRadius: 8, border: '1px solid #d1d5db',
          fontSize: 13, fontFamily: 'inherit', width: '100%', maxWidth: 400
        }}
      >
        {locations.map(l => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </select>

      {loading && <p style={{color:'#9ca3af'}}>⏳ กำลังโหลดข้อมูล...</p>}

      {!loading && history.length > 0 && (
        <>
          {/* Stats */}
          <div style={{display:'flex', gap:12, marginBottom:12}}>
            {[
              { label:'ค่าล่าสุด',  value: values.at(-1)?.toFixed(1), unit:'µg/m³', color: getColor(values.at(-1)) },
              { label:'สูงสุด 7 วัน', value: maxVal.toFixed(1),        unit:'µg/m³', color: getColor(maxVal) },
              { label:'เฉลี่ย 7 วัน', value: (values.reduce((a,b)=>a+b,0)/values.length).toFixed(1), unit:'µg/m³', color:'#374151' },
            ].map(s => (
              <div key={s.label} style={{
                background:'#f9fafb', border:'1px solid #e5e7eb',
                borderRadius:8, padding:'8px 12px', flex:1
              }}>
                <p style={{fontSize:11,color:'#6b7280',margin:'0 0 2px'}}>{s.label}</p>
                <p style={{fontSize:18,fontWeight:600,color:s.color,margin:0}}>
                  {s.value} <span style={{fontSize:11,fontWeight:400}}>µg/m³</span>
                </p>
              </div>
            ))}
          </div>

          {/* กราฟ SVG */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:8}}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
              {/* grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(t => {
                const y = PAD.top + t * (H - PAD.top - PAD.bottom)
                const v = maxVal - t * range
                return (
                  <g key={t}>
                    <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                      stroke="#f3f4f6" strokeWidth="1"/>
                    <text x={PAD.left - 4} y={y} textAnchor="end"
                      dominantBaseline="central" style={{fontSize:9,fill:'#9ca3af'}}>
                      {v.toFixed(0)}
                    </text>
                  </g>
                )
              })}

              {/* เส้นกราฟ */}
              {points.length > 1 && (
                <polyline points={polyline} fill="none"
                  stroke="#ff7e00" strokeWidth="1.5" strokeLinejoin="round"/>
              )}

              {/* จุดล่าสุด */}
              {points.length > 0 && (
                <circle cx={points.at(-1).x} cy={points.at(-1).y} r="4"
                  fill={getColor(points.at(-1).value)}/>
              )}

              {/* label แกน X */}
              {points.length > 0 && [0, Math.floor(points.length/2), points.length-1].map(i => (
                <text key={i} x={points[i]?.x} y={H - 4}
                  textAnchor="middle" style={{fontSize:9,fill:'#9ca3af'}}>
                  {new Date(points[i]?.datetime).toLocaleDateString('th-TH',{month:'short',day:'numeric'})}
                </text>
              ))}
            </svg>
          </div>

          <p style={{fontSize:11,color:'#9ca3af',marginTop:6}}>
            {history.length} รายการ · ข้อมูลจาก OpenAQ
          </p>
        </>
      )}

      {!loading && history.length === 0 && (
        <p style={{color:'#9ca3af'}}>ไม่มีข้อมูลย้อนหลังสำหรับสถานีนี้</p>
      )}
    </div>
  )
}