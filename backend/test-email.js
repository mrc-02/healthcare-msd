import { sendWelcomeEmail } from './src/utils/emailService.js'

// Test email sending
const testEmail = async () => {
  try {
    console.log('Testing email service...')
    
    const result = await sendWelcomeEmail('your-email@gmail.com', {
      name: 'Test User',
      email: 'your-email@gmail.com',
      role: 'patient'
    })
    
    console.log('Email sent successfully:', result)
  } catch (error) {
    console.error('Email test failed:', error)
  }
}

testEmail()