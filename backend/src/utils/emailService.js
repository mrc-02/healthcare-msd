import nodemailer from 'nodemailer'

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '231fa04f98@gmail.com',
      pass: process.env.EMAIL_PASS || 'xdcn fgvb iweg tcxl'
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// Send appointment confirmation email
export const sendAppointmentConfirmation = async (patientEmail, appointmentData) => {
  try {
    console.log('Attempting to send appointment confirmation email to:', patientEmail)
    
    if (!patientEmail || !appointmentData) {
      throw new Error('Missing email or appointment data')
    }
    
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER || '231fa04f98@gmail.com',
      to: patientEmail,
      subject: 'Appointment Confirmation - Healthcare Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Appointment Confirmed</h2>
          <p>Dear ${appointmentData.patientName},</p>
          <p>Your appointment has been successfully booked. Here are the details:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Appointment Details</h3>
            <p><strong>Doctor:</strong> ${appointmentData.doctorName}</p>
            <p><strong>Specialization:</strong> ${appointmentData.specialization}</p>
            <p><strong>Date:</strong> ${appointmentData.date}</p>
            <p><strong>Time:</strong> ${appointmentData.time}</p>
            <p><strong>Symptoms:</strong> ${appointmentData.symptoms}</p>
            <p><strong>Status:</strong> ${appointmentData.status}</p>
          </div>
          
          <p>Please arrive 15 minutes before your scheduled appointment time.</p>
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          
          <p>Best regards,<br>Healthcare Management System</p>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Appointment confirmation email sent successfully:', result.messageId)
    return result
  } catch (error) {
    console.error('Error sending appointment confirmation email:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    })
    throw error
  }
}

// Send appointment cancellation email
export const sendAppointmentCancellation = async (patientEmail, appointmentData) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER || '231fa04f98@gmail.com',
      to: patientEmail,
      subject: 'Appointment Cancelled - Healthcare Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Dear ${appointmentData.patientName},</p>
          <p>Your appointment has been cancelled. Here were the details:</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #374151;">Cancelled Appointment</h3>
            <p><strong>Doctor:</strong> ${appointmentData.doctorName}</p>
            <p><strong>Date:</strong> ${appointmentData.date}</p>
            <p><strong>Time:</strong> ${appointmentData.time}</p>
          </div>
          
          <p>If you need to book a new appointment, please visit our website or contact us.</p>
          
          <p>Best regards,<br>Healthcare Management System</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Appointment cancellation email sent successfully')
  } catch (error) {
    console.error('Error sending appointment cancellation email:', error)
  }
}

// Send appointment status update email
export const sendAppointmentStatusUpdate = async (patientEmail, appointmentData) => {
  try {
    const transporter = createTransporter()
    
    const statusColors = {
      confirmed: '#059669',
      pending: '#d97706',
      completed: '#2563eb',
      cancelled: '#dc2626'
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || '231fa04f98@gmail.com',
      to: patientEmail,
      subject: 'Appointment Status Update - Healthcare Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusColors[appointmentData.status] || '#374151'};">Appointment Status Updated</h2>
          <p>Dear ${appointmentData.patientName},</p>
          <p>Your appointment status has been updated:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Appointment Details</h3>
            <p><strong>Doctor:</strong> ${appointmentData.doctorName}</p>
            <p><strong>Date:</strong> ${appointmentData.date}</p>
            <p><strong>Time:</strong> ${appointmentData.time}</p>
            <p><strong>New Status:</strong> <span style="color: ${statusColors[appointmentData.status]}; font-weight: bold; text-transform: uppercase;">${appointmentData.status}</span></p>
          </div>
          
          <p>Thank you for using our healthcare management system.</p>
          
          <p>Best regards,<br>Healthcare Management System</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Appointment status update email sent successfully')
  } catch (error) {
    console.error('Error sending appointment status update email:', error)
  }
}

// Send welcome email after registration
export const sendWelcomeEmail = async (userEmail, userData) => {
  try {
    console.log('Attempting to send welcome email to:', userEmail)
    
    if (!userEmail || !userData) {
      throw new Error('Missing email or user data')
    }
    
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER || '231fa04f98@gmail.com',
      to: userEmail,
      subject: 'Welcome to Healthcare Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Healthcare Management System!</h2>
          <p>Dear ${userData.name},</p>
          <p>Thank you for registering with our Healthcare Management System. Your account has been successfully created.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Account Details</h3>
            <p><strong>Name:</strong> ${userData.name}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Role:</strong> ${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</p>
            <p><strong>Registration Date:</strong> ${new Date().toDateString()}</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">What's Next?</h3>
            ${userData.role === 'patient' ? `
              <ul>
                <li>Complete your profile with medical history</li>
                <li>Book your first appointment with our qualified doctors</li>
                <li>Track your health metrics and medications</li>
                <li>Access our AI-powered symptom checker</li>
              </ul>
            ` : userData.role === 'doctor' ? `
              <ul>
                <li>Complete your professional profile</li>
                <li>Set your availability schedule</li>
                <li>Start managing patient appointments</li>
                <li>Access patient communication tools</li>
              </ul>
            ` : `
              <ul>
                <li>Access the admin dashboard</li>
                <li>Manage users and appointments</li>
                <li>Monitor system analytics</li>
                <li>Configure system settings</li>
              </ul>
            `}
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>Healthcare Management System Team</p>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Welcome email sent successfully:', result.messageId)
    return result
  } catch (error) {
    console.error('Error sending welcome email:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    })
    throw error
  }
}