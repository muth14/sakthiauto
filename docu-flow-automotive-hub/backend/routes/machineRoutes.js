const express = require('express');
const { body } = require('express-validator');
const {
  getMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine,
  addMaintenanceRecord
} = require('../controllers/machineController');
const { protect } = require('../middleware/authMiddleware');
const { 
  canManageAssets,
  adminOrSupervisor
} = require('../middleware/roleMiddleware');

const router = express.Router();

// Validation rules
const machineValidation = [
  body('machineId')
    .isLength({ min: 1, max: 20 })
    .withMessage('Machine ID is required and must be less than 20 characters')
    .trim()
    .toUpperCase(),
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Machine name is required and must be less than 100 characters')
    .trim(),
  body('model')
    .isLength({ min: 1, max: 100 })
    .withMessage('Model is required and must be less than 100 characters')
    .trim(),
  body('manufacturer')
    .isLength({ min: 1, max: 100 })
    .withMessage('Manufacturer is required and must be less than 100 characters')
    .trim(),
  body('serialNumber')
    .isLength({ min: 1, max: 50 })
    .withMessage('Serial number is required and must be less than 50 characters')
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
  body('installationDate')
    .isISO8601()
    .withMessage('Installation date must be a valid date'),
  body('warrantyExpiry')
    .optional()
    .isISO8601()
    .withMessage('Warranty expiry must be a valid date'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Under Maintenance', 'Decommissioned'])
    .withMessage('Invalid status'),
  body('assignedOperators')
    .optional()
    .isArray()
    .withMessage('Assigned operators must be an array')
];

const maintenanceValidation = [
  body('type')
    .isIn(['Preventive', 'Corrective', 'Emergency', 'Routine'])
    .withMessage('Invalid maintenance type'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description is required and must be between 10 and 1000 characters')
    .trim(),
  body('nextMaintenanceDate')
    .optional()
    .isISO8601()
    .withMessage('Next maintenance date must be a valid date'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters')
    .trim()
];

// Routes
router.get('/', protect, getMachines);
router.get('/:id', protect, getMachine);
router.post('/', protect, canManageAssets, machineValidation, createMachine);
router.put('/:id', protect, canManageAssets, machineValidation, updateMachine);
router.delete('/:id', protect, adminOrSupervisor, deleteMachine);
router.post('/:id/maintenance', protect, canManageAssets, maintenanceValidation, addMaintenanceRecord);

module.exports = router;
