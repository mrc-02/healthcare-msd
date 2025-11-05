import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { appointmentService } from '../../services'
import { Calendar, Clock, User, Phone, MapPin, Stethoscope, CheckCircle, XCircle, AlertCircle, Eye, MessageCircle, RefreshCw, X, Mail } from 'lucide-react'
import { format, isToday, isTomorrow, addDays } from 'date-fns'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    loadAppointments()
  }, [user])

  const loadAppointments = async () => {
    try {
      // Load from API
      let apiAppointments = []
      try {
        const response = await appointmentService.getAppointments()
        apiAppointments = response.data?.appointments || []
      } catch (apiError) {
        console.error('API error:', apiError)
        // Continue with local storage if API fails
      }

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
      const mergedAppointments = apiAppointments.map(apiApt => {
        const normalizedDate = normalizeDate(apiApt.date)
        const patientName = apiApt.patient?.name || ''
        const time = apiApt.time || ''
        const key = `${patientName}_${normalizedDate}_${time}`
        const localApt = localAppointmentsMap.get(key)
        
        // If local appointment exists, prefer it (has more details)
        return localApt || apiApt
      })

      // Add local-only appointments (not in API)
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
        
        // Check if this appointment belongs to current user
        const patientId = localApt.patient?._id || localApt.patient?.id
        const userId = user?._id || user?.id
        
        if (key && !apiAppointmentKeys.has(key) && patientId === userId) {
          mergedAppointments.push(localApt)
        }
      })

      // Sort by date
      mergedAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`)
        const dateB = new Date(`${b.date} ${b.time}`)
        return dateB - dateA // Most recent first
      })

      setAppointments(mergedAppointments)
    } catch (error) {
      toast.error('Failed to load appointments')
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    if (filter === 'today') return isToday(new Date(apt.date))
    if (filter === 'upcoming') return new Date(apt.date) > new Date()
    if (filter === 'past') return new Date(apt.date) < new Date()
    return apt.status === filter
  })

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

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleMessage = (appointment) => {
    const appointmentId = appointment._id || appointment.id
    if (appointmentId) {
      navigate(`/app/patient/chat?appointmentId=${appointmentId}`)
    } else {
      toast.error('Unable to open chat. Please try again.')
    }
  }

  const handleCancelAppointment = async (appointment) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    setIsCancelling(true)
    try {
      const appointmentId = appointment._id || appointment.id
      if (appointmentId) {
        try {
          await appointmentService.cancelAppointment(appointmentId)
          toast.success('Appointment cancelled successfully')
        } catch (apiError) {
          console.error('API cancellation error:', apiError)
          // Update local storage
          const localAppointments = JSON.parse(localStorage.getItem('localAppointments') || '[]')
          const updatedAppointments = localAppointments.map(apt => {
            if ((apt._id || apt.id) === appointmentId) {
              return { ...apt, status: 'cancelled' }
            }
            return apt
          })
          localStorage.setItem('localAppointments', JSON.stringify(updatedAppointments))
          toast.success('Appointment cancelled (saved locally)')
        }
      } else {
        // Update local storage directly
        const localAppointments = JSON.parse(localStorage.getItem('localAppointments') || '[]')
        const updatedAppointments = localAppointments.map(apt => {
          if (apt.patient?.name === appointment.patient?.name &&
              apt.date === appointment.date &&
              apt.time === appointment.time) {
            return { ...apt, status: 'cancelled' }
          }
          return apt
        })
        localStorage.setItem('localAppointments', JSON.stringify(updatedAppointments))
        toast.success('Appointment cancelled')
      }
      
      // Refresh appointments
      await loadAppointments()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Failed to cancel appointment')
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-2">Manage and view all your appointments</p>
          </div>
          <button
            onClick={loadAppointments}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {[
            { value: 'all', label: 'All Appointments' },
            { value: 'today', label: 'Today' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' }
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === filterOption.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Appointments ({filteredAppointments.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment, index) => (
              <div key={appointment._id || appointment.id || `appointment-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.doctor?.name || 'Dr. Name'}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
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
                            {appointment.doctor?.phone || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            {appointment.doctor?.address || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Symptoms:</p>
                        <p className="text-sm text-gray-600">{appointment.symptoms}</p>
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
                      <button 
                        onClick={() => handleViewAppointment(appointment)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => handleMessage(appointment)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <button 
                          onClick={() => handleCancelAppointment(appointment)}
                          disabled={isCancelling}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      )}
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
                {filter === 'all' 
                  ? 'You don\'t have any appointments yet.' 
                  : `No appointments match the "${filter}" filter.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedAppointment(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Doctor Info */}
              <div className="flex items-start space-x-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedAppointment.doctor?.name || 'Dr. Name'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedAppointment.doctor?.specialization || 'Specialist'}
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(selectedAppointment.urgency)}`}>
                      {selectedAppointment.urgency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Appointment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(selectedAppointment.date), 'EEEE, MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAppointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAppointment.duration || 30} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Contact */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Doctor Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAppointment.doctor?.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedAppointment.doctor.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedAppointment.doctor?.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedAppointment.doctor.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedAppointment.doctor?.address && (
                    <div className="flex items-start space-x-3 md:col-span-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedAppointment.doctor.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Symptoms</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {selectedAppointment.symptoms || 'No symptoms provided'}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              {selectedAppointment.diagnosis && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Diagnosis</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedAppointment.diagnosis}</p>
                  </div>
                </div>
              )}

              {/* Prescription */}
              {selectedAppointment.prescription && selectedAppointment.prescription.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Prescription</h4>
                  <div className="bg-green-50 rounded-lg p-4 space-y-2">
                    {selectedAppointment.prescription.map((prescription, index) => (
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
                  setShowDetailsModal(false)
                  setSelectedAppointment(null)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleMessage(selectedAppointment)
                  setShowDetailsModal(false)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Doctor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments