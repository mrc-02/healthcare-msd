import { io } from 'socket.io-client'

class RealtimeService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect(token) {
    if (this.socket) {
      this.disconnect()
    }

    // Check if we're running on localhost or production
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname === '')

    // Disable Socket.IO in production (Vercel serverless doesn't support WebSockets)
    if (!isLocalhost || import.meta.env.PROD) {
      if (this.isConnected) {
        this.disconnect()
      }
      this.isConnected = false
      // Silently fail - don't log in production
      if (isLocalhost) {
        console.log('📡 Real-time features disabled (serverless limitation)')
      }
      return
    }

    try {
      // Only use Socket.IO in development
      const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
      
      this.socket = io(apiUrl, {
        auth: {
          token
        },
        transports: ['polling', 'websocket'], // Try polling first, then websocket
        reconnection: true, // Enable reconnection but with limits
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 5000,
        autoConnect: true,
        forceNew: false
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        console.log('✅ Real-time server connected')
        // Emit connection status event
        if (this.listeners.has('connection-status')) {
          this.listeners.get('connection-status').forEach(callback => {
            callback({ connected: true })
          })
        }
      })

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false
        // Emit connection status event
        if (this.listeners.has('connection-status')) {
          this.listeners.get('connection-status').forEach(callback => {
            callback({ connected: false, reason })
          })
        }
        // Only log if not a normal disconnect
        if (reason !== 'io client disconnect' && import.meta.env.DEV) {
          console.log('📡 Real-time server disconnected:', reason)
        }
      })

      this.socket.on('connect_error', (error) => {
        this.isConnected = false
        // Emit connection error event
        if (this.listeners.has('connection-error')) {
          this.listeners.get('connection-error').forEach(callback => {
            callback(error)
          })
        }
        // Suppress error messages in console - Socket.IO will try polling fallback
        // Only show warning in development if connection completely fails
      })

      this.socket.on('reconnect_error', () => {
        // Silently handle reconnect errors - won't spam console
      })

      this.socket.on('reconnect_failed', () => {
        // Silently handle final reconnect failure
        if (import.meta.env.DEV) {
          console.warn('⚠️ Real-time connection unavailable (Socket.IO not configured or server not running)')
        }
      })
    } catch (error) {
      // Silently handle error - backend might not be running
      this.isConnected = false
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Join user-specific rooms
  joinUserRoom(userId) {
    if (this.socket) {
      this.socket.emit('join-user-room', userId)
    }
  }

  joinDoctorRoom(doctorId) {
    if (this.socket) {
      this.socket.emit('join-doctor-room', doctorId)
    }
  }

  joinAdminRoom() {
    if (this.socket) {
      this.socket.emit('join-admin-room')
    }
  }

  // Real-time event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
    
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  // Specific real-time events
  onAppointmentUpdate(callback) {
    this.on('appointment-updated', callback)
  }

  onMedicineUpdate(callback) {
    this.on('medicine-tracked', callback)
  }

  onNewNotification(callback) {
    this.on('new-notification', callback)
  }

  onChatMessage(callback) {
    this.on('chat-message', callback)
  }

  onAnalyticsUpdate(callback) {
    this.on('analytics-updated', callback)
  }

  // Send real-time updates
  sendAppointmentUpdate(data) {
    this.emit('appointment-update', data)
  }

  sendMedicineUpdate(data) {
    this.emit('medicine-update', data)
  }

  sendNotification(data) {
    this.emit('notification-sent', data)
  }

  sendChatMessage(data) {
    this.emit('chat-message', data)
  }

  sendAnalyticsUpdate(data) {
    this.emit('analytics-update', data)
  }

  // Cleanup all listeners
  cleanup() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        if (this.socket) {
          this.socket.off(event, callback)
        }
      })
    })
    this.listeners.clear()
  }
}

// Create singleton instance
const realtimeService = new RealtimeService()

export default realtimeService
