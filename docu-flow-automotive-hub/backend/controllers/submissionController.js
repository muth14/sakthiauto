const { validationResult } = require('express-validator');
const FormSubmission = require('../models/FormSubmission');
const FormTemplate = require('../models/FormTemplate');
const AuditLog = require('../models/AuditLog');
const workflowEngine = require('../services/workflowEngine');
const notificationService = require('../services/notificationService');

/**
 * @desc    Get all form submissions
 * @route   GET /api/forms/submissions
 * @access  Private
 */
exports.getFormSubmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department,
      submittedBy,
      dateFrom,
      dateTo,
      search
    } = req.query;

    // For development - return mock data if no submissions exist
    const submissionCount = await FormSubmission.countDocuments();
    if (submissionCount === 0) {
      const mockSubmissions = [
        {
          _id: '507f1f77bcf86cd799439011',
          submissionId: 'SUB-001',
          title: 'Daily Quality Check',
          status: 'Draft',
          submittedBy: {
            firstName: 'Sarah',
            lastName: 'Operator'
          },
          submittedAt: new Date(),
          department: 'Quality Control',
          priority: 'Medium',
          tags: ['quality', 'daily-check']
        },
        {
          _id: '507f1f77bcf86cd799439012',
          submissionId: 'SUB-002',
          title: 'Machine Maintenance Report',
          status: 'Submitted',
          submittedBy: {
            firstName: 'Sarah',
            lastName: 'Operator'
          },
          submittedAt: new Date(Date.now() - 86400000),
          department: 'Quality Control',
          priority: 'High',
          tags: ['maintenance', 'machine']
        }
      ];

      // Filter mock data based on user role
      let filteredSubmissions = mockSubmissions;
      if (req.user.role === 'Operator') {
        filteredSubmissions = mockSubmissions.filter(sub =>
          sub.submittedBy.firstName === req.user.firstName &&
          sub.submittedBy.lastName === req.user.lastName
        );
      }

      return res.status(200).json({
        success: true,
        data: filteredSubmissions,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredSubmissions.length,
          itemsPerPage: 10
        }
      });
    }

    // Build query
    let query = {};

    // Department filter (non-admins can only see their department)
    if (req.user.role !== 'Admin') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    // Role-based filtering
    if (req.user.role === 'Operator') {
      // Operators can only see their own submissions
      query.submittedBy = req.user._id || req.user.id;
    } else if (submittedBy) {
      query.submittedBy = submittedBy;
    }

    if (status) query.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      query.submittedAt = {};
      if (dateFrom) query.submittedAt.$gte = new Date(dateFrom);
      if (dateTo) query.submittedAt.$lte = new Date(dateTo);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { submissionId: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const submissions = await FormSubmission.find(query)
      .populate('formTemplate', 'title category')
      .populate('submittedBy', 'username firstName lastName')
      .populate('machine', 'machineId name')
      .populate('tool', 'toolId name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FormSubmission.countDocuments(query);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDocs: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get form submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching form submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single form submission
 * @route   GET /api/forms/submissions/:id
 * @access  Private
 */
exports.getFormSubmission = async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.id)
      .populate('formTemplate')
      .populate('submittedBy', 'username firstName lastName')
      .populate('machine', 'machineId name model')
      .populate('tool', 'toolId name type')
      .populate('approvalWorkflow.userId', 'username firstName lastName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'Operator' && submission.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own submissions.'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && submission.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view submissions from your department.'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Get form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching form submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create new form submission
 * @route   POST /api/forms/submissions
 * @access  Private (Operator and above)
 */
exports.createFormSubmission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      formTemplate,
      title,
      sections,
      machine,
      tool,
      priority,
      dueDate,
      tags,
      notes
    } = req.body;

    // Verify form template exists and is active
    const template = await FormTemplate.findById(formTemplate);
    if (!template || !template.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Form template not found or inactive'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && template.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create submissions for templates from your department.'
      });
    }

    // Create form submission
    const submission = await FormSubmission.create({
      formTemplate,
      title,
      submittedBy: req.user._id,
      department: req.user.department,
      sections,
      machine,
      tool,
      priority,
      dueDate,
      tags,
      notes
    });

    // Populate the created submission
    await submission.populate([
      { path: 'formTemplate', select: 'title category' },
      { path: 'submittedBy', select: 'username firstName lastName' },
      { path: 'machine', select: 'machineId name' },
      { path: 'tool', select: 'toolId name' }
    ]);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'create_form_submission',
      description: `Created form submission: ${title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: submission.department
    });

    res.status(201).json({
      success: true,
      message: 'Form submission created successfully',
      data: submission
    });
  } catch (error) {
    console.error('Create form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating form submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update form submission
 * @route   PUT /api/forms/submissions/:id
 * @access  Private
 */
exports.updateFormSubmission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let submission = await FormSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check permissions
    const canEdit = 
      req.user.role === 'Admin' ||
      (req.user.role === 'Operator' && submission.submittedBy.toString() === req.user._id.toString() && submission.status === 'Draft') ||
      (['Supervisor', 'Line Incharge'].includes(req.user.role) && submission.department === req.user.department);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot edit this submission.'
      });
    }

    const {
      title,
      sections,
      machine,
      tool,
      priority,
      dueDate,
      tags,
      notes
    } = req.body;

    // Update fields
    if (title) submission.title = title;
    if (sections) submission.sections = sections;
    if (machine) submission.machine = machine;
    if (tool) submission.tool = tool;
    if (priority) submission.priority = priority;
    if (dueDate) submission.dueDate = dueDate;
    if (tags) submission.tags = tags;
    if (notes !== undefined) submission.notes = notes;

    // Save submission
    await submission.save();

    // Populate the updated submission
    await submission.populate([
      { path: 'formTemplate', select: 'title category' },
      { path: 'submittedBy', select: 'username firstName lastName' },
      { path: 'machine', select: 'machineId name' },
      { path: 'tool', select: 'toolId name' }
    ]);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'update_form_submission',
      description: `Updated form submission: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: submission.department
    });

    res.status(200).json({
      success: true,
      message: 'Form submission updated successfully',
      data: submission
    });
  } catch (error) {
    console.error('Update form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating form submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Submit form (change status from Draft to Submitted) - Uses Workflow Engine
 * @route   PUT /api/forms/submissions/:id/submit
 * @access  Private (Operator and above)
 */
exports.submitForm = async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check permissions
    if (submission.submittedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only submit your own forms.'
      });
    }

    // Check if form is in draft status
    if (submission.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Form can only be submitted from Draft status'
      });
    }

    // Use workflow engine to process submission
    const result = await workflowEngine.processWorkflow(
      req.params.id,
      'submit_form',
      req.user,
      {
        comments: req.body.comments || '',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Submit form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while submitting form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Verify form submission - Uses Workflow Engine
 * @route   PUT /api/forms/submissions/:id/verify
 * @access  Private (Line Incharge and above)
 */
exports.verifyFormSubmission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { comments } = req.body;
    const submission = await FormSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && submission.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only verify submissions from your department.'
      });
    }

    // Determine action based on current status
    let action = 'verify_form';
    if (submission.status === 'Submitted') {
      action = 'start_verification';
    } else if (submission.status === 'Under Verification') {
      action = 'verify_form';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Form cannot be verified in current status'
      });
    }

    // Use workflow engine to process verification
    const result = await workflowEngine.processWorkflow(
      req.params.id,
      action,
      req.user,
      {
        comments: comments || '',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Verify form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while verifying form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Approve form submission - Uses Workflow Engine
 * @route   PUT /api/forms/submissions/:id/approve
 * @access  Private (Supervisor and above)
 */
exports.approveFormSubmission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { comments } = req.body;
    const submission = await FormSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && submission.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only approve submissions from your department.'
      });
    }

    // Determine action based on current status
    let action = 'approve_form';
    if (submission.status === 'Verified') {
      action = 'start_approval';
    } else if (submission.status === 'Under Approval') {
      action = 'approve_form';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Form cannot be approved in current status'
      });
    }

    // Use workflow engine to process approval
    const result = await workflowEngine.processWorkflow(
      req.params.id,
      action,
      req.user,
      {
        comments: comments || '',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Approve form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while approving form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Reject form submission
 * @route   PUT /api/forms/submissions/:id/reject
 * @access  Private (Line Incharge and above)
 */
exports.rejectFormSubmission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { comments, step } = req.body; // step can be 'verification' or 'approval'
    const submission = await FormSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && submission.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only reject submissions from your department.'
      });
    }

    // Validate step and user permissions
    if (step === 'verification' && !['Admin', 'Supervisor', 'Line Incharge'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Verification rejection requires Line Incharge or higher privileges.'
      });
    }

    if (step === 'approval' && !['Admin', 'Supervisor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Approval rejection requires Supervisor or higher privileges.'
      });
    }

    // Add rejection to approval workflow
    submission.approvalWorkflow.push({
      step,
      status: 'rejected',
      userId: req.user._id,
      comments,
      processedAt: new Date()
    });

    submission.status = 'Rejected';
    await submission.save();

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'reject_form',
      description: `Rejected form submission: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: submission.department
    });

    res.status(200).json({
      success: true,
      message: 'Form rejected successfully',
      data: submission
    });
  } catch (error) {
    console.error('Reject form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
