import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useAppointments, useUpdateAppointment } from '../../hooks'
import { Calendar, Clock, User, Phone, MapPin, Stethoscope, CheckCircle, XCircle, AlertCircle, Eye, MessageCircle, Filter, Search, RefreshCw, X, Mail, Calendar as CalendarIcon, Droplet, UserCircle, AlertTriangle } from 'lucide-react'
import { format, isToday, isTomorrow, addDays, differenceInHours, differenceInMinutes } from 'date-fns'
import realtimeService from '../../services/realtime'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DoctorAppointments = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const { data: appointmentsData, refetch: refetchAppointments } = useAppointments()
  const updateAppointmentMutation = useUpdateAppointment()
  
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [realtimeUpdates, setRealtimeUpdates] = useState([])
  const [showPatientDetails, setShowPatientDetails] = useState(false)
  const [selectedPatientAppointment, setSelectedPatientAppointment] = useState(null)

  const allAppointments = appointmentsData?.data?.appointments || []

  // Merge local appointments with API appointments to get complete patient details
  useEffect(() => {
    const mergeAppointmentsWithLocalData = () => {
      try {
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
        
        // Create a map of appointments by key (patient name + date + time) for easy lookup
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
        const mergedAppointments = allAppointments.map(apiApt => {
          // Try to find matching local appointment
          const normalizedDate = normalizeDate(apiApt.date)
          const patientName = apiApt.patient?.name || ''
          const time = apiApt.time || ''
          const key = `${patientName}_${normalizedDate}_${time}`
          const localApt = localAppointmentsMap.get(key)
          
          if (localApt && localApt.patient) {
            // Merge patient data, prefer local data if it exists (local has more details)
            return {
              ...apiApt,
              patient: {
                ...apiApt.patient,
                // Override with local patient details if they exist
                name: localApt.patient.name || apiApt.patient.name,
                phone: localApt.patient.phone || apiApt.patient.phone,
                email: localApt.patient.email || apiApt.patient.email,
                address: localApt.patient.address || apiApt.patient.address,
                age: localApt.patient.age || apiApt.patient.age,
                gender: localApt.patient.gender || apiApt.patient.gender,
                bloodGroup: localApt.patient.bloodGroup || apiApt.patient.bloodGroup,
                medicalHistory: localApt.patient.medicalHistory || apiApt.patient.medicalHistory,
                emergencyContactName: localApt.patient.emergencyContactName || apiApt.patient.emergencyContactName,
                emergencyContactPhone: localApt.patient.emergencyContactPhone || apiApt.patient.emergencyContactPhone
              }
            }
          }
          return apiApt
        })
        
        // Also add local-only appointments (those not in API)
        const apiAppointmentKeys = new Set(mergedAppointments.map(apt => {
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
          
          if (key && !apiAppointmentKeys.has(key)) {
            // Check if it's for this doctor
            const doctorId = localApt.doctor?._id || localApt.doctor?.id
            const userId = user?._id || user?.id
            if (doctorId === userId || localApt.doctor?.name) {
              mergedAppointments.push(localApt)
            }
          }
        })
        
        setAppointments(mergedAppointments)
      } catch (error) {
        console.error('Error merging local appointments:', error)
        setAppointments(allAppointments)
      }
    }

    mergeAppointmentsWithLocalData()
  }, [allAppointments, user])

  // Real-time updates
  useEffect(() => {
    if (user) {
      realtimeService.onAppointmentUpdate((data) => {
        if (data.doctorId === user._id) {
          toast.success('Appointment updated!')
          refetchAppointments()
          addRealtimeUpdate(`Appointment ${data.status}: ${data.patientName}`)
        }
      })

      realtimeService.on('appointment-booked', (data) => {
        if (data.doctorId === user._id) {
          toast.info('New appointment booked!')
          refetchAppointments()
          addRealtimeUpdate(`New appointment: ${data.patientName} at ${data.time}`)
        }
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
    }

    return () => {
      realtimeService.cleanup()
    }
  }, [user])

  // Filter appointments
  useEffect(() => {
    let filtered = allAppointments

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const patientName = apt.patient?.name?.toLowerCase() || ''
        const symptoms = Array.isArray(apt.symptoms) 
          ? apt.symptoms.map(symptom => 
              typeof symptom === 'object' ? symptom.name : symptom
            ).join(' ').toLowerCase()
          : (apt.symptoms || '').toLowerCase()
        
        return patientName.includes(searchTerm.toLowerCase()) ||
               symptoms.includes(searchTerm.toLowerCase())
      })
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Filter by urgency
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(apt => apt.urgency === urgencyFilter)
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const today = new Date()
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date)
        switch (dateFilter) {
          case 'today':
            return isToday(aptDate)
          case 'tomorrow':
            return isTomorrow(aptDate)
          case 'this-week':
            return aptDate >= today && aptDate <= addDays(today, 7)
          case 'this-month':
            return aptDate >= today && aptDate <= addDays(today, 30)
          default:
            return true
        }
      })
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateA - dateB
    })

    setFilteredAppointments(filtered)
  }, [appointments, searchTerm, statusFilter, urgencyFilter, dateFilter])

  const addRealtimeUpdate = (message) => {
    setRealtimeUpdates(prev => [
      { id: Date.now(), message, timestamp: new Date() },
      ...prev.slice(0, 9)
    ])
  }

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setIsUpdating(true)
    try {
      await updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        status: newStatus
      })

      // Send real-time update
      realtimeService.sendAppointmentUpdate({
        appointmentId,
        status: newStatus,
        doctorId: user._id,
        doctorName: user.name
      })

      toast.success(`Appointment ${newStatus} successfully!`)
      refetchAppointments()
    } catch (error) {
      toast.error('Failed to update appointment status')
    } finally {
      setIsUpdating(false)
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
        <p className="text-gray-600 mt-2">Manage and track all your patient appointments</p>
      </div>

      {/* Real-time Updates */}
      {realtimeUpdates.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
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

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients or symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Urgency</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Appointments ({filteredAppointments.length})
            </h2>
            <button
              onClick={() => refetchAppointments()}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment, index) => (
              <div key={appointment._id || appointment.id || `appointment-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patient?.name || 'Patient Name'}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{appointment.status}</span>
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(appointment.urgency)}`}>
                          {appointment.urgency}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            {format(new Date(appointment.date), 'EEEE, MMMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">
                            <Clock className="w-4 h-4 inline mr-2" />
                            {appointment.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <Phone className="w-4 h-4 inline mr-2" />
                            {appointment.patient?.phone || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            {appointment.patient?.address || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Symptoms:</p>
                        <p className="text-sm text-gray-600">
                          {Array.isArray(appointment.symptoms) 
                            ? appointment.symptoms.map((symptom, index) => 
                                typeof symptom === 'object' ? symptom.name : symptom
                              ).join(', ')
                            : appointment.symptoms || 'No symptoms provided'
                          }
                        </p>
                      </div>

                      {appointment.notes && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors flex items-center space-x-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                          disabled={isUpdating}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>

                    {/* Additional Actions */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedPatientAppointment(appointment)
                          setShowPatientDetails(true)
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => {
                          const appointmentId = appointment._id || appointment.id
                          if (appointmentId) {
                            navigate(`/app/doctor/chat?appointmentId=${appointmentId}`)
                          } else {
                            toast.error('Unable to open chat. Please try again.')
                          }
                        }}
                        className="px-3 py-1 bg-blue-200 text-blue-700 text-xs rounded-lg hover:bg-blue-300 transition-colors flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more appointments.'
                  : 'You don\'t have any appointments scheduled yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {showPatientDetails && selectedPatientAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
              <button
                onClick={() => {
                  setShowPatientDetails(false)
                  setSelectedPatientAppointment(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="flex items-start space-x-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedPatientAppointment.patient?.name || 
                     selectedPatientAppointment.patientName || 
                     (selectedPatientAppointment.patient?.firstName && selectedPatientAppointment.patient?.lastName 
                       ? `${selectedPatientAppointment.patient.firstName} ${selectedPatientAppointment.patient.lastName}`
                       : 'Patient Name')}
                  </h3>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPatientAppointment.status)}`}>
                      {getStatusIcon(selectedPatientAppointment.status)}
                      <span className="ml-1">{selectedPatientAppointment.status}</span>
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(selectedPatientAppointment.urgency)}`}>
                      {selectedPatientAppointment.urgency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPatientAppointment.patient?.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPatientAppointment.patient?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPatientAppointment.patient?.address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  {selectedPatientAppointment.patient?.age && (
                    <div className="flex items-start space-x-3">
                      <UserCircle className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPatientAppointment.patient.age} years
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedPatientAppointment.patient?.gender && (
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {selectedPatientAppointment.patient.gender}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedPatientAppointment.patient?.bloodGroup && (
                    <div className="flex items-start space-x-3">
                      <Droplet className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Blood Group</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPatientAppointment.patient.bloodGroup}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {(selectedPatientAppointment.patient?.emergencyContactName || selectedPatientAppointment.patient?.emergencyContactPhone) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPatientAppointment.patient.emergencyContactName && (
                      <div className="flex items-start space-x-3">
                        <UserCircle className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Contact Name</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedPatientAppointment.patient.emergencyContactName}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedPatientAppointment.patient.emergencyContactPhone && (
                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Contact Phone</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedPatientAppointment.patient.emergencyContactPhone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical History */}
              {selectedPatientAppointment.patient?.medicalHistory && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Medical History</h4>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedPatientAppointment.patient.medicalHistory}
                    </p>
                  </div>
                </div>
              )}

              {/* Appointment Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(selectedPatientAppointment.date), 'EEEE, MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPatientAppointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPatientAppointment.duration || 30} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Symptoms</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {Array.isArray(selectedPatientAppointment.symptoms) 
                      ? selectedPatientAppointment.symptoms.map((symptom, index) => 
                          typeof symptom === 'object' ? symptom.name : symptom
                        ).join(', ')
                      : selectedPatientAppointment.symptoms || 'No symptoms provided'}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedPatientAppointment.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedPatientAppointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              {selectedPatientAppointment.diagnosis && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Diagnosis</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedPatientAppointment.diagnosis}</p>
                  </div>
                </div>
              )}

              {/* Prescription */}
              {selectedPatientAppointment.prescription && selectedPatientAppointment.prescription.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Prescription</h4>
                  <div className="bg-green-50 rounded-lg p-4 space-y-2">
                    {selectedPatientAppointment.prescription.map((prescription, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-3">
                        <p className="text-sm font-medium text-gray-900">{prescription.medicine}</p>
                        <p className="text-xs text-gray-600">Dosage: {prescription.dosage}</p>
                        <p className="text-xs text-gray-600">Frequency: {prescription.frequency}</p>
                        {prescription.instructions && (
                          <p className="text-xs text-gray-600">Instructions: {prescription.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPatientDetails(false)
                  setSelectedPatientAppointment(null)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const appointmentId = selectedPatientAppointment._id || selectedPatientAppointment.id
                  if (appointmentId) {
                    navigate(`/app/doctor/chat?appointmentId=${appointmentId}`)
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Patient</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointments