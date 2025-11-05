// Vercel serverless function entry point
import app from '../backend/server-production.js'

// Export as Vercel serverless function
// Vercel will automatically detect and use this as the handler
export default app

