const { validationResult } = require('express-validator');
const Tool = require('../models/Tool');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get all tools
 * @route   GET /api/tools
 * @access  Private
 */
exports.getTools = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      type,
      status,
      condition,
      search,
      calibrationStatus
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Department filter (non-admins can only see their department)
    if (req.user.role !== 'Admin') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (type) query.type = type;
    if (status) query.status = status;
    if (condition) query.condition = condition;

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { toolId: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const tools = await Tool.find(query)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedTo', 'username firstName lastName')
      .populate('compatibleMachines', 'machineId name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tool.countDocuments(query);

    // Filter by calibration status if requested
    let filteredTools = tools;
    if (calibrationStatus) {
      filteredTools = tools.filter(tool => {
        const status = tool.calibrationStatus;
        return status === calibrationStatus;
      });
    }

    res.status(200).json({
      success: true,
      data: filteredTools,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDocs: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get tools error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tools',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single tool
 * @route   GET /api/tools/:id
 * @access  Private
 */
exports.getTool = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('assignedTo', 'username firstName lastName role')
      .populate('compatibleMachines', 'machineId name model')
      .populate('calibrationRecords.calibratedBy', 'username firstName lastName')
      .populate('usageHistory.usedBy', 'username firstName lastName')
      .populate('usageHistory.machine', 'machineId name');

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && tool.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view tools from your department.'
      });
    }

    res.status(200).json({
      success: true,
      data: tool
    });
  } catch (error) {
    console.error('Get tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tool',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create new tool
 * @route   POST /api/tools
 * @access  Private (Admin, Supervisor, Line Incharge)
 */
exports.createTool = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      toolId,
      name,
      type,
      material,
      manufacturer,
      model,
      serialNumber,
      department,
      location,
      purchaseDate,
      cost,
      lifespan,
      specifications,
      calibrationRequired,
      calibrationFrequency,
      assignedTo,
      compatibleMachines
    } = req.body;

    // Check if tool ID already exists
    const existingTool = await Tool.findOne({ toolId });
    if (existingTool) {
      return res.status(400).json({
        success: false,
        message: 'Tool with this ID already exists'
      });
    }

    // Check if serial number already exists (if provided)
    if (serialNumber) {
      const existingSerial = await Tool.findOne({ serialNumber });
      if (existingSerial) {
        return res.status(400).json({
          success: false,
          message: 'Tool with this serial number already exists'
        });
      }
    }

    // Create tool
    const tool = await Tool.create({
      toolId,
      name,
      type,
      material,
      manufacturer,
      model,
      serialNumber,
      department: req.user.role === 'Admin' ? department : req.user.department,
      location,
      purchaseDate,
      cost,
      lifespan,
      specifications,
      calibrationRequired,
      calibrationFrequency,
      assignedTo,
      compatibleMachines,
      createdBy: req.user._id
    });

    // Populate the created tool
    await tool.populate([
      { path: 'createdBy', select: 'username firstName lastName' },
      { path: 'assignedTo', select: 'username firstName lastName' },
      { path: 'compatibleMachines', select: 'machineId name' }
    ]);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'create_tool',
      description: `Created tool: ${name} (${toolId})`,
      resourceType: 'tool',
      resourceId: tool._id,
      resourceModel: 'Tool',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: tool.department
    });

    res.status(201).json({
      success: true,
      message: 'Tool created successfully',
      data: tool
    });
  } catch (error) {
    console.error('Create tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tool',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update tool
 * @route   PUT /api/tools/:id
 * @access  Private (Admin, Supervisor, Line Incharge)
 */
exports.updateTool = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && tool.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update tools from your department.'
      });
    }

    const {
      name,
      type,
      material,
      manufacturer,
      model,
      location,
      cost,
      lifespan,
      status,
      condition,
      specifications,
      calibrationRequired,
      calibrationFrequency,
      assignedTo,
      compatibleMachines
    } = req.body;

    // Update fields
    if (name) tool.name = name;
    if (type) tool.type = type;
    if (material) tool.material = material;
    if (manufacturer) tool.manufacturer = manufacturer;
    if (model) tool.model = model;
    if (location) tool.location = location;
    if (cost !== undefined) tool.cost = cost;
    if (lifespan) tool.lifespan = lifespan;
    if (status) tool.status = status;
    if (condition) tool.condition = condition;
    if (specifications) tool.specifications = specifications;
    if (calibrationRequired !== undefined) tool.calibrationRequired = calibrationRequired;
    if (calibrationFrequency) tool.calibrationFrequency = calibrationFrequency;
    if (assignedTo !== undefined) tool.assignedTo = assignedTo;
    if (compatibleMachines) tool.compatibleMachines = compatibleMachines;

    tool.updatedBy = req.user._id;

    // Save tool
    await tool.save();

    // Populate the updated tool
    await tool.populate([
      { path: 'createdBy', select: 'username firstName lastName' },
      { path: 'updatedBy', select: 'username firstName lastName' },
      { path: 'assignedTo', select: 'username firstName lastName' },
      { path: 'compatibleMachines', select: 'machineId name' }
    ]);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'update_tool',
      description: `Updated tool: ${tool.name} (${tool.toolId})`,
      resourceType: 'tool',
      resourceId: tool._id,
      resourceModel: 'Tool',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: tool.department
    });

    res.status(200).json({
      success: true,
      message: 'Tool updated successfully',
      data: tool
    });
  } catch (error) {
    console.error('Update tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tool',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete tool (soft delete)
 * @route   DELETE /api/tools/:id
 * @access  Private (Admin, Supervisor)
 */
exports.deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && tool.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete tools from your department.'
      });
    }

    // Soft delete - set isActive to false
    tool.isActive = false;
    tool.updatedBy = req.user._id;
    await tool.save();

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'delete_tool',
      description: `Deleted tool: ${tool.name} (${tool.toolId})`,
      resourceType: 'tool',
      resourceId: tool._id,
      resourceModel: 'Tool',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: tool.department
    });

    res.status(200).json({
      success: true,
      message: 'Tool deleted successfully'
    });
  } catch (error) {
    console.error('Delete tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting tool',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Add usage record
 * @route   POST /api/tools/:id/usage
 * @access  Private
 */
exports.addUsageRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && tool.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only add usage records for tools from your department.'
      });
    }

    const {
      machine,
      formSubmission,
      duration,
      purpose,
      condition,
      notes
    } = req.body;

    // Add usage record
    const usageRecord = {
      usedBy: req.user._id,
      machine,
      formSubmission,
      usageDate: new Date(),
      duration,
      purpose,
      condition: condition || tool.condition,
      notes
    };

    tool.usageHistory.push(usageRecord);

    // Update current usage
    if (duration) {
      tool.currentUsage.totalHours += duration / 60; // Convert minutes to hours
    }
    tool.currentUsage.totalCycles += 1;

    // Update tool condition if provided
    if (condition) {
      tool.condition = condition;
    }

    tool.updatedBy = req.user._id;
    await tool.save();

    // Populate the usage record
    await tool.populate('usageHistory.usedBy', 'username firstName lastName');

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'update_tool',
      description: `Added usage record for tool: ${tool.name} (${tool.toolId})`,
      resourceType: 'tool',
      resourceId: tool._id,
      resourceModel: 'Tool',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: tool.department,
      metadata: {
        duration,
        purpose
      }
    });

    res.status(201).json({
      success: true,
      message: 'Usage record added successfully',
      data: tool.usageHistory[tool.usageHistory.length - 1]
    });
  } catch (error) {
    console.error('Add usage record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding usage record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Add calibration record
 * @route   POST /api/tools/:id/calibration
 * @access  Private (Admin, Supervisor, Line Incharge)
 */
exports.addCalibrationRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && tool.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only add calibration records for tools from your department.'
      });
    }

    const {
      nextCalibrationDate,
      certificateNumber,
      calibrationAgency,
      results,
      deviations,
      notes
    } = req.body;

    // Add calibration record
    const calibrationRecord = {
      calibratedBy: req.user._id,
      calibrationDate: new Date(),
      nextCalibrationDate,
      certificateNumber,
      calibrationAgency,
      results,
      deviations,
      notes
    };

    tool.calibrationRecords.push(calibrationRecord);

    // Update calibration dates
    tool.lastCalibrationDate = new Date();
    if (nextCalibrationDate) {
      tool.nextCalibrationDate = nextCalibrationDate;
    }

    // Update status based on calibration results
    if (results === 'Pass') {
      tool.status = 'Available';
    } else if (results === 'Fail') {
      tool.status = 'Calibration Due';
    }

    tool.updatedBy = req.user._id;
    await tool.save();

    // Populate the calibration record
    await tool.populate('calibrationRecords.calibratedBy', 'username firstName lastName');

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'update_tool',
      description: `Added calibration record for tool: ${tool.name} (${tool.toolId})`,
      resourceType: 'tool',
      resourceId: tool._id,
      resourceModel: 'Tool',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: tool.department,
      metadata: {
        calibrationResults: results,
        certificateNumber
      }
    });

    res.status(201).json({
      success: true,
      message: 'Calibration record added successfully',
      data: tool.calibrationRecords[tool.calibrationRecords.length - 1]
    });
  } catch (error) {
    console.error('Add calibration record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding calibration record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
