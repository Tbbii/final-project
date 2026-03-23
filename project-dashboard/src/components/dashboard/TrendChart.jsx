import { useEffect, useState } from 'react'
import { fetchThaiLocations, fetchSensorHistory, getPM25SensorId } from '../../services/openaqService'

const getColor = (v) => {
  if (v <= 25)  return '#00e400'
  if (v <= 50)  return '#ffcc00'
  if (v <= 100) return '#ff7e00'
  if (v <= 200) return '#ff0000'
  return '#8f3f97'
}

export default function TrendChart() {
  const [locations, setLocations] = useState([])
  const [selected, setSelected]   = useState(null)
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    fetchThaiLocations(50).then(locs => {
      setLocations(locs)
      setSelected(locs[0] ?? null)
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    const sensorId = getPM25SensorId(selected)
    if (!sensorId) return
    setLoading(true)
    fetchSensorHistory(sensorId, 7)
      .then(data => { setHistory(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selected])

  const values = history.map(h => h.value)
  const maxVal = Math.max(...values, 1)
  const minVal = Math.min(...values, 0)
  const range  = maxVal - minVal || 1
  const avg    = values.length ? (values.reduce((a,b)=>a+b,0)/values.length).toFixed(1) : '-'

  const W = 560; const H = 140
  const PAD = { top:16, right:16, bottom:28, left:36 }

  const points = history.map((h, i) => ({
    x: PAD.left + (i / Math.max(history.length-1, 1)) * (W - PAD.left - PAD.right),
    y: PAD.top + (1 - (h.value - minVal) / range) * (H - PAD.top - PAD.bottom),
    ...h
  }))

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div style={{ background:'#fff', borderRadius:10, border:'1px solid #e5e7eb', padding:'14px 16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <p style={{ fontWeight:600, fontSize:13, margin:0 }}>แนวโน้ม PM2.5 ย้อนหลัง 7 วัน</p>
        <select
          value={selected?.id ?? ''}
          onChange={e => setSelected(locations.find(l => l.id === Number(e.target.value)))}
          style={{
            padding:'4px 8px', borderRadius:6, border:'1px solid #d1d5db',
            fontSize:12, fontFamily:'inherit', maxWidth:200
          }}
        >
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {/* mini stats */}
      <div style={{ display:'flex', gap:10, marginBottom:12 }}>
        {[
          { label:'ล่าสุด',    value: values.at(-1)?.toFixed(1) ?? '-', color: getColor(values.at(-1)) },
          { label:'สูงสุด',    value: maxVal.toFixed(1),                 color: getColor(maxVal) },
          { label:'เฉลี่ย 7 วัน', value: avg,                           color:'#374151' },
        ].map(s => (
          <div key={s.label} style={{
            background:'#f9fafb', border:'1px solid #e5e7eb',
            borderRadius:8, padding:'6px 12px', flex:1, textAlign:'center'
          }}>
            <p style={{ fontSize:11, color:'#6b7280', margin:'0 0 2px' }}>{s.label}</p>
            <p style={{ fontSize:16, fontWeight:700, color:s.color, margin:0 }}>
              {s.value} <span style={{ fontSize:10, fontWeight:400 }}>µg/m³</span>
            </p>
          </div>
        ))}
      </div>

      {loading && <p style={{ color:'#9ca3af', fontSize:13 }}>⏳ กำลังโหลด...</p>}

      {!loading && points.length > 1 && (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
          {/* grid */}
          {[0, 0.5, 1].map(t => {
            const y = PAD.top + t * (H - PAD.top - PAD.bottom)
            const v = maxVal - t * range
            return (
              <g key={t}>
                <line x1={PAD.left} y1={y} x2={W-PAD.right} y2={y}
                  stroke="#f3f4f6" strokeWidth="1"/>
                <text x={PAD.left-4} y={y} textAnchor="end"
                  dominantBaseline="central" style={{ fontSize:9, fill:'#9ca3af' }}>
                  {v.toFixed(0)}
                </text>
              </g>
            )
          })}
          {/* เส้น */}
          <polyline points={polyline} fill="none"
            stroke="#ff7e00" strokeWidth="2" strokeLinejoin="round"/>
          {/* จุดล่าสุด */}
          <circle cx={points.at(-1).x} cy={points.at(-1).y} r="5"
            fill={getColor(points.at(-1).value)} stroke="#fff" strokeWidth="2"/>
          {/* label X */}
          {[0, Math.floor(points.length/2), points.length-1].map(i => (
            <text key={i} x={points[i]?.x} y={H-2} textAnchor="middle"
              style={{ fontSize:9, fill:'#9ca3af' }}>
              {new Date(points[i]?.datetime).toLocaleDateString('th-TH',{month:'short',day:'numeric'})}
            </text>
          ))}
        </svg>
      )}

      {!loading && points.length === 0 && (
        <p style={{ color:'#9ca3af', fontSize:13 }}>ไม่มีข้อมูลสำหรับสถานีนี้</p>
      )}

      <p style={{ fontSize:10, color:'#d1d5db', margin:'6px 0 0' }}>
        ข้อมูลจาก OpenAQ · {history.length} รายการ
      </p>
    </div>
  )
}