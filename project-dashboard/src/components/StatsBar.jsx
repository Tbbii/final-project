import { calcStats } from '../utils/aqiHelpers'

export default function StatsBar({ stations }) {
  const stats = calcStats(stations)
  const total = stations.length

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      padding: '10px 16px', borderBottom: '1px solid #e5e7eb',
      background: '#f9fafb'
    }}>
      {stats.filter(s => s.count > 0).map(s => (
        <div key={s.label} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 20, padding: '4px 10px',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: s.color, flexShrink: 0
          }} />
          <span style={{ fontSize: 12, color: '#374151' }}>
            {s.label}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: '#111827', minWidth: 20, textAlign: 'right'
          }}>
            {s.count}
          </span>
        </div>
      ))}
      <div style={{
        marginLeft: 'auto', fontSize: 12,
        color: '#6b7280', alignSelf: 'center'
      }}>
        รวม {total} สถานี
      </div>
    </div>
  )
}