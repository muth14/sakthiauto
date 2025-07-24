const express = require('express');
const {
  uploadExcelFile,
  getExcelFiles,
  getExcelFile,
  downloadExcelFile,
  processExcelData,
  deleteExcelFile
} = require('../controllers/excelController');
const { protect } = require('../middleware/authMiddleware');
const { 
  canManageAssets,
  adminOrSupervisor
} = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes
router.post('/upload', protect, canManageAssets, uploadExcelFile);
router.get('/files', protect, getExcelFiles);
router.get('/files/:id', protect, getExcelFile);
router.get('/download/:id', protect, downloadExcelFile);
router.post('/process/:id', protect, adminOrSupervisor, processExcelData);
router.delete('/files/:id', protect, adminOrSupervisor, deleteExcelFile);

module.exports = router;
