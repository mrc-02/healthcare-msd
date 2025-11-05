import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Send, User, Stethoscope, Phone, Video, FileText, MessageCircle } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useAppointments } from '../../hooks'
import realtimeService from '../../services/realtime'
import toast from 'react-hot-toast'

const PatientChat = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: appointmentsData } = useAppointments()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const appointments = appointmentsData?.data?.appointments || []

  useEffect(() => {
    // Get appointment ID from URL params or location state
    const appointmentId = new URLSearchParams(location.search).get('appointmentId') || location.state?.appointmentId
    if (appointmentId) {
      const appointment = appointments.find(apt => apt._id === appointmentId)
      if (appointment) {
        setSelectedAppointment(appointment)
      }
    }

    // Load chat history and setup real-time listeners
    loadChatHistory()
    
    realtimeService.onChatMessage((data) => {
      if (selectedAppointment && data.appointmentId === selectedAppointment._id) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: data.senderId,
          text: data.message,
          timestamp: new Date(data.timestamp),
          senderName: data.senderName
        }])
      }
    })
  }, [location, appointments, selectedAppointment])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = () => {
    if (selectedAppointment) {
      // In a real app, this would load from the API
      // For now, we'll simulate with some sample messages
      const sampleMessages = [
        {
          id: 1,
          sender: user._id,
          text: `Hello Doctor, I have some questions about my appointment scheduled for ${new Date(selectedAppointment.date).toLocaleDateString()} at ${selectedAppointment.time}.`,
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          senderName: user.name
        },
        {
          id: 2,
          sender: selectedAppointment.doctor?._id,
          text: `Hello ${user.name}, I'm here to help you with any questions about your appointment. What would you like to know?`,
          timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
          senderName: selectedAppointment.doctor?.name
        }
      ]
      setMessages(sampleMessages)
    }
  }

  const handleSend = () => {
    if (!input.trim() || !selectedAppointment) return

    const newMessage = {
      id: Date.now(),
      sender: user._id,
      text: input,
      timestamp: new Date(),
      senderName: user.name
    }

    // Add message to local state
    setMessages(prev => [...prev, newMessage])
    setInput('')

    // Send message via realtime service
    realtimeService.sendChatMessage({
      appointmentId: selectedAppointment._id,
      senderId: user._id,
      senderName: user.name,
      message: input,
      timestamp: new Date().toISOString(),
      recipientId: selectedAppointment.doctor._id,
      recipientName: selectedAppointment.doctor.name
    })

    toast.success('Message sent!')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getAvailableAppointments = () => {
    return appointments.filter(apt => apt.patient?._id === user._id && (apt.status === 'confirmed' || apt.status === 'pending'))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat with Doctor</h1>
              <p className="text-gray-600">Communicate with your doctor about your appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Appointment List Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Select Doctor</h2>
            <p className="text-sm text-gray-600">Choose an appointment to start chatting</p>
          </div>
          <div className="overflow-y-auto h-full">
            {getAvailableAppointments().map((appointment) => (
              <button
                key={appointment._id}
                onClick={() => setSelectedAppointment(appointment)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                  selectedAppointment?._id === appointment._id ? 'bg-blue-100 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {appointment.doctor?.name || 'Unknown Doctor'}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {appointment.doctor?.specialization || 'General'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">at</span>
                      <span className="text-xs text-gray-500">{appointment.time}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedAppointment ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedAppointment.doctor?.name || 'Unknown Doctor'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Doctor • {selectedAppointment.doctor?.specialization || 'General'} • Appointment: {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                      </p>
                      <p className="text-sm text-gray-500">
                        Symptoms: {selectedAppointment.reason || selectedAppointment.symptoms}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-[70%] ${message.sender === user._id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === user._id ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {message.sender === user._id ? (
                          <User className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Stethoscope className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className={`p-3 rounded-2xl ${
                          message.sender === user._id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-800 shadow-sm border'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.senderName} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Doctor</h3>
                <p className="text-gray-500">Choose an appointment from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientChat
