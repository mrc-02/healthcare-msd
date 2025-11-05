import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { auth } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validation.js'
import User from '../models/User.js'
import Appointment from '../models/Appointment.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// Get all users with filtering
router.get('/', auth, async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query
    
    let query = {}
    
    // Filter by role
    if (role) {
      query.role = role
    }
    
    // Filter by status
    if (status) {
      query.status = status
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await User.countDocuments(query)
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    })
  }
})

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    })
  }
})

// Update user profile
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('address').optional().trim(),
  body('specialization').optional().trim(),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('qualification').optional().trim(),
  body('bio').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.params.id
    const updates = req.body
    
    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    // Check if user is updating their own profile or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      })
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')
    
    // Note: Real-time updates disabled for serverless deployment
    
    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'User updated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    })
  }
})

// Get user statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const userId = req.params.id
    
    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    let stats = {}
    
    if (user.role === 'doctor') {
      // Doctor statistics
      const totalAppointments = await Appointment.countDocuments({ doctor: userId })
      const completedAppointments = await Appointment.countDocuments({ 
        doctor: userId, 
        status: 'completed' 
      })
      const pendingAppointments = await Appointment.countDocuments({ 
        doctor: userId, 
        status: 'pending' 
      })
      const totalPatients = await Appointment.distinct('patient', { doctor: userId })
      
      // Calculate monthly earnings (assuming ₹800 per consultation)
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      
      const monthlyAppointments = await Appointment.countDocuments({
        doctor: userId,
        status: 'completed',
        createdAt: { $gte: thisMonth }
      })
      
      const monthlyEarnings = monthlyAppointments * 800
      
      stats = {
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalPatients: totalPatients.length,
        monthlyEarnings,
        averageRating: 4.8, // This would come from reviews
        responseTime: '2.5 min' // This would be calculated from actual data
      }
    } else if (user.role === 'patient') {
      // Patient statistics
      const totalAppointments = await Appointment.countDocuments({ patient: userId })
      const completedAppointments = await Appointment.countDocuments({ 
        patient: userId, 
        status: 'completed' 
      })
      const upcomingAppointments = await Appointment.countDocuments({ 
        patient: userId, 
        status: { $in: ['pending', 'confirmed'] },
        date: { $gte: new Date() }
      })
      
      stats = {
        totalAppointments,
        completedAppointments,
        upcomingAppointments,
        lastAppointment: await Appointment.findOne({ patient: userId })
          .sort({ date: -1 })
          .populate('doctor', 'name specialization')
      }
    }
    
    res.json({
      success: true,
      data: { stats }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    })
  }
})

// Get user's appointments
router.get('/:id/appointments', auth, async (req, res) => {
  try {
    const userId = req.params.id
    const { status, date, page = 1, limit = 10 } = req.query
    
    let query = {}
    
    // Check if user is doctor or patient
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    if (user.role === 'doctor') {
      query.doctor = userId
    } else if (user.role === 'patient') {
      query.patient = userId
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role'
      })
    }
    
    // Add filters
    if (status) {
      query.status = status
    }
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      query.date = { $gte: startOfDay, $lte: endOfDay }
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email phone')
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await Appointment.countDocuments(query)
    
    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    })
  }
})

// Get user's notifications
router.get('/:id/notifications', auth, async (req, res) => {
  try {
    const userId = req.params.id
    const { unread, page = 1, limit = 10 } = req.query
    
    let query = { user: userId }
    
    if (unread === 'true') {
      query.read = false
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await Notification.countDocuments(query)
    
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    })
  }
})

// Mark notification as read
router.put('/:id/notifications/:notificationId/read', auth, async (req, res) => {
  try {
    const { id, notificationId } = req.params
    
    // Check if user is authorized
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    )
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }
    
    // Note: Real-time updates disabled for serverless deployment
    
    res.json({
      success: true,
      data: { notification },
      message: 'Notification marked as read'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    })
  }
})

// Get doctors list for patients (public endpoint for testing)
router.get('/doctors/list', async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query
    
    let query = { role: 'doctor', isActive: true }
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ]
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const doctors = await User.find(query)
      .select('name email specialization experience qualification bio phone location licenseNumber')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await User.countDocuments(query)
    
    console.log('Found doctors:', doctors.length, 'Query:', query)
    
    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    })
  }
})

// Get patients list for doctors
router.get('/patients/list', auth, async (req, res) => {
  try {
    // Only doctors and admins can access this
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }
    
    const { search, page = 1, limit = 10 } = req.query
    
    let query = { role: 'patient' }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const patients = await User.find(query)
      .select('name email phone dateOfBirth gender address')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await User.countDocuments(query)
    
    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    })
  }
})

export default router