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

// Routes - Temporarily disable auth for testing
router.post('/generate/:submissionId', generatePDFValidation, generatePDF);
router.get('/download/:submissionId', downloadPDF);
router.get('/view/:submissionId', viewPDF);
router.delete('/:submissionId', protect, adminOrSupervisor, deletePDF);

module.exports = router;
