import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'

import LandingPage from './pages/LandingPage'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

import PatientDashboard from './pages/patient/Dashboard'
import PatientProfile from './pages/patient/Profile'
import BookAppointment from './pages/patient/BookAppointment'
import MyAppointments from './pages/patient/MyAppointments'
import SupplyChainTracker from './pages/patient/SupplyChainTracker'
import PatientChat from './pages/patient/Chat'

import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorProfile from './pages/doctor/Profile'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorPatients from './pages/doctor/Patients'
import DoctorChat from './pages/doctor/Chat'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import Analytics from './pages/admin/Analytics'
import MedicalDataManager from './pages/admin/MedicalDataManager'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import NetworkStatus from './components/NetworkStatus'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      onError: (error) => {
        if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
          console.error('Query error:', error)
        }
      }
    },
    mutations: {
      onError: (error) => {
        if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
          console.error('Mutation error:', error)
        }
      }
    }
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <AuthProvider>
            <AppProvider>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="profile" element={<PatientProfile />} />
                <Route path="book-appointment" element={<BookAppointment />} />
                <Route path="my-appointments" element={<MyAppointments />} />
                <Route path="supply-chain" element={<SupplyChainTracker />} />
                <Route path="patient/chat" element={<PatientChat />} />
                
                <Route path="doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="doctor/profile" element={<DoctorProfile />} />
                <Route path="doctor/appointments" element={<DoctorAppointments />} />
                <Route path="doctor/patients" element={<DoctorPatients />} />
                <Route path="doctor/chat" element={<DoctorChat />} />
                
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/users" element={<AdminUsers />} />
                <Route path="admin/analytics" element={<Analytics />} />
                <Route path="admin/medical-data" element={<MedicalDataManager />} />
              </Route>
              
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/book-appointment" element={<Navigate to="/app/book-appointment" replace />} />
              <Route path="/my-appointments" element={<Navigate to="/app/my-appointments" replace />} />
              <Route path="/supply-chain" element={<Navigate to="/app/supply-chain" replace />} />
              <Route path="/doctor/*" element={<Navigate to="/app/doctor" replace />} />
              <Route path="/admin/*" element={<Navigate to="/app/admin" replace />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
              />
            <NetworkStatus />
            </AppProvider>
          </AuthProvider>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  )
}

export default App

