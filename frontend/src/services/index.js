import api from './api.js'

export const authService = {
  register: async (userData) => {
    try {
      console.log('authService.register: Sending registration request with data:', userData)
      const response = await api.post('/auth/register', userData)
      console.log('authService.register: Response received:', response.data)
      return response.data
    } catch (error) {
      console.error('authService.register: Error occurred:', error)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw error
      }
      
      throw error
    }
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data
  }
}

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  // Get all doctors
  getDoctors: async (params = {}) => {
    const response = await api.get('/users/doctors/list', { params })
    return response.data
  },

  // Get all patients (Doctor/Admin only)
  getPatients: async (params = {}) => {
    const response = await api.get('/users/patients/list', { params })
    return response.data
  },

  // Get user by ID
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data
  },

  // Get user statistics
  getUserStats: async (userId) => {
    const response = await api.get(`/users/${userId}/stats`)
    return response.data
  },

  // Get user's appointments
  getUserAppointments: async (userId, params = {}) => {
    const response = await api.get(`/users/${userId}/appointments`, { params })
    return response.data
  },

  // Get user's notifications
  getUserNotifications: async (userId, params = {}) => {
    const response = await api.get(`/users/${userId}/notifications`, { params })
    return response.data
  },

  // Mark notification as read
  markNotificationRead: async (userId, notificationId) => {
    const response = await api.put(`/users/${userId}/notifications/${notificationId}/read`)
    return response.data
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`)
    return response.data
  },

  // Toggle user status (Admin only)
  toggleUserStatus: async (userId) => {
    const response = await api.put(`/users/${userId}/status`)
    return response.data
  }
}

// Appointment Services
export const appointmentService = {
  // Get appointments
  getAppointments: async (params = {}) => {
    const response = await api.get('/appointments', { params })
    return response.data
  },

  // Get appointment by ID
  getAppointment: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`)
    return response.data
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData)
    return response.data
  },

  // Update appointment
  updateAppointment: async (appointmentId, appointmentData) => {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData)
    return response.data
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId) => {
    const response = await api.delete(`/appointments/${appointmentId}`)
    return response.data
  },

  // Get doctor availability
  getDoctorAvailability: async (doctorId, date) => {
    const response = await api.get(`/appointments/doctor/${doctorId}/availability`, {
      params: { date }
    })
    return response.data
  }
}

// Medicine Services
export const medicineService = {
  // Get medicines
  getMedicines: async (params = {}) => {
    const response = await api.get('/medicines', { params })
    return response.data
  },

  // Get medicine by ID
  getMedicine: async (medicineId) => {
    const response = await api.get(`/medicines/${medicineId}`)
    return response.data
  },

  // Create medicine (Admin only)
  createMedicine: async (medicineData) => {
    const response = await api.post('/medicines', medicineData)
    return response.data
  },

  // Update medicine (Admin only)
  updateMedicine: async (medicineId, medicineData) => {
    const response = await api.put(`/medicines/${medicineId}`, medicineData)
    return response.data
  },

  // Delete medicine (Admin only)
  deleteMedicine: async (medicineId) => {
    const response = await api.delete(`/medicines/${medicineId}`)
    return response.data
  },

  // Update medicine stage (Admin only)
  updateMedicineStage: async (medicineId, stageData) => {
    const response = await api.put(`/medicines/${medicineId}/stage`, stageData)
    return response.data
  },

  // Track medicine by batch number
  trackMedicine: async (batchNumber) => {
    const response = await api.get(`/medicines/track/${batchNumber}`)
    return response.data
  },

  // Get expiring medicines (Admin only)
  getExpiringMedicines: async (days = 30) => {
    const response = await api.get('/medicines/expiring', {
      params: { days }
    })
    return response.data
  }
}

// Notification Services
export const notificationService = {
  // Get notifications
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count')
    return response.data
  },

  // Get notification by ID
  getNotification: async (notificationId) => {
    const response = await api.get(`/notifications/${notificationId}`)
    return response.data
  },

  // Create notification (Admin only)
  createNotification: async (notificationData) => {
    const response = await api.post('/notifications', notificationData)
    return response.data
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`)
    return response.data
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read')
    return response.data
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`)
    return response.data
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    const response = await api.delete('/notifications/clear-all')
    return response.data
  }
}
