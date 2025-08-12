const notificationService = require('../services/notificationService');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      req.user._id,
      { limit: parseInt(limit), unreadOnly: unreadOnly === 'true' }
    );

    res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const success = await notificationService.markAsRead(req.user._id, req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'notification_read',
      description: `Marked notification as read: ${req.params.id}`,
      resourceType: 'system',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { notificationId: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const count = await notificationService.markAllAsRead(req.user._id);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'notifications_read_all',
      description: `Marked all notifications as read (${count} notifications)`,
      resourceType: 'system',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { notificationCount: count }
    });

    res.status(200).json({
      success: true,
      message: `Marked ${count} notifications as read`,
      data: { count }
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking all notifications as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Send system notification (Admin only)
 * @route   POST /api/notifications/system
 * @access  Private (Admin)
 */
exports.sendSystemNotification = async (req, res) => {
  try {
    const { userIds, title, message, data = {} } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const notifications = await notificationService.broadcastNotification(
      userIds,
      title,
      message,
      data
    );

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'system_notification_sent',
      description: `Sent system notification to ${userIds.length} users: ${title}`,
      resourceType: 'system',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { 
        userIds,
        title,
        message,
        notificationCount: notifications.length
      }
    });

    res.status(200).json({
      success: true,
      message: `Notification sent to ${notifications.length} users`,
      data: { notifications }
    });
  } catch (error) {
    console.error('Send system notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending system notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get notification statistics (Admin only)
 * @route   GET /api/notifications/stats
 * @access  Private (Admin)
 */
exports.getNotificationStats = async (req, res) => {
  try {
    const stats = await notificationService.getNotificationStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
