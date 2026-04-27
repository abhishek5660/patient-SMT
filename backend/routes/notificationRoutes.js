const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET api/notifications
// @desc    Get all notifications for a user
// @access  Private
router.get('/', protect, notificationController.getNotifications);

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', protect, notificationController.markAsRead);

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, notificationController.markAllRead);

module.exports = router;
