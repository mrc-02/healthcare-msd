import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'
import { validateRequest, validateUserRegistration, validateUserLogin } from '../middleware/validation.js'
import { findUserByEmail, addMockUser, generateMockToken } from '../middleware/mockAuth.js'

const router = express.Router()

// Check if database is connected
const isDBConnected = () => mongoose.connection.readyState === 1

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production'
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

// Custom validation for registration
router.post('/register', async (req, res, next) => {
  // Basic validation
  const { name, email, password, role } = req.body
  
  if (!name || name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 2 and 50 characters'
    })
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email'
    })
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    })
  }
  
  if (role && !['patient', 'doctor', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be patient, doctor, or admin'
    })
  }
  
  next()
}, async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, licenseNumber } = req.body

    // Use mock auth if database not connected
    if (!isDBConnected()) {
      const existingUser = findUserByEmail(email)
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        })
      }

      const userData = {
        name,
        email,
        password,
        role: role || 'patient',
        phone: phone || '',
        isActive: true
      }

      if (role === 'doctor') {
        userData.specialization = specialization
        userData.experience = 0
        userData.location = 'Guntur'
      }

      const newUser = addMockUser(userData)
      const token = generateMockToken(newUser._id)

      return res.status(201).json({
        success: true,
        message: 'User registered successfully (Demo Mode)',
        data: {
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            specialization: newUser.specialization
          },
          token
        }
      })
    }

    // Normal database flow
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    const userData = {
      name,
      email,
      password,
      role: role || 'patient',
      phone: phone || '',
      isActive: true
    }

    if (role === 'doctor') {
      if (!specialization || !licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'Specialization and license number are required for doctors'
        })
      }
      userData.specialization = specialization
      userData.licenseNumber = licenseNumber
      userData.experience = parseInt(req.body.experience) || 0
      userData.location = req.body.location || ''
      userData.bio = `Experienced ${specialization} specialist with ${req.body.experience || 0} years of practice.`
    }

    const user = new User(userData)
    await user.save()

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    })
  }
})

router.post('/login', validateUserLogin, validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body

    // Use mock auth if database not connected
    if (!isDBConnected()) {
      const user = findUserByEmail(email)
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials (Demo: Try demo@demo.com / demo123)'
        })
      }

      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }

      const token = generateMockToken(user._id)
      return res.json({
        success: true,
        message: 'Login successful (Demo Mode)',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            specialization: user.specialization
          },
          token
        }
      })
    }

    // Normal database flow
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    })
  }
})

router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    })
  }
})

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    })
  }
})

router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = generateToken(req.user._id)
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message
    })
  }
})

export default router
