import { toApiError } from './errors.js'
import { http } from './http.js'

export async function listReviews(roomId) {
  try {
    const { data } = await http.get(`/rooms/${roomId}/reviews`)
    return Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createReview(roomId, payload) {
  try {
    const { data } = await http.post(`/rooms/${roomId}/reviews`, payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
