import express from 'express'
import Notification from '../models/Notification.js'
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'
import { validateRequest, validateNotification, validateObjectId, validatePagination } from '../middleware/validation.js'

const router = express.Router()

router.get('/', authenticateToken, validatePagination, validateRequest, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { read, type, priority } = req.query

    const filter = { user: req.user._id }
    if (read !== undefined) filter.read = read === 'true'
    if (type) filter.type = type
    if (priority) filter.priority = priority

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Notification.countDocuments(filter)
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    })

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    })
  }
})

router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    })

    res.json({
      success: true,
      data: {
        unreadCount
      }
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    })
  }
})

router.get('/:id', authenticateToken, validateObjectId, validateRequest, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      data: {
        notification
      }
    })
  } catch (error) {
    console.error('Get notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification',
      error: error.message
    })
  }
})

router.post('/', authenticateToken, authorizeRoles('admin'), validateNotification, validateRequest, async (req, res) => {
  try {
    const notification = new Notification({
      ...req.body,
      user: req.body.userId || req.user._id
    })
    await notification.save()

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification
      }
    })
  } catch (error) {
    console.error('Create notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    })
  }
})

router.put('/:id/read', authenticateToken, validateObjectId, validateRequest, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    notification.read = true
    await notification.save()

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification
      }
    })
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    })
  }
})

router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    )

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    })
  }
})

router.delete('/:id', authenticateToken, validateObjectId, validateRequest, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    // Check if user can delete this notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    await Notification.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    })
  }
})

router.delete('/clear-all', authenticateToken, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id })

    res.json({
      success: true,
      message: 'All notifications cleared'
    })
  } catch (error) {
    console.error('Clear all notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to clear all notifications',
      error: error.message
    })
  }
})

export default router
