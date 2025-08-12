import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Important for cookies (refresh tokens)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sakthiauto_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data;
        localStorage.setItem('sakthiauto_token', token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('sakthiauto_token');
        localStorage.removeItem('sakthiauto_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalDocs: number;
    limit: number;
  };
}

// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'Admin' | 'Supervisor' | 'Line Incharge' | 'Operator' | 'Auditor';
  department: string;
  employeeId: string;
  profilePicture?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Form Types
export interface FormTemplate {
  _id: string;
  title: string;
  description?: string;
  department: string;
  category: string;
  version: number;
  isActive: boolean;
  sections: FormSection[];
  createdBy: User;
  updatedBy?: User;
  approvedBy?: User;
  approvedAt?: string;
  machineTypes?: string[];
  toolTypes?: string[];
  totalFields: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSection {
  sectionId: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

export interface FormField {
  fieldId: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'radio' | 'file' | 'signature' | 'textarea';
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: any;
  defaultValue?: any;
  description?: string;
  order: number;
}

export interface FormSubmission {
  _id: string;
  formTemplate: string | FormTemplate;
  submissionId: string;
  title: string;
  status: 'Draft' | 'Submitted' | 'Under Verification' | 'Verified' | 'Approved' | 'Rejected';
  submittedBy: User;
  submittedAt?: string;
  department: string;
  machine?: any;
  tool?: any;
  sections: FormSectionResponse[];
  approvalWorkflow: ApprovalStep[];
  pdfGenerated: boolean;
  pdfPath?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormSectionResponse {
  sectionId: string;
  title: string;
  responses: FieldResponse[];
}

export interface FieldResponse {
  fieldId: string;
  label: string;
  type: string;
  value: any;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ApprovalStep {
  step: 'verification' | 'approval';
  status: 'pending' | 'approved' | 'rejected';
  userId?: User;
  comments?: string;
  processedAt?: string;
}

// Machine Types
export interface Machine {
  _id: string;
  machineId: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  department: string;
  location: string;
  installationDate: string;
  warrantyExpiry?: string;
  status: 'Active' | 'Inactive' | 'Under Maintenance' | 'Decommissioned';
  specifications?: Record<string, string>;
  operatingParameters?: {
    maxTemperature?: number;
    maxPressure?: number;
    maxSpeed?: number;
    powerRating?: number;
    voltage?: number;
    frequency?: number;
  };
  maintenanceSchedule?: {
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
  };
  maintenanceRecords?: MaintenanceRecord[];
  assignedOperators?: User[];
  isActive: boolean;
  age?: number;
  maintenanceStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  type: 'Preventive' | 'Corrective' | 'Emergency' | 'Routine';
  description: string;
  performedBy: User;
  performedAt: string;
  nextMaintenanceDate?: string;
  cost?: number;
  partsReplaced?: {
    partName: string;
    partNumber: string;
    quantity: number;
    cost: number;
  }[];
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Cancelled';
  notes?: string;
}

// Tool Types
export interface Tool {
  _id: string;
  toolId: string;
  name: string;
  type: 'Measuring' | 'Cutting' | 'Drilling' | 'Grinding' | 'Assembly' | 'Testing' | 'Calibration' | 'Other';
  material: string;
  manufacturer: string;
  model?: string;
  serialNumber?: string;
  department: string;
  location: string;
  purchaseDate: string;
  cost?: number;
  lifespan?: {
    expectedHours?: number;
    expectedCycles?: number;
    expectedYears?: number;
  };
  currentUsage?: {
    totalHours: number;
    totalCycles: number;
  };
  status: 'Available' | 'In Use' | 'Under Maintenance' | 'Calibration Due' | 'Retired' | 'Lost/Damaged';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  specifications?: Record<string, string>;
  calibrationRequired: boolean;
  calibrationFrequency?: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Bi-Annual';
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  calibrationRecords?: CalibrationRecord[];
  usageHistory?: UsageRecord[];
  assignedTo?: User;
  compatibleMachines?: Machine[];
  isActive: boolean;
  age?: number;
  usagePercentage?: number;
  calibrationStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalibrationRecord {
  calibratedBy: User;
  calibrationDate: string;
  nextCalibrationDate: string;
  certificateNumber?: string;
  calibrationAgency?: string;
  results: 'Pass' | 'Fail' | 'Conditional';
  deviations?: {
    parameter: string;
    expected: string;
    actual: string;
    deviation: string;
  }[];
  notes?: string;
}

export interface UsageRecord {
  usedBy: User;
  machine?: Machine;
  formSubmission?: FormSubmission;
  usageDate: string;
  duration?: number;
  purpose?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  notes?: string;
}

// Audit Log Types
export interface AuditLog {
  _id: string;
  user: User;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType: string;
  resourceId?: string;
  resourceModel?: string;
  metadata?: Record<string, any>;
  status: 'success' | 'failure' | 'warning';
  department?: string;
  createdAt: string;
}

// Excel File Types
export interface ExcelFile {
  _id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedBy: User;
  department: string;
  category: string;
  description?: string;
  sheets: SheetMetadata[];
  status: 'Uploaded' | 'Processing' | 'Processed' | 'Error' | 'Imported';
  processingStartedAt?: string;
  processingCompletedAt?: string;
  importStartedAt?: string;
  importCompletedAt?: string;
  dataSummary?: DataSummary;
  targetModel?: 'Machine' | 'Tool' | 'User' | null;
  importedIds?: string[];
  tags?: string[];
  isArchived: boolean;
  notes?: string;
  processingDuration?: number;
  importDuration?: number;
  fileAge?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SheetMetadata {
  name: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
}

export interface DataSummary {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  importedRecords: number;
  errors: {
    row?: number;
    column?: string;
    message: string;
  }[];
}

export default api;
