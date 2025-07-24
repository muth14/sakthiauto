const mongoose = require('mongoose');

// Schema for file attachments
const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Schema for form field responses
const fieldResponseSchema = new mongoose.Schema({
  fieldId: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be string, number, array, etc.
    default: null
  },
  attachments: [attachmentSchema]
}, { _id: false });

// Schema for section responses
const sectionResponseSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  responses: [fieldResponseSchema]
}, { _id: false });

// Schema for approval workflow
const approvalSchema = new mongoose.Schema({
  step: {
    type: String,
    required: true,
    enum: ['verification', 'approval']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comments cannot exceed 1000 characters']
  },
  processedAt: {
    type: Date
  }
}, { _id: false });

// Main FormSubmission schema
const formSubmissionSchema = new mongoose.Schema({
  formTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormTemplate',
    required: true
  },
  submissionId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Draft', 'Submitted', 'Under Verification', 'Verified', 'Approved', 'Rejected'],
      message: 'Status must be one of: Draft, Submitted, Under Verification, Verified, Approved, Rejected'
    },
    default: 'Draft'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date
  },
  department: {
    type: String,
    required: true
  },
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  },
  tool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool'
  },
  sections: [sectionResponseSchema],
  approvalWorkflow: [approvalSchema],
  pdfGenerated: {
    type: Boolean,
    default: false
  },
  pdfPath: {
    type: String
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
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
formSubmissionSchema.index({ submissionId: 1 });
formSubmissionSchema.index({ formTemplate: 1 });
formSubmissionSchema.index({ submittedBy: 1 });
formSubmissionSchema.index({ status: 1 });
formSubmissionSchema.index({ department: 1 });
formSubmissionSchema.index({ submittedAt: -1 });
formSubmissionSchema.index({ createdAt: -1 });

// Virtual for current approval step
formSubmissionSchema.virtual('currentApprovalStep').get(function() {
  if (this.approvalWorkflow.length === 0) return null;
  return this.approvalWorkflow[this.approvalWorkflow.length - 1];
});

// Pre-save middleware to generate submission ID
formSubmissionSchema.pre('save', function(next) {
  if (this.isNew && !this.submissionId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.submissionId = `SUB-${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
