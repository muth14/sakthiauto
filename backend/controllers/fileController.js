const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const AuditLog = require('../models/AuditLog');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Create different folders based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath += 'pdfs/';
    } else if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
      uploadPath += 'excel/';
    } else {
      uploadPath += 'documents/';
    }

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and Excel files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter
});

/**
 * @desc    Upload single file
 * @route   POST /api/files/upload
 * @access  Private
 */
exports.uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { relatedForm, description } = req.body;

      // Process image files (resize if needed)
      if (req.file.mimetype.startsWith('image/')) {
        try {
          const processedPath = req.file.path.replace(path.extname(req.file.path), '_processed' + path.extname(req.file.path));
          
          await sharp(req.file.path)
            .resize(1920, 1080, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toFile(processedPath);

          // Replace original with processed image
          await fs.unlink(req.file.path);
          await fs.rename(processedPath, req.file.path);
        } catch (imageError) {
          console.error('Image processing error:', imageError);
          // Continue with original file if processing fails
        }
      }

      // Create file metadata
      const fileMetadata = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
        relatedForm,
        description
      };

      // Create audit log
      await AuditLog.createLog({
        user: req.user._id,
        action: 'upload_file',
        description: `Uploaded file: ${req.file.originalname}`,
        resourceType: 'file',
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: fileMetadata
      });
    } catch (error) {
      console.error('File upload error:', error);
      
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
        message: 'Server error during file upload',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
];

/**
 * @desc    Upload multiple files
 * @route   POST /api/files/upload-multiple
 * @access  Private
 */
exports.uploadMultipleFiles = [
  upload.array('files', 10), // Maximum 10 files
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const { relatedForm, description } = req.body;
      const uploadedFiles = [];

      // Process each file
      for (const file of req.files) {
        // Process image files (resize if needed)
        if (file.mimetype.startsWith('image/')) {
          try {
            const processedPath = file.path.replace(path.extname(file.path), '_processed' + path.extname(file.path));
            
            await sharp(file.path)
              .resize(1920, 1080, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .jpeg({ quality: 85 })
              .toFile(processedPath);

            // Replace original with processed image
            await fs.unlink(file.path);
            await fs.rename(processedPath, file.path);
          } catch (imageError) {
            console.error('Image processing error:', imageError);
            // Continue with original file if processing fails
          }
        }

        // Create file metadata
        const fileMetadata = {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          uploadedBy: req.user._id,
          uploadedAt: new Date(),
          relatedForm,
          description
        };

        uploadedFiles.push(fileMetadata);
      }

      // Create audit log
      await AuditLog.createLog({
        user: req.user._id,
        action: 'upload_file',
        description: `Uploaded ${req.files.length} files`,
        resourceType: 'file',
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
          fileCount: req.files.length,
          totalSize: req.files.reduce((total, file) => total + file.size, 0)
        }
      });

      res.status(201).json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        data: uploadedFiles
      });
    } catch (error) {
      console.error('Multiple file upload error:', error);
      
      // Clean up uploaded files if there was an error
      if (req.files) {
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error deleting uploaded file:', unlinkError);
          }
        }
      }

      res.status(500).json({
        success: false,
        message: 'Server error during file upload',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
];

/**
 * @desc    Download file
 * @route   GET /api/files/download/:filename
 * @access  Private
 */
exports.downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Find file in uploads directory
    const possiblePaths = [
      `uploads/images/${filename}`,
      `uploads/pdfs/${filename}`,
      `uploads/excel/${filename}`,
      `uploads/documents/${filename}`
    ];

    let filePath = null;
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        filePath = possiblePath;
        break;
      } catch (error) {
        // File doesn't exist in this path, continue
      }
    }

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream file to response
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'download_file',
      description: `Downloaded file: ${filename}`,
      resourceType: 'file',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        filename,
        size: stats.size
      }
    });

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file download',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete file
 * @route   DELETE /api/files/:filename
 * @access  Private (Admin, Supervisor, or file owner)
 */
exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Find file in uploads directory
    const possiblePaths = [
      `uploads/images/${filename}`,
      `uploads/pdfs/${filename}`,
      `uploads/excel/${filename}`,
      `uploads/documents/${filename}`
    ];

    let filePath = null;
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        filePath = possiblePath;
        break;
      } catch (error) {
        // File doesn't exist in this path, continue
      }
    }

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file
    await fs.unlink(filePath);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'delete_file',
      description: `Deleted file: ${filename}`,
      resourceType: 'file',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        filename
      }
    });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
