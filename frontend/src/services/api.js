import axios from 'axios'

// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we're running on localhost or production
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname === '')
  
  // In production (not localhost), use relative path
  if (!isLocalhost) {
    // If VITE_API_URL is set, use it (for Railway or custom domains)
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL
    }
    // Otherwise use relative path (for Vercel)
    return '/api'
  }
  
  // In development (localhost), use env variable or default localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
}

// Check if we're in demo mode by checking health endpoint
let isDemoMode = null

const checkDemoMode = async () => {
  if (isDemoMode !== null) return isDemoMode
  
  try {
    const apiUrl = getApiUrl()
    const response = await axios.get(`${apiUrl}/health`)
    isDemoMode = response.data.mode === 'demo' || response.data.demo === true
  } catch (error) {
    console.warn('Could not check demo mode:', error)
    isDemoMode = true // Default to demo mode on error
  }
  return isDemoMode
}

// Get base URL with mock endpoints for demo mode
export const getAuthApiUrl = async () => {
  const demo = await checkDemoMode()
  const baseUrl = getApiUrl()
  
  // Use mock auth endpoints when in demo mode
  return demo ? `${baseUrl}/auth/mock` : `${baseUrl}/auth`
}

// Create axios instance with dynamic baseURL
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to set baseURL and auth token
api.interceptors.request.use(
  (config) => {
    // Set baseURL dynamically based on current environment
    config.baseURL = getApiUrl()
    
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Network error detected:', error.message)
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
