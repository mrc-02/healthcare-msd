import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Show status when offline or when coming back online
  if (!isOnline || showStatus) {
    return (
      <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        'translate-x-0 opacity-100'
      }`}>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg ${
          isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isOnline ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Back Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">You're Offline</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default NetworkStatus
