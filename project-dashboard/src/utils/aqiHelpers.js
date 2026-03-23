export const getAQIColor = (aqi) => {
  const v = Number(aqi)
  if (!v || v < 0)  return '#aaaaaa'
  if (v <= 25)      return '#00e400'
  if (v <= 50)      return '#ffcc00'
  if (v <= 100)     return '#ff7e00'
  if (v <= 200)     return '#ff0000'
  return '#8f3f97'
}

export const getAQILabel = (aqi) => {
  const v = Number(aqi)
  if (!v || v < 0)  return 'ไม่มีข้อมูล'
  if (v <= 25)      return '😊 ดีมาก'
  if (v <= 50)      return '🙂 ดี'
  if (v <= 100)     return '😐 ปานกลาง'
  if (v <= 200)     return '😷 มีผลต่อสุขภาพ'
  return '🚨 อันตราย'
}

export const AQI_LEGEND = [
  { color: '#00e400', label: 'ดีมาก',          range: '0–25'    },
  { color: '#ffcc00', label: 'ดี',              range: '26–50'   },
  { color: '#ff7e00', label: 'ปานกลาง',         range: '51–100'  },
  { color: '#ff0000', label: 'มีผลต่อสุขภาพ',  range: '101–200' },
  { color: '#8f3f97', label: 'อันตราย',         range: '>200'    },
  { color: '#aaaaaa', label: 'ไม่มีข้อมูล',    range: '-'       },
]

export const calcStats = (stations) => {
  return AQI_LEGEND.map(level => {
    const count = stations.filter(s => {
      const v = Number(s.aqi)
      if (level.label === 'ไม่มีข้อมูล') return !v || v < 0
      if (level.label === 'ดีมาก')        return v > 0  && v <= 25
      if (level.label === 'ดี')            return v > 25 && v <= 50
      if (level.label === 'ปานกลาง')      return v > 50 && v <= 100
      if (level.label === 'มีผลต่อสุขภาพ') return v > 100 && v <= 200
      if (level.label === 'อันตราย')       return v > 200
      return false
    }).length
    return { ...level, count }
  })
}