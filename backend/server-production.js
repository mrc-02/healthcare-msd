import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'

import authRoutes from './src/routes/auth.js'
import userRoutes from './src/routes/users.js'
import appointmentRoutes from './src/routes/appointments.js'
import medicineRoutes from './src/routes/medicines.js'
import notificationRoutes from './src/routes/notifications.js'
import demoRoutes from './src/routes/demo.js'
import mockAuthRoutes from './src/routes/mockAuth.js'

import { errorHandler } from './src/middleware/errorHandler.js'
import { handleDBError } from './src/middleware/demoHandler.js'

dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))

// General rate limiter - increased for production (1000 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased from 100 to 1000
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})

// Auth-specific rate limiter - more permissive for login/register (100 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 login/register attempts per 15 minutes per IP
  message: 'Too many authentication attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins against limit
})

// CORS configuration - allow all origins in production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    // In production, allow all origins for public API access
    if (!origin || process.env.NODE_ENV === 'production' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      callback(null, true)
    } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all origins in production by default
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return
  }

  try {
    const mongoURI = process.env.MONGODB_URI
    if (!mongoURI) {
      console.warn('⚠️ MONGODB_URI not set, running in DEMO MODE')
      return
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds for serverless
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('⚠️ MongoDB connection error:', error.message)
    console.log('ℹ️ Running in DEMO MODE without database')
  }
}

connectDB().catch(err => {
  console.log('ℹ️ Continuing without database connection')
})

// API routes
app.use('/api', demoRoutes)  // Demo routes first

// Auth routes with permissive rate limiter (login/register can be called many times)
// These routes allow 100 attempts per 15 minutes per IP
app.use('/api/auth/mock', authLimiter, mockAuthRoutes)  // Mock auth for demo mode
app.use('/api/auth', authLimiter, authRoutes)  // More permissive rate limiting for auth

// Apply general rate limiter to all other API routes (1000 requests per 15 minutes)
app.use('/api/users', limiter, userRoutes)
app.use('/api/appointments', limiter, appointmentRoutes)
app.use('/api/medicines', limiter, medicineRoutes)
app.use('/api/notifications', limiter, notificationRoutes)

// Database error handler
app.use(handleDBError)

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1
  res.json({ 
    status: 'OK', 
    message: 'Healthcare Management System API is running',
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'disconnected (DEMO MODE)',
    mode: isConnected ? 'production' : 'demo',
    note: isConnected ? 'Database connected' : 'Running in demo mode without database. Frontend UI works, but API calls return errors. Visit the homepage to see the UI.',
    demo: !isConnected,
    demoInfo: !isConnected ? {
      message: 'Frontend demo is available at homepage. Backend API requires MongoDB for full functionality.',
      frontend: 'Working',
      api: 'Limited without MongoDB'
    } : null
  })
})

// Error handler
app.use(errorHandler)

// Only start server if not in Vercel serverless environment
// Vercel will handle the serverless function execution
if (process.env.VERCEL !== '1') {
  // Serve static files from frontend build
  const frontendPath = path.join(__dirname, '../frontend/dist')
  app.use(express.static(frontendPath))

  // Catch all handler: send back React's index.html file for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
      })
    }
    
    res.sendFile(path.join(frontendPath, 'index.html'))
  })

  const PORT = process.env.PORT || 3000

  app.listen(PORT, '0.0.0.0', () => {
    const isConnected = mongoose.connection.readyState === 1
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`)
    console.log(`🗄️  Database: ${isConnected ? 'Connected' : 'Demo Mode'}`)
  })
}

export default app

