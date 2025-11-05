import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { 
  mockUsers, 
  generateMockToken, 
  findUserByEmail, 
  findUserById, 
  addMockUser 
} from '../middleware/mockAuth.js'
import mongoose from 'mongoose'

const router = express.Router()

// Check if database is connected
const isDBConnected = () => {
  return mongoose.connection.readyState === 1
}

// Mock signup - creates user in memory for demo
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization } = req.body

    // Check if database is connected
    if (isDBConnected()) {
      return res.status(400).json({
        success: false,
        message: 'Database connected. Please use regular signup endpoint.'
      })
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create mock user
    const userData = {
      name,
      email,
      password, // Stored as plain text for demo
      role: role || 'patient',
      phone,
      isActive: true
    }

    if (role === 'doctor') {
      userData.specialization = specialization
      userData.experience = 0
      userData.location = 'Guntur'
    }

    const newUser = addMockUser(userData)

    // Generate mock token
    const token = generateMockToken(newUser._id)

    res.status(201).json({
      success: true,
      message: 'User registered successfully (Demo Mode)',
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          specialization: newUser.specialization,
          createdAt: newUser.createdAt
        },
        token
      }
    })
  } catch (error) {
    console.error('Mock signup error:', error)
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    })
  }
})

// Mock login - authenticates against in-memory users
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if database is connected
    if (isDBConnected()) {
      return res.status(400).json({
        success: false,
        message: 'Database connected. Please use regular login endpoint.'
      })
    }

    // Find user
    const user = findUserByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials (Demo: Try demo@demo.com / demo123)'
      })
    }

    // Check password (plain text comparison for demo)
    if (user.password !== password) {
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

    // Generate token
    const token = generateMockToken(user._id)

    res.json({
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
  } catch (error) {
    console.error('Mock login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    })
  }
})

// Mock get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7)

    // Extract user ID from token (simple for demo)
    let userId = null
    if (token.startsWith('demo_token_')) {
      const parts = token.split('_')
      userId = `mock_user_${parts[2]}`
    }

    // Find user by ID
    const user = findUserById(userId)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          specialization: user.specialization
        }
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

export default router

