import { useCallback, useMemo, useState } from 'react'

import { login as loginRequest, registerAccount } from '../api/auth.js'
import { ApiError } from '../api/errors.js'
import { AuthContext } from './AuthContext.js'
import { clearSession, readSession, writeSession } from './tokenStorage.js'

function extractToken(data) {
  return data?.token || data?.accessToken || data?.jwt || ''
}

function extractUser(data, fallbackEmail) {
  const user = data?.user ?? data?.profile ?? {}
  return {
    userId: user.userId ?? user.id ?? null,
    email: user.email ?? fallbackEmail ?? '',
    fullName: user.fullName ?? user.displayName ?? user.email ?? fallbackEmail ?? '',
    role: user.role ?? data?.role ?? 'EMPLOYEE',
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())

  const applySession = useCallback((data, email) => {
    const token = extractToken(data)
    if (!token) {
      throw new ApiError({
        status: 500,
        code: 'AUTH_RESPONSE_ERROR',
        message: 'Сервер не вернул токен доступа. Проверьте контракт входа.',
      })
    }
    const nextSession = { token, user: extractUser(data, email) }
    writeSession(nextSession)
    setSession(nextSession)
    return nextSession.user
  }, [])

  const login = useCallback(
    async (credentials) => {
      const data = await loginRequest(credentials)
      return applySession(data, credentials.email)
    },
    [applySession],
  )

  const register = useCallback(
    async (payload) => {
      const data = await registerAccount(payload)
      if (!extractToken(data)) {
        return null
      }
      return applySession(data, payload.email)
    },
    [applySession],
  )

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      isAdmin: session?.user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
