const express = require('express');
const {
  uploadFile,
  uploadMultipleFiles,
  downloadFile,
  deleteFile
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrSupervisor } = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes
router.post('/upload', protect, uploadFile);
router.post('/upload-multiple', protect, uploadMultipleFiles);
router.get('/download/:filename', protect, downloadFile);
router.delete('/:filename', protect, adminOrSupervisor, deleteFile);

module.exports = router;
