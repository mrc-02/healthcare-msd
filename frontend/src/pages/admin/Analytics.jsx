import React, { useState } from 'react'
import { TrendingUp, Users, Calendar, DollarSign, Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week')

  const overviewStats = [
    {
      icon: Users,
      label: 'Total Users',
      value: '12,845',
      change: '+12.5%',
      changeType: 'increase',
      description: 'vs last period',
      color: 'blue'
    },
    {
      icon: Calendar,
      label: 'Appointments',
      value: '8,432',
      change: '+8.2%',
      changeType: 'increase',
      description: 'vs last period',
      color: 'green'
    },
    {
      icon: DollarSign,
      label: 'Revenue',
      value: '₹22,48,500',
      change: '+22.1%',
      changeType: 'increase',
      description: 'vs last period',
      color: 'purple'
    },
    {
      icon: Activity,
      label: 'Success Rate',
      value: '94.8%',
      change: '+2.3%',
      changeType: 'increase',
      description: 'vs last period',
      color: 'orange'
    }
  ]

  const peakHours = [
    { hour: '9 AM', bookings: 45 },
    { hour: '10 AM', bookings: 78 },
    { hour: '11 AM', bookings: 92 },
    { hour: '12 PM', bookings: 65 },
    { hour: '2 PM', bookings: 88 },
    { hour: '3 PM', bookings: 95 },
    { hour: '4 PM', bookings: 82 },
    { hour: '5 PM', bookings: 58 }
  ]

  const topDoctors = [
    { name: 'Dr. Priya Sharma', specialty: 'Cardiologist', appointments: 234, rating: 4.9, revenue: '₹2,80,800' },
    { name: 'Dr. Rajesh Kumar', specialty: 'General Physician', appointments: 198, rating: 4.8, revenue: '₹1,58,400' },
    { name: 'Dr. Anjali Desai', specialty: 'Neurologist', appointments: 187, rating: 4.9, revenue: '₹2,80,500' },
    { name: 'Dr. Arjun Mehta', specialty: 'Cardiologist', appointments: 176, rating: 4.8, revenue: '₹2,46,400' }
  ]

  const fraudAlerts = [
    { type: 'warning', description: 'Unusual prescription pattern detected for Dr. X', severity: 'medium', time: '2 hours ago' },
    { type: 'alert', description: 'Multiple appointment cancellations from same IP', severity: 'high', time: '4 hours ago' },
    { type: 'info', description: 'Payment verification delayed for 3 transactions', severity: 'low', time: '1 day ago' }
  ]

  const specialtyDistribution = [
    { specialty: 'General Medicine', percentage: 35, count: 4498, color: 'bg-blue-500' },
    { specialty: 'Cardiology', percentage: 22, count: 2823, color: 'bg-green-500' },
    { specialty: 'Neurology', percentage: 18, count: 2309, color: 'bg-purple-500' },
    { specialty: 'Pediatrics', percentage: 15, count: 1925, color: 'bg-orange-500' },
    { specialty: 'Others', percentage: 10, count: 1283, color: 'bg-gray-500' }
  ]

  const maxBookings = Math.max(...peakHours.map(h => h.bookings))

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn-primary">Export Report</button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, idx) => {
          const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500'
          }
          return (
            <div key={idx} className="card hover:scale-105">
              <div className={`w-12 h-12 ${colorClasses[stat.color]} rounded-lg flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
              <div className={`flex items-center text-sm ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="font-semibold">{stat.change}</span>
                <span className="text-gray-500 ml-1">{stat.description}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Peak Hours Chart */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Peak Booking Hours</h2>
        <div className="flex items-end justify-between space-x-3 h-64">
          {peakHours.map((hour, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="text-sm font-semibold text-gray-900 mb-2">{hour.bookings}</div>
              <div
                className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all hover:from-primary-700 hover:to-primary-500"
                style={{ height: `${(hour.bookings / maxBookings) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-600 mt-3">{hour.hour}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">Insight:</span>
            <span>Peak hours are between 10 AM - 4 PM. Consider allocating more resources during this time.</span>
          </div>
        </div>
      </div>

      {/* Top Doctors & Specialty Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Doctors */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Doctors</h2>
          <div className="space-y-4">
            {topDoctors.map((doctor, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{doctor.appointments} appointments</span>
                    <span>⭐ {doctor.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{doctor.revenue}</div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specialty Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Appointments by Specialty</h2>
          <div className="space-y-4">
            {specialtyDistribution.map((specialty, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{specialty.specialty}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{specialty.percentage}%</span>
                    <span className="text-xs text-gray-500 ml-2">({specialty.count})</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${specialty.color} h-3 rounded-full transition-all`}
                    style={{ width: `${specialty.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-xs text-gray-600">Specialties</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">523</div>
              <div className="text-xs text-gray-600">Active Doctors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Detection & Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Fraud Detection</h2>
            <p className="text-sm text-gray-600">Automated system monitoring and anomaly detection</p>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">System Active</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-1">98.5%</div>
            <div className="text-sm text-gray-600">Detection Accuracy</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600 mb-1">3</div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-1">147</div>
            <div className="text-sm text-gray-600">Prevented Frauds</div>
          </div>
        </div>

        <div className="space-y-3">
          {fraudAlerts.map((alert, idx) => {
            const severityColors = {
              high: 'bg-red-50 border-red-500 text-red-700',
              medium: 'bg-yellow-50 border-yellow-500 text-yellow-700',
              low: 'bg-blue-50 border-blue-500 text-blue-700'
            }
            return (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${severityColors[alert.severity]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-semibold">{alert.description}</p>
                      <p className="text-xs mt-1 opacity-75">{alert.time}</p>
                    </div>
                  </div>
                  <span className={`badge uppercase ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-lg text-gray-900 mb-4">User Engagement</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Daily Active Users</span>
              <span className="font-bold text-gray-900">8,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Session Time</span>
              <span className="font-bold text-gray-900">24 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Return Rate</span>
              <span className="font-bold text-gray-900">76%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Server Uptime</span>
              <span className="font-bold text-green-600">99.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Response Time</span>
              <span className="font-bold text-gray-900">120ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="font-bold text-gray-900">0.02%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Supply Chain</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Medicines Tracked</span>
              <span className="font-bold text-gray-900">45,231</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">In Transit</span>
              <span className="font-bold text-gray-900">2,847</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Authenticity Rate</span>
              <span className="font-bold text-green-600">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

