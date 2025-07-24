const express = require('express');
const { body } = require('express-validator');
const {
  getTools,
  getTool,
  createTool,
  updateTool,
  deleteTool,
  addUsageRecord,
  addCalibrationRecord
} = require('../controllers/toolController');
const { protect } = require('../middleware/authMiddleware');
const { 
  canManageAssets,
  adminOrSupervisor
} = require('../middleware/roleMiddleware');

const router = express.Router();

// Validation rules
const toolValidation = [
  body('toolId')
    .isLength({ min: 1, max: 20 })
    .withMessage('Tool ID is required and must be less than 20 characters')
    .trim()
    .toUpperCase(),
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Tool name is required and must be less than 100 characters')
    .trim(),
  body('type')
    .isIn(['Measuring', 'Cutting', 'Drilling', 'Grinding', 'Assembly', 'Testing', 'Calibration', 'Other'])
    .withMessage('Invalid tool type'),
  body('material')
    .isLength({ min: 1, max: 100 })
    .withMessage('Material is required and must be less than 100 characters')
    .trim(),
  body('manufacturer')
    .isLength({ min: 1, max: 100 })
    .withMessage('Manufacturer is required and must be less than 100 characters')
    .trim(),
  body('model')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Model must be less than 100 characters')
    .trim(),
  body('serialNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Serial number must be less than 50 characters')
    .trim(),
  body('department')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Department must be less than 100 characters')
    .trim(),
  body('location')
    .isLength({ min: 1, max: 200 })
    .withMessage('Location is required and must be less than 200 characters')
    .trim(),
  body('purchaseDate')
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('status')
    .optional()
    .isIn(['Available', 'In Use', 'Under Maintenance', 'Calibration Due', 'Retired', 'Lost/Damaged'])
    .withMessage('Invalid status'),
  body('condition')
    .optional()
    .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'])
    .withMessage('Invalid condition'),
  body('calibrationRequired')
    .optional()
    .isBoolean()
    .withMessage('Calibration required must be a boolean'),
  body('calibrationFrequency')
    .optional()
    .isIn(['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Bi-Annual'])
    .withMessage('Invalid calibration frequency'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned to must be a valid user ID'),
  body('compatibleMachines')
    .optional()
    .isArray()
    .withMessage('Compatible machines must be an array')
];

const usageValidation = [
  body('machine')
    .optional()
    .isMongoId()
    .withMessage('Machine must be a valid ID'),
  body('formSubmission')
    .optional()
    .isMongoId()
    .withMessage('Form submission must be a valid ID'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer (in minutes)'),
  body('purpose')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Purpose cannot exceed 500 characters')
    .trim(),
  body('condition')
    .optional()
    .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'])
    .withMessage('Invalid condition'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
    .trim()
];

const calibrationValidation = [
  body('nextCalibrationDate')
    .isISO8601()
    .withMessage('Next calibration date is required and must be a valid date'),
  body('certificateNumber')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Certificate number must be less than 100 characters')
    .trim(),
  body('calibrationAgency')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Calibration agency must be less than 200 characters')
    .trim(),
  body('results')
    .isIn(['Pass', 'Fail', 'Conditional'])
    .withMessage('Results must be Pass, Fail, or Conditional'),
  body('deviations')
    .optional()
    .isArray()
    .withMessage('Deviations must be an array'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
    .trim()
];

// Routes
router.get('/', protect, getTools);
router.get('/:id', protect, getTool);
router.post('/', protect, canManageAssets, toolValidation, createTool);
router.put('/:id', protect, canManageAssets, toolValidation, updateTool);
router.delete('/:id', protect, adminOrSupervisor, deleteTool);
router.post('/:id/usage', protect, usageValidation, addUsageRecord);
router.post('/:id/calibration', protect, canManageAssets, calibrationValidation, addCalibrationRecord);

module.exports = router;
