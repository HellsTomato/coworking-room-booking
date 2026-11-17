import { toApiError } from './errors.js'
import { http } from './http.js'

function compactParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

function asList(data) {
  if (Array.isArray(data)) {
    return data
  }
  return Array.isArray(data?.content) ? data.content : []
}

export async function listRooms(filters = {}) {
  try {
    const { data } = await http.get('/rooms', { params: compactParams(filters) })
    return asList(data)
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getRoom(roomId) {
  try {
    const { data } = await http.get(`/rooms/${roomId}`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createRoom(payload) {
  try {
    const { data } = await http.post('/admin/rooms', payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateRoom(roomId, payload) {
  try {
    const { data } = await http.put(`/admin/rooms/${roomId}`, payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function archiveRoom(roomId) {
  try {
    const { data } = await http.patch(`/admin/rooms/${roomId}/archive`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
