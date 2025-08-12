const express = require('express');
const {
  getAuditLogs,
  getAuditLog,
  getAuditStats,
  exportAuditLogsCSV,
  exportAuditLogsJSON
} = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { canViewAuditLogs } = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes
router.get('/logs', protect, canViewAuditLogs, getAuditLogs);
router.get('/logs/:id', protect, canViewAuditLogs, getAuditLog);
router.get('/stats', protect, canViewAuditLogs, getAuditStats);
router.post('/export/csv', protect, canViewAuditLogs, exportAuditLogsCSV);
router.post('/export/json', protect, canViewAuditLogs, exportAuditLogsJSON);

module.exports = router;
