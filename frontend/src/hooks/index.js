import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { authService, userService, appointmentService, medicineService, notificationService } from '../services'
import { errorUtils, storageUtils } from '../utils'
import { demoDataService } from '../services/demoDataService'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      const { user: userData, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      toast.success('Login successful!')
      return response
    } catch (error) {
      toast.error(errorUtils.getErrorMessage(error))
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      const { user: newUser, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
      
      toast.success('Registration successful!')
      return response
    } catch (error) {
      toast.error(errorUtils.getErrorMessage(error))
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully!')
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }
}

// User hooks
export const useUsers = (params = {}) => {
  return useQuery(
    ['users', params],
    async () => {
      try {
        return await userService.getUsers(params)
      } catch (error) {
        // Return empty users on error
        return { data: { users: [] } }
      }
    },
    {
      enabled: !!localStorage.getItem('token'),
      retry: false,
      onError: () => {
        // Silently fail - no toast
      },
      // Provide fallback data for network errors
      placeholderData: () => {
        const cachedUsers = storageUtils.get('cached_users')
        return cachedUsers ? { data: { users: cachedUsers } } : { data: { users: [] } }
      }
    }
  )
}

export const useDoctors = (params = {}) => {
  return useQuery(
    ['doctors', params],
    async () => {
      try {
        return await userService.getDoctors(params)
      } catch (error) {
        if (errorUtils.isNetworkError(error)) {
          console.log('Using demo doctors data due to network error')
          return demoDataService.getDemoDoctors()
        }
        throw error
      }
    },
    {
      enabled: !!localStorage.getItem('token'),
      onError: (error) => {
        // Only show toast for non-network errors
        if (!errorUtils.isNetworkError(error)) {
          toast.error(errorUtils.getErrorMessage(error))
        }
      }
    }
  )
}

export const usePatients = (params = {}) => {
  return useQuery(
    ['patients', params],
    () => userService.getPatients(params),
    {
      enabled: !!localStorage.getItem('token'),
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useUserStats = (userId) => {
  return useQuery(
    ['user-stats', userId],
    () => userService.getUserStats(userId),
    {
      enabled: !!userId && !!localStorage.getItem('token'),
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useUser = (userId) => {
  return useQuery(
    ['user', userId],
    () => userService.getUser(userId),
    {
      enabled: !!userId && !!localStorage.getItem('token'),
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ userId, userData }) => userService.updateUser(userId, userData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['user', variables.userId])
        queryClient.invalidateQueries('users')
        toast.success('User updated successfully!')
      },
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

// Appointment hooks
export const useAppointments = (params = {}) => {
  return useQuery(
    ['appointments', params],
    async () => {
      console.log('Fetching appointments from API...')
      
      try {
        const apiResult = await appointmentService.getAppointments(params)
        console.log('API Appointments Result:', apiResult)
        
        // Also check for local appointments
        const localAppointments = JSON.parse(localStorage.getItem('localAppointments') || '[]')
        console.log('Local Appointments:', localAppointments)
        
        // Merge API and local appointments
        const allAppointments = [
          ...(apiResult.data?.appointments || []),
          ...localAppointments
        ]
        
        // Remove duplicates based on ID
        const uniqueAppointments = allAppointments.filter((appointment, index, self) => 
          index === self.findIndex(a => a.id === appointment.id || a._id === appointment._id)
        )
        
        console.log('Merged Appointments:', uniqueAppointments)
        
        return {
          ...apiResult,
          data: {
            ...apiResult.data,
            appointments: uniqueAppointments
          }
        }
      } catch (error) {
        console.error('Network error fetching appointments, using local data:', error.message)
        
        // If API fails, return local appointments only
        const localAppointments = JSON.parse(localStorage.getItem('localAppointments') || '[]')
        console.log('Using local appointments only:', localAppointments)
        
        // If no local appointments, return empty array (no demo data)
        if (localAppointments.length === 0) {
          console.log('No local appointments found, returning empty array')
          return {
            data: {
              appointments: [],
              total: 0
            },
            isLocal: true,
            isEmpty: true
          }
        }
        
        return {
          data: {
            appointments: localAppointments,
            total: localAppointments.length
          },
          isLocal: true
        }
      }
    },
    {
      enabled: !!localStorage.getItem('token'),
      retry: false, // Don't retry on network errors
      onError: (error) => {
        console.error('Error fetching appointments:', error)
        // Only show toast for non-network errors
        if (error.code !== 'ERR_NETWORK') {
          toast.error(errorUtils.getErrorMessage(error))
        }
      }
    }
  )
}

export const useAppointment = (appointmentId) => {
  return useQuery(
    ['appointment', appointmentId],
    () => appointmentService.getAppointment(appointmentId),
    {
      enabled: !!appointmentId && !!localStorage.getItem('token'),
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (appointmentData) => appointmentService.createAppointment(appointmentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments')
        toast.success('Appointment created successfully!')
      },
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ appointmentId, appointmentData }) => 
      appointmentService.updateAppointment(appointmentId, appointmentData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['appointment', variables.appointmentId])
        queryClient.invalidateQueries('appointments')
        toast.success('Appointment updated successfully!')
      },
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useCancelAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (appointmentId) => appointmentService.cancelAppointment(appointmentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments')
        toast.success('Appointment cancelled successfully!')
      },
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useDoctorAvailability = (doctorId, date) => {
  return useQuery(
    ['doctor-availability', doctorId, date],
    () => appointmentService.getDoctorAvailability(doctorId, date),
    {
      enabled: !!doctorId && !!date && !!localStorage.getItem('token'),
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

// Medicine hooks
export const useMedicines = (params = {}) => {
  return useQuery(
    ['medicines', params],
    async () => {
      try {
        return await medicineService.getMedicines(params)
      } catch (error) {
        // Return empty medicines on error
        return { data: { medicines: [] } }
      }
    },
    {
      enabled: !!localStorage.getItem('token'),
      retry: false,
      onError: () => {
        // Silently fail - no toast
      }
    }
  )
}

export const useMedicine = (medicineId) => {
  return useQuery(
    ['medicine', medicineId],
    () => medicineService.getMedicine(medicineId),
    {
      enabled: !!medicineId && !!localStorage.getItem('token'),
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useCreateMedicine = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (medicineData) => medicineService.createMedicine(medicineData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('medicines')
        toast.success('Medicine created successfully!')
      },
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ medicineId, medicineData }) => 
      medicineService.updateMedicine(medicineId, medicineData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['medicine', variables.medicineId])
        queryClient.invalidateQueries('medicines')
        toast.success('Medicine updated successfully!')
      },
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useTrackMedicine = (batchNumber) => {
  return useQuery(
    ['track-medicine', batchNumber],
    () => medicineService.trackMedicine(batchNumber),
    {
      enabled: !!batchNumber && !!localStorage.getItem('token'),
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

// Notification hooks
export const useNotifications = (params = {}) => {
  return useQuery(
    ['notifications', params],
    async () => {
      try {
        return await notificationService.getNotifications(params)
      } catch (error) {
        // Return empty notifications on error
        return { data: { notifications: [] } }
      }
    },
    {
      enabled: !!localStorage.getItem('token'),
      refetchInterval: false, // Disable auto-refetch
      retry: false,
      onError: () => {
        // Silently fail - no toast
      }
    }
  )
}

export const useUnreadCount = () => {
  return useQuery(
    'unread-count',
    () => notificationService.getUnreadCount(),
    {
      enabled: !!localStorage.getItem('token'),
      refetchInterval: 30000, // Refetch every 30 seconds
      onError: (error) => {
        console.error('Error fetching unread count:', error)
      }
    }
  )
}

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (notificationId) => notificationService.markAsRead(notificationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications')
        queryClient.invalidateQueries('unread-count')
      },
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    () => notificationService.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications')
        queryClient.invalidateQueries('unread-count')
        toast.success('All notifications marked as read!')
      },
      onError: (error) => {
        toast.error(errorUtils.getErrorMessage(error))
      }
    }
  )
}

// Custom hook for form handling
export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
  }

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors
  }
}
