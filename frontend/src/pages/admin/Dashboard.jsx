import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, Package, DollarSign, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react'

const AdminDashboard = () => {
  const stats = [
    {
      icon: Users,
      label: 'Total Users',
      value: '12,845',
      change: '+12.5%',
      trend: 'up',
      color: 'bg-blue-500',
      subtext: '156 new this week'
    },
    {
      icon: Calendar,
      label: 'Total Appointments',
      value: '8,432',
      change: '+8.2%',
      trend: 'up',
      color: 'bg-green-500',
      subtext: '342 today'
    },
    {
      icon: Package,
      label: 'Medicines Tracked',
      value: '45,231',
      change: '+15.3%',
      trend: 'up',
      color: 'bg-purple-500',
      subtext: 'In supply chain'
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: '₹22,48,500',
      change: '+22.1%',
      trend: 'up',
      color: 'bg-orange-500',
      subtext: 'This month'
    }
  ]

  const recentUsers = [
    { name: 'Rahul Verma', email: 'rahul.verma@gmail.com', role: 'Patient', joinDate: '2 hours ago', status: 'Active' },
    { name: 'Dr. Priya Sharma', email: 'priya.sharma@nrihospital.com', role: 'Doctor', joinDate: '5 hours ago', status: 'Active' },
    { name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', role: 'Patient', joinDate: '1 day ago', status: 'Active' },
    { name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@kimshospital.com', role: 'Doctor', joinDate: '1 day ago', status: 'Active' },
    { name: 'Priya Patel', email: 'priya.patel@gmail.com', role: 'Patient', joinDate: '2 days ago', status: 'Active' },
    { name: 'Dr. Anjali Desai', email: 'anjali.desai@rameshhospital.com', role: 'Doctor', joinDate: '3 days ago', status: 'Active' },
    { name: 'Arjun Singh', email: 'arjun.singh@gmail.com', role: 'Patient', joinDate: '3 days ago', status: 'Active' },
    { name: 'Dr. Arjun Mehta', email: 'arjun.mehta@manipalhospital.com', role: 'Doctor', joinDate: '4 days ago', status: 'Active' },
    { name: 'Vikram Nair', email: 'vikram.nair@gmail.com', role: 'Patient', joinDate: '5 days ago', status: 'Active' },
    { name: 'Kavya Reddy', email: 'kavya.reddy@gmail.com', role: 'Patient', joinDate: '1 week ago', status: 'Active' }
  ]

  const systemAlerts = [
    { type: 'warning', message: '3 appointments pending confirmation', time: '10 mins ago' },
    { type: 'info', message: 'System backup completed successfully', time: '1 hour ago' },
    { type: 'success', message: '15 new medicine entries added to blockchain', time: '2 hours ago' },
    { type: 'warning', message: 'Server load at 75%', time: '3 hours ago' }
  ]

  const quickStats = [
    { label: 'Active Doctors', value: '523', color: 'text-green-600' },
    { label: 'Active Patients', value: '12,322', color: 'text-blue-600' },
    { label: 'Pending Verifications', value: '47', color: 'text-orange-600' },
    { label: 'Support Tickets', value: '12', color: 'text-red-600' }
  ]

  return (
    <div className="space-y-4 md:space-y-6 animate-slideIn px-2 sm:px-0">
      {/* Welcome Banner - Mobile Responsive */}
      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 text-white overflow-hidden shadow-2xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 animate-fadeIn">Admin Dashboard</h1>
            <p className="text-white/90 text-sm md:text-lg">
              Guntur Healthcare System Management
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-float shadow-xl">
              <Activity className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card hover:scale-105 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="text-xs sm:text-sm font-semibold hidden sm:inline">{stat.change}</span>
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</div>
            <div className="text-xs text-gray-500 hidden md:block">{stat.subtext}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity & System Alerts - Mobile Responsive */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Users - Guntur</h2>
            <Link to="/admin/users" className="text-primary-600 hover:text-primary-700 font-medium text-xs sm:text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3 md:space-y-4">
            {recentUsers.map((user, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=0ea5e9&color=fff`}
                    alt={user.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">{user.name}</h4>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge text-xs ${
                        user.role === 'Doctor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-xs text-gray-500">{user.joinDate}</span>
                    </div>
                  </div>
                </div>
                <span className={`badge text-xs self-start sm:self-auto ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.status}
                  </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">System Alerts</h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Clear All
            </button>
          </div>
          <div className="space-y-3">
            {systemAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  alert.type === 'success' ? 'bg-green-50 border-green-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'success' ? 'text-green-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="card">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Quick Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <button className="p-3 md:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mb-2" />
            <div className="font-semibold text-gray-900 text-sm md:text-base">All Users</div>
            <div className="text-xs text-gray-500 mt-1">Doctors & Patients</div>
          </button>
          <Link to="/admin/analytics" className="p-3 md:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
            <Activity className="w-5 h-5 md:w-6 md:h-6 text-green-600 mb-2" />
            <div className="font-semibold text-gray-900 text-sm md:text-base">Analytics</div>
            <div className="text-xs text-gray-500 mt-1">View Reports</div>
          </Link>
          <button className="p-3 md:p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-600 mb-2" />
            <div className="font-semibold text-gray-900 text-sm md:text-base">Appointments</div>
            <div className="text-xs text-gray-500 mt-1">All Bookings</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard


