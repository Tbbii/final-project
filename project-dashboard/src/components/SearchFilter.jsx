export default function SearchFilter({ search, onSearch, province, onProvince, provinces }) {
  return (
    <div style={{
      padding: '10px 16px', borderBottom: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column', gap: 8
    }}>
      {/* ค้นหาชื่อสถานี */}
      <input
        type="text"
        placeholder="🔍 ค้นหาชื่อสถานี..."
        value={search}
        onChange={e => onSearch(e.target.value)}
        style={{
          width: '100%', padding: '8px 12px',
          border: '1px solid #d1d5db', borderRadius: 8,
          fontSize: 13, outline: 'none',
          boxSizing: 'border-box', fontFamily: 'inherit'
        }}
      />

      {/* กรองจังหวัด */}
      <select
        value={province}
        onChange={e => onProvince(e.target.value)}
        style={{
          width: '100%', padding: '8px 12px',
          border: '1px solid #d1d5db', borderRadius: 8,
          fontSize: 13, outline: 'none', background: '#fff',
          boxSizing: 'border-box', fontFamily: 'inherit',
          cursor: 'pointer'
        }}
      >
        <option value="">📍 ทุกจังหวัด</option>
        {provinces.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  )
}