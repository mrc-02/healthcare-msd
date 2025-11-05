import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useAppointments, useNotifications, useUsers } from '../../hooks'
import { Calendar, Clock, Users, DollarSign, TrendingUp, Video, FileText, Stethoscope, Activity, Bell, CheckCircle, AlertCircle, User, Phone, MapPin, Star, Eye, Heart, Zap, Target, Award, ArrowUp, ArrowDown, Minus, MessageCircle } from 'lucide-react'
import { format, isToday, isTomorrow, addDays, differenceInHours, differenceInMinutes, startOfDay, endOfDay } from 'date-fns'
import realtimeService from '../../services/realtime'
import toast from 'react-hot-toast'

const DoctorDashboard = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const { data: appointmentsData, refetch: refetchAppointments } = useAppointments()
  const { data: notificationsData, refetch: refetchNotifications } = useNotifications()
  const { data: patientsData, refetch: refetchPatients } = useUsers({ role: 'patient' })
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [liveStats, setLiveStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    monthlyEarnings: 0,
    averageRating: 4.8,
    responseTime: '2.5 min',
    patientSatisfaction: 96
  })
  const [realtimeUpdates, setRealtimeUpdates] = useState([])
  const [livePatientMetrics, setLivePatientMetrics] = useState({
    activePatients: 0,
    newPatients: 0,
    followUpRequired: 0,
    emergencyCases: 0
  })
  const appointments = appointmentsData?.data?.appointments || []
  const notifications = notificationsData?.data?.notifications || []
  const patients = patientsData?.data?.users || []

  // Debug logging
  console.log('Appointments Data:', appointmentsData)
  console.log('Appointments Array:', appointments)
  console.log('Appointments Length:', appointments.length)

  // Listen for new appointments
  useEffect(() => {
    const handleAppointmentAdded = () => {
      console.log('New appointment added, refetching appointments...')
      refetchAppointments()
    }

    window.addEventListener('appointmentAdded', handleAppointmentAdded)
    return () => window.removeEventListener('appointmentAdded', handleAppointmentAdded)
  }, [refetchAppointments])

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Real-time WebSocket connection for doctors
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && user) {
      realtimeService.connect(token)
      realtimeService.joinDoctorRoom(user._id)

      // Listen for real-time updates
      realtimeService.onAppointmentUpdate((data) => {
        if (data.doctorId === user._id) {
          toast.success('New appointment update!')
          refetchAppointments()
          addRealtimeUpdate(`Appointment ${data.status}: ${data.patientName}`)
        }
      })

      realtimeService.onNewNotification((data) => {
        if (data.userId === user._id) {
          toast.success('New notification!')
          refetchNotifications()
          addRealtimeUpdate(`New notification: ${data.title}`)
        }
      })

      realtimeService.on('patient-registered', (data) => {
        toast.info('New patient registered!')
        refetchPatients()
        addRealtimeUpdate(`New patient: ${data.patientName}`)
      })

      realtimeService.on('appointment-cancelled', (data) => {
        if (data.doctorId === user._id) {
          toast.warning('Appointment cancelled!')
          refetchAppointments()
          addRealtimeUpdate(`Appointment cancelled: ${data.patientName}`)
        }
      })

      realtimeService.on('emergency-alert', (data) => {
        if (data.doctorId === user._id) {
          toast.error('Emergency alert!')
          addRealtimeUpdate(`Emergency: ${data.patientName} - ${data.symptoms}`)
        }
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

  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        totalPatients: patients.length + Math.floor(Math.random() * 5),
        todayAppointments: appointments.filter(apt => isToday(new Date(apt.date))).length,
        pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        monthlyEarnings: prev.monthlyEarnings + Math.floor(Math.random() * 1000),
        responseTime: `${(Math.random() * 2 + 1).toFixed(1)} min`,
        patientSatisfaction: Math.floor(Math.random() * 5) + 94
      }))

      setLivePatientMetrics(prev => ({
        ...prev,
        activePatients: Math.floor(Math.random() * 10) + 15,
        newPatients: Math.floor(Math.random() * 3) + 2,
        followUpRequired: Math.floor(Math.random() * 5) + 3,
        emergencyCases: Math.floor(Math.random() * 2)
      }))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [appointments, patients])

  const addRealtimeUpdate = (message) => {
    setRealtimeUpdates(prev => [
      { id: Date.now(), message, timestamp: new Date() },
      ...prev.slice(0, 9)
    ])
  }

  const handleOpenChat = (appointmentId) => {
    navigate(`/app/doctor/chat?appointmentId=${appointmentId}`)
  }

  // Get today's appointments
  const todaysAppointments = appointments.filter(apt => 
    isToday(new Date(apt.date))
  ).sort((a, b) => new Date(a.time) - new Date(b.time))

  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

  // Get urgent appointments
  const urgentAppointments = appointments.filter(apt => 
    apt.urgency === 'urgent' || apt.urgency === 'high'
  )

  // Get recent patients
  const recentPatients = patients
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Get appointment statistics
  const appointmentStats = {
    total: appointments.length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, Dr. {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              {format(currentTime, 'EEEE, MMMM do, yyyy')} • {format(currentTime, 'h:mm:ss a')}
            </p>
            <p className="text-blue-600 font-medium">{user?.specialization}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/app/doctor/profile"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Link
                to="/app/doctor/appointments"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>View All Appointments</span>
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

      {/* Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.totalPatients}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 ml-1">+{livePatientMetrics.newPatients} this week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.todayAppointments}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-600 ml-1">Next: {todaysAppointments[0]?.time || 'None'}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.pendingAppointments}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Eye className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-600 ml-1">Requires attention</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{liveStats.monthlyEarnings.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 ml-1">+15% from last month</span>
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
            <Link to="/app/doctor/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {todaysAppointments.length > 0 ? (
            <div className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.patient?.name || 'Patient Name'}</h3>
                      <p className="text-sm text-gray-600">{appointment.patient?.email || 'No email provided'}</p>
                      <p className="text-sm text-gray-600">{appointment.reason || appointment.symptoms || 'No reason specified'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span key="urgency" className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(appointment.urgency)}`}>
                          {appointment.urgency || 'normal'}
                        </span>
                        <span key="status" className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{appointment.time}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button key="start-btn" className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                        Start
                      </button>
                      <button 
                        key="message-btn"
                        onClick={() => handleOpenChat(appointment._id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments scheduled for today</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/app/doctor/appointments"
              className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">View Appointments</span>
            </Link>
            <Link
              to="/app/doctor/patients"
              className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Manage Patients</span>
            </Link>
            <Link
              to="/app/doctor/profile"
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-800 font-medium">Edit Profile</span>
            </Link>
            <button className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors w-full">
              <Video className="w-5 h-5 text-purple-600" />
              <span className="text-purple-800 font-medium">Start Consultation</span>
            </button>
            <button className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors w-full">
              <FileText className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800 font-medium">Write Prescription</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-green-600" />
            Upcoming Appointments
          </h2>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.patient?.name || 'Patient Name'}</h3>
                      <p className="text-sm text-gray-600">{format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}</p>
                      <p className="text-sm text-gray-500">{appointment.reason || appointment.symptoms || 'No reason specified'}</p>
                      {appointment.patient?.phone && (
                        <p className="text-sm text-gray-500">Phone: {appointment.patient.phone}</p>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
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

        {/* Recent Patients */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-purple-600" />
            Recent Patients
          </h2>
          
          {recentPatients.length > 0 ? (
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined: {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                      View
                    </button>
                    <button 
                      onClick={() => navigate('/app/doctor/chat')}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent patients</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Patient Metrics */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-indigo-600" />
          Live Patient Metrics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{livePatientMetrics.activePatients}</h3>
            <p className="text-gray-600">Active Patients</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{livePatientMetrics.newPatients}</h3>
            <p className="text-gray-600">New This Week</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{livePatientMetrics.followUpRequired}</h3>
            <p className="text-gray-600">Follow-up Required</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{livePatientMetrics.emergencyCases}</h3>
            <p className="text-gray-600">Emergency Cases</p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard