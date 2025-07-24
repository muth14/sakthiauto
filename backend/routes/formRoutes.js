const express = require('express');
const { body } = require('express-validator');
const {
  getFormTemplates,
  getFormTemplate,
  createFormTemplate,
  updateFormTemplate,
  deleteFormTemplate,
  approveFormTemplate
} = require('../controllers/formController');
const { protect } = require('../middleware/authMiddleware');
const { 
  canManageTemplates, 
  adminOrSupervisor 
} = require('../middleware/roleMiddleware');

const router = express.Router();

// Validation rules
const formTemplateValidation = [
  body('title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  body('department')
    .isLength({ min: 1, max: 100 })
    .withMessage('Department is required')
    .trim(),
  body('category')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category is required')
    .trim(),
  body('sections')
    .isArray()
    .withMessage('Sections must be an array'),
  body('sections.*.sectionId')
    .notEmpty()
    .withMessage('Section ID is required'),
  body('sections.*.title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Section title is required and must be less than 100 characters')
    .trim(),
  body('sections.*.order')
    .isInt({ min: 0 })
    .withMessage('Section order must be a non-negative integer'),
  body('sections.*.fields')
    .isArray()
    .withMessage('Fields must be an array'),
  body('sections.*.fields.*.fieldId')
    .notEmpty()
    .withMessage('Field ID is required'),
  body('sections.*.fields.*.label')
    .isLength({ min: 1, max: 100 })
    .withMessage('Field label is required and must be less than 100 characters')
    .trim(),
  body('sections.*.fields.*.type')
    .isIn(['text', 'number', 'date', 'dropdown', 'checkbox', 'radio', 'file', 'signature', 'textarea'])
    .withMessage('Invalid field type'),
  body('sections.*.fields.*.order')
    .isInt({ min: 0 })
    .withMessage('Field order must be a non-negative integer'),
  body('machineTypes')
    .optional()
    .isArray()
    .withMessage('Machine types must be an array'),
  body('toolTypes')
    .optional()
    .isArray()
    .withMessage('Tool types must be an array')
];

// Routes
router.get('/templates', protect, getFormTemplates);
router.get('/templates/:id', protect, getFormTemplate);
router.post('/templates', protect, canManageTemplates, formTemplateValidation, createFormTemplate);
router.put('/templates/:id', protect, canManageTemplates, formTemplateValidation, updateFormTemplate);
router.delete('/templates/:id', protect, canManageTemplates, deleteFormTemplate);
router.put('/templates/:id/approve', protect, adminOrSupervisor, approveFormTemplate);

module.exports = router;
