// Mock authentication for demo mode without MongoDB

// In-memory storage for demo users
export let mockUsers = [
  {
    _id: 'mock_user_1',
    name: 'Demo User',
    email: 'demo@demo.com',
    password: 'demo123', // Plain text for demo
    role: 'patient',
    phone: '+91-9876543210',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'mock_doctor_1',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@demo.com',
    password: 'demo123',
    role: 'doctor',
    specialization: 'Cardiology',
    phone: '+91-863-1234567',
    isActive: true,
    experience: 10,
    location: 'Guntur',
    createdAt: new Date()
  },
  {
    _id: 'mock_admin_1',
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'admin',
    isActive: true,
    createdAt: new Date()
  }
]

// Simple JWT generation for demo
export const generateMockToken = (userId) => {
  return `demo_token_${userId}_${Date.now()}`
}

// Find user by email
export const findUserByEmail = (email) => {
  return mockUsers.find(u => u.email === email)
}

// Find user by ID
export const findUserById = (id) => {
  return mockUsers.find(u => u._id === id)
}

// Add new user
export const addMockUser = (userData) => {
  const newUser = {
    _id: `mock_user_${Date.now()}`,
    ...userData,
    createdAt: new Date()
  }
  mockUsers.push(newUser)
  return newUser
}

export default { mockUsers, generateMockToken, findUserByEmail, findUserById, addMockUser }

