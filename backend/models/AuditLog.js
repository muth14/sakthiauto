const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: {
      values: [
        'login', 
        'logout', 
        'create_user', 
        'update_user', 
        'delete_user',
        'create_form_template', 
        'update_form_template', 
        'delete_form_template',
        'create_form_submission', 
        'update_form_submission', 
        'delete_form_submission',
        'submit_form', 
        'verify_form', 
        'approve_form', 
        'reject_form',
        'generate_pdf', 
        'download_pdf',
        'upload_file', 
        'delete_file',
        'create_machine', 
        'update_machine', 
        'delete_machine',
        'create_tool', 
        'update_tool', 
        'delete_tool',
        'upload_excel', 
        'download_excel',
        'export_data',
        'system_error',
        'other'
      ],
      message: 'Invalid action type'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  resourceType: {
    type: String,
    enum: {
      values: [
        'user', 
        'form_template', 
        'form_submission', 
        'file', 
        'machine', 
        'tool', 
        'excel', 
        'system',
        'other'
      ],
      message: 'Invalid resource type'
    },
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceModel'
  },
  resourceModel: {
    type: String,
    enum: ['User', 'FormTemplate', 'FormSubmission', 'Machine', 'Tool', 'ExcelFile']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  department: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ department: 1 });

// Static method to create a new audit log
auditLogSchema.statics.createLog = async function(logData) {
  try {
    return await this.create(logData);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent disrupting main application flow
    return null;
  }
};

// Static method to get logs by date range
auditLogSchema.statics.getLogsByDateRange = async function(startDate, endDate, filters = {}) {
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    ...filters
  };
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'username firstName lastName role');
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
