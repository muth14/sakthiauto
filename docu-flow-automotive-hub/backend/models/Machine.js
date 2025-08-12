const mongoose = require('mongoose');

// Schema for maintenance records
const maintenanceRecordSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Preventive', 'Corrective', 'Emergency', 'Routine'],
    default: 'Routine'
  },
  description: {
    type: String,
    required: [true, 'Maintenance description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  nextMaintenanceDate: {
    type: Date
  },
  cost: {
    type: Number,
    min: 0
  },
  partsReplaced: [{
    partName: String,
    partNumber: String,
    quantity: Number,
    cost: Number
  }],
  status: {
    type: String,
    enum: ['Completed', 'In Progress', 'Scheduled', 'Cancelled'],
    default: 'Completed'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, { timestamps: true });

// Main Machine schema
const machineSchema = new mongoose.Schema({
  machineId: {
    type: String,
    required: [true, 'Machine ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Machine ID cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Machine name is required'],
    trim: true,
    maxlength: [100, 'Machine name cannot exceed 100 characters']
  },
  model: {
    type: String,
    required: [true, 'Machine model is required'],
    trim: true,
    maxlength: [100, 'Machine model cannot exceed 100 characters']
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true,
    maxlength: [100, 'Manufacturer cannot exceed 100 characters']
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
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
  installationDate: {
    type: Date,
    required: [true, 'Installation date is required']
  },
  warrantyExpiry: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Active', 'Inactive', 'Under Maintenance', 'Decommissioned'],
      message: 'Status must be one of: Active, Inactive, Under Maintenance, Decommissioned'
    },
    default: 'Active'
  },
  specifications: {
    type: Map,
    of: String,
    default: new Map()
  },
  operatingParameters: {
    maxTemperature: Number,
    maxPressure: Number,
    maxSpeed: Number,
    powerRating: Number,
    voltage: Number,
    frequency: Number
  },
  maintenanceSchedule: {
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'],
      default: 'Monthly'
    },
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date
  },
  maintenanceRecords: [maintenanceRecordSchema],
  assignedOperators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
machineSchema.index({ machineId: 1 });
machineSchema.index({ serialNumber: 1 });
machineSchema.index({ department: 1 });
machineSchema.index({ status: 1 });
machineSchema.index({ isActive: 1 });

// Virtual for machine age
machineSchema.virtual('age').get(function() {
  if (!this.installationDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.installationDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
});

// Virtual for maintenance status
machineSchema.virtual('maintenanceStatus').get(function() {
  if (!this.maintenanceSchedule.nextMaintenanceDate) return 'Not Scheduled';
  
  const now = new Date();
  const nextMaintenance = new Date(this.maintenanceSchedule.nextMaintenanceDate);
  const diffDays = Math.ceil((nextMaintenance - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 7) return 'Due Soon';
  return 'Scheduled';
});

module.exports = mongoose.model('Machine', machineSchema);
