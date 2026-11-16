import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, isTokenExpired } from '../context/authStore'

// Protects all /admin/* routes — redirects to /admin/login when the session is
// missing or the JWT has expired.
export default function AdminRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const token           = useAuthStore((s) => s.token)
  const logout          = useAuthStore((s) => s.logout)
  const location        = useLocation()

  const expired = isAuthenticated && isTokenExpired(token)

  useEffect(() => {
    if (expired) logout()
  }, [expired, logout])

  if (!isAuthenticated || expired) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  return children
}
