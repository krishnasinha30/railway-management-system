import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchMe } from '../features/auth/authSlice'
import useAuth from '../hooks/useAuth'
import AccessDeniedPage from '../pages/AccessDeniedPage'

export default function ProtectedRoute({ children, roles = [] }) {
  const dispatch = useDispatch()
  const { isAuthenticated, role, loading } = useAuth()
  const token = localStorage.getItem('rms_token')

  useEffect(() => {
    if (token && !isAuthenticated && !loading) {
      dispatch(fetchMe())
    }
  }, [dispatch, token, isAuthenticated, loading])

  if (token && !isAuthenticated && loading) {
    return <div className="grid min-h-screen place-items-center bg-mist text-plum">Loading your workspace...</div>
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.includes(role)) {
    return <AccessDeniedPage requiredRoles={roles} currentRole={role} />
  }

  return children
}
