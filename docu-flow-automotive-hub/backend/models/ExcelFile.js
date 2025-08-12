const mongoose = require('mongoose');

// Schema for sheet metadata
const sheetMetadataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rowCount: {
    type: Number,
    required: true,
    min: 0
  },
  columnCount: {
    type: Number,
    required: true,
    min: 0
  },
  headers: {
    type: [String],
    default: []
  }
}, { _id: false });

// Schema for parsed data summary
const dataSummarySchema = new mongoose.Schema({
  totalRecords: {
    type: Number,
    required: true,
    min: 0
  },
  validRecords: {
    type: Number,
    required: true,
    min: 0
  },
  invalidRecords: {
    type: Number,
    required: true,
    min: 0
  },
  duplicateRecords: {
    type: Number,
    required: true,
    min: 0
  },
  importedRecords: {
    type: Number,
    required: true,
    min: 0
  },
  errors: [{
    row: Number,
    column: String,
    message: String
  }]
}, { _id: false });

// Main ExcelFile schema
const excelFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: 0
  },
  mimetype: {
    type: String,
    required: [true, 'MIME type is required'],
    enum: {
      values: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.spreadsheet'
      ],
      message: 'Invalid file type. Only Excel files are allowed.'
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  sheets: [sheetMetadataSchema],
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Uploaded', 'Processing', 'Processed', 'Error', 'Imported'],
      message: 'Status must be one of: Uploaded, Processing, Processed, Error, Imported'
    },
    default: 'Uploaded'
  },
  processingStartedAt: {
    type: Date
  },
  processingCompletedAt: {
    type: Date
  },
  importStartedAt: {
    type: Date
  },
  importCompletedAt: {
    type: Date
  },
  dataSummary: dataSummarySchema,
  targetModel: {
    type: String,
    enum: ['Machine', 'Tool', 'User', 'FormTemplate', null],
    default: null
  },
  importedIds: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
excelFileSchema.index({ uploadedBy: 1 });
excelFileSchema.index({ department: 1 });
excelFileSchema.index({ category: 1 });
excelFileSchema.index({ status: 1 });
excelFileSchema.index({ createdAt: -1 });
excelFileSchema.index({ isArchived: 1 });

// Virtual for processing duration
excelFileSchema.virtual('processingDuration').get(function() {
  if (!this.processingStartedAt || !this.processingCompletedAt) return null;
  return (this.processingCompletedAt - this.processingStartedAt) / 1000; // in seconds
});

// Virtual for import duration
excelFileSchema.virtual('importDuration').get(function() {
  if (!this.importStartedAt || !this.importCompletedAt) return null;
  return (this.importCompletedAt - this.importStartedAt) / 1000; // in seconds
});

// Virtual for file age
excelFileSchema.virtual('fileAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // in days
});

module.exports = mongoose.model('ExcelFile', excelFileSchema);
