const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  sendSystemNotification,
  getNotificationStats
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

// User notification routes
router.get('/', protect, getNotifications);
router.get('/count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

// Admin notification routes
router.post('/system', protect, adminOnly, sendSystemNotification);
router.get('/stats', protect, adminOnly, getNotificationStats);

module.exports = router;
