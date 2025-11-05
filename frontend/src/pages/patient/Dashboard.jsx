import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useAppointments, useNotifications, useMedicines } from '../../hooks'
import { Calendar, Clock, Activity, TrendingUp, AlertCircle, CheckCircle, Package, MessageCircle, Heart, Droplet, Zap, Moon, Target, Award, Bell, ArrowUp, ArrowDown, Minus, Users, Stethoscope, MapPin, Phone, User } from 'lucide-react'
import { format, isToday, isTomorrow, addDays, differenceInHours, differenceInMinutes } from 'date-fns'
import realtimeService from '../../services/realtime'
import toast from 'react-hot-toast'

const PatientDashboard = () => {
  const { user } = useAuthContext()
  
  // Safe hook calls with error handling
  const { data: appointmentsData, refetch: refetchAppointments } = useAppointments() || { data: null, refetch: () => {} }
  const { data: notificationsData, refetch: refetchNotifications } = useNotifications() || { data: null, refetch: () => {} }
  const { data: medicinesData, refetch: refetchMedicines } = useMedicines() || { data: null, refetch: () => {} }
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [liveStats, setLiveStats] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    temperature: 98.6,
    oxygenLevel: 98,
    steps: 8542,
    calories: 2100,
    sleepHours: 7.5,
    waterIntake: 6
  })
  const [realtimeUpdates, setRealtimeUpdates] = useState([])

  const [mergedAppointments, setMergedAppointments] = useState([])

  const appointments = appointmentsData?.data?.appointments || []
  const notifications = notificationsData?.data?.notifications || []
  const medicines = medicinesData?.data?.medicines || []

  // Merge local storage appointments with API appointments
  useEffect(() => {
    const mergeAppointments = () => {
      try {
        // Load from local storage
        const localAppointments = JSON.parse(localStorage.getItem('localAppointments') || '[]')
        
        // Helper function to normalize date for comparison
        const normalizeDate = (date) => {
          if (!date) return ''
          try {
            const d = new Date(date)
            return d.toISOString().split('T')[0] // YYYY-MM-DD
          } catch {
            return String(date).split('T')[0]
          }
        }

        // Create a map of local appointments
        const localAppointmentsMap = new Map()
        localAppointments.forEach(apt => {
          const normalizedDate = normalizeDate(apt.date)
          const patientName = apt.patient?.name || ''
          const time = apt.time || ''
          const key = `${patientName}_${normalizedDate}_${time}`
          if (key) {
            localAppointmentsMap.set(key, apt)
          }
        })

        // Merge API appointments with local data
        const merged = (appointments || []).map(apiApt => {
          const normalizedDate = normalizeDate(apiApt.date)
          const patientName = apiApt.patient?.name || ''
          const time = apiApt.time || ''
          const key = `${patientName}_${normalizedDate}_${time}`
          const localApt = localAppointmentsMap.get(key)
          
          // If local appointment exists, prefer it (has more details)
          return localApt || apiApt
        })

        // Add local-only appointments
        const apiAppointmentKeys = new Set(merged.map(apt => {
          const normalizedDate = normalizeDate(apt.date)
          const patientName = apt.patient?.name || ''
          const time = apt.time || ''
          return `${patientName}_${normalizedDate}_${time}`
        }))

        localAppointments.forEach(localApt => {
          const normalizedDate = normalizeDate(localApt.date)
          const patientName = localApt.patient?.name || ''
          const time = localApt.time || ''
          const key = `${patientName}_${normalizedDate}_${time}`
          
          // Check if this appointment belongs to current user
          const patientId = localApt.patient?._id || localApt.patient?.id
          const userId = user?._id || user?.id
          
          if (key && !apiAppointmentKeys.has(key) && patientId === userId) {
            merged.push(localApt)
          }
        })

        // Only update if appointments actually changed to prevent infinite loops
        setMergedAppointments(prev => {
          const prevStr = JSON.stringify(prev)
          const mergedStr = JSON.stringify(merged)
          return prevStr === mergedStr ? prev : merged
        })
      } catch (error) {
        console.error('Error merging appointments:', error)
        setMergedAppointments(appointments || [])
      }
    }

    mergeAppointments()
  }, [appointments?.length, user?._id || user?.id])

  // Safe data access helpers
  const safeAppointments = Array.isArray(mergedAppointments) ? mergedAppointments : []
  const safeNotifications = Array.isArray(notifications) ? notifications : []
  const safeMedicines = Array.isArray(medicines) ? medicines : []

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Real-time WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && user) {
      realtimeService.connect(token)
      realtimeService.joinUserRoom(user._id)

      // Listen for real-time updates
      realtimeService.onAppointmentUpdate((data) => {
        toast.success('Appointment updated!')
        refetchAppointments()
        addRealtimeUpdate(`Appointment ${data.status}: ${data.doctorName}`)
      })

      realtimeService.onNewNotification((data) => {
        toast.success('New notification!')
        refetchNotifications()
        addRealtimeUpdate(`New notification: ${data.title}`)
      })

      realtimeService.onMedicineUpdate((data) => {
        toast.success('Medicine tracking updated!')
        refetchMedicines()
        addRealtimeUpdate(`Medicine ${data.name} status: ${data.currentStage}`)
      })

      realtimeService.on('connection-status', (status) => {
        if (status.connected) {
          toast.success('Connected to real-time updates')
        } else {
          toast.error('Disconnected from real-time updates')
        }
      })
    }

    return () => {
      realtimeService.cleanup()
    }
  }, [user])

  // Simulate live health metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        heartRate: Math.floor(Math.random() * 20) + 65, // 65-85
        bloodPressure: `${Math.floor(Math.random() * 20) + 110}/${Math.floor(Math.random() * 10) + 70}`,
        temperature: (Math.random() * 2 + 97.5).toFixed(1),
        oxygenLevel: Math.floor(Math.random() * 5) + 95, // 95-100
        steps: prev.steps + Math.floor(Math.random() * 10),
        calories: prev.calories + Math.floor(Math.random() * 5)
      }))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const addRealtimeUpdate = (message) => {
    setRealtimeUpdates(prev => [
      { id: Date.now(), message, timestamp: new Date() },
      ...prev.slice(0, 9) // Keep only last 10 updates
    ])
  }

  // Get today's appointments
  const todaysAppointments = safeAppointments.filter(apt => 
    apt && apt.date && isToday(new Date(apt.date))
  )

  // Get upcoming appointments
  const upcomingAppointments = safeAppointments
    .filter(apt => apt && apt.date && new Date(apt.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)

  // Get urgent notifications
  const urgentNotifications = safeNotifications.filter(notif => 
    notif && (notif.priority === 'urgent' || notif.priority === 'high')
  )

  // Get medicines in transit
  const medicinesInTransit = safeMedicines.filter(med => 
    med && (med.currentStage === 'in-transit' || med.currentStage === 'quality-check')
  )

  const getHealthStatus = (metric, value) => {
    switch (metric) {
      case 'heartRate':
        return value < 60 ? 'low' : value > 100 ? 'high' : 'normal'
      case 'bloodPressure':
        const [systolic] = value.split('/')
        return parseInt(systolic) < 90 ? 'low' : parseInt(systolic) > 140 ? 'high' : 'normal'
      case 'temperature':
        return parseFloat(value) < 97 ? 'low' : parseFloat(value) > 99.5 ? 'high' : 'normal'
      case 'oxygenLevel':
        return value < 95 ? 'low' : 'normal'
      default:
        return 'normal'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return 'text-red-600'
      case 'high': return 'text-red-600'
      case 'normal': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'low': return <ArrowDown className="w-4 h-4" />
      case 'high': return <ArrowUp className="w-4 h-4" />
      case 'normal': return <CheckCircle className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              {format(currentTime, 'EEEE, MMMM do, yyyy')} • {format(currentTime, 'h:mm:ss a')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/app/profile"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Link
                to="/app/book-appointment"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Updates */}
      {realtimeUpdates.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Live Updates
          </h3>
          <div className="space-y-1">
            {realtimeUpdates.slice(0, 3).map((update) => (
              <div key={update.id} className="text-sm text-blue-700 flex items-center justify-between">
                <span>{update.message}</span>
                <span className="text-xs text-blue-500">
                  {format(update.timestamp, 'h:mm:ss a')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Heart Rate</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.heartRate} BPM</p>
            </div>
            <div className={`p-3 rounded-full ${getHealthStatus('heartRate', liveStats.heartRate) === 'normal' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Heart className={`w-6 h-6 ${getStatusColor(getHealthStatus('heartRate', liveStats.heartRate))}`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {getStatusIcon(getHealthStatus('heartRate', liveStats.heartRate))}
            <span className={`text-sm ml-1 ${getStatusColor(getHealthStatus('heartRate', liveStats.heartRate))}`}>
              {getHealthStatus('heartRate', liveStats.heartRate)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.bloodPressure}</p>
            </div>
            <div className={`p-3 rounded-full ${getHealthStatus('bloodPressure', liveStats.bloodPressure) === 'normal' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Droplet className={`w-6 h-6 ${getStatusColor(getHealthStatus('bloodPressure', liveStats.bloodPressure))}`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {getStatusIcon(getHealthStatus('bloodPressure', liveStats.bloodPressure))}
            <span className={`text-sm ml-1 ${getStatusColor(getHealthStatus('bloodPressure', liveStats.bloodPressure))}`}>
              {getHealthStatus('bloodPressure', liveStats.bloodPressure)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Temperature</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.temperature}°F</p>
            </div>
            <div className={`p-3 rounded-full ${getHealthStatus('temperature', liveStats.temperature) === 'normal' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Zap className={`w-6 h-6 ${getStatusColor(getHealthStatus('temperature', liveStats.temperature))}`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {getStatusIcon(getHealthStatus('temperature', liveStats.temperature))}
            <span className={`text-sm ml-1 ${getStatusColor(getHealthStatus('temperature', liveStats.temperature))}`}>
              {getHealthStatus('temperature', liveStats.temperature)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Oxygen Level</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.oxygenLevel}%</p>
            </div>
            <div className={`p-3 rounded-full ${getHealthStatus('oxygenLevel', liveStats.oxygenLevel) === 'normal' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Target className={`w-6 h-6 ${getStatusColor(getHealthStatus('oxygenLevel', liveStats.oxygenLevel))}`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {getStatusIcon(getHealthStatus('oxygenLevel', liveStats.oxygenLevel))}
            <span className={`text-sm ml-1 ${getStatusColor(getHealthStatus('oxygenLevel', liveStats.oxygenLevel))}`}>
              {getHealthStatus('oxygenLevel', liveStats.oxygenLevel)}
            </span>
          </div>
        </div>
      </div>

      {/* Today's Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              Today's Schedule
            </h2>
            <Link to="/app/my-appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {todaysAppointments.length > 0 ? (
            <div className="space-y-4">
              {todaysAppointments.map((appointment, index) => (
                <div key={appointment._id || appointment.id || `today-apt-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.doctor?.name || 'Dr. Name'}</h3>
                      <p className="text-sm text-gray-600">{appointment.doctor?.specialization || 'Specialist'}</p>
                      <p className="text-sm text-gray-500">{appointment.symptoms}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{appointment.time}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments scheduled for today</p>
              <Link to="/app/book-appointment" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Book an appointment
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/app/book-appointment"
              className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Book Appointment</span>
            </Link>
            <Link
              to="/app/supply-chain"
              className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Package className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Track Medicine</span>
            </Link>
            <Link
              to="/app/my-appointments"
              className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-purple-800 font-medium">View Appointments</span>
            </Link>
            <Link
              to="/app/profile"
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-800 font-medium">Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-green-600" />
            Upcoming Appointments
          </h2>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={appointment._id || appointment.id || `upcoming-apt-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.doctor?.name || 'Dr. Name'}</h3>
                      <p className="text-sm text-gray-600">{format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming appointments</p>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-orange-600" />
            Recent Notifications
          </h2>
          
          {safeNotifications.length > 0 ? (
            <div className="space-y-4">
              {safeNotifications.slice(0, 5).map((notification) => (
                <div key={notification._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.priority === 'urgent' ? 'bg-red-500' :
                    notification.priority === 'high' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{format(new Date(notification.createdAt), 'MMM dd, h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard