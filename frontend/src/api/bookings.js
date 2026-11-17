import { toApiError } from './errors.js'
import { http } from './http.js'

export async function createBooking(payload) {
  try {
    const { data } = await http.post('/bookings', payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listMyBookings(scope = 'active') {
  try {
    const { data } = await http.get('/bookings/me', { params: { scope } })
    return Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []
  } catch (error) {
    throw toApiError(error)
  }
}

export async function cancelBooking(bookingId) {
  try {
    const { data } = await http.patch(`/bookings/${bookingId}/cancel`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
