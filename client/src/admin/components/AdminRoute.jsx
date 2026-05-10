import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'

// Protects all /admin/* routes — redirects to /admin/login if not authenticated
export default function AdminRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  return children
}
