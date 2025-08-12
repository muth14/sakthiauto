const multer = require('multer');
const ExcelJS = require('exceljs');
const { validationResult } = require('express-validator');
const ExcelFile = require('../models/ExcelFile');
const Machine = require('../models/Machine');
const Tool = require('../models/Tool');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer for Excel file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = 'uploads/excel/';
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter for Excel files only
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files (.xls, .xlsx) are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for Excel files
  },
  fileFilter: fileFilter
});

/**
 * @desc    Upload Excel file
 * @route   POST /api/excel/upload
 * @access  Private (Admin, Supervisor, Line Incharge)
 */
exports.uploadExcelFile = [
  upload.single('excelFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No Excel file uploaded'
        });
      }

      const { department, category, description, targetModel } = req.body;

      // Create Excel file record
      const excelFile = await ExcelFile.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedBy: req.user._id,
        department: req.user.role === 'Admin' ? department : req.user.department,
        category,
        description,
        targetModel,
        status: 'Uploaded'
      });

      // Start processing the file asynchronously
      processExcelFile(excelFile._id);

      // Create audit log
      await AuditLog.createLog({
        user: req.user._id,
        action: 'upload_excel',
        description: `Uploaded Excel file: ${req.file.originalname}`,
        resourceType: 'excel',
        resourceId: excelFile._id,
        resourceModel: 'ExcelFile',
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        department: excelFile.department,
        metadata: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          category,
          targetModel
        }
      });

      res.status(201).json({
        success: true,
        message: 'Excel file uploaded successfully. Processing started.',
        data: {
          id: excelFile._id,
          filename: excelFile.filename,
          originalName: excelFile.originalName,
          status: excelFile.status,
          uploadedAt: excelFile.createdAt
        }
      });
    } catch (error) {
      console.error('Excel upload error:', error);
      
      // Clean up uploaded file if there was an error
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Server error during Excel file upload',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
];

/**
 * @desc    Get all Excel files
 * @route   GET /api/excel/files
 * @access  Private
 */
exports.getExcelFiles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      category,
      status,
      search
    } = req.query;

    // Build query
    let query = { isArchived: false };

    // Department filter (non-admins can only see their department)
    if (req.user.role !== 'Admin') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (category) query.category = category;
    if (status) query.status = status;

    // Search functionality
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const files = await ExcelFile.find(query)
      .populate('uploadedBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ExcelFile.countDocuments(query);

    res.status(200).json({
      success: true,
      data: files,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDocs: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get Excel files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching Excel files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single Excel file
 * @route   GET /api/excel/files/:id
 * @access  Private
 */
exports.getExcelFile = async (req, res) => {
  try {
    const excelFile = await ExcelFile.findById(req.params.id)
      .populate('uploadedBy', 'username firstName lastName')
      .populate('importedIds');

    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && excelFile.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view Excel files from your department.'
      });
    }

    res.status(200).json({
      success: true,
      data: excelFile
    });
  } catch (error) {
    console.error('Get Excel file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching Excel file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Download Excel file
 * @route   GET /api/excel/download/:id
 * @access  Private
 */
exports.downloadExcelFile = async (req, res) => {
  try {
    const excelFile = await ExcelFile.findById(req.params.id);

    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && excelFile.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only download Excel files from your department.'
      });
    }

    // Check if file exists
    try {
      await fs.access(excelFile.path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found on server'
      });
    }

    // Get file stats
    const stats = await fs.stat(excelFile.path);
    
    // Set headers for download
    res.setHeader('Content-Type', excelFile.mimetype);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${excelFile.originalName}"`);

    // Stream file
    const fileStream = require('fs').createReadStream(excelFile.path);
    fileStream.pipe(res);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'download_excel',
      description: `Downloaded Excel file: ${excelFile.originalName}`,
      resourceType: 'excel',
      resourceId: excelFile._id,
      resourceModel: 'ExcelFile',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: excelFile.department
    });

  } catch (error) {
    console.error('Excel download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Excel file download',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Process Excel file data
 * @route   POST /api/excel/process/:id
 * @access  Private (Admin, Supervisor)
 */
exports.processExcelData = async (req, res) => {
  try {
    const excelFile = await ExcelFile.findById(req.params.id);

    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && excelFile.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only process Excel files from your department.'
      });
    }

    if (excelFile.status !== 'Processed') {
      return res.status(400).json({
        success: false,
        message: 'Excel file must be processed before importing data'
      });
    }

    // Start import process
    const importResult = await importExcelData(excelFile);

    res.status(200).json({
      success: true,
      message: 'Excel data import completed',
      data: importResult
    });
  } catch (error) {
    console.error('Process Excel data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Excel data processing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete Excel file
 * @route   DELETE /api/excel/files/:id
 * @access  Private (Admin, Supervisor)
 */
exports.deleteExcelFile = async (req, res) => {
  try {
    const excelFile = await ExcelFile.findById(req.params.id);

    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && excelFile.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete Excel files from your department.'
      });
    }

    // Archive instead of delete
    excelFile.isArchived = true;
    await excelFile.save();

    // Optionally delete the physical file
    try {
      await fs.unlink(excelFile.path);
    } catch (error) {
      console.error('Error deleting physical file:', error);
      // Continue even if file deletion fails
    }

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'delete_file',
      description: `Deleted Excel file: ${excelFile.originalName}`,
      resourceType: 'excel',
      resourceId: excelFile._id,
      resourceModel: 'ExcelFile',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: excelFile.department
    });

    res.status(200).json({
      success: true,
      message: 'Excel file deleted successfully'
    });
  } catch (error) {
    console.error('Delete Excel file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Excel file deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Process Excel file asynchronously
 * @param {String} excelFileId - Excel file ID
 */
async function processExcelFile(excelFileId) {
  try {
    const excelFile = await ExcelFile.findById(excelFileId);
    if (!excelFile) return;

    // Update status to processing
    excelFile.status = 'Processing';
    excelFile.processingStartedAt = new Date();
    await excelFile.save();

    // Read Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFile.path);

    const sheets = [];
    const errors = [];

    // Process each worksheet
    workbook.eachSheet((worksheet, sheetId) => {
      const sheetData = {
        name: worksheet.name,
        rowCount: worksheet.rowCount,
        columnCount: worksheet.columnCount,
        headers: []
      };

      // Get headers from first row
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        sheetData.headers.push(cell.value ? cell.value.toString() : '');
      });

      sheets.push(sheetData);
    });

    // Update Excel file with processing results
    excelFile.sheets = sheets;
    excelFile.status = 'Processed';
    excelFile.processingCompletedAt = new Date();
    excelFile.dataSummary = {
      totalRecords: sheets.reduce((total, sheet) => total + Math.max(0, sheet.rowCount - 1), 0),
      validRecords: 0,
      invalidRecords: 0,
      duplicateRecords: 0,
      importedRecords: 0,
      errors: errors
    };

    await excelFile.save();

  } catch (error) {
    console.error('Excel processing error:', error);

    // Update status to error
    try {
      const excelFile = await ExcelFile.findById(excelFileId);
      if (excelFile) {
        excelFile.status = 'Error';
        excelFile.processingCompletedAt = new Date();
        await excelFile.save();
      }
    } catch (updateError) {
      console.error('Error updating Excel file status:', updateError);
    }
  }
}

/**
 * Import data from Excel file
 * @param {Object} excelFile - Excel file object
 * @returns {Object} Import results
 */
async function importExcelData(excelFile) {
  try {
    excelFile.importStartedAt = new Date();
    await excelFile.save();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFile.path);

    let importedRecords = 0;
    let errors = [];
    const importedIds = [];

    // Process based on target model
    if (excelFile.targetModel === 'Machine') {
      const result = await importMachines(workbook, excelFile);
      importedRecords = result.imported;
      errors = result.errors;
      importedIds.push(...result.ids);
    } else if (excelFile.targetModel === 'Tool') {
      const result = await importTools(workbook, excelFile);
      importedRecords = result.imported;
      errors = result.errors;
      importedIds.push(...result.ids);
    } else if (excelFile.targetModel === 'User') {
      const result = await importUsers(workbook, excelFile);
      importedRecords = result.imported;
      errors = result.errors;
      importedIds.push(...result.ids);
    }

    // Update Excel file with import results
    excelFile.status = 'Imported';
    excelFile.importCompletedAt = new Date();
    excelFile.dataSummary.importedRecords = importedRecords;
    excelFile.dataSummary.errors = errors;
    excelFile.importedIds = importedIds;

    await excelFile.save();

    return {
      imported: importedRecords,
      errors: errors.length,
      totalRecords: excelFile.dataSummary.totalRecords
    };

  } catch (error) {
    console.error('Excel import error:', error);

    // Update status to error
    excelFile.status = 'Error';
    excelFile.importCompletedAt = new Date();
    await excelFile.save();

    throw error;
  }
}

/**
 * Import machines from Excel
 * @param {Object} workbook - Excel workbook
 * @param {Object} excelFile - Excel file object
 * @returns {Object} Import results
 */
async function importMachines(workbook, excelFile) {
  const worksheet = workbook.getWorksheet(1); // Use first sheet
  const errors = [];
  const importedIds = [];
  let imported = 0;

  // Expected columns: machineId, name, model, manufacturer, serialNumber, department, location, installationDate
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    try {
      const row = worksheet.getRow(rowNumber);

      const machineData = {
        machineId: row.getCell(1).value?.toString().trim(),
        name: row.getCell(2).value?.toString().trim(),
        model: row.getCell(3).value?.toString().trim(),
        manufacturer: row.getCell(4).value?.toString().trim(),
        serialNumber: row.getCell(5).value?.toString().trim(),
        department: row.getCell(6).value?.toString().trim() || excelFile.department,
        location: row.getCell(7).value?.toString().trim(),
        installationDate: row.getCell(8).value,
        createdBy: excelFile.uploadedBy
      };

      // Validate required fields
      if (!machineData.machineId || !machineData.name || !machineData.model) {
        errors.push({
          row: rowNumber,
          message: 'Missing required fields: machineId, name, or model'
        });
        continue;
      }

      // Check for duplicates
      const existing = await Machine.findOne({
        $or: [
          { machineId: machineData.machineId },
          { serialNumber: machineData.serialNumber }
        ]
      });

      if (existing) {
        errors.push({
          row: rowNumber,
          message: `Machine with ID ${machineData.machineId} or serial number already exists`
        });
        continue;
      }

      // Create machine
      const machine = await Machine.create(machineData);
      importedIds.push(machine._id);
      imported++;

    } catch (error) {
      errors.push({
        row: rowNumber,
        message: error.message
      });
    }
  }

  return { imported, errors, ids: importedIds };
}

/**
 * Import tools from Excel
 * @param {Object} workbook - Excel workbook
 * @param {Object} excelFile - Excel file object
 * @returns {Object} Import results
 */
async function importTools(workbook, excelFile) {
  const worksheet = workbook.getWorksheet(1);
  const errors = [];
  const importedIds = [];
  let imported = 0;

  // Expected columns: toolId, name, type, material, manufacturer, department, location, purchaseDate
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    try {
      const row = worksheet.getRow(rowNumber);

      const toolData = {
        toolId: row.getCell(1).value?.toString().trim(),
        name: row.getCell(2).value?.toString().trim(),
        type: row.getCell(3).value?.toString().trim(),
        material: row.getCell(4).value?.toString().trim(),
        manufacturer: row.getCell(5).value?.toString().trim(),
        department: row.getCell(6).value?.toString().trim() || excelFile.department,
        location: row.getCell(7).value?.toString().trim(),
        purchaseDate: row.getCell(8).value,
        createdBy: excelFile.uploadedBy
      };

      // Validate required fields
      if (!toolData.toolId || !toolData.name || !toolData.type || !toolData.material) {
        errors.push({
          row: rowNumber,
          message: 'Missing required fields: toolId, name, type, or material'
        });
        continue;
      }

      // Check for duplicates
      const existing = await Tool.findOne({ toolId: toolData.toolId });
      if (existing) {
        errors.push({
          row: rowNumber,
          message: `Tool with ID ${toolData.toolId} already exists`
        });
        continue;
      }

      // Create tool
      const tool = await Tool.create(toolData);
      importedIds.push(tool._id);
      imported++;

    } catch (error) {
      errors.push({
        row: rowNumber,
        message: error.message
      });
    }
  }

  return { imported, errors, ids: importedIds };
}

/**
 * Import users from Excel
 * @param {Object} workbook - Excel workbook
 * @param {Object} excelFile - Excel file object
 * @returns {Object} Import results
 */
async function importUsers(workbook, excelFile) {
  const worksheet = workbook.getWorksheet(1);
  const errors = [];
  const importedIds = [];
  let imported = 0;

  // Expected columns: username, email, firstName, lastName, role, department, employeeId
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    try {
      const row = worksheet.getRow(rowNumber);

      const userData = {
        username: row.getCell(1).value?.toString().trim(),
        email: row.getCell(2).value?.toString().trim().toLowerCase(),
        firstName: row.getCell(3).value?.toString().trim(),
        lastName: row.getCell(4).value?.toString().trim(),
        role: row.getCell(5).value?.toString().trim(),
        department: row.getCell(6).value?.toString().trim() || excelFile.department,
        employeeId: row.getCell(7).value?.toString().trim(),
        password: 'TempPassword123!' // Default password - should be changed on first login
      };

      // Validate required fields
      if (!userData.username || !userData.email || !userData.firstName || !userData.lastName) {
        errors.push({
          row: rowNumber,
          message: 'Missing required fields: username, email, firstName, or lastName'
        });
        continue;
      }

      // Validate role
      const validRoles = ['Admin', 'Supervisor', 'Line Incharge', 'Operator', 'Auditor'];
      if (!validRoles.includes(userData.role)) {
        errors.push({
          row: rowNumber,
          message: `Invalid role: ${userData.role}. Must be one of: ${validRoles.join(', ')}`
        });
        continue;
      }

      // Check for duplicates
      const existing = await User.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email },
          { employeeId: userData.employeeId }
        ]
      });

      if (existing) {
        errors.push({
          row: rowNumber,
          message: `User with username, email, or employee ID already exists`
        });
        continue;
      }

      // Create user
      const user = await User.create(userData);
      importedIds.push(user._id);
      imported++;

    } catch (error) {
      errors.push({
        row: rowNumber,
        message: error.message
      });
    }
  }

  return { imported, errors, ids: importedIds };
}
