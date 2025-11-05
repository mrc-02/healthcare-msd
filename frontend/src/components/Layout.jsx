import React, { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { 
  Home, Calendar, FileText, Package, BarChart3, 
  Bell, Menu, X, LogOut, MessageCircle, User,
  Stethoscope, Users
} from 'lucide-react'
import ChatBot from './ChatBot'

const Layout = () => {
  const { user, logout } = useAuthContext()
  const { chatOpen, setChatOpen, notifications } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Safety check: if user is not available, show loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNavItems = () => {
    if (user?.role === 'doctor') {
      return [
        { icon: Home, label: 'Dashboard', path: '/app/doctor/dashboard' },
        { icon: Calendar, label: 'Appointments', path: '/app/doctor/appointments' },
        { icon: Users, label: 'Patients', path: '/app/doctor/patients' },
        { icon: MessageCircle, label: 'Chat with Patients', path: '/app/doctor/chat' },
      ]
    } else if (user?.role === 'admin') {
      return [
        { icon: Home, label: 'Dashboard', path: '/app/admin/dashboard' },
        { icon: BarChart3, label: 'Analytics', path: '/app/admin/analytics' },
        { icon: Users, label: 'Users', path: '/app/admin/users' },
        { icon: Activity, label: 'Medical Data', path: '/app/admin/medical-data' },
        { icon: Package, label: 'Supply Chain', path: '/app/supply-chain' },
      ]
    } else {
      return [
        { icon: Home, label: 'Dashboard', path: '/app/dashboard' },
        { icon: Calendar, label: 'Book Appointment', path: '/app/book-appointment' },
        { icon: FileText, label: 'My Appointments', path: '/app/my-appointments' },
        { icon: Package, label: 'Supply Chain', path: '/app/supply-chain' },
        { icon: MessageCircle, label: 'Chat with Doctor', path: '/app/patient/chat' },
      ]
    }
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/90 backdrop-blur-lg border-r border-gray-200/50 transition-all duration-300 fixed h-full z-20 shadow-xl`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Stethoscope className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MediCare</span>
              </div>
            )}
            {!sidebarOpen && (
              <div className="flex justify-center">
                <div className="relative">
                  <Stethoscope className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 text-gray-700 hover:text-primary-600 transition-all duration-300 group hover:scale-105 transform hover:shadow-md"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <Link
              to={user?.role === 'doctor' ? '/app/doctor/profile' : user?.role === 'admin' ? '/app/admin/dashboard' : '/app/profile'}
              className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'} p-2 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 transition-all duration-300 group cursor-pointer`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
                </div>
              )}
              {sidebarOpen && (
                <User className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              )}
            </Link>
          </div>
        </div>
      </aside>

      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="h-16 bg-white/90 backdrop-blur-lg border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setChatOpen(true)}
              className="relative p-2 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 transition-all duration-300 group hover:scale-110 transform"
            >
              <MessageCircle className="w-6 h-6 text-gray-700 group-hover:text-primary-600 transition-colors" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse shadow-lg"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-30 animate-slideIn">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notif.read ? 'bg-primary-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-sm text-gray-900">{notif.title}</h4>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>

      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

export default Layout

