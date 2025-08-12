const express = require('express');
const { body } = require('express-validator');
const {
  generatePDF,
  downloadPDF,
  viewPDF,
  deletePDF
} = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrSupervisor } = require('../middleware/roleMiddleware');

const router = express.Router();

// Validation rules
const generatePDFValidation = [
  body('watermark')
    .optional()
    .isBoolean()
    .withMessage('Watermark must be a boolean value')
];

// Routes
router.post('/generate/:submissionId', protect, generatePDFValidation, generatePDF);
router.get('/download/:submissionId', protect, downloadPDF);
router.get('/view/:submissionId', protect, viewPDF);
router.delete('/:submissionId', protect, adminOrSupervisor, deletePDF);

module.exports = router;
