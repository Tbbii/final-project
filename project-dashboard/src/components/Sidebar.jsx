import { useState, useMemo } from 'react'
import StationDetail from './StationDetail'
import StatsBar from './StatsBar'
import SearchFilter from './SearchFilter'
import StationList from './StationList'

export default function Sidebar({ stations, selected, onSelect, isOpen, onToggle }) {
  const [search, setSearch]     = useState('')
  const [province, setProvince] = useState('')
  const [view, setView]         = useState('list') // 'list' | 'detail'

  // รายชื่อจังหวัดทั้งหมด (unique)
  const provinces = useMemo(() => {
    const set = new Set(
      stations.map(s => s.area?.split(',').at(-1)?.trim()).filter(Boolean)
    )
    return [...set].sort()
  }, [stations])

  // filter stations
  const filtered = useMemo(() => {
    return stations.filter(s => {
      const matchSearch   = s.name.toLowerCase().includes(search.toLowerCase())
      const matchProvince = province
        ? s.area?.includes(province)
        : true
      return matchSearch && matchProvince
    })
  }, [stations, search, province])

  // เมื่อเลือกสถานี → switch to detail view (mobile)
  const handleSelect = (s) => {
    onSelect(s)
    setView('detail')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          style={{
            display: 'none',
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 40,
          }}
          className="mobile-overlay"
        />
      )}

      <div style={{
        width: 300, background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', height: '100%',
        // Mobile: drawer จากซ้าย
        position: 'relative', zIndex: 50,
      }}
      className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid #e5e7eb',
          background: '#1158e5', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>
              🌤 คุณภาพอากาศไทย
            </p>
            <p style={{ color: '#bfdbfe', fontSize: 11, margin: '2px 0 0' }}>
              Air4Thai · {stations.length} สถานี
            </p>
          </div>
          {/* Mobile close */}
          <button
            onClick={onToggle}
            className="mobile-only"
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none',
              color: '#fff', borderRadius: 6, padding: '4px 8px',
              cursor: 'pointer', fontSize: 13, display: 'none'
            }}
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        <StatsBar stations={stations} />

        {/* Mobile tab (list / detail) */}
        {selected && (
          <div style={{
            display: 'none', borderBottom: '1px solid #e5e7eb',
          }} className="mobile-tabs">
            {['list', 'detail'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                flex: 1, padding: '8px', border: 'none', cursor: 'pointer',
                background: view === v ? '#eff6ff' : '#fff',
                color: view === v ? '#1158e5' : '#6b7280',
                fontWeight: view === v ? 600 : 400,
                fontSize: 13, fontFamily: 'inherit',
                borderBottom: view === v ? '2px solid #1158e5' : '2px solid transparent'
              }}>
                {v === 'list' ? '📋 รายการ' : '📊 รายละเอียด'}
              </button>
            ))}
          </div>
        )}

        {/* Search + Filter */}
        {(view === 'list' || !selected) && (
          <SearchFilter
            search={search} onSearch={setSearch}
            province={province} onProvince={setProvince}
            provinces={provinces}
          />
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {view === 'detail' && selected ? (
            <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
              <StationDetail station={selected} />
            </div>
          ) : (
            <StationList
              stations={filtered}
              selected={selected}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>
    </>
  )
}