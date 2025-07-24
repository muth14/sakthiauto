const mongoose = require('mongoose');

// Schema for usage history
const usageHistorySchema = new mongoose.Schema({
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  },
  formSubmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormSubmission'
  },
  usageDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  purpose: {
    type: String,
    trim: true,
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
    default: 'Good'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, { timestamps: true });

// Schema for calibration records
const calibrationRecordSchema = new mongoose.Schema({
  calibratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  calibrationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  nextCalibrationDate: {
    type: Date,
    required: true
  },
  certificateNumber: {
    type: String,
    trim: true
  },
  calibrationAgency: {
    type: String,
    trim: true,
    maxlength: [200, 'Calibration agency cannot exceed 200 characters']
  },
  results: {
    type: String,
    enum: ['Pass', 'Fail', 'Conditional'],
    required: true
  },
  deviations: [{
    parameter: String,
    expected: String,
    actual: String,
    deviation: String
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, { timestamps: true });

// Main Tool schema
const toolSchema = new mongoose.Schema({
  toolId: {
    type: String,
    required: [true, 'Tool ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Tool ID cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Tool name is required'],
    trim: true,
    maxlength: [100, 'Tool name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Tool type is required'],
    enum: {
      values: ['Measuring', 'Cutting', 'Drilling', 'Grinding', 'Assembly', 'Testing', 'Calibration', 'Other'],
      message: 'Tool type must be one of: Measuring, Cutting, Drilling, Grinding, Assembly, Testing, Calibration, Other'
    }
  },
  material: {
    type: String,
    required: [true, 'Material is required'],
    trim: true,
    maxlength: [100, 'Material cannot exceed 100 characters']
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true,
    maxlength: [100, 'Manufacturer cannot exceed 100 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    trim: true,
    maxlength: [50, 'Serial number cannot exceed 50 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  cost: {
    type: Number,
    min: 0
  },
  lifespan: {
    expectedHours: {
      type: Number,
      min: 0
    },
    expectedCycles: {
      type: Number,
      min: 0
    },
    expectedYears: {
      type: Number,
      min: 0
    }
  },
  currentUsage: {
    totalHours: {
      type: Number,
      default: 0,
      min: 0
    },
    totalCycles: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Available', 'In Use', 'Under Maintenance', 'Calibration Due', 'Retired', 'Lost/Damaged'],
      message: 'Status must be one of: Available, In Use, Under Maintenance, Calibration Due, Retired, Lost/Damaged'
    },
    default: 'Available'
  },
  condition: {
    type: String,
    required: true,
    enum: {
      values: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
      message: 'Condition must be one of: Excellent, Good, Fair, Poor, Damaged'
    },
    default: 'Good'
  },
  specifications: {
    type: Map,
    of: String,
    default: new Map()
  },
  calibrationRequired: {
    type: Boolean,
    default: false
  },
  calibrationFrequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Bi-Annual'],
    default: 'Annual'
  },
  lastCalibrationDate: {
    type: Date
  },
  nextCalibrationDate: {
    type: Date
  },
  calibrationRecords: [calibrationRecordSchema],
  usageHistory: [usageHistorySchema],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  compatibleMachines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  }],
  documents: [{
    name: String,
    type: String,
    path: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
toolSchema.index({ toolId: 1 });
toolSchema.index({ serialNumber: 1 });
toolSchema.index({ department: 1 });
toolSchema.index({ type: 1 });
toolSchema.index({ status: 1 });
toolSchema.index({ condition: 1 });
toolSchema.index({ isActive: 1 });

// Virtual for tool age
toolSchema.virtual('age').get(function() {
  if (!this.purchaseDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.purchaseDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
});

// Virtual for usage percentage
toolSchema.virtual('usagePercentage').get(function() {
  if (!this.lifespan.expectedHours || this.lifespan.expectedHours === 0) return null;
  return Math.min((this.currentUsage.totalHours / this.lifespan.expectedHours) * 100, 100);
});

// Virtual for calibration status
toolSchema.virtual('calibrationStatus').get(function() {
  if (!this.calibrationRequired) return 'Not Required';
  if (!this.nextCalibrationDate) return 'Not Scheduled';
  
  const now = new Date();
  const nextCalibration = new Date(this.nextCalibrationDate);
  const diffDays = Math.ceil((nextCalibration - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 30) return 'Due Soon';
  return 'Current';
});

module.exports = mongoose.model('Tool', toolSchema);
