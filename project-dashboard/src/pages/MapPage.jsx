import { useState } from 'react'
import useAirData from '../hooks/useAirData'
import Sidebar from '../components/Sidebar'
import StationMap from '../components/StationMap'

export default function MapPage() {
  const { stations, loading, error } = useAirData()
  const [selected, setSelected]      = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <p style={{ fontSize:18 }}>⏳ กำลังโหลดข้อมูล...</p>
    </div>
  )

  if (error) return (
    <div style={{ padding:20, color:'red' }}>❌ {error}</div>
  )

  return (
    <div style={{
      display:'flex', height:'100vh',
      fontFamily:'Noto Sans Thai, sans-serif',
      position:'relative', overflow:'hidden'
    }}>
      <div className="mobile-topbar" style={{
        display:'none', position:'fixed', top:0, left:0, right:0,
        background:'#1158e5', color:'#fff', zIndex:30,
        padding:'10px 16px', alignItems:'center', justifyContent:'space-between'
      }}>
        <span style={{ fontWeight:700, fontSize:15 }}>🌤 คุณภาพอากาศไทย</span>
        <button onClick={() => setSidebarOpen(o => !o)} style={{
          background:'rgba(255,255,255,0.2)', border:'none',
          color:'#fff', borderRadius:6, padding:'6px 12px',
          cursor:'pointer', fontSize:13, fontFamily:'inherit'
        }}>
          ☰ สถานี
        </button>
      </div>

      <div className="sidebar-wrapper">
        <Sidebar
          stations={stations}
          selected={selected}
          onSelect={setSelected}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
        />
      </div>

      <div style={{ flex:1 }} className="map-wrapper">
        <StationMap
          stations={stations}
          onSelect={(s) => { setSelected(s); setSidebarOpen(true) }}
        />
      </div>
    </div>
  )
}