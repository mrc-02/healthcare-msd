import express from 'express'
import Medicine from '../models/Medicine.js'
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'
import { validateRequest, validateMedicine, validateObjectId, validatePagination } from '../middleware/validation.js'

const router = express.Router()

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Private
router.get('/', authenticateToken, validatePagination, validateRequest, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { name, manufacturer, currentStage, search } = req.query

    // Build filter
    const filter = { isActive: true }
    if (name) filter.name = { $regex: name, $options: 'i' }
    if (manufacturer) filter.manufacturer = { $regex: manufacturer, $options: 'i' }
    if (currentStage) filter.currentStage = currentStage
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } }
      ]
    }

    const medicines = await Medicine.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Medicine.countDocuments(filter)

    res.json({
      success: true,
      data: {
        medicines,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalMedicines: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    console.error('Get medicines error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicines',
      error: error.message
    })
  }
})

// @route   GET /api/medicines/:id
// @desc    Get medicine by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId, validateRequest, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      })
    }

    res.json({
      success: true,
      data: {
        medicine
      }
    })
  } catch (error) {
    console.error('Get medicine error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicine',
      error: error.message
    })
  }
})

// @route   POST /api/medicines
// @desc    Create new medicine (Admin only)
// @access  Private/Admin
router.post('/', authenticateToken, authorizeRoles('admin'), validateMedicine, validateRequest, async (req, res) => {
  try {
    // Check if batch number already exists
    const existingMedicine = await Medicine.findOne({ batchNumber: req.body.batchNumber })
    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: 'Medicine with this batch number already exists'
      })
    }

    const medicine = new Medicine(req.body)
    await medicine.save()

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: {
        medicine
      }
    })
  } catch (error) {
    console.error('Create medicine error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create medicine',
      error: error.message
    })
  }
})

// @route   PUT /api/medicines/:id
// @desc    Update medicine (Admin only)
// @access  Private/Admin
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateObjectId, validateRequest, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      })
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: {
        medicine: updatedMedicine
      }
    })
  } catch (error) {
    console.error('Update medicine error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update medicine',
      error: error.message
    })
  }
})

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validateObjectId, validateRequest, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      })
    }

    // Soft delete by setting isActive to false
    medicine.isActive = false
    await medicine.save()

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    })
  } catch (error) {
    console.error('Delete medicine error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete medicine',
      error: error.message
    })
  }
})

// @route   PUT /api/medicines/:id/stage
// @desc    Update medicine stage (Admin only)
// @access  Private/Admin
router.put('/:id/stage', authenticateToken, authorizeRoles('admin'), validateObjectId, validateRequest, async (req, res) => {
  try {
    const { stageName, location, notes, temperature, humidity } = req.body

    if (!stageName || !location) {
      return res.status(400).json({
        success: false,
        message: 'Stage name and location are required'
      })
    }

    const medicine = await Medicine.findById(req.params.id)

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      })
    }

    // Add new stage
    const newStage = {
      name: stageName,
      location,
      date: new Date(),
      completed: true,
      notes,
      temperature,
      humidity
    }

    medicine.stages.push(newStage)
    medicine.currentStage = stageName.toLowerCase().replace(/\s+/g, '-')

    await medicine.save()

    res.json({
      success: true,
      message: 'Medicine stage updated successfully',
      data: {
        medicine
      }
    })
  } catch (error) {
    console.error('Update medicine stage error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update medicine stage',
      error: error.message
    })
  }
})

// @route   GET /api/medicines/track/:batchNumber
// @desc    Track medicine by batch number
// @access  Private
router.get('/track/:batchNumber', authenticateToken, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ 
      batchNumber: req.params.batchNumber,
      isActive: true 
    })

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found with this batch number'
      })
    }

    res.json({
      success: true,
      data: {
        medicine
      }
    })
  } catch (error) {
    console.error('Track medicine error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to track medicine',
      error: error.message
    })
  }
})

// @route   GET /api/medicines/expiring
// @desc    Get medicines expiring soon (Admin only)
// @access  Private/Admin
router.get('/expiring', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const expiringMedicines = await Medicine.find({
      expiryDate: { $lte: futureDate },
      isActive: true
    }).sort({ expiryDate: 1 })

    res.json({
      success: true,
      data: {
        medicines: expiringMedicines,
        days
      }
    })
  } catch (error) {
    console.error('Get expiring medicines error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring medicines',
      error: error.message
    })
  }
})

export default router
