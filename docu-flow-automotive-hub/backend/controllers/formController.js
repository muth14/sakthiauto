const { validationResult } = require('express-validator');
const FormTemplate = require('../models/FormTemplate');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get all form templates
 * @route   GET /api/forms/templates
 * @access  Private
 */
exports.getFormTemplates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      category,
      isActive,
      search
    } = req.query;

    // Build query
    let query = {};

    // Department filter (non-admins can only see their department)
    if (req.user.role !== 'Admin') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'createdBy', select: 'username firstName lastName' },
        { path: 'updatedBy', select: 'username firstName lastName' },
        { path: 'approvedBy', select: 'username firstName lastName' }
      ]
    };

    const result = await FormTemplate.paginate(query, options);

    res.status(200).json({
      success: true,
      data: result.docs,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get form templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching form templates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single form template
 * @route   GET /api/forms/templates/:id
 * @access  Private
 */
exports.getFormTemplate = async (req, res) => {
  try {
    const template = await FormTemplate.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('approvedBy', 'username firstName lastName')
      .populate('machineTypes', 'machineId name model')
      .populate('toolTypes', 'toolId name type');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Form template not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && template.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view templates from your department.'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get form template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching form template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create new form template
 * @route   POST /api/forms/templates
 * @access  Private (Admin, Supervisor)
 */
exports.createFormTemplate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      department,
      category,
      sections,
      machineTypes,
      toolTypes
    } = req.body;

    // Create form template
    const template = await FormTemplate.create({
      title,
      description,
      department: req.user.role === 'Admin' ? department : req.user.department,
      category,
      sections,
      machineTypes,
      toolTypes,
      createdBy: req.user._id
    });

    // Populate the created template
    await template.populate([
      { path: 'createdBy', select: 'username firstName lastName' },
      { path: 'machineTypes', select: 'machineId name model' },
      { path: 'toolTypes', select: 'toolId name type' }
    ]);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'create_form_template',
      description: `Created form template: ${title}`,
      resourceType: 'form_template',
      resourceId: template._id,
      resourceModel: 'FormTemplate',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: template.department
    });

    res.status(201).json({
      success: true,
      message: 'Form template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Create form template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating form template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update form template
 * @route   PUT /api/forms/templates/:id
 * @access  Private (Admin, Supervisor)
 */
exports.updateFormTemplate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let template = await FormTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Form template not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && template.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update templates from your department.'
      });
    }

    const {
      title,
      description,
      department,
      category,
      sections,
      machineTypes,
      toolTypes,
      isActive
    } = req.body;

    // Update fields
    if (title) template.title = title;
    if (description !== undefined) template.description = description;
    if (req.user.role === 'Admin' && department) template.department = department;
    if (category) template.category = category;
    if (sections) template.sections = sections;
    if (machineTypes) template.machineTypes = machineTypes;
    if (toolTypes) template.toolTypes = toolTypes;
    if (isActive !== undefined) template.isActive = isActive;

    template.updatedBy = req.user._id;
    template.version += 1;

    // Save template
    await template.save();

    // Populate the updated template
    await template.populate([
      { path: 'createdBy', select: 'username firstName lastName' },
      { path: 'updatedBy', select: 'username firstName lastName' },
      { path: 'machineTypes', select: 'machineId name model' },
      { path: 'toolTypes', select: 'toolId name type' }
    ]);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'update_form_template',
      description: `Updated form template: ${template.title}`,
      resourceType: 'form_template',
      resourceId: template._id,
      resourceModel: 'FormTemplate',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: template.department
    });

    res.status(200).json({
      success: true,
      message: 'Form template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Update form template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating form template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete form template
 * @route   DELETE /api/forms/templates/:id
 * @access  Private (Admin, Supervisor)
 */
exports.deleteFormTemplate = async (req, res) => {
  try {
    const template = await FormTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Form template not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && template.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete templates from your department.'
      });
    }

    // Soft delete - set isActive to false instead of removing
    template.isActive = false;
    template.updatedBy = req.user._id;
    await template.save();

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'delete_form_template',
      description: `Deleted form template: ${template.title}`,
      resourceType: 'form_template',
      resourceId: template._id,
      resourceModel: 'FormTemplate',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: template.department
    });

    res.status(200).json({
      success: true,
      message: 'Form template deleted successfully'
    });
  } catch (error) {
    console.error('Delete form template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting form template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Approve form template
 * @route   PUT /api/forms/templates/:id/approve
 * @access  Private (Admin, Supervisor)
 */
exports.approveFormTemplate = async (req, res) => {
  try {
    const template = await FormTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Form template not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && template.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only approve templates from your department.'
      });
    }

    // Update approval status
    template.approvedBy = req.user._id;
    template.approvedAt = new Date();
    template.isActive = true;
    await template.save();

    // Populate the approved template
    await template.populate([
      { path: 'createdBy', select: 'username firstName lastName' },
      { path: 'approvedBy', select: 'username firstName lastName' }
    ]);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'approve_form',
      description: `Approved form template: ${template.title}`,
      resourceType: 'form_template',
      resourceId: template._id,
      resourceModel: 'FormTemplate',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: template.department
    });

    res.status(200).json({
      success: true,
      message: 'Form template approved successfully',
      data: template
    });
  } catch (error) {
    console.error('Approve form template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving form template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
