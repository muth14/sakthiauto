const express = require('express');
const { body } = require('express-validator');
const {
  getFormSubmissions,
  getFormSubmission,
  createFormSubmission,
  updateFormSubmission,
  submitForm,
  verifyFormSubmission,
  approveFormSubmission,
  rejectFormSubmission
} = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const { 
  canSubmitForms,
  canVerifyForms,
  canApproveForms
} = require('../middleware/roleMiddleware');

const router = express.Router();

// Validation rules
const formSubmissionValidation = [
  body('formTemplate')
    .isMongoId()
    .withMessage('Valid form template ID is required'),
  body('title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),
  body('sections')
    .isArray()
    .withMessage('Sections must be an array'),
  body('sections.*.sectionId')
    .notEmpty()
    .withMessage('Section ID is required'),
  body('sections.*.title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Section title is required')
    .trim(),
  body('sections.*.responses')
    .isArray()
    .withMessage('Responses must be an array'),
  body('sections.*.responses.*.fieldId')
    .notEmpty()
    .withMessage('Field ID is required'),
  body('sections.*.responses.*.label')
    .notEmpty()
    .withMessage('Field label is required'),
  body('sections.*.responses.*.type')
    .notEmpty()
    .withMessage('Field type is required'),
  body('machine')
    .optional()
    .isMongoId()
    .withMessage('Valid machine ID is required'),
  body('tool')
    .optional()
    .isMongoId()
    .withMessage('Valid tool ID is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority level'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters')
    .trim()
];

const approvalValidation = [
  body('comments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters')
    .trim()
];

const rejectionValidation = [
  body('comments')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comments are required for rejection and must be between 10 and 1000 characters')
    .trim(),
  body('step')
    .isIn(['verification', 'approval'])
    .withMessage('Step must be either verification or approval')
];

// Routes
router.get('/submissions', protect, getFormSubmissions);
router.get('/submissions/:id', protect, getFormSubmission);
router.post('/submissions', protect, canSubmitForms, formSubmissionValidation, createFormSubmission);
router.put('/submissions/:id', protect, formSubmissionValidation, updateFormSubmission);
router.put('/submissions/:id/submit', protect, canSubmitForms, submitForm);
router.put('/submissions/:id/verify', protect, canVerifyForms, approvalValidation, verifyFormSubmission);
router.put('/submissions/:id/approve', protect, canApproveForms, approvalValidation, approveFormSubmission);
router.put('/submissions/:id/reject', protect, canVerifyForms, rejectionValidation, rejectFormSubmission);

module.exports = router;
