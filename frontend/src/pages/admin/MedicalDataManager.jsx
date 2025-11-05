import React, { useState } from 'react'
import { Settings, Plus, Edit3, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  DOCTOR_SPECIALIZATIONS, 
  DISEASE_CATEGORIES, 
  COMMON_CONDITIONS,
  SEVERITY_LEVELS 
} from '../../config/medicalData'

const MedicalDataManager = () => {
  const [activeTab, setActiveTab] = useState('specializations')
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState('')
  
  // Local state for managing data (in real app, this would be connected to backend)
  const [specializations, setSpecializations] = useState([...DOCTOR_SPECIALIZATIONS])
  const [diseaseCategories, setDiseaseCategories] = useState({...DISEASE_CATEGORIES})
  const [commonConditions, setCommonConditions] = useState([...COMMON_CONDITIONS])

  const handleAddSpecialization = () => {
    if (newItem.trim() && !specializations.includes(newItem.trim())) {
      setSpecializations([...specializations, newItem.trim()])
      setNewItem('')
      toast.success('Specialization added successfully!')
    } else {
      toast.error('Please enter a valid specialization name')
    }
  }

  const handleRemoveSpecialization = (item) => {
    setSpecializations(specializations.filter(s => s !== item))
    toast.success('Specialization removed!')
  }

  const handleAddCondition = () => {
    if (newItem.trim() && !commonConditions.includes(newItem.trim())) {
      setCommonConditions([...commonConditions, newItem.trim()])
      setNewItem('')
      toast.success('Condition added successfully!')
    } else {
      toast.error('Please enter a valid condition name')
    }
  }

  const handleRemoveCondition = (item) => {
    setCommonConditions(commonConditions.filter(c => c !== item))
    toast.success('Condition removed!')
  }

  const handleAddSymptom = (category) => {
    if (newItem.trim()) {
      const newSymptom = {
        id: newItem.toLowerCase().replace(/\s+/g, '_'),
        name: newItem.trim(),
        severity: 'medium'
      }
      
      setDiseaseCategories(prev => ({
        ...prev,
        [category]: [...prev[category], newSymptom]
      }))
      setNewItem('')
      toast.success('Symptom added successfully!')
    } else {
      toast.error('Please enter a valid symptom name')
    }
  }

  const handleRemoveSymptom = (category, symptomId) => {
    setDiseaseCategories(prev => ({
      ...prev,
      [category]: prev[category].filter(s => s.id !== symptomId)
    }))
    toast.success('Symptom removed!')
  }

  const handleUpdateSymptomSeverity = (category, symptomId, newSeverity) => {
    setDiseaseCategories(prev => ({
      ...prev,
      [category]: prev[category].map(s => 
        s.id === symptomId ? { ...s, severity: newSeverity } : s
      )
    }))
    toast.success('Symptom severity updated!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medical Data Manager</h1>
              <p className="text-gray-600 mt-2">Manage diseases, symptoms, and doctor specializations</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Settings className="w-4 h-4" />
              <span>Easy Configuration</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'specializations', label: 'Doctor Specializations', count: specializations.length },
                { id: 'symptoms', label: 'Symptoms & Diseases', count: Object.values(diseaseCategories).flat().length },
                { id: 'conditions', label: 'Common Conditions', count: commonConditions.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Add New Item */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={
                  activeTab === 'specializations' ? 'Enter new specialization...' :
                  activeTab === 'conditions' ? 'Enter new condition...' :
                  'Enter new symptom...'
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                if (activeTab === 'specializations') handleAddSpecialization()
                else if (activeTab === 'conditions') handleAddCondition()
                else toast.info('Select a category below to add symptoms')
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Doctor Specializations */}
          {activeTab === 'specializations' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctor Specializations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specializations.map((spec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{spec}</span>
                    <button
                      onClick={() => handleRemoveSpecialization(spec)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Symptoms & Diseases */}
          {activeTab === 'symptoms' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Symptoms & Diseases by Category</h2>
              <div className="space-y-6">
                {Object.entries(diseaseCategories).map(([category, symptoms]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Add new symptom..."
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSymptom(category)
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddSymptom(category)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {symptoms.map((symptom) => (
                        <div key={symptom.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900">{symptom.name}</span>
                            <select
                              value={symptom.severity}
                              onChange={(e) => handleUpdateSymptomSeverity(category, symptom.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              symptom.severity === 'high' ? 'bg-red-100 text-red-800' :
                              symptom.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {symptom.severity}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveSymptom(category, symptom.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Conditions */}
          {activeTab === 'conditions' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Common Medical Conditions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commonConditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{condition}</span>
                    <button
                      onClick={() => handleRemoveCondition(condition)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">How to Use This Manager</h3>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• <strong>Doctor Specializations:</strong> Add/remove medical specializations for doctor registration</li>
                <li>• <strong>Symptoms & Diseases:</strong> Organize symptoms by category and set severity levels</li>
                <li>• <strong>Common Conditions:</strong> Manage frequently diagnosed conditions</li>
                <li>• <strong>Severity Levels:</strong> Low (routine), Medium (soon), High (urgent)</li>
                <li>• Changes are automatically applied to the appointment booking system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalDataManager
