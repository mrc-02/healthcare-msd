import mongoose from 'mongoose'

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1
}

export const handleDBError = (error, req, res, next) => {
  // Check if it's a database connection error
  if (!isDBConnected() && error.name === 'MongoError') {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Running in demo mode.',
      demo: true,
      error: 'Database connection error'
    })
  }
  
  // For other database-related errors when DB is not connected
  if (!isDBConnected() && (error.message.includes('MongoError') || error.message.includes('Mongoose'))) {
    return res.status(503).json({
      success: false,
      message: 'Database not available. This is a demo deployment.',
      demo: true,
      suggestion: 'This demo is working without MongoDB. Some features may be limited.',
      data: {
        message: 'Please note this is a demonstration without database connectivity.'
      }
    })
  }
  
  next(error)
}

export default { isDBConnected, handleDBError }

