import React, { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Stethoscope, Award, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const DoctorProfile = () => {
  const { user, updateUser } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    licenseNumber: user?.licenseNumber || '',
    bio: user?.bio || '',
    consultationFee: user?.consultationFee || '',
    availability: user?.availability || ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
        toast.success('Profile updated successfully!')
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      specialization: user?.specialization || '',
      experience: user?.experience || '',
      licenseNumber: user?.licenseNumber || '',
      bio: user?.bio || '',
      consultationFee: user?.consultationFee || '',
      availability: user?.availability || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
              <p className="text-gray-600 mt-2">Manage your professional information and practice details</p>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{user?.name}</h2>
                <p className="text-gray-600 mb-2">{user?.specialization}</p>
                <p className="text-sm text-gray-500 mb-4">{user?.experience}</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(user?.createdAt).getFullYear()}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Patients</span>
                  <span className="font-semibold text-gray-900">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Appointments Today</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold text-gray-900">4.8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold text-gray-900">2.5 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Professional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                      type="text"
                      name="name"
                      value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <User className="w-4 h-4" />
                      <span>{formData.name || 'Not provided'}</span>
                    </div>
                    )}
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Mail className="w-4 h-4" />
                    <span>{formData.email}</span>
                  </div>
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                      value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Phone className="w-4 h-4" />
                      <span>{formData.phone || 'Not provided'}</span>
                    </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                      value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <MapPin className="w-4 h-4" />
                      <span>{formData.location || 'Not provided'}</span>
                    </div>
                    )}
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    {isEditing ? (
                      <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Stethoscope className="w-4 h-4" />
                      <span>{formData.specialization || 'Not provided'}</span>
                    </div>
                    )}
                </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    {isEditing ? (
                      <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                        onChange={handleInputChange}
                      placeholder="e.g., 10 years"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Award className="w-4 h-4" />
                      <span>{formData.experience || 'Not provided'}</span>
                    </div>
                    )}
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                    <div className="text-gray-900">
                      {formData.licenseNumber || 'Not provided'}
                    </div>
                    )}
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                    {isEditing ? (
                      <input
                        type="text"
                      name="consultationFee"
                      value={formData.consultationFee}
                        onChange={handleInputChange}
                      placeholder="e.g., $150"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                    <div className="text-gray-900">
                      {formData.consultationFee || 'Not provided'}
                  </div>
                  )}
              </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                      value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                      placeholder="Tell patients about your background and approach..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                    <div className="text-gray-900">
                      {formData.bio || 'No bio provided'}
                    </div>
                )}
              </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                {isEditing ? (
                  <textarea
                      name="availability"
                      value={formData.availability}
                    onChange={handleInputChange}
                    rows={3}
                      placeholder="e.g., Monday-Friday: 9AM-5PM, Saturday: 9AM-1PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                    <div className="flex items-start space-x-2 text-gray-900">
                      <Clock className="w-4 h-4 mt-1" />
                      <span>{formData.availability || 'Not provided'}</span>
                    </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile