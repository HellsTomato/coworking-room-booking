export function equipmentList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }
  if (!value) {
    return []
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function roomName(room) {
  return room?.name || room?.title || `Комната #${room?.id ?? '—'}`
}

export function bookingRoomName(booking, roomsById = {}) {
  return booking?.roomName || roomsById[booking?.roomId]?.name || `Комната #${booking?.roomId ?? '—'}`
}
