import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from './useAuth.js'

function redirectTarget(location) {
  return { from: `${location.pathname}${location.search}` }
}

export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={redirectTarget(location)} />
  }

  return <Outlet />
}

export function RequireAdmin() {
  const { isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={redirectTarget(location)} />
  }

  if (!isAdmin) {
    return <Navigate to="/rooms" replace state={{ denied: true }} />
  }

  return <Outlet />
}
