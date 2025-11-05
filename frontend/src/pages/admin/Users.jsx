import React, { useState } from 'react'
import { Search, Filter, MoreVertical, Mail, Phone, MapPin, Shield, UserCheck, UserX, Eye, X } from 'lucide-react'

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

  // Sample users data - Doctors and Patients from Guntur
  const users = [
    // Doctors
    { 
      id: 1, 
      name: 'Dr. Priya Sharma', 
      email: 'priya.sharma@nrihospital.com', 
      role: 'Doctor', 
      specialty: 'Cardiologist',
      hospital: 'NRI Hospital, Guntur',
      phone: '+91 98765 43210',
      status: 'Active',
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      avatar: 'https://ui-avatars.com/api/?name=Dr.+Priya+Sharma&background=0ea5e9&color=fff'
    },
    { 
      id: 2, 
      name: 'Dr. Rajesh Kumar', 
      email: 'rajesh.kumar@kimshospital.com', 
      role: 'Doctor', 
      specialty: 'General Physician',
      hospital: 'KIMS Icon Hospital, Guntur',
      phone: '+91 98765 43211',
      status: 'Active',
      joinDate: '2024-02-20',
      lastActive: '5 hours ago',
      avatar: 'https://ui-avatars.com/api/?name=Dr.+Rajesh+Kumar&background=0ea5e9&color=fff'
    },
    { 
      id: 3, 
      name: 'Dr. Anjali Desai', 
      email: 'anjali.desai@rameshhospital.com', 
      role: 'Doctor', 
      specialty: 'Neurologist',
      hospital: 'Ramesh Hospitals, Guntur',
      phone: '+91 98765 43212',
      status: 'Active',
      joinDate: '2024-03-10',
      lastActive: '1 day ago',
      avatar: 'https://ui-avatars.com/api/?name=Dr.+Anjali+Desai&background=0ea5e9&color=fff'
    },
    { 
      id: 4, 
      name: 'Dr. Arjun Mehta', 
      email: 'arjun.mehta@manipalhospital.com', 
      role: 'Doctor', 
      specialty: 'Cardiologist',
      hospital: 'Manipal Hospital, Guntur',
      phone: '+91 98765 43213',
      status: 'Active',
      joinDate: '2024-01-05',
      lastActive: '3 hours ago',
      avatar: 'https://ui-avatars.com/api/?name=Dr.+Arjun+Mehta&background=0ea5e9&color=fff'
    },
    
    // Patients
    { 
      id: 5, 
      name: 'Rahul Verma', 
      email: 'rahul.verma@gmail.com', 
      role: 'Patient', 
      specialty: null,
      hospital: null,
      phone: '+91 98765 43214',
      status: 'Active',
      joinDate: '2024-03-15',
      lastActive: '1 hour ago',
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=10b981&color=fff'
    },
    { 
      id: 6, 
      name: 'Sneha Reddy', 
      email: 'sneha.reddy@gmail.com', 
      role: 'Patient', 
      specialty: null,
      hospital: null,
      phone: '+91 98765 43215',
      status: 'Active',
      joinDate: '2024-03-12',
      lastActive: '30 mins ago',
      avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=10b981&color=fff'
    },
    { 
      id: 7, 
      name: 'Priya Patel', 
      email: 'priya.patel@gmail.com', 
      role: 'Patient', 
      specialty: null,
      hospital: null,
      phone: '+91 98765 43216',
      status: 'Active',
      joinDate: '2024-02-28',
      lastActive: '2 days ago',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=10b981&color=fff'
    },
    { 
      id: 8, 
      name: 'Arjun Singh', 
      email: 'arjun.singh@gmail.com', 
      role: 'Patient', 
      specialty: null,
      hospital: null,
      phone: '+91 98765 43217',
      status: 'Active',
      joinDate: '2024-03-01',
      lastActive: '1 day ago',
      avatar: 'https://ui-avatars.com/api/?name=Arjun+Singh&background=10b981&color=fff'
    },
    { 
      id: 9, 
      name: 'Vikram Nair', 
      email: 'vikram.nair@gmail.com', 
      role: 'Patient', 
      specialty: null,
      hospital: null,
      phone: '+91 98765 43218',
      status: 'Active',
      joinDate: '2024-02-15',
      lastActive: '4 hours ago',
      avatar: 'https://ui-avatars.com/api/?name=Vikram+Nair&background=10b981&color=fff'
    },
    { 
      id: 10, 
      name: 'Kavya Reddy', 
      email: 'kavya.reddy@gmail.com', 
      role: 'Patient', 
      specialty: null,
      hospital: null,
      phone: '+91 98765 43219',
      status: 'Active',
      joinDate: '2024-01-20',
      lastActive: '6 hours ago',
      avatar: 'https://ui-avatars.com/api/?name=Kavya+Reddy&background=10b981&color=fff'
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole.toLowerCase()
    return matchesSearch && matchesRole
  })

  const doctorCount = users.filter(u => u.role === 'Doctor').length
  const patientCount = users.filter(u => u.role === 'Patient').length

  return (
    <div className="space-y-4 md:space-y-6 animate-slideIn px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage all doctors and patients in Guntur healthcare system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center bg-blue-50 px-4 py-2 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{doctorCount}</div>
            <div className="text-xs md:text-sm text-gray-600">Doctors</div>
          </div>
          <div className="text-center bg-green-50 px-4 py-2 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-green-600">{patientCount}</div>
            <div className="text-xs md:text-sm text-gray-600">Patients</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm md:text-base"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm md:text-base"
            >
              <option value="all">All Users</option>
              <option value="doctor">Doctors Only</option>
              <option value="patient">Patients Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 md:gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="card hover:shadow-2xl transition-all p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start space-x-4 flex-1">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base md:text-lg text-gray-900">{user.name}</h3>
                    <span className={`badge text-xs ${
                      user.role === 'Doctor' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                    {user.specialty && (
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>{user.specialty}</span>
                      </div>
                    )}
                    {user.hospital && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{user.hospital}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Joined</div>
                  <div className="text-sm font-medium text-gray-900">{new Date(user.joinDate).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500">Last active: {user.lastActive}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Activate/Deactivate">
                      {user.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSelectedUser(null)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideIn">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <span className={`badge ${
                      selectedUser.role === 'Doctor' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedUser.phone}</p>
                  </div>
                  {selectedUser.specialty && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Specialty</label>
                      <p className="text-gray-900">{selectedUser.specialty}</p>
                    </div>
                  )}
                  {selectedUser.hospital && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Hospital</label>
                      <p className="text-gray-900">{selectedUser.hospital}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Status</label>
                    <span className={`badge ${
                      selectedUser.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Last Active</label>
                    <p className="text-gray-900">{selectedUser.lastActive}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminUsers
