import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = useAuthStore((state) => state.token)
  const isAdmin = useAuthStore.getState().isAdmin()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute

