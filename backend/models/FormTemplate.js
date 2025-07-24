const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Schema for individual form fields
const formFieldSchema = new mongoose.Schema({
  fieldId: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: [true, 'Field label is required'],
    trim: true,
    maxlength: [100, 'Field label cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Field type is required'],
    enum: {
      values: ['text', 'number', 'date', 'dropdown', 'checkbox', 'radio', 'file', 'signature', 'textarea'],
      message: 'Field type must be one of: text, number, date, dropdown, checkbox, radio, file, signature, textarea'
    }
  },
  placeholder: {
    type: String,
    trim: true,
    maxlength: [200, 'Placeholder cannot exceed 200 characters']
  },
  required: {
    type: Boolean,
    default: false
  },
  options: {
    type: [String], // For dropdown, checkbox, radio
    default: []
  },
  validation: {
    type: Object,
    default: null
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  order: {
    type: Number,
    required: true
  }
}, { _id: false });

// Schema for form sections
const formSectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
    maxlength: [100, 'Section title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  order: {
    type: Number,
    required: true
  },
  fields: [formFieldSchema]
}, { _id: false });

// Main FormTemplate schema
const formTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Form title is required'],
    trim: true,
    maxlength: [200, 'Form title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sections: [formSectionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  machineTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  }],
  toolTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
formTemplateSchema.index({ title: 1 });
formTemplateSchema.index({ department: 1 });
formTemplateSchema.index({ category: 1 });
formTemplateSchema.index({ isActive: 1 });
formTemplateSchema.index({ createdBy: 1 });

// Virtual for total fields count
formTemplateSchema.virtual('totalFields').get(function() {
  return this.sections.reduce((total, section) => total + section.fields.length, 0);
});

// Add pagination plugin
formTemplateSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('FormTemplate', formTemplateSchema);
