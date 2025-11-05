import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // Give a moment for state to update when loading first starts
    const timer = setTimeout(() => {
      setCheckingAuth(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Show loading while checking authentication
  if (loading || checkingAuth) {
    console.log('ProtectedRoute: Still loading...', { loading, checkingAuth })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user exists in localStorage as fallback
  const checkLocalStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser)
      } catch (e) {
        return null
      }
    }
    return null
  }

  // If no user in state, check localStorage (for initial load issues)
  if (!user) {
    const localStorageUser = checkLocalStorage()
    if (localStorageUser) {
      console.log('ProtectedRoute: User found in localStorage, but not in state. User:', localStorageUser)
      // Still show loading, let the AuthContext update
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }
    
    console.log('ProtectedRoute: No user found in state or localStorage, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute: User is authenticated:', user.name, user.role)
  return children
}

export default ProtectedRoute

