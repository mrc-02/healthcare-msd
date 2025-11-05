import express from 'express'
import { sendWelcomeEmail, sendAppointmentConfirmation } from '../utils/emailService.js'

const router = express.Router()

// Test email endpoint
router.post('/email', async (req, res) => {
  try {
    const { email, type } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    let result
    if (type === 'welcome') {
      result = await sendWelcomeEmail(email, {
        name: 'Test User',
        email: email,
        role: 'patient'
      })
    } else {
      result = await sendAppointmentConfirmation(email, {
        patientName: 'Test Patient',
        doctorName: 'Dr. Test',
        specialization: 'General Medicine',
        date: new Date().toDateString(),
        time: '10:00 AM',
        symptoms: 'Test symptoms',
        status: 'confirmed'
      })
    }

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    })
  } catch (error) {
    console.error('Test email error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    })
  }
})

export default router