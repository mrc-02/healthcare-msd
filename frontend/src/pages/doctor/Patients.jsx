import React, { useState, useEffect, useMemo } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useUsers, useAppointments } from '../../hooks'
import { Users, Search, Filter, RefreshCw, User, Phone, Mail, Calendar, Stethoscope, Activity, Heart, AlertCircle, CheckCircle, Clock, MessageCircle, Video, FileText, MapPin, Star } from 'lucide-react'
import { format, differenceInDays, differenceInHours } from 'date-fns'
import realtimeService from '../../services/realtime'
import toast from 'react-hot-toast'

const DoctorPatients = () => {
  const { user } = useAuthContext()
  const { data: patientsData, refetch: refetchPatients } = useUsers({ role: 'patient' })
  const { data: appointmentsData, refetch: refetchAppointments } = useAppointments()
  
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ageFilter, setAgeFilter] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [realtimeUpdates, setRealtimeUpdates] = useState([])
  const [liveStats, setLiveStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    newPatients: 0,
    followUpRequired: 0
  })

  const allPatients = patientsData?.data?.users || []
  const appointments = appointmentsData?.data?.appointments || []

  // Listen for new appointments
  useEffect(() => {
    const handleAppointmentAdded = () => {
      console.log('New appointment added, refetching appointments...')
      refetchAppointments()
    }

    window.addEventListener('appointmentAdded', handleAppointmentAdded)
    return () => window.removeEventListener('appointmentAdded', handleAppointmentAdded)
  }, [refetchAppointments])

  // Real-time updates
  useEffect(() => {
    if (user) {
      realtimeService.on('patient-registered', (data) => {
        toast.success('New patient registered!')
        refetchPatients()
        addRealtimeUpdate(`New patient: ${data.patientName}`)
      })

      realtimeService.on('patient-updated', (data) => {
        toast.info('Patient information updated!')
        refetchPatients()
        addRealtimeUpdate(`Patient updated: ${data.patientName}`)
      })

      realtimeService.onAppointmentUpdate((data) => {
        if (data.doctorId === user._id) {
          addRealtimeUpdate(`Appointment ${data.status}: ${data.patientName}`)
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

  // Filter patients using useMemo to prevent infinite loops
  const filteredPatients = useMemo(() => {
    let filtered = allPatients

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => {
        const lastAppointment = appointments
          .filter(apt => apt.patient?._id === patient._id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        
        if (!lastAppointment) return statusFilter === 'new'
        
        const daysSinceLastAppointment = differenceInDays(new Date(), new Date(lastAppointment.date))
        
        switch (statusFilter) {
          case 'active':
            return daysSinceLastAppointment <= 30
          case 'inactive':
            return daysSinceLastAppointment > 30
          case 'new':
            return daysSinceLastAppointment <= 7
          case 'follow-up':
            return lastAppointment.status === 'completed' && daysSinceLastAppointment <= 14
          default:
            return true
        }
      })
    }

    // Filter by age
    if (ageFilter !== 'all') {
      filtered = filtered.filter(patient => {
        if (!patient.dateOfBirth) return false
        
        const age = differenceInDays(new Date(), new Date(patient.dateOfBirth)) / 365
        
        switch (ageFilter) {
          case '0-18':
            return age <= 18
          case '19-35':
            return age > 18 && age <= 35
          case '36-50':
            return age > 35 && age <= 50
          case '50+':
            return age > 50
          default:
            return true
        }
      })
    }

    // Sort by last appointment date
    filtered.sort((a, b) => {
      const aLastAppointment = appointments
        .filter(apt => apt.patient?._id === a._id)
        .sort((x, y) => new Date(y.date) - new Date(x.date))[0]
      
      const bLastAppointment = appointments
        .filter(apt => apt.patient?._id === b._id)
        .sort((x, y) => new Date(y.date) - new Date(x.date))[0]
      
      if (!aLastAppointment && !bLastAppointment) return 0
      if (!aLastAppointment) return 1
      if (!bLastAppointment) return -1
      
      return new Date(bLastAppointment.date) - new Date(aLastAppointment.date)
    })

    return filtered
  }, [allPatients, appointments, searchTerm, statusFilter, ageFilter])

  // Update live stats
  useEffect(() => {
    const updateStats = () => {
      setLiveStats({
        totalPatients: allPatients.length,
        activePatients: allPatients.filter(patient => {
          const lastAppointment = appointments
            .filter(apt => apt.patient?._id === patient._id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
          return lastAppointment && differenceInDays(new Date(), new Date(lastAppointment.date)) <= 30
        }).length,
        newPatients: allPatients.filter(patient => {
          const lastAppointment = appointments
            .filter(apt => apt.patient?._id === patient._id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
          return lastAppointment && differenceInDays(new Date(), new Date(lastAppointment.date)) <= 7
        }).length,
        followUpRequired: appointments.filter(apt => 
          apt.status === 'completed' && 
          differenceInDays(new Date(), new Date(apt.date)) <= 14
        ).length
      })
    }

    // Update stats immediately
    updateStats()

    // Set up interval for periodic updates
    const interval = setInterval(updateStats, 5000)

    return () => clearInterval(interval)
  }, [allPatients.length, appointments.length]) // Only depend on lengths to avoid infinite loops

  const addRealtimeUpdate = (message) => {
    setRealtimeUpdates(prev => [
      { id: Date.now(), message, timestamp: new Date() },
      ...prev.slice(0, 9)
    ])
  }

  const getPatientStatus = (patient) => {
    const lastAppointment = appointments
      .filter(apt => apt.patient?._id === patient._id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    
    if (!lastAppointment) return { status: 'new', color: 'bg-green-100 text-green-800' }
    
    const daysSinceLastAppointment = differenceInDays(new Date(), new Date(lastAppointment.date))
    
    if (daysSinceLastAppointment <= 7) {
      return { status: 'recent', color: 'bg-blue-100 text-blue-800' }
    } else if (daysSinceLastAppointment <= 30) {
      return { status: 'active', color: 'bg-green-100 text-green-800' }
    } else {
      return { status: 'inactive', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const getPatientAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    return Math.floor(differenceInDays(new Date(), new Date(dateOfBirth)) / 365)
  }

  const getLastAppointment = (patient) => {
    return appointments
      .filter(apt => apt.patient?._id === patient._id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  }

  const getAppointmentCount = (patient) => {
    return appointments.filter(apt => apt.patient?._id === patient._id).length
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <p className="text-gray-600 mt-2">Manage and track all your patients</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.activePatients}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Patients</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.newPatients}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Follow-up Required</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.followUpRequired}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new">New</option>
              <option value="follow-up">Follow-up Required</option>
            </select>
          </div>

          {/* Age Filter */}
          <div>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Ages</option>
              <option value="0-18">0-18 years</option>
              <option value="19-35">19-35 years</option>
              <option value="36-50">36-50 years</option>
              <option value="50+">50+ years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Patients ({filteredPatients.length})
            </h2>
            <button
              onClick={() => refetchPatients()}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => {
              const patientStatus = getPatientStatus(patient)
              const lastAppointment = getLastAppointment(patient)
              const appointmentCount = getAppointmentCount(patient)
              
              return (
                <div key={patient._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${patientStatus.color}`}>
                            {patientStatus.status}
                          </span>
                          <span className="text-sm text-gray-600">Age: {getPatientAge(patient.dateOfBirth)}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              <Mail className="w-4 h-4 inline mr-2" />
                              {patient.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Phone className="w-4 h-4 inline mr-2" />
                              {patient.phone || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <Calendar className="w-4 h-4 inline mr-2" />
                              Joined: {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Stethoscope className="w-4 h-4 inline mr-2" />
                              Appointments: {appointmentCount}
                            </p>
                          </div>
                        </div>

                        {lastAppointment && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Last Appointment:</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{format(new Date(lastAppointment.date), 'MMM dd, yyyy')}</span>
                              <span>{lastAppointment.time}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                lastAppointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                lastAppointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                lastAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {lastAppointment.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{lastAppointment.symptoms}</p>
                          </div>
                        )}

                        {patient.address && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">
                              <MapPin className="w-4 h-4 inline mr-2" />
                              {patient.address}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Book</span>
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>Message</span>
                        </button>
                        <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1">
                          <Video className="w-3 h-3" />
                          <span>Call</span>
                        </button>
                      </div>

                      {/* Additional Actions */}
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>History</span>
                        </button>
                        <button className="px-3 py-1 bg-orange-200 text-orange-700 text-xs rounded-lg hover:bg-orange-300 transition-colors flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>Health</span>
                        </button>
                        <button className="px-3 py-1 bg-indigo-200 text-indigo-700 text-xs rounded-lg hover:bg-indigo-300 transition-colors flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Notes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || ageFilter !== 'all'
                  ? 'Try adjusting your filters to see more patients.'
                  : 'You don\'t have any patients yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorPatients