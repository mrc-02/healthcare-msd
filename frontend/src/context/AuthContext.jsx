import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { authService } from '../services'
import toast from 'react-hot-toast'

const AuthContext = createContext(undefined)

export { AuthContext }

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const isLoggingInRef = useRef(false)

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          console.log('AuthContext: Loading user from localStorage:', userData)
          setUser(userData)
          // Small delay to ensure state is set
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error('Error parsing user data:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    // Load immediately on mount
    loadUser()

    // Listen for storage changes (for login from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        loadUser()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = async (credentials) => {
    try {
      isLoggingInRef.current = true
      console.log('Login: Starting login process')
      
      // Demo Doctor Account
      if (credentials.email === 'doctor@demo.com' && credentials.password === 'demo123') {
        const demoUser = {
          _id: 'demo_doctor_1',
          name: 'Dr. Sarah Johnson',
          email: 'doctor@demo.com',
          role: 'doctor',
          specialization: 'Cardiology',
          experience: '10 years',
          location: 'Guntur',
          phone: '+91-863-1234567',
          licenseNumber: 'DOC123456',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
          isDemo: true
        }
        const demoToken = 'demo_doctor_token'
        
        // Set localStorage first
        localStorage.setItem('token', demoToken)
        localStorage.setItem('user', JSON.stringify(demoUser))
        
        // Set state synchronously
        setUser(demoUser)
        
        // Wait for state to propagate and ensure localStorage is set
        await new Promise(resolve => setTimeout(resolve, 300))
        
        isLoggingInRef.current = false
        console.log('Login: User set, isLoggingIn set to false')
        
        toast.success('Demo doctor login successful!')
        return { data: { user: demoUser, token: demoToken } }
      }

      // Demo Patient Account
      if (credentials.email === 'patient@demo.com' && credentials.password === 'demo123') {
        const demoUser = {
          _id: 'demo_patient_1',
          name: 'John Smith',
          email: 'patient@demo.com',
          role: 'patient',
          phone: '+91-863-9876543',
          dateOfBirth: '1990-05-15',
          gender: 'male',
          address: {
            street: '123 Main Street',
            city: 'Guntur',
            state: 'Andhra Pradesh',
            zipCode: '522001',
            country: 'India'
          },
          medicalHistory: [
            {
              condition: 'Hypertension',
              diagnosis: 'High Blood Pressure',
              treatment: 'Medication and lifestyle changes',
              date: '2023-01-15'
            }
          ],
          allergies: ['Penicillin'],
          emergencyContact: {
            name: 'Jane Smith',
            phone: '+91-863-9876544',
            relationship: 'Spouse'
          },
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isDemo: true
        }
        const demoToken = 'demo_patient_token'
        
        localStorage.setItem('token', demoToken)
        localStorage.setItem('user', JSON.stringify(demoUser))
        
        // Set state synchronously
        setUser(demoUser)
        
        // Wait for state to propagate and ensure localStorage is set
        await new Promise(resolve => setTimeout(resolve, 300))
        
        isLoggingInRef.current = false
        console.log('Login: Patient user set, isLoggingIn set to false')
        
        toast.success('Demo patient login successful!')
        return { data: { user: demoUser, token: demoToken } }
      }

      // Demo Admin Account
      if (credentials.email === 'admin@demo.com' && credentials.password === 'demo123') {
        const demoUser = {
          _id: 'demo_admin_1',
          name: 'Admin User',
          email: 'admin@demo.com',
          role: 'admin',
          phone: '+91-863-5555555',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          isDemo: true
        }
        const demoToken = 'demo_admin_token'
        
        localStorage.setItem('token', demoToken)
        localStorage.setItem('user', JSON.stringify(demoUser))
        
        // Set state synchronously
        setUser(demoUser)
        
        // Wait for state to propagate and ensure localStorage is set
        await new Promise(resolve => setTimeout(resolve, 300))
        
        isLoggingInRef.current = false
        console.log('Login: Admin user set, isLoggingIn set to false')
        
        toast.success('Demo admin login successful!')
        return { data: { user: demoUser, token: demoToken } }
      }
      
      

      const response = await authService.login(credentials)
      const { user: userData, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      toast.success('Login successful!')
      return response
    } catch (error) {
      toast.error('Login failed. Please try again.')
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      // authService.register returns the API response body { success, message, data: { user, token } }
      // So we need to access response.data to get { user, token }
      const { user: newUser, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
      
      toast.success('Registration successful!')
      return response
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('Network error, creating local user account')
        
        const localUser = {
          _id: Date.now().toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role,
          specialization: userData.specialization || '',
          experience: userData.experience || '',
          location: userData.location || '',
          phone: userData.phone || '',
          licenseNumber: userData.licenseNumber || '',
          isLocal: true,
          createdAt: new Date().toISOString()
        }
        
        const localToken = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        localStorage.setItem('token', localToken)
        localStorage.setItem('user', JSON.stringify(localUser))
        setUser(localUser)
        
        toast.success('Account created locally! (Will sync when online)')
        return { data: { user: localUser, token: localToken } }
      }
      
      // Handle API validation errors - offer local account creation
      if (error.response?.status === 400 || error.response?.status === 422) {
        console.log('API validation error, offering local account creation')
        
        // Show a toast with option to create local account
        toast.error('API validation failed. You can create a local account instead.', {
          duration: 5000,
          action: {
            label: 'Create Local Account',
            onClick: () => {
              // Create local account
              const localUser = {
                _id: Date.now().toString(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                specialization: userData.specialization || '',
                experience: userData.experience || '',
                location: userData.location || '',
                phone: userData.phone || '',
                licenseNumber: userData.licenseNumber || '',
                isLocal: true,
                createdAt: new Date().toISOString()
              }
              
              const localToken = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              
              localStorage.setItem('token', localToken)
              localStorage.setItem('user', JSON.stringify(localUser))
              setUser(localUser)
              
              toast.success('Local account created!')
              return { data: { user: localUser, token: localToken } }
            }
          }
        })
      }
      
      // Handle other errors
      let errorMessage = 'Registration failed'
      
      if (error.response?.status === 400) {
        // Bad Request - validation error
        errorMessage = error.response?.data?.message || 'Invalid data provided. Please check your information.'
      } else if (error.response?.status === 409) {
        // Conflict - user already exists
        errorMessage = 'An account with this email already exists.'
      } else if (error.response?.status === 422) {
        // Unprocessable Entity - validation error
        errorMessage = error.response?.data?.message || 'Please check all required fields.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(`Registration failed: ${errorMessage}`)
      throw error
    }
  }

  const updateUser = (updatedUserData) => {
    const currentUser = { ...user, ...updatedUserData }
    setUser(currentUser)
    localStorage.setItem('user', JSON.stringify(currentUser))
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully!')
  }

  const value = {
    user,
    loading,
    login,
    register,
    updateUser,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

