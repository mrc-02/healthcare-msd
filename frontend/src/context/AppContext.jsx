import React, { createContext, useContext, useState, useEffect } from 'react'
import { notificationService, appointmentService, medicineService } from '../services'
import realtimeService from '../services/realtime'
import toast from 'react-hot-toast'

const AppContext = createContext(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(false)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [liveUpdates, setLiveUpdates] = useState([])
  const [notifications, setNotifications] = useState([])
  const [appointments, setAppointments] = useState([])
  const [medicines, setMedicines] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const [notificationsRes, appointmentsRes, medicinesRes] = await Promise.all([
            notificationService.getNotifications(),
            appointmentService.getAppointments(),
            medicineService.getMedicines()
          ])
          
          setNotifications(notificationsRes.data?.notifications || [])
          setAppointments(appointmentsRes.data?.appointments || [])
          setMedicines(medicinesRes.data?.medicines || [])
        }
      } catch (error) {
        if (error.code !== 'ERR_NETWORK') {
          console.error('Error loading initial data:', error)
        } else {
          console.log('Network unavailable, using local data only')
        }
        
        try {
          const localAppointments = JSON.parse(localStorage.getItem('localAppointments') || '[]')
          const localNotifications = JSON.parse(localStorage.getItem('localNotifications') || '[]')
          
          if (localAppointments.length > 0) {
            setAppointments(localAppointments)
          }
          if (localNotifications.length > 0) {
            setNotifications(localNotifications)
          }
        } catch (localError) {
          console.log('No local data available')
        }
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        realtimeService.connect(token)
        
        realtimeService.on('connection-status', (status) => {
          setRealtimeConnected(status.connected)
          if (status.connected) {
            toast.success('Connected to real-time updates')
          }
        })

        realtimeService.on('connection-error', (error) => {
          setRealtimeConnected(false)
          console.log('Real-time connection error:', error)
          if (error.code !== 'ERR_NETWORK' && error.message !== 'Network Error') {
            toast.error('Connection error: ' + error.message)
          }
        })
      } catch (error) {
        console.log('Real-time connection failed:', error)
        setRealtimeConnected(false)
      }

      realtimeService.onAppointmentUpdate((data) => {
        addLiveUpdate(`Appointment ${data.status}: ${data.doctorName}`)
        appointmentService.getAppointments().then(res => {
          setAppointments(res.data?.appointments || [])
        }).catch(error => {
          console.log('Error refreshing appointments:', error)
        })
      })

      realtimeService.onNewNotification((data) => {
        addLiveUpdate(`New notification: ${data.title}`)
        // Refresh notifications data
        notificationService.getNotifications().then(res => {
          setNotifications(res.data?.notifications || [])
        }).catch(error => {
          console.log('Error refreshing notifications:', error)
        })
      })

      realtimeService.onMedicineUpdate((data) => {
        addLiveUpdate(`Medicine ${data.name} status: ${data.currentStage}`)
        // Refresh medicines data
        medicineService.getMedicines().then(res => {
          setMedicines(res.data?.medicines || [])
        }).catch(error => {
          console.log('Error refreshing medicines:', error)
        })
      })

      realtimeService.onChatMessage((data) => {
        addLiveUpdate(`New message from ${data.senderName}`)
      })
    }

    return () => {
      realtimeService.cleanup()
    }
  }, [])

  const addLiveUpdate = (message) => {
    setLiveUpdates(prev => [
      { id: Date.now(), message, timestamp: new Date() },
      ...prev.slice(0, 19) // Keep last 20 updates
    ])
  }

  const addNotification = async (notification) => {
    try {
      await notificationService.createNotification(notification)
      // Refresh notifications data
      const res = await notificationService.getNotifications()
      setNotifications(res.data?.notifications || [])
      addLiveUpdate(`Notification added: ${notification.title}`)
    } catch (error) {
      console.error('Error adding notification:', error)
      // If it's a network error, add to local state anyway
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          isLocal: true
        }
        setNotifications(prev => [...prev, newNotification])
        addLiveUpdate(`Notification added locally: ${notification.title}`)
      }
    }
  }

  const markNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      // Refresh notifications data
      const res = await notificationService.getNotifications()
      setNotifications(res.data?.notifications || [])
      addLiveUpdate(`Notification marked as read`)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // If it's a network error, update local state anyway
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setNotifications(prev => prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        ))
        addLiveUpdate(`Notification marked as read locally`)
      }
    }
  }

  const addAppointment = async (appointment) => {
    try {
      await appointmentService.createAppointment(appointment)
      // Refresh appointments data
      const res = await appointmentService.getAppointments()
      setAppointments(res.data?.appointments || [])
      addLiveUpdate(`Appointment added: ${appointment.doctor?.name || appointment.doctorName}`)
    } catch (error) {
      // Only log detailed error for non-network issues
      if (error.code !== 'ERR_NETWORK') {
        console.error('Error adding appointment:', error.message)
      } else {
        console.log('Network unavailable, saving appointment locally')
      }
      
      // Save to local storage as fallback
      const localAppointments = JSON.parse(localStorage.getItem('localAppointments') || '[]')
      const appointmentWithId = {
        ...appointment,
        id: appointment.id || Date.now().toString(),
        createdAt: appointment.createdAt || new Date().toISOString(),
        isLocal: true
      }
      localAppointments.push(appointmentWithId)
      localStorage.setItem('localAppointments', JSON.stringify(localAppointments))
      
      // Update local state
      setAppointments(prev => [...prev, appointmentWithId])
      addLiveUpdate(`Appointment added locally: ${appointment.doctor?.name || appointment.doctorName || 'Unknown Doctor'}`)
      
      // Trigger a custom event to notify components to refetch
      window.dispatchEvent(new CustomEvent('appointmentAdded', { detail: appointmentWithId }))
      
      // Re-throw error so calling component knows it failed
      throw error
    }
  }

  const sendRealtimeUpdate = (type, data) => {
    switch (type) {
      case 'appointment':
        realtimeService.sendAppointmentUpdate(data)
        break
      case 'medicine':
        realtimeService.sendMedicineUpdate(data)
        break
      case 'notification':
        realtimeService.sendNotification(data)
        break
      case 'chat':
        realtimeService.sendChatMessage(data)
        break
      default:
        console.warn('Unknown real-time update type:', type)
    }
  }

  const value = {
    chatOpen,
    setChatOpen,
    notifications,
    addNotification,
    markNotificationRead,
    appointments,
    addAppointment,
    medicines,
    realtimeConnected,
    liveUpdates,
    sendRealtimeUpdate,
    addLiveUpdate
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

