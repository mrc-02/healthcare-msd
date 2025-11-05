export const tokenUtils = {
  setToken: (token) => {
    localStorage.setItem('token', token)
  },

  getToken: () => {
    return localStorage.getItem('token')
  },

  removeToken: () => {
    localStorage.removeItem('token')
  },

  isTokenExpired: (token) => {
    if (!token) return true
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }
}

export const userUtils = {
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
  },

  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  removeUser: () => {
    localStorage.removeItem('user')
  },

  isAuthenticated: () => {
    const token = tokenUtils.getToken()
    const user = userUtils.getUser()
    return token && user && !tokenUtils.isTokenExpired(token)
  },

  logout: () => {
    tokenUtils.removeToken()
    userUtils.removeUser()
  }
}

// Date formatting
export const dateUtils = {
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  formatTime: (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  },

  formatDateTime: (date, time) => {
    const dateStr = dateUtils.formatDate(date)
    const timeStr = dateUtils.formatTime(time)
    return `${dateStr} at ${timeStr}`
  },

  isPastDate: (date) => {
    return new Date(date) < new Date()
  },

  isToday: (date) => {
    const today = new Date()
    const checkDate = new Date(date)
    return checkDate.toDateString() === today.toDateString()
  },

  addDays: (date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },

  getTimeSlots: (startHour = 9, endHour = 17, interval = 30) => {
    const slots = []
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }
}

// Validation utilities
export const validationUtils = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidPhone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  isValidPassword: (password) => {
    return password.length >= 6
  },

  isValidName: (name) => {
    return name.length >= 2 && name.length <= 50
  },

  isValidBatchNumber: (batchNumber) => {
    return batchNumber.length >= 5 && batchNumber.length <= 50
  }
}

// Status utilities
export const statusUtils = {
  getAppointmentStatusColor: (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      'no-show': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  },

  getNotificationTypeColor: (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      appointment: 'bg-purple-100 text-purple-800',
      medicine: 'bg-indigo-100 text-indigo-800',
      system: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  },

  getPriorityColor: (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }
}

// Error handling
export const errorUtils = {
  getErrorMessage: (error) => {
    // Handle network errors
    if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
      return 'Unable to connect to server. Please check your internet connection.'
    }
    
    // Handle API response errors
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    
    // Handle other errors
    if (error.message) {
      return error.message
    }
    
    return 'An unexpected error occurred'
  },

  getValidationErrors: (error) => {
    if (error.response?.data?.errors) {
      return error.response.data.errors
    }
    return []
  },

  isNetworkError: (error) => {
    return error?.code === 'ERR_NETWORK' || error?.message === 'Network Error'
  },

  isOffline: () => {
    return !navigator.onLine
  }
}

// Avatar utilities
export const avatarUtils = {
  generateAvatarUrl: (name, background = '0ea5e9', color = 'fff') => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=${color}`
  },

  getInitials: (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
}

// Pagination utilities
export const paginationUtils = {
  calculatePagination: (page, limit, total) => {
    const totalPages = Math.ceil(total / limit)
    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  }
}

// Local storage utilities
export const storageUtils = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },

  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}
