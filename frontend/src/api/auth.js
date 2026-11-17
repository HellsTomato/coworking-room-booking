import { toApiError } from './errors.js'
import { http } from './http.js'

async function post(path, payload) {
  try {
    const { data } = await http.post(path, payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export function login(credentials) {
  return post('/auth/login', credentials)
}

export function registerAccount(payload) {
  return post('/auth/register', payload)
}
