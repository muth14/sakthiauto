import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Eye, 
  MessageSquare, 
  AlertTriangle,
  ArrowRight,
  User,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

interface FormWorkflowControlsProps {
  submission: FormSubmission;
  onStatusUpdate: (submissionId: string, newStatus: string) => void;
  showDetails?: boolean;
}

const FormWorkflowControls: React.FC<FormWorkflowControlsProps> = ({
  submission,
  onStatusUpdate,
  showDetails = false
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'submit' | 'verify' | 'approve' | 'reject'>('submit');

  // Check user permissions for different actions
  const canSubmit = user?.role === 'Operator' || user?.role === 'Line Incharge';
  const canVerify = user?.role === 'Supervisor' || user?.role === 'Admin';
  const canApprove = user?.role === 'Admin' || user?.role === 'Auditor';

  // Get available actions based on current status and user role
  const getAvailableActions = () => {
    const actions = [];

    switch (submission.status) {
      case 'Draft':
        if (canSubmit) {
          actions.push({
            type: 'submit' as const,
            label: 'Submit for Review',
            icon: <Send size={16} />,
            color: 'bg-blue-500 hover:bg-blue-600',
            description: 'Submit form for verification'
          });
        }
        break;

      case 'Submitted':
        if (canVerify) {
          actions.push({
            type: 'verify' as const,
            label: 'Start Verification',
            icon: <Eye size={16} />,
            color: 'bg-orange-500 hover:bg-orange-600',
            description: 'Begin verification process'
          });
        }
        break;

      case 'Under Verification':
        if (canVerify) {
          actions.push({
            type: 'verify' as const,
            label: 'Complete Verification',
            icon: <CheckCircle size={16} />,
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Mark verification as complete'
          });
          actions.push({
            type: 'reject' as const,
            label: 'Reject',
            icon: <XCircle size={16} />,
            color: 'bg-red-500 hover:bg-red-600',
            description: 'Reject the form submission'
          });
        }
        break;

      case 'Verified':
        if (canApprove) {
          actions.push({
            type: 'approve' as const,
            label: 'Approve',
            icon: <CheckCircle size={16} />,
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Give final approval'
          });
          actions.push({
            type: 'reject' as const,
            label: 'Reject',
            icon: <XCircle size={16} />,
            color: 'bg-red-500 hover:bg-red-600',
            description: 'Reject the form submission'
          });
        }
        break;
    }

    return actions;
  };

  // Handle workflow action
  const handleAction = async (action: 'submit' | 'verify' | 'approve' | 'reject') => {
    if (action === 'reject' && !comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide comments when rejecting a form.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let endpoint = '';
      let payload: any = {};

      switch (action) {
        case 'submit':
          endpoint = `/forms/submissions/${submission._id}/submit`;
          break;
        case 'verify':
          endpoint = `/forms/submissions/${submission._id}/verify`;
          payload = { comments: comments.trim() };
          break;
        case 'approve':
          endpoint = `/forms/submissions/${submission._id}/approve`;
          payload = { comments: comments.trim() };
          break;
        case 'reject':
          endpoint = `/forms/submissions/${submission._id}/reject`;
          payload = { comments: comments.trim() };
          break;
      }

      const response = await api.put(endpoint, payload);

      if (response.data.success) {
        const newStatus = response.data.data.status;
        onStatusUpdate(submission._id, newStatus);
        
        toast({
          title: "Success",
          description: response.data.message
        });

        setShowCommentModal(false);
        setComments('');
      }
    } catch (error: any) {
      console.error('Workflow action error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update form status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Open comment modal for actions that need comments
  const openCommentModal = (action: 'submit' | 'verify' | 'approve' | 'reject') => {
    setActionType(action);
    if (action === 'submit') {
      // Submit doesn't need comments, execute directly
      handleAction(action);
    } else {
      setShowCommentModal(true);
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Draft':
        return { color: 'text-gray-500', bg: 'bg-gray-100', icon: <Clock size={16} /> };
      case 'Submitted':
        return { color: 'text-blue-500', bg: 'bg-blue-100', icon: <Send size={16} /> };
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

  const statusDisplay = getStatusDisplay(submission.status);
  const availableActions = getAvailableActions();

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${statusDisplay.bg}`}>
            <div className={statusDisplay.color}>
              {statusDisplay.icon}
            </div>
          </div>
          <div>
            <div className="font-medium text-foreground">Current Status</div>
            <div className={`text-sm ${statusDisplay.color}`}>{submission.status}</div>
          </div>
        </div>
      </div>

      {/* Workflow Actions */}
      {availableActions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Available Actions</div>
          <div className="flex flex-wrap gap-2">
            {availableActions.map((action) => (
              <button
                key={action.type}
                onClick={() => openCommentModal(action.type)}
                disabled={loading}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-white text-sm font-medium
                  transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  ${action.color}
                `}
                title={action.description}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workflow History */}
      {showDetails && submission.approvalWorkflow.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Workflow History</div>
          <div className="space-y-2">
            {submission.approvalWorkflow.map((step, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className={`p-1 rounded ${
                  step.status === 'approved' ? 'bg-green-100 text-green-600' :
                  step.status === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {step.status === 'approved' ? <CheckCircle size={14} /> :
                   step.status === 'rejected' ? <XCircle size={14} /> :
                   <Clock size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium capitalize">{step.step}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      step.status === 'approved' ? 'bg-green-100 text-green-700' :
                      step.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  {step.userId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      by {step.userId.firstName} {step.userId.lastName}
                    </div>
                  )}
                  {step.comments && (
                    <div className="text-sm text-foreground mt-1">{step.comments}</div>
                  )}
                  {step.processedAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(step.processedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {actionType === 'reject' ? 'Rejection Comments' : 'Comments (Optional)'}
            </h3>
            
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder={actionType === 'reject' ? 'Please provide reason for rejection...' : 'Add your comments here...'}
              required={actionType === 'reject'}
            />
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(actionType)}
                disabled={loading || (actionType === 'reject' && !comments.trim())}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormWorkflowControls;
