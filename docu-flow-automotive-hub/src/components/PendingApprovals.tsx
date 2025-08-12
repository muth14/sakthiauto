import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  Send, 
  FileText, 
  User, 
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormWorkflowControls from './FormWorkflowControls';
import { toast } from '../hooks/use-toast';
import api from '../lib/api';

interface PendingForm {
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
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string;
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
}

interface PendingApprovalsProps {
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
}

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ 
  maxItems = 5, 
  showHeader = true,
  compact = false 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingForms, setPendingForms] = useState<PendingForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    pendingSubmission: 0,
    pendingVerification: 0,
    pendingApproval: 0,
    total: 0
  });

  useEffect(() => {
    loadPendingForms();
  }, [user]);

  const loadPendingForms = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get('/forms/submissions');
      
      if (response.data.success) {
        const allSubmissions = response.data.data || [];
        const filtered = filterPendingForUser(allSubmissions);
        setPendingForms(filtered.slice(0, maxItems));
        calculateCounts(allSubmissions);
      }
    } catch (error: any) {
      console.error('Error loading pending forms:', error);
      toast({
        title: "Error",
        description: "Failed to load pending approvals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter forms that need user's attention based on role
  const filterPendingForUser = (submissions: PendingForm[]) => {
    if (!user) return [];

    let filtered: PendingForm[] = [];

    switch (user.role) {
      case 'Operator':
      case 'Line Incharge':
        // Show own draft forms that can be submitted
        filtered = submissions.filter(sub => 
          sub.status === 'Draft' &&
          sub.submittedBy.firstName === user.firstName &&
          sub.submittedBy.lastName === user.lastName
        );
        break;

      case 'Supervisor':
        // Show submitted forms from own department that need verification
        filtered = submissions.filter(sub => 
          (sub.status === 'Submitted' || sub.status === 'Under Verification') &&
          sub.department === user.department
        );
        break;

      case 'Admin':
        // Show all forms needing verification or approval
        filtered = submissions.filter(sub => 
          sub.status === 'Submitted' || 
          sub.status === 'Under Verification' || 
          sub.status === 'Verified'
        );
        break;

      case 'Auditor':
        // Show verified forms that need final approval
        filtered = submissions.filter(sub => sub.status === 'Verified');
        break;

      default:
        filtered = [];
    }

    // Sort by priority and date
    return filtered.sort((a, b) => {
      // Priority order: Critical > High > Medium > Low
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const aPriority = priorityOrder[a.priority || 'Medium'];
      const bPriority = priorityOrder[b.priority || 'Medium'];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by submission date (oldest first)
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });
  };

  // Calculate counts for different types of pending items
  const calculateCounts = (submissions: PendingForm[]) => {
    if (!user) return;

    let pendingSubmission = 0;
    let pendingVerification = 0;
    let pendingApproval = 0;

    submissions.forEach(sub => {
      switch (user.role) {
        case 'Operator':
        case 'Line Incharge':
          if (sub.status === 'Draft' && 
              sub.submittedBy.firstName === user.firstName &&
              sub.submittedBy.lastName === user.lastName) {
            pendingSubmission++;
          }
          break;

        case 'Supervisor':
          if ((sub.status === 'Submitted' || sub.status === 'Under Verification') &&
              sub.department === user.department) {
            pendingVerification++;
          }
          break;

        case 'Admin':
          if (sub.status === 'Submitted' || sub.status === 'Under Verification') {
            pendingVerification++;
          } else if (sub.status === 'Verified') {
            pendingApproval++;
          }
          break;

        case 'Auditor':
          if (sub.status === 'Verified') {
            pendingApproval++;
          }
          break;
      }
    });

    const total = pendingSubmission + pendingVerification + pendingApproval;
    setCounts({ pendingSubmission, pendingVerification, pendingApproval, total });
  };

  const handleStatusUpdate = (submissionId: string, newStatus: string) => {
    setPendingForms(prev => 
      prev.map(form => 
        form._id === submissionId 
          ? { ...form, status: newStatus as any }
          : form
      ).filter(form => filterPendingForUser([form]).length > 0)
    );
    
    // Reload to get fresh data
    loadPendingForms();
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Draft':
        return { color: 'text-gray-500', bg: 'bg-gray-100', icon: <FileText size={14} /> };
      case 'Submitted':
        return { color: 'text-blue-500', bg: 'bg-blue-100', icon: <Send size={14} /> };
      case 'Under Verification':
        return { color: 'text-orange-500', bg: 'bg-orange-100', icon: <Eye size={14} /> };
      case 'Verified':
        return { color: 'text-green-500', bg: 'bg-green-100', icon: <CheckCircle size={14} /> };
      default:
        return { color: 'text-gray-500', bg: 'bg-gray-100', icon: <Clock size={14} /> };
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'High':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Medium':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'Low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getActionText = () => {
    switch (user?.role) {
      case 'Operator':
      case 'Line Incharge':
        return 'Forms to Submit';
      case 'Supervisor':
        return 'Forms to Verify';
      case 'Admin':
        return 'Forms Requiring Action';
      case 'Auditor':
        return 'Forms to Approve';
      default:
        return 'Pending Actions';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{getActionText()}</h2>
            <p className="text-sm text-muted-foreground">
              {counts.total} item{counts.total !== 1 ? 's' : ''} requiring your attention
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadPendingForms}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => navigate('/form-submissions')}
              className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {!compact && counts.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {counts.pendingSubmission > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Send className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-blue-800">To Submit</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{counts.pendingSubmission}</div>
            </div>
          )}
          
          {counts.pendingVerification > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Eye className="text-orange-600" size={16} />
                <span className="text-sm font-medium text-orange-800">To Verify</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 mt-1">{counts.pendingVerification}</div>
            </div>
          )}
          
          {counts.pendingApproval > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-600" size={16} />
                <span className="text-sm font-medium text-green-800">To Approve</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">{counts.pendingApproval}</div>
            </div>
          )}
        </div>
      )}

      {/* Pending Forms List */}
      <div className="space-y-3">
        {pendingForms.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
            <p className="text-muted-foreground">No forms requiring your attention at the moment.</p>
          </div>
        ) : (
          pendingForms.map((form) => {
            const statusDisplay = getStatusDisplay(form.status);
            return (
              <div key={form._id} className={`professional-card ${compact ? 'p-3' : 'p-4'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-medium text-foreground ${compact ? 'text-sm' : ''}`}>
                        {form.title}
                      </h3>
                      {form.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(form.priority)}`}>
                          {form.priority}
                        </span>
                      )}
                    </div>
                    <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                      {form.formTemplate.title} • {form.submissionId}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                    {statusDisplay.icon}
                    <span>{form.status}</span>
                  </div>
                </div>

                {!compact && (
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center space-x-2">
                      <User size={12} />
                      <span>{form.submittedBy.firstName} {form.submittedBy.lastName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={12} />
                      <span>{new Date(form.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                <FormWorkflowControls
                  submission={form}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            );
          })
        )}
      </div>

      {pendingForms.length > 0 && pendingForms.length === maxItems && (
        <div className="text-center">
          <button
            onClick={() => navigate('/form-submissions')}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            View all {counts.total} pending items →
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
