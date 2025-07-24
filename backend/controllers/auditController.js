const { validationResult } = require('express-validator');
const AuditLog = require('../models/AuditLog');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Get audit logs with filtering
 * @route   GET /api/audit/logs
 * @access  Private (Admin, Supervisor, Auditor)
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      user,
      resourceType,
      status,
      department,
      dateFrom,
      dateTo,
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

    // Filters
    if (action) query.action = action;
    if (user) query.user = user;
    if (resourceType) query.resourceType = resourceType;
    if (status) query.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const logs = await AuditLog.find(query)
      .populate('user', 'username firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDocs: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single audit log
 * @route   GET /api/audit/logs/:id
 * @access  Private (Admin, Supervisor, Auditor)
 */
exports.getAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('user', 'username firstName lastName role department')
      .populate('resourceId');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && log.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view audit logs from your department.'
      });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get audit log statistics
 * @route   GET /api/audit/stats
 * @access  Private (Admin, Supervisor, Auditor)
 */
exports.getAuditStats = async (req, res) => {
  try {
    const { dateFrom, dateTo, department } = req.query;

    // Build base query
    let baseQuery = {};

    // Department filter
    if (req.user.role !== 'Admin') {
      baseQuery.department = req.user.department;
    } else if (department) {
      baseQuery.department = department;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      baseQuery.createdAt = {};
      if (dateFrom) baseQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) baseQuery.createdAt.$lte = new Date(dateTo);
    }

    // Get statistics
    const [
      totalLogs,
      actionStats,
      userStats,
      resourceStats,
      statusStats,
      dailyStats
    ] = await Promise.all([
      // Total logs count
      AuditLog.countDocuments(baseQuery),

      // Action statistics
      AuditLog.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // User statistics
      AuditLog.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $project: {
            count: 1,
            username: { $arrayElemAt: ['$userInfo.username', 0] },
            firstName: { $arrayElemAt: ['$userInfo.firstName', 0] },
            lastName: { $arrayElemAt: ['$userInfo.lastName', 0] }
          }
        }
      ]),

      // Resource type statistics
      AuditLog.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$resourceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Status statistics
      AuditLog.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Daily activity (last 30 days)
      AuditLog.aggregate([
        {
          $match: {
            ...baseQuery,
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        actionStats,
        userStats,
        resourceStats,
        statusStats,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Export audit logs to CSV
 * @route   POST /api/audit/export/csv
 * @access  Private (Admin, Supervisor, Auditor)
 */
exports.exportAuditLogsCSV = async (req, res) => {
  try {
    const {
      action,
      user,
      resourceType,
      status,
      department,
      dateFrom,
      dateTo
    } = req.body;

    // Build query
    let query = {};

    // Department filter
    if (req.user.role !== 'Admin') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    // Filters
    if (action) query.action = action;
    if (user) query.user = user;
    if (resourceType) query.resourceType = resourceType;
    if (status) query.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Fetch logs
    const logs = await AuditLog.find(query)
      .populate('user', 'username firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit to prevent memory issues

    // Prepare CSV data
    const csvData = logs.map(log => ({
      id: log._id.toString(),
      timestamp: log.createdAt.toISOString(),
      user: log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.username})` : 'Unknown',
      role: log.user ? log.user.role : 'Unknown',
      action: log.action,
      description: log.description,
      resourceType: log.resourceType,
      resourceId: log.resourceId ? log.resourceId.toString() : '',
      status: log.status,
      department: log.department || '',
      ipAddress: log.ipAddress || '',
      userAgent: log.userAgent || ''
    }));

    // Create CSV file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit_logs_${timestamp}.csv`;
    const filePath = path.join('uploads', 'exports', filename);

    // Ensure exports directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'user', title: 'User' },
        { id: 'role', title: 'Role' },
        { id: 'action', title: 'Action' },
        { id: 'description', title: 'Description' },
        { id: 'resourceType', title: 'Resource Type' },
        { id: 'resourceId', title: 'Resource ID' },
        { id: 'status', title: 'Status' },
        { id: 'department', title: 'Department' },
        { id: 'ipAddress', title: 'IP Address' },
        { id: 'userAgent', title: 'User Agent' }
      ]
    });

    // Write CSV
    await csvWriter.writeRecords(csvData);

    // Create audit log for export
    await AuditLog.createLog({
      user: req.user._id,
      action: 'export_data',
      description: `Exported ${logs.length} audit logs to CSV`,
      resourceType: 'system',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        exportType: 'csv',
        recordCount: logs.length,
        filename
      }
    });

    // Send file for download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('CSV download error:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading CSV file'
        });
      }
      
      // Clean up file after download
      setTimeout(async () => {
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.error('Error deleting CSV file:', unlinkError);
        }
      }, 60000); // Delete after 1 minute
    });

  } catch (error) {
    console.error('Export audit logs CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Export audit logs to JSON
 * @route   POST /api/audit/export/json
 * @access  Private (Admin, Supervisor, Auditor)
 */
exports.exportAuditLogsJSON = async (req, res) => {
  try {
    const {
      action,
      user,
      resourceType,
      status,
      department,
      dateFrom,
      dateTo
    } = req.body;

    // Build query (same as CSV export)
    let query = {};

    // Department filter
    if (req.user.role !== 'Admin') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    // Filters
    if (action) query.action = action;
    if (user) query.user = user;
    if (resourceType) query.resourceType = resourceType;
    if (status) query.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Fetch logs
    const logs = await AuditLog.find(query)
      .populate('user', 'username firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit to prevent memory issues

    // Create JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit_logs_${timestamp}.json`;
    const filePath = path.join('uploads', 'exports', filename);

    // Ensure exports directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write JSON file
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: req.user._id,
        username: req.user.username,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      filters: { action, user, resourceType, status, department, dateFrom, dateTo },
      totalRecords: logs.length,
      data: logs
    };

    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));

    // Create audit log for export
    await AuditLog.createLog({
      user: req.user._id,
      action: 'export_data',
      description: `Exported ${logs.length} audit logs to JSON`,
      resourceType: 'system',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        exportType: 'json',
        recordCount: logs.length,
        filename
      }
    });

    // Send file for download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('JSON download error:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading JSON file'
        });
      }
      
      // Clean up file after download
      setTimeout(async () => {
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.error('Error deleting JSON file:', unlinkError);
        }
      }, 60000); // Delete after 1 minute
    });

  } catch (error) {
    console.error('Export audit logs JSON error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
