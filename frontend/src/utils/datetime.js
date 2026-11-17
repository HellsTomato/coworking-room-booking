const pad = (value) => String(value).padStart(2, '0')

export function offsetSuffix(date = new Date(), time = '00:00') {
  const base = date instanceof Date ? date : new Date(`${date}T${time}:00`)
  const safeDate = Number.isNaN(base.getTime()) ? new Date() : base
  const minutes = -safeDate.getTimezoneOffset()
  const sign = minutes >= 0 ? '+' : '-'
  const absolute = Math.abs(minutes)
  return `${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`
}

export function toOffsetTime(date, time) {
  if (!time) {
    return ''
  }
  return `${time}:00${offsetSuffix(date, time)}`
}

export function toOffsetDateTime(date, time) {
  if (!date || !time) {
    return ''
  }
  return `${date}T${time}:00${offsetSuffix(date, time)}`
}

export function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function formatDate(value) {
  if (!value) {
    return ''
  }
  const [year, month, day] = String(value).split('-')
  return year && month && day ? `${day}.${month}.${year}` : value
}

export function formatTimeRange(timeFrom, timeTo) {
  const from = (timeFrom || '').slice(0, 5)
  const to = (timeTo || '').slice(0, 5)
  return from && to ? `${from}–${to}` : ''
}
