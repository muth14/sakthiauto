// Application Constants

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  SUPERVISOR: 'Supervisor',
  LINE_INCHARGE: 'Line Incharge',
  OPERATOR: 'Operator',
  AUDITOR: 'Auditor',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Form Submission Statuses
export const FORM_STATUSES = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_VERIFICATION: 'Under Verification',
  VERIFIED: 'Verified',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export type FormStatus = typeof FORM_STATUSES[keyof typeof FORM_STATUSES];

// Machine Statuses
export const MACHINE_STATUSES = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  UNDER_MAINTENANCE: 'Under Maintenance',
  DECOMMISSIONED: 'Decommissioned',
} as const;

export type MachineStatus = typeof MACHINE_STATUSES[keyof typeof MACHINE_STATUSES];

// Tool Statuses
export const TOOL_STATUSES = {
  AVAILABLE: 'Available',
  IN_USE: 'In Use',
  UNDER_MAINTENANCE: 'Under Maintenance',
  CALIBRATION_DUE: 'Calibration Due',
  RETIRED: 'Retired',
  LOST_DAMAGED: 'Lost/Damaged',
} as const;

export type ToolStatus = typeof TOOL_STATUSES[keyof typeof TOOL_STATUSES];

// Tool Types
export const TOOL_TYPES = {
  MEASURING: 'Measuring',
  CUTTING: 'Cutting',
  DRILLING: 'Drilling',
  GRINDING: 'Grinding',
  ASSEMBLY: 'Assembly',
  TESTING: 'Testing',
  CALIBRATION: 'Calibration',
  OTHER: 'Other',
} as const;

export type ToolType = typeof TOOL_TYPES[keyof typeof TOOL_TYPES];

// Conditions
export const CONDITIONS = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  DAMAGED: 'Damaged',
} as const;

export type Condition = typeof CONDITIONS[keyof typeof CONDITIONS];

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

// Form Field Types
export const FORM_FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  DROPDOWN: 'dropdown',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  FILE: 'file',
  SIGNATURE: 'signature',
  TEXTAREA: 'textarea',
} as const;

export type FormFieldType = typeof FORM_FIELD_TYPES[keyof typeof FORM_FIELD_TYPES];

// Maintenance Types
export const MAINTENANCE_TYPES = {
  PREVENTIVE: 'Preventive',
  CORRECTIVE: 'Corrective',
  EMERGENCY: 'Emergency',
  ROUTINE: 'Routine',
} as const;

export type MaintenanceType = typeof MAINTENANCE_TYPES[keyof typeof MAINTENANCE_TYPES];

// Maintenance Frequencies
export const MAINTENANCE_FREQUENCIES = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  ANNUALLY: 'Annually',
} as const;

export type MaintenanceFrequency = typeof MAINTENANCE_FREQUENCIES[keyof typeof MAINTENANCE_FREQUENCIES];

// Calibration Frequencies
export const CALIBRATION_FREQUENCIES = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUAL: 'Semi-Annual',
  ANNUAL: 'Annual',
  BI_ANNUAL: 'Bi-Annual',
} as const;

export type CalibrationFrequency = typeof CALIBRATION_FREQUENCIES[keyof typeof CALIBRATION_FREQUENCIES];

// Calibration Results
export const CALIBRATION_RESULTS = {
  PASS: 'Pass',
  FAIL: 'Fail',
  CONDITIONAL: 'Conditional',
} as const;

export type CalibrationResult = typeof CALIBRATION_RESULTS[keyof typeof CALIBRATION_RESULTS];

// File Types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  DOCUMENTS: ['application/pdf'],
  EXCEL: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet'
  ],
} as const;

// File Size Limits (in MB)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10,
  DOCUMENT: 50,
  EXCEL: 50,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'sakthiauto_token',
  USER: 'sakthiauto_user',
  THEME: 'sakthiauto_theme',
  PREFERENCES: 'sakthiauto_preferences',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  FORMS: {
    TEMPLATES: '/forms/templates',
    SUBMISSIONS: '/forms/submissions',
  },
  MACHINES: '/machines',
  TOOLS: '/tools',
  FILES: '/files',
  PDF: '/pdf',
  AUDIT: '/audit',
  EXCEL: '/excel',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    MESSAGE: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
    MESSAGE: 'Username can only contain letters, numbers, and underscores',
  },
} as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: 'blue',
  SECONDARY: 'gray',
  SUCCESS: 'green',
  WARNING: 'yellow',
  ERROR: 'red',
  INFO: 'blue',
} as const;

// Navigation Items
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['Admin', 'Supervisor', 'Line Incharge', 'Operator', 'Auditor'],
  },
  {
    name: 'Forms',
    href: '/forms',
    icon: 'FileText',
    roles: ['Admin', 'Supervisor', 'Line Incharge', 'Operator'],
  },
  {
    name: 'Machines',
    href: '/machines',
    icon: 'Settings',
    roles: ['Admin', 'Supervisor', 'Line Incharge', 'Operator'],
  },
  {
    name: 'Tools',
    href: '/tools',
    icon: 'Wrench',
    roles: ['Admin', 'Supervisor', 'Line Incharge', 'Operator'],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: 'BarChart3',
    roles: ['Admin', 'Supervisor', 'Auditor'],
  },
  {
    name: 'Audit Logs',
    href: '/audit',
    icon: 'Shield',
    roles: ['Admin', 'Supervisor', 'Auditor'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: 'Settings',
    roles: ['Admin'],
  },
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file format.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  SAVE: 'Changes saved successfully!',
  DELETE: 'Item deleted successfully!',
  UPLOAD: 'File uploaded successfully!',
  SUBMIT: 'Form submitted successfully!',
  APPROVE: 'Form approved successfully!',
  REJECT: 'Form rejected successfully!',
} as const;
