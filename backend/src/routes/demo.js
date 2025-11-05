import express from 'express'
import mongoose from 'mongoose'

const router = express.Router()

// Check if database is connected
const isDBConnected = () => {
  return mongoose.connection.readyState === 1
}

// Demo data for when database is not connected
const DEMO_DOCTORS = [
  {
    _id: 'demo_doctor_1',
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    rating: 4.8,
    reviewCount: 156,
    experience: 10,
    location: 'Guntur',
    bio: 'Senior Cardiologist with expertise in interventional cardiology.',
    phone: '+91-863-1234567',
    email: 'sarah.johnson@hospital.com',
    consultationFee: 800,
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
  },
  {
    _id: 'demo_doctor_2',
    name: 'Dr. Rajesh Kumar',
    specialization: 'Neurology',
    rating: 4.7,
    reviewCount: 134,
    experience: 12,
    location: 'Guntur',
    bio: 'Expert in neurological disorders and stroke management.',
    phone: '+91-863-1234568',
    email: 'rajesh.kumar@hospital.com',
    consultationFee: 750,
    availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30']
  },
  {
    _id: 'demo_doctor_3',
    name: 'Dr. Priya Reddy',
    specialization: 'Dermatology',
    rating: 4.6,
    reviewCount: 98,
    experience: 8,
    location: 'Guntur',
    bio: 'Specialist in cosmetic dermatology and skin cancer treatment.',
    phone: '+91-863-1234569',
    email: 'priya.reddy@hospital.com',
    consultationFee: 600,
    availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00']
  },
  {
    _id: 'demo_doctor_4',
    name: 'Dr. Michael Chen',
    specialization: 'General Medicine',
    rating: 4.5,
    reviewCount: 89,
    experience: 6,
    location: 'Guntur',
    bio: 'General practitioner with expertise in primary care and preventive medicine.',
    phone: '+91-863-1234570',
    email: 'michael.chen@hospital.com',
    consultationFee: 500,
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  }
]

const DEMO_USER = {
  _id: 'demo_user_id',
  name: 'Demo User',
  email: 'demo@demo.com',
  role: 'patient',
  phone: '+91-9876543210'
}

// Demo login endpoint
router.post('/auth/demo-login', async (req, res) => {
  if (isDBConnected()) {
    return res.status(400).json({
      success: false,
      message: 'Database connected. Please use regular login.'
    })
  }

  const token = require('crypto').randomBytes(32).toString('hex')
  
  res.json({
    success: true,
    message: 'Demo login successful',
    data: {
      user: DEMO_USER,
      token: `demo_${token}`
    }
  })
})

// Demo doctors endpoint
router.get('/users/doctors/demo', async (req, res) => {
  if (isDBConnected()) {
    return res.status(400).json({
      success: false,
      message: 'Database connected. Please use regular doctors endpoint.'
    })
  }

  const { specialization, search } = req.query
  
  let doctors = [...DEMO_DOCTORS]
  
  if (specialization) {
    doctors = doctors.filter(doc => 
      doc.specialization.toLowerCase().includes(specialization.toLowerCase())
    )
  }
  
  if (search) {
    doctors = doctors.filter(doc =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase())
    )
  }

  res.json({
    success: true,
    data: {
      doctors,
      pagination: {
        current: 1,
        pages: 1,
        total: doctors.length,
        limit: 10
      }
    },
    message: 'Demo mode: Showing demo doctors data'
  })
})

export default router

