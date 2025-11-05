import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useMedicines, useTrackMedicine } from '../../hooks'
import { medicineService } from '../../services'
import { Package, MapPin, Clock, CheckCircle, AlertCircle, Search, Truck, Building, Shield, Eye, RefreshCw } from 'lucide-react'
import { format, differenceInDays, differenceInHours } from 'date-fns'
import realtimeService from '../../services/realtime'
import toast from 'react-hot-toast'

const SupplyChainTracker = () => {
  const { user } = useAuthContext()
  const { data: medicinesData, refetch: refetchMedicines } = useMedicines()
  
  const [searchBatch, setSearchBatch] = useState('')
  const [trackedMedicine, setTrackedMedicine] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [liveUpdates, setLiveUpdates] = useState([])
  const [realtimeLocation, setRealtimeLocation] = useState(null)
  const [activeBatchNumber, setActiveBatchNumber] = useState(null)

  const medicines = medicinesData?.data?.medicines || []
  
  // Use the track medicine hook only when we have an active batch number
  const { data: trackedMedicineData, isLoading: isTrackingLoading } = useTrackMedicine(activeBatchNumber)

  // Update tracked medicine when query result changes
  useEffect(() => {
    if (trackedMedicineData?.data?.medicine) {
      setTrackedMedicine(trackedMedicineData.data.medicine)
      setIsTracking(false)
    }
  }, [trackedMedicineData])

  // Real-time medicine tracking updates
  useEffect(() => {
    if (user) {
      realtimeService.onMedicineUpdate((data) => {
        toast.success('Medicine tracking updated!')
        addLiveUpdate(`Medicine ${data.name} status: ${data.currentStage}`)
        
        // Update real-time location
        if (data.currentLocation) {
          setRealtimeLocation(data.currentLocation)
        }
        
        // Refresh medicines if it's in our tracked list
        if (trackedMedicine && trackedMedicine.batchNumber === data.batchNumber) {
          setTrackedMedicine(data)
        }
      })

      realtimeService.on('medicine-stage-updated', (data) => {
        addLiveUpdate(`Stage updated: ${data.stageName} at ${data.location}`)
      })

      realtimeService.on('medicine-delivered', (data) => {
        toast.success('Medicine delivered!')
        addLiveUpdate(`Medicine ${data.name} delivered to ${data.pharmacy}`)
      })
    }

    return () => {
      realtimeService.cleanup()
    }
  }, [user, trackedMedicine])

  const addLiveUpdate = (message) => {
    setLiveUpdates(prev => [
      { id: Date.now(), message, timestamp: new Date() },
      ...prev.slice(0, 9)
    ])
  }

  const handleTrackMedicine = async (batchNumber = null) => {
    const batchToTrack = batchNumber || searchBatch.trim()
    
    if (!batchToTrack) {
      toast.error('Please enter a batch number')
      return
    }

    setIsTracking(true)
    setActiveBatchNumber(batchToTrack)
    
    // The useTrackMedicine hook will automatically fetch when activeBatchNumber is set
    // We'll handle the result in the useEffect above
    // But also try direct API call as fallback
    try {
      const response = await medicineService.trackMedicine(batchToTrack)
      if (response.data?.medicine) {
        setTrackedMedicine(response.data.medicine)
        setSearchBatch(batchToTrack) // Update the input field
        toast.success('Medicine found!')
      } else {
        toast.error('Medicine not found with this batch number')
        setTrackedMedicine(null)
        setActiveBatchNumber(null)
      }
    } catch (error) {
      // Check if it's a 404 (not found) vs other error
      if (error.response?.status === 404) {
        toast.error('Medicine not found with this batch number')
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error('Failed to track medicine. Please try again.')
      }
      setTrackedMedicine(null)
      setActiveBatchNumber(null)
    } finally {
      setIsTracking(false)
    }
  }

  const getStageColor = (stageName, completed, isCurrentStage) => {
    if (completed) return 'bg-green-100 text-green-800 border-green-200'
    if (isCurrentStage) return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const getStageIcon = (stageName, completed, isCurrentStage) => {
    if (completed) return <CheckCircle className="w-5 h-5" />
    if (isCurrentStage) return <RefreshCw className="w-5 h-5 animate-spin" />
    
    switch (stageName?.toLowerCase()) {
      case 'manufactured': return <Building className="w-5 h-5" />
      case 'quality-check': return <Shield className="w-5 h-5" />
      case 'wholesaler': return <Package className="w-5 h-5" />
      case 'in-transit': return <Truck className="w-5 h-5" />
      case 'pharmacy': return <Building className="w-5 h-5" />
      case 'delivered': return <CheckCircle className="w-5 h-5" />
      default: return <Package className="w-5 h-5" />
    }
  }

  const getEstimatedDelivery = (medicine) => {
    if (!medicine) return null
    
    const currentStage = medicine.currentStage
    const stages = ['manufactured', 'quality-check', 'wholesaler', 'in-transit', 'pharmacy', 'delivered']
    const currentIndex = stages.indexOf(currentStage)
    
    if (currentIndex === -1) return null
    
    const remainingStages = stages.length - currentIndex - 1
    const estimatedDays = remainingStages * 2 // 2 days per stage average
    
    return estimatedDays
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medicine Supply Chain Tracker</h1>
        <p className="text-gray-600 mt-2">Track your medicines with blockchain-powered real-time updates</p>
      </div>

      {/* Live Updates */}
      {liveUpdates.length > 0 && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Live Tracking Updates
          </h3>
          <div className="space-y-1">
            {liveUpdates.slice(0, 3).map((update) => (
              <div key={update.id} className="text-sm text-green-700 flex items-center justify-between">
                <span>{update.message}</span>
                <span className="text-xs text-green-500">
                  {format(update.timestamp, 'h:mm:ss a')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search & Track */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Track Medicine</h2>
              <button
                onClick={() => refetchMedicines()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh medicines list"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Batch Number
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchBatch}
                    onChange={(e) => setSearchBatch(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isTracking && searchBatch.trim()) {
                        handleTrackMedicine()
                      }
                    }}
                    placeholder="e.g., BATCH2024001"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleTrackMedicine}
                    disabled={isTracking || !searchBatch.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isTracking ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sample Batch Numbers */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Try these sample batch numbers:</p>
                <div className="space-y-1">
                  {medicines.slice(0, 3).map((medicine, index) => (
                    <button
                      key={medicine._id || medicine.id || `sample-${index}`}
                      onClick={() => {
                        setSearchBatch(medicine.batchNumber)
                        handleTrackMedicine(medicine.batchNumber)
                      }}
                      className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {medicine.batchNumber} - {medicine.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Medicines */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Medicines</h2>
            
            {medicines.length > 0 ? (
              <div className="space-y-3">
                {medicines.slice(0, 5).map((medicine, index) => (
                  <div
                    key={medicine._id || medicine.id || `medicine-${index}`}
                    onClick={() => {
                      setSearchBatch(medicine.batchNumber)
                      handleTrackMedicine(medicine.batchNumber)
                    }}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{medicine.name}</h3>
                        <p className="text-xs text-gray-600">{medicine.batchNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          medicine.currentStage === 'delivered' ? 'bg-green-100 text-green-800' :
                          medicine.currentStage === 'pharmacy' ? 'bg-blue-100 text-blue-800' :
                          medicine.currentStage === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {medicine.currentStage}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No medicines found</p>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Details */}
        <div className="lg:col-span-2">
          {(isTracking || isTrackingLoading) ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <RefreshCw className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Tracking Medicine...</h2>
              <p className="text-gray-600">
                Searching for medicine with batch number: {searchBatch || activeBatchNumber}
              </p>
            </div>
          ) : trackedMedicine ? (
            <div className="space-y-6">
              {/* Medicine Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{trackedMedicine.name}</h2>
                    <p className="text-gray-600">{trackedMedicine.manufacturer}</p>
                    <p className="text-sm text-gray-500">Batch: {trackedMedicine.batchNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      trackedMedicine.currentStage === 'delivered' ? 'bg-green-100 text-green-800' :
                      trackedMedicine.currentStage === 'pharmacy' ? 'bg-blue-100 text-blue-800' :
                      trackedMedicine.currentStage === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {trackedMedicine.currentStage}
                    </span>
                    {getEstimatedDelivery(trackedMedicine) && (
                      <p className="text-sm text-gray-600 mt-2">
                        Est. {getEstimatedDelivery(trackedMedicine)} days to delivery
                      </p>
                    )}
                  </div>
                </div>

                {/* Blockchain Hash */}
                {trackedMedicine.blockchainHash && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Blockchain Hash:</p>
                    <p className="text-sm font-mono text-gray-800 break-all">
                      {trackedMedicine.blockchainHash}
                    </p>
                  </div>
                )}
              </div>

              {/* Supply Chain Stages */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Supply Chain Journey</h3>
                
                {trackedMedicine.stages && trackedMedicine.stages.length > 0 ? (
                  <div className="space-y-4">
                    {trackedMedicine.stages.map((stage, index) => {
                      // Normalize stage name for comparison
                      const stageNameNormalized = stage.name?.toLowerCase().replace(/\s+/g, '-')
                      const currentStageNormalized = trackedMedicine.currentStage?.toLowerCase().replace(/\s+/g, '-')
                      const isCurrentStage = stageNameNormalized === currentStageNormalized
                      const isCompleted = stage.completed || (!isCurrentStage && index < trackedMedicine.stages.findIndex(s => {
                        const sName = s.name?.toLowerCase().replace(/\s+/g, '-')
                        return sName === currentStageNormalized
                      }))
                      
                      return (
                        <div key={index} className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStageColor(stage.name, isCompleted, isCurrentStage)}`}>
                            {getStageIcon(stage.name, isCompleted, isCurrentStage)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 capitalize">{stage.name}</h4>
                              <span className="text-sm text-gray-600">
                                {stage.date && stage.date !== 'Pending' && stage.date !== 'pending' 
                                  ? format(new Date(stage.date), 'MMM dd, yyyy') 
                                  : 'Pending'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{stage.location || 'Location not specified'}</p>
                            {stage.notes && (
                              <p className="text-gray-500 text-xs mt-1">{stage.notes}</p>
                            )}
                            {(stage.temperature || stage.humidity) && (
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                {stage.temperature && <span>🌡️ {stage.temperature}°C</span>}
                                {stage.humidity && <span>💧 {stage.humidity}%</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No supply chain stages recorded yet</p>
                    <p className="text-sm text-gray-500 mt-1">Stages will appear as the medicine moves through the supply chain</p>
                  </div>
                )}
              </div>

              {/* Real-time Location */}
              {realtimeLocation && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                    Current Location
                  </h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">{realtimeLocation}</p>
                    <p className="text-blue-600 text-sm mt-1">
                      Last updated: {format(new Date(), 'h:mm:ss a')}
                    </p>
                  </div>
                </div>
              )}

              {/* Medicine Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Medicine Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Dosage</label>
                    <p className="text-gray-900">{trackedMedicine.dosage}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Form</label>
                    <p className="text-gray-900 capitalize">{trackedMedicine.form}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Strength</label>
                    <p className="text-gray-900">{trackedMedicine.strength}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                    <p className="text-gray-900">
                      {trackedMedicine.expiryDate 
                        ? (() => {
                            try {
                              return format(new Date(trackedMedicine.expiryDate), 'MMM dd, yyyy')
                            } catch {
                              return trackedMedicine.expiryDate
                            }
                          })()
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Track Your Medicine</h2>
              <p className="text-gray-600 mb-6">
                Enter a batch number to start tracking your medicine through the supply chain
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchBatch}
                    onChange={(e) => setSearchBatch(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isTracking && searchBatch.trim()) {
                        handleTrackMedicine()
                      }
                    }}
                    placeholder="Enter batch number..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleTrackMedicine}
                    disabled={isTracking || !searchBatch.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isTracking ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Track'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupplyChainTracker