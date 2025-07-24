const { validationResult } = require('express-validator');
const Machine = require('../models/Machine');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get all machines
 * @route   GET /api/machines
 * @access  Private
 */
exports.getMachines = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      status,
      search,
      maintenanceStatus
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Department filter (non-admins can only see their department)
    if (req.user.role !== 'Admin') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (status) query.status = status;

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { machineId: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const machines = await Machine.find(query)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedOperators', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Machine.countDocuments(query);

    // Filter by maintenance status if requested
    let filteredMachines = machines;
    if (maintenanceStatus) {
      filteredMachines = machines.filter(machine => {
        const status = machine.maintenanceStatus;
        return status === maintenanceStatus;
      });
    }

    res.status(200).json({
      success: true,
      data: filteredMachines,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDocs: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get machines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching machines',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single machine
 * @route   GET /api/machines/:id
 * @access  Private
 */
exports.getMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('assignedOperators', 'username firstName lastName role')
      .populate('maintenanceRecords.performedBy', 'username firstName lastName');

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && machine.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view machines from your department.'
      });
    }

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    console.error('Get machine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching machine',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create new machine
 * @route   POST /api/machines
 * @access  Private (Admin, Supervisor, Line Incharge)
 */
exports.createMachine = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      machineId,
      name,
      model,
      manufacturer,
      serialNumber,
      department,
      location,
      installationDate,
      warrantyExpiry,
      specifications,
      operatingParameters,
      maintenanceSchedule,
      assignedOperators
    } = req.body;

    // Check if machine ID or serial number already exists
    const existingMachine = await Machine.findOne({
      $or: [{ machineId }, { serialNumber }]
    });

    if (existingMachine) {
      return res.status(400).json({
        success: false,
        message: 'Machine with this ID or serial number already exists'
      });
    }

    // Create machine
    const machine = await Machine.create({
      machineId,
      name,
      model,
      manufacturer,
      serialNumber,
      department: req.user.role === 'Admin' ? department : req.user.department,
      location,
      installationDate,
      warrantyExpiry,
      specifications,
      operatingParameters,
      maintenanceSchedule,
      assignedOperators,
      createdBy: req.user._id
    });

    // Populate the created machine
    await machine.populate([
      { path: 'createdBy', select: 'username firstName lastName' },
      { path: 'assignedOperators', select: 'username firstName lastName' }
    ]);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'create_machine',
      description: `Created machine: ${name} (${machineId})`,
      resourceType: 'machine',
      resourceId: machine._id,
      resourceModel: 'Machine',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: machine.department
    });

    res.status(201).json({
      success: true,
      message: 'Machine created successfully',
      data: machine
    });
  } catch (error) {
    console.error('Create machine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating machine',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update machine
 * @route   PUT /api/machines/:id
 * @access  Private (Admin, Supervisor, Line Incharge)
 */
exports.updateMachine = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && machine.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update machines from your department.'
      });
    }

    const {
      name,
      model,
      manufacturer,
      location,
      warrantyExpiry,
      status,
      specifications,
      operatingParameters,
      maintenanceSchedule,
      assignedOperators
    } = req.body;

    // Update fields
    if (name) machine.name = name;
    if (model) machine.model = model;
    if (manufacturer) machine.manufacturer = manufacturer;
    if (location) machine.location = location;
    if (warrantyExpiry) machine.warrantyExpiry = warrantyExpiry;
    if (status) machine.status = status;
    if (specifications) machine.specifications = specifications;
    if (operatingParameters) machine.operatingParameters = operatingParameters;
    if (maintenanceSchedule) machine.maintenanceSchedule = maintenanceSchedule;
    if (assignedOperators) machine.assignedOperators = assignedOperators;

    machine.updatedBy = req.user._id;

    // Save machine
    await machine.save();

    // Populate the updated machine
    await machine.populate([
      { path: 'createdBy', select: 'username firstName lastName' },
      { path: 'updatedBy', select: 'username firstName lastName' },
      { path: 'assignedOperators', select: 'username firstName lastName' }
    ]);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'update_machine',
      description: `Updated machine: ${machine.name} (${machine.machineId})`,
      resourceType: 'machine',
      resourceId: machine._id,
      resourceModel: 'Machine',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: machine.department
    });

    res.status(200).json({
      success: true,
      message: 'Machine updated successfully',
      data: machine
    });
  } catch (error) {
    console.error('Update machine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating machine',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete machine (soft delete)
 * @route   DELETE /api/machines/:id
 * @access  Private (Admin, Supervisor)
 */
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && machine.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete machines from your department.'
      });
    }

    // Soft delete - set isActive to false
    machine.isActive = false;
    machine.updatedBy = req.user._id;
    await machine.save();

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'delete_machine',
      description: `Deleted machine: ${machine.name} (${machine.machineId})`,
      resourceType: 'machine',
      resourceId: machine._id,
      resourceModel: 'Machine',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: machine.department
    });

    res.status(200).json({
      success: true,
      message: 'Machine deleted successfully'
    });
  } catch (error) {
    console.error('Delete machine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting machine',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Add maintenance record
 * @route   POST /api/machines/:id/maintenance
 * @access  Private (Admin, Supervisor, Line Incharge)
 */
exports.addMaintenanceRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && machine.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only add maintenance records for machines from your department.'
      });
    }

    const {
      type,
      description,
      nextMaintenanceDate,
      cost,
      partsReplaced,
      notes
    } = req.body;

    // Add maintenance record
    const maintenanceRecord = {
      type,
      description,
      performedBy: req.user._id,
      performedAt: new Date(),
      nextMaintenanceDate,
      cost,
      partsReplaced,
      status: 'Completed',
      notes
    };

    machine.maintenanceRecords.push(maintenanceRecord);

    // Update maintenance schedule
    machine.maintenanceSchedule.lastMaintenanceDate = new Date();
    if (nextMaintenanceDate) {
      machine.maintenanceSchedule.nextMaintenanceDate = nextMaintenanceDate;
    }

    machine.updatedBy = req.user._id;
    await machine.save();

    // Populate the maintenance record
    await machine.populate('maintenanceRecords.performedBy', 'username firstName lastName');

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'update_machine',
      description: `Added maintenance record for machine: ${machine.name} (${machine.machineId})`,
      resourceType: 'machine',
      resourceId: machine._id,
      resourceModel: 'Machine',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: machine.department,
      metadata: {
        maintenanceType: type,
        maintenanceDescription: description
      }
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance record added successfully',
      data: machine.maintenanceRecords[machine.maintenanceRecords.length - 1]
    });
  } catch (error) {
    console.error('Add maintenance record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding maintenance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
