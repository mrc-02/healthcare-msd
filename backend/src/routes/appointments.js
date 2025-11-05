import express from 'express'
import Appointment from '../models/Appointment.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'
import { validateRequest, validateAppointment, validateAppointmentUpdate, validateObjectId, validatePagination } from '../middleware/validation.js'

const router = express.Router()

// @route   GET /api/appointments
// @desc    Get appointments (filtered by user role)
// @access  Private
router.get('/', authenticateToken, validatePagination, validateRequest, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { status, date, doctor } = req.query

    // Build filter based on user role
    let filter = {}
    if (req.user.role === 'patient') {
      filter.patient = req.user._id
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user._id
    }
    // Admin can see all appointments

    if (status) filter.status = status
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      filter.date = { $gte: startDate, $lt: endDate }
    }
    if (doctor) filter.doctor = doctor

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email specialization avatar')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Appointment.countDocuments(filter)

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAppointments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    console.error('Get appointments error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    })
  }
})

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId, validateRequest, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email specialization avatar')

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }

    // Check if user can access this appointment
    const canAccess = req.user.role === 'admin' || 
                     appointment.patient._id.toString() === req.user._id.toString() ||
                     appointment.doctor._id.toString() === req.user._id.toString()

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      data: {
        appointment
      }
    })
  } catch (error) {
    console.error('Get appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    })
  }
})

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', authenticateToken, validateAppointment, validateRequest, async (req, res) => {
  try {
    // Patients can only book appointments for themselves
    if (req.user.role === 'patient') {
      req.body.patient = req.user._id
    }

    // Verify doctor exists and is active
    const doctor = await User.findById(req.body.doctor)
    if (!doctor || doctor.role !== 'doctor' || !doctor.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor selected'
      })
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctor: req.body.doctor,
      date: req.body.date,
      time: req.body.time,
      status: { $in: ['pending', 'confirmed'] }
    })

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      })
    }

    const appointment = new Appointment(req.body)
    await appointment.save()

    // Populate the appointment
    await appointment.populate([
      { path: 'patient', select: 'name email phone avatar' },
      { path: 'doctor', select: 'name email specialization avatar' }
    ])

    // Create notification for doctor
    await Notification.create({
      user: doctor._id,
      title: 'New Appointment Request',
      message: `New appointment request from ${appointment.patient.name} for ${appointment.date.toDateString()} at ${appointment.time}`,
      type: 'appointment',
      priority: 'medium',
      metadata: { appointmentId: appointment._id }
    })

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment
      }
    })
  } catch (error) {
    console.error('Create appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    })
  }
})

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', authenticateToken, validateObjectId, validateAppointmentUpdate, validateRequest, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }

    // Check if user can update this appointment
    const canUpdate = req.user.role === 'admin' || 
                     appointment.doctor.toString() === req.user._id.toString()

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'name email phone avatar' },
      { path: 'doctor', select: 'name email specialization avatar' }
    ])

    // Create notification for patient if status changed
    if (req.body.status && req.body.status !== appointment.status) {
      await Notification.create({
        user: appointment.patient,
        title: 'Appointment Status Updated',
        message: `Your appointment status has been updated to ${req.body.status}`,
        type: 'appointment',
        priority: 'medium',
        metadata: { appointmentId: appointment._id }
      })
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment: updatedAppointment
      }
    })
  } catch (error) {
    console.error('Update appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    })
  }
})

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', authenticateToken, validateObjectId, validateRequest, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }

    // Check if user can cancel this appointment
    const canCancel = req.user.role === 'admin' || 
                     appointment.patient.toString() === req.user._id.toString() ||
                     appointment.doctor.toString() === req.user._id.toString()

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Update status to cancelled instead of deleting
    appointment.status = 'cancelled'
    await appointment.save()

    // Create notification
    const notifyUser = appointment.patient.toString() === req.user._id.toString() 
      ? appointment.doctor 
      : appointment.patient

    await Notification.create({
      user: notifyUser,
      title: 'Appointment Cancelled',
      message: `Appointment scheduled for ${appointment.date.toDateString()} at ${appointment.time} has been cancelled`,
      type: 'appointment',
      priority: 'medium',
      metadata: { appointmentId: appointment._id }
    })

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    })
  }
})

// @route   GET /api/appointments/doctor/:doctorId/availability
// @desc    Get doctor's available time slots
// @access  Private
router.get('/doctor/:doctorId/availability', authenticateToken, validateObjectId, validateRequest, async (req, res) => {
  try {
    const { date } = req.query
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      })
    }

    const doctor = await User.findById(req.params.doctorId)
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      })
    }

    const appointmentDate = new Date(date)
    const startOfDay = new Date(appointmentDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(appointmentDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get existing appointments for the day
    const existingAppointments = await Appointment.find({
      doctor: req.params.doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    }).select('time duration')

    // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
    const availableSlots = []
    const startHour = 9
    const endHour = 17

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const isBooked = existingAppointments.some(apt => apt.time === timeString)
        
        if (!isBooked) {
          availableSlots.push(timeString)
        }
      }
    }

    res.json({
      success: true,
      data: {
        availableSlots,
        doctor: {
          name: doctor.name,
          specialization: doctor.specialization
        }
      }
    })
  } catch (error) {
    console.error('Get availability error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor availability',
      error: error.message
    })
  }
})

export default router
