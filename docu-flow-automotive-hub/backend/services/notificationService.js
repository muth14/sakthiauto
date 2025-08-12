const AuditLog = require('../models/AuditLog');

/**
 * Notification Service
 * Handles workflow notifications and alerts
 */
class NotificationService {
  constructor() {
    this.notifications = new Map(); // In-memory storage for demo
  }

  /**
   * Send workflow notification to user
   * @param {Object} user - Target user
   * @param {Object} submission - Form submission
   * @param {String} stage - Workflow stage
   */
  async sendWorkflowNotification(user, submission, stage) {
    try {
      const notification = {
        id: this.generateId(),
        userId: user._id,
        type: 'workflow',
        title: this.getNotificationTitle(stage),
        message: this.getNotificationMessage(submission, stage),
        data: {
          submissionId: submission._id,
          submissionTitle: submission.title,
          stage: stage,
          department: submission.department
        },
        read: false,
        createdAt: new Date()
      };

      // Store notification (in production, this would be in database)
      const userNotifications = this.notifications.get(user._id.toString()) || [];
      userNotifications.push(notification);
      this.notifications.set(user._id.toString(), userNotifications);

      // Log notification
      await AuditLog.createLog({
        user: user._id,
        action: 'notification_sent',
        description: `Notification sent: ${notification.title}`,
        resourceType: 'form_submission',
        resourceId: submission._id,
        resourceModel: 'FormSubmission',
        status: 'success',
        department: submission.department,
        metadata: {
          notificationType: 'workflow',
          stage: stage,
          notificationId: notification.id
        }
      });

      console.log(`📧 Notification sent to ${user.firstName} ${user.lastName}: ${notification.title}`);
      
      return notification;
    } catch (error) {
      console.error('Notification error:', error);
      return null;
    }
  }

  /**
   * Get notifications for user
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   */
  async getUserNotifications(userId, options = {}) {
    const { limit = 50, unreadOnly = false } = options;
    
    let notifications = this.notifications.get(userId.toString()) || [];
    
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    
    return notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  /**
   * Mark notification as read
   * @param {String} userId - User ID
   * @param {String} notificationId - Notification ID
   */
  async markAsRead(userId, notificationId) {
    const userNotifications = this.notifications.get(userId.toString()) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      notification.readAt = new Date();
      return true;
    }
    
    return false;
  }

  /**
   * Mark all notifications as read for user
   * @param {String} userId - User ID
   */
  async markAllAsRead(userId) {
    const userNotifications = this.notifications.get(userId.toString()) || [];
    const now = new Date();
    
    userNotifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = now;
      }
    });
    
    return userNotifications.length;
  }

  /**
   * Get unread count for user
   * @param {String} userId - User ID
   */
  async getUnreadCount(userId) {
    const notifications = this.notifications.get(userId.toString()) || [];
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Send system notification
   * @param {String} userId - User ID
   * @param {String} title - Notification title
   * @param {String} message - Notification message
   * @param {Object} data - Additional data
   */
  async sendSystemNotification(userId, title, message, data = {}) {
    try {
      const notification = {
        id: this.generateId(),
        userId: userId,
        type: 'system',
        title: title,
        message: message,
        data: data,
        read: false,
        createdAt: new Date()
      };

      const userNotifications = this.notifications.get(userId.toString()) || [];
      userNotifications.push(notification);
      this.notifications.set(userId.toString(), userNotifications);

      return notification;
    } catch (error) {
      console.error('System notification error:', error);
      return null;
    }
  }

  /**
   * Broadcast notification to multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {String} title - Notification title
   * @param {String} message - Notification message
   * @param {Object} data - Additional data
   */
  async broadcastNotification(userIds, title, message, data = {}) {
    const notifications = [];
    
    for (const userId of userIds) {
      const notification = await this.sendSystemNotification(userId, title, message, data);
      if (notification) {
        notifications.push(notification);
      }
    }
    
    return notifications;
  }

  /**
   * Helper methods
   */
  getNotificationTitle(stage) {
    const titles = {
      'Submitted': '📝 New Form Submitted',
      'Under Verification': '🔍 Form Ready for Verification',
      'Verified': '✅ Form Verified - Ready for Approval',
      'Approved': '🎉 Form Approved',
      'Rejected': '❌ Form Rejected',
      'Completed': '✨ Workflow Completed'
    };
    
    return titles[stage] || `📋 Form Status: ${stage}`;
  }

  getNotificationMessage(submission, stage) {
    const messages = {
      'Submitted': `Form "${submission.title}" has been submitted and is ready for verification.`,
      'Under Verification': `Form "${submission.title}" is now under verification and requires your attention.`,
      'Verified': `Form "${submission.title}" has been verified and is ready for final approval.`,
      'Approved': `Form "${submission.title}" has been approved and the workflow is complete.`,
      'Rejected': `Form "${submission.title}" has been rejected. Please review the comments.`,
      'Completed': `Form "${submission.title}" workflow has been completed successfully.`
    };
    
    return messages[stage] || `Form "${submission.title}" status updated to ${stage}.`;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    for (const [userId, notifications] of this.notifications.entries()) {
      const filteredNotifications = notifications.filter(
        n => new Date(n.createdAt) > thirtyDaysAgo
      );
      
      if (filteredNotifications.length !== notifications.length) {
        this.notifications.set(userId, filteredNotifications);
        console.log(`🧹 Cleaned up old notifications for user ${userId}`);
      }
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    let totalNotifications = 0;
    let unreadNotifications = 0;
    let userCount = 0;

    for (const [userId, notifications] of this.notifications.entries()) {
      userCount++;
      totalNotifications += notifications.length;
      unreadNotifications += notifications.filter(n => !n.read).length;
    }

    return {
      totalNotifications,
      unreadNotifications,
      readNotifications: totalNotifications - unreadNotifications,
      usersWithNotifications: userCount,
      averageNotificationsPerUser: userCount > 0 ? Math.round(totalNotifications / userCount) : 0
    };
  }
}

// Auto cleanup every hour
const notificationService = new NotificationService();
setInterval(() => {
  notificationService.cleanupOldNotifications();
}, 60 * 60 * 1000);

module.exports = notificationService;
