import { useContext } from 'react'

import { AuthContext } from './AuthContext.js'

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return value
}
