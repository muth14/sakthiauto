import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  User,
  Building,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FormWorkflowControls from '../components/FormWorkflowControls';
import { toast } from '../hooks/use-toast';
import api from '../lib/api';

interface FormSubmission {
  _id: string;
  submissionId: string;
  title: string;
  status: 'Draft' | 'Submitted' | 'Under Verification' | 'Verified' | 'Approved' | 'Rejected';
  submittedBy: {
    firstName: string;
    lastName: string;
  };
  submittedAt: string;
  department: string;
  formTemplate: {
    title: string;
    category: string;
  };
  approvalWorkflow: Array<{
    step: 'verification' | 'approval';
    status: 'pending' | 'approved' | 'rejected';
    userId?: {
      firstName: string;
      lastName: string;
    };
    comments?: string;
    processedAt?: string;
  }>;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string;
}

const FormSubmissions: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Load submissions from backend
  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/forms/submissions');
      
      if (response.data.success) {
        setSubmissions(response.data.data || []);
      } else {
        throw new Error('Failed to fetch submissions');
      }
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load form submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle status update from workflow controls
  const handleStatusUpdate = (submissionId: string, newStatus: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub._id === submissionId 
          ? { ...sub, status: newStatus as any }
          : sub
      )
    );
    
    // Refresh data from backend to get updated workflow
    loadSubmissions();
  };

  // Filter submissions based on user role and filters
  const getFilteredSubmissions = () => {
    let filtered = submissions;

    // Role-based filtering
    if (user?.role === 'Operator' || user?.role === 'Line Incharge') {
      // Show only own submissions
      filtered = filtered.filter(sub => 
        sub.submittedBy.firstName === user.firstName && 
        sub.submittedBy.lastName === user.lastName
      );
    } else if (user?.role === 'Supervisor') {
      // Show submissions from own department
      filtered = filtered.filter(sub => sub.department === user.department);
    }
    // Admin and Auditor see all submissions

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.submissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.formTemplate.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status.toLowerCase() === statusFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(sub => sub.department === departmentFilter);
    }

    return filtered;
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Draft':
        return { color: 'text-gray-500', bg: 'bg-gray-100', icon: <Clock size={16} /> };
      case 'Submitted':
        return { color: 'text-blue-500', bg: 'bg-blue-100', icon: <FileText size={16} /> };
      case 'Under Verification':
        return { color: 'text-orange-500', bg: 'bg-orange-100', icon: <Eye size={16} /> };
      case 'Verified':
        return { color: 'text-green-500', bg: 'bg-green-100', icon: <CheckCircle size={16} /> };
      case 'Approved':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle size={16} /> };
      case 'Rejected':
        return { color: 'text-red-500', bg: 'bg-red-100', icon: <XCircle size={16} /> };
      default:
        return { color: 'text-gray-500', bg: 'bg-gray-100', icon: <Clock size={16} /> };
    }
  };

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600 bg-red-100';
      case 'High':
        return 'text-orange-600 bg-orange-100';
      case 'Medium':
        return 'text-blue-600 bg-blue-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredSubmissions = getFilteredSubmissions();
  const departments = [...new Set(submissions.map(sub => sub.department))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Form Submissions</h1>
          <p className="text-muted-foreground">
            Manage and track form submissions through the approval workflow
          </p>
        </div>
        <button
          onClick={loadSubmissions}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under verification">Under Verification</option>
          <option value="verified">Verified</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <div className="text-sm text-muted-foreground flex items-center">
          <Filter size={16} className="mr-2" />
          {filteredSubmissions.length} of {submissions.length} submissions
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">No submissions found</h3>
            <p className="text-muted-foreground">
              {submissions.length === 0 
                ? "No form submissions have been created yet."
                : "No submissions match your current filters."
              }
            </p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const statusDisplay = getStatusDisplay(submission.status);
            return (
              <div key={submission._id} className="professional-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{submission.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {submission.formTemplate.title} • {submission.submissionId}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {submission.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(submission.priority)}`}>
                            {submission.priority}
                          </span>
                        )}
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                          {statusDisplay.icon}
                          <span>{submission.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <User size={14} />
                        <span>{submission.submittedBy.firstName} {submission.submittedBy.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Building size={14} />
                        <span>{submission.department}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar size={14} />
                        <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Workflow Controls */}
                    <FormWorkflowControls
                      submission={submission}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  </div>

                  {/* Actions */}
                  <div className="ml-4">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowDetailsModal(true);
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Submission Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Title:</span>
                      <div className="font-medium">{selectedSubmission.title}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submission ID:</span>
                      <div className="font-medium">{selectedSubmission.submissionId}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Form Template:</span>
                      <div className="font-medium">{selectedSubmission.formTemplate.title}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <div className="font-medium">{selectedSubmission.formTemplate.category}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <div className="font-medium">{selectedSubmission.department}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted By:</span>
                      <div className="font-medium">
                        {selectedSubmission.submittedBy.firstName} {selectedSubmission.submittedBy.lastName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Controls with Details */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Workflow Management</h3>
                  <FormWorkflowControls
                    submission={selectedSubmission}
                    onStatusUpdate={handleStatusUpdate}
                    showDetails={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSubmissions;
