import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { Server } from 'socket.io'

import authRoutes from './src/routes/auth.js'
import userRoutes from './src/routes/users.js'
import appointmentRoutes from './src/routes/appointments.js'
import medicineRoutes from './src/routes/medicines.js'
import notificationRoutes from './src/routes/notifications.js'

import { errorHandler } from './src/middleware/errorHandler.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))

// General rate limiter - increased for production usage (1000 requests per 15 minutes)
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

// CORS configuration - allow all origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    // In development and production, allow all origins
    if (!origin || process.env.ALLOW_ALL_ORIGINS === 'true') {
      callback(null, true)
    } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all origins by default
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
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsystem'
    console.log('🔗 Connecting to MongoDB...')
    console.log('📍 URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')) // Hide password in logs
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    })
    console.log('✅ MongoDB connected successfully')
    console.log('📊 Database:', mongoose.connection.db.databaseName)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('')
    console.error('To fix this:')
    console.error('1. Install MongoDB: https://www.mongodb.com/try/download/community')
    console.error('2. Start MongoDB service')
    console.error('3. Or update MONGODB_URI in backend/.env to your Atlas connection string')
    console.error('')
    process.exit(1)
  }
}

connectDB()

// Auth routes with permissive rate limiter (login/register can be called many times)
app.use('/api/auth', authLimiter, authRoutes)  // More permissive rate limiting for auth

// Apply general rate limiter to all other API routes (1000 requests per 15 minutes)
app.use('/api/users', limiter, userRoutes)
app.use('/api/appointments', limiter, appointmentRoutes)
app.use('/api/medicines', limiter, medicineRoutes)
app.use('/api/notifications', limiter, notificationRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1
  res.json({ 
    status: 'OK', 
    message: 'Healthcare Management System API is running',
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      connected: isConnected,
      readyState: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
    }
  })
})

// Error handler
app.use(errorHandler)

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  
  // Allow connection even without token (for demo mode or initial connection)
  // In production, you might want to require authentication
  if (!token) {
    console.log('📡 Client connected without token (allowed)')
    return next()
  }

  // If token is provided, verify it (optional - can be implemented later)
  // For now, allow all connections
  next()
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id)

  // Handle user joining rooms
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  socket.on('join-doctor-room', (doctorId) => {
    socket.join(`doctor-${doctorId}`)
    console.log(`Doctor ${doctorId} joined their room`)
  })

  socket.on('join-admin-room', () => {
    socket.join('admin')
    console.log('Admin joined admin room')
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })
})

// Make io available for use in routes if needed
app.locals.io = io

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, async () => {
  const isConnected = mongoose.connection.readyState === 1
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Database: ${isConnected ? '✅ Connected' : '❌ Not connected'}`)
  console.log(`🔌 Socket.IO server ready`)
  if (!isConnected) {
    console.error('⚠️  MongoDB connection required. Please check your MONGODB_URI in .env file')
  }
})

export default app

