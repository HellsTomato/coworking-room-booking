export const SESSION_STORAGE_KEY = 'coworking.session'

export function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeSession(session) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function getToken() {
  return readSession()?.token ?? null
}
