import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

export const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    }

    const result = await transporter.sendMail(mailOptions)
    return result
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

export const sendAppointmentConfirmation = async (userEmail, userName, appointment) => {
  const subject = 'Appointment Confirmation'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Appointment Confirmed</h2>
      <p>Dear ${userName},</p>
      <p>Your appointment has been confirmed with the following details:</p>
      <ul>
        <li><strong>Doctor:</strong> ${appointment.doctor.name}</li>
        <li><strong>Date:</strong> ${appointment.date.toDateString()}</li>
        <li><strong>Time:</strong> ${appointment.time}</li>
        <li><strong>Status:</strong> ${appointment.status}</li>
      </ul>
      <p>Please arrive 15 minutes before your scheduled time.</p>
      <p>Best regards,<br>Healthcare Management System</p>
    </div>
  `
  
  return await sendEmail(userEmail, subject, html)
}

export const sendMedicineTrackingUpdate = async (userEmail, userName, medicine) => {
  const subject = 'Medicine Tracking Update'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Medicine Tracking Update</h2>
      <p>Dear ${userName},</p>
      <p>Your medicine tracking has been updated:</p>
      <ul>
        <li><strong>Medicine:</strong> ${medicine.name}</li>
        <li><strong>Batch Number:</strong> ${medicine.batchNumber}</li>
        <li><strong>Current Stage:</strong> ${medicine.currentStage}</li>
        <li><strong>Manufacturer:</strong> ${medicine.manufacturer}</li>
      </ul>
      <p>You can track your medicine using the batch number: <strong>${medicine.batchNumber}</strong></p>
      <p>Best regards,<br>Healthcare Management System</p>
    </div>
  `
  
  return await sendEmail(userEmail, subject, html)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatTime = (time) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const calculatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit)
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  }
}

export const generateAvatarUrl = (name, background = '0ea5e9', color = 'fff') => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=${color}`
}

export const isPastDate = (date) => {
  return new Date(date) < new Date()
}

export const isToday = (date) => {
  const today = new Date()
  const checkDate = new Date(date)
  return checkDate.toDateString() === today.toDateString()
}

export const getTimeSlots = (startHour = 9, endHour = 17, interval = 30) => {
  const slots = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  return slots
}
