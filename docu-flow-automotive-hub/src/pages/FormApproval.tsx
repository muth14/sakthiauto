import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, User, Calendar, Eye, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

interface FormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  submittedBy: string;
  submittedAt: string;
  department: string;
  status: 'submitted' | 'approved' | 'rejected' | 'pending';
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  data: { [key: string]: any };
  completionTime: number;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
}

const FormApproval: React.FC = () => {
  const { user } = useAuth();
  const [selectedForm, setSelectedForm] = useState<FormSubmission | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');

  // Load submissions from localStorage
  useEffect(() => {
    const loadSubmissions = () => {
      try {
        const allSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        
        // Filter submissions based on user role and department
        let filteredSubmissions = allSubmissions;
        
        if (user?.role === 'Supervisor' || user?.role === 'Line Incharge') {
          // Supervisors see submissions from their department
          filteredSubmissions = allSubmissions.filter((sub: FormSubmission) => 
            sub.department === user.department
          );
        }
        // Admins and Auditors see all submissions
        
        // Add priority and category if missing
        const enhancedSubmissions = filteredSubmissions.map((sub: FormSubmission) => ({
          ...sub,
          priority: sub.priority || determinePriority(sub),
          category: sub.category || determineCategory(sub.formTitle)
        }));
        
        setSubmissions(enhancedSubmissions);
        
        // Add sample submissions if none exist
        if (enhancedSubmissions.length === 0) {
          const sampleSubmissions = generateSampleSubmissions();
          setSubmissions(sampleSubmissions);
          localStorage.setItem('formSubmissions', JSON.stringify(sampleSubmissions));
        }
        
      } catch (error) {
        console.error('Error loading submissions:', error);
        const sampleSubmissions = generateSampleSubmissions();
        setSubmissions(sampleSubmissions);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [user]);

  // Generate sample submissions for demo
  const generateSampleSubmissions = (): FormSubmission[] => {
    const now = new Date();
    const today = now.toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

    return [
      {
        id: 'approval_1',
        formId: '1',
        formTitle: 'Quality Control Inspection Report',
        submittedBy: 'Sarah Operator',
        submittedAt: today,
        department: 'Quality Control',
        status: 'pending' as const,
        priority: 'high' as const,
        category: 'Quality',
        data: {
          inspector_name: 'Sarah Operator',
          inspection_date: new Date().toISOString().split('T')[0],
          product_id: 'PRD-001',
          quality_rating: 'Good',
          defects_found: 'Minor surface scratches on 2 units'
        },
        completionTime: 480
      },
      {
        id: 'approval_2',
        formId: '2',
        formTitle: 'Machine Setup Checklist',
        submittedBy: 'Mike Technician',
        submittedAt: yesterday,
        department: 'Production',
        status: 'pending' as const,
        priority: 'high' as const,
        category: 'Setup',
        data: {
          operator_name: 'Mike Technician',
          setup_date: new Date().toISOString().split('T')[0],
          machine_id: 'MCH-001',
          shift: 'Morning',
          power_check: true,
          safety_guards: true
        },
        completionTime: 720
      },
      {
        id: 'approval_3',
        formId: '3',
        formTitle: 'Safety Inspection Report',
        submittedBy: 'John Worker',
        submittedAt: yesterday,
        department: 'Safety',
        status: 'pending' as const,
        priority: 'high' as const,
        category: 'Safety',
        data: {
          safety_officer: 'John Worker',
          inspection_date: new Date().toISOString().split('T')[0],
          area_inspected: 'Production Floor A',
          emergency_exits: true,
          fire_extinguishers: false,
          safety_compliance: 'Needs Improvement'
        },
        completionTime: 360
      },
      {
        id: 'approval_4',
        formId: '5',
        formTitle: 'Production Line Audit',
        submittedBy: 'Lisa Supervisor',
        submittedAt: twoDaysAgo,
        department: 'Production',
        status: 'approved' as const,
        priority: 'medium' as const,
        category: 'Audit',
        reviewedBy: user?.firstName + ' ' + user?.lastName,
        reviewedAt: yesterday,
        comments: 'All production targets met. Good performance.',
        data: {
          auditor_name: 'Lisa Supervisor',
          audit_date: new Date().toISOString().split('T')[0],
          production_line: 'Line A',
          production_target: 1000,
          actual_production: 1050
        },
        completionTime: 900
      },
      {
        id: 'approval_5',
        formId: '1',
        formTitle: 'Quality Control Inspection',
        submittedBy: 'Tom Operator',
        submittedAt: threeDaysAgo,
        department: 'Quality Control',
        status: 'rejected' as const,
        priority: 'low' as const,
        category: 'Quality',
        reviewedBy: user?.firstName + ' ' + user?.lastName,
        reviewedAt: twoDaysAgo,
        comments: 'Incomplete inspection data. Please re-submit with all required measurements.',
        data: {
          inspector_name: 'Tom Operator',
          inspection_date: new Date().toISOString().split('T')[0],
          product_id: 'PRD-002',
          quality_rating: 'Poor'
        },
        completionTime: 240
      }
    ];
  };

  // Utility functions
  const determinePriority = (submission: FormSubmission): 'high' | 'medium' | 'low' => {
    const hoursSinceSubmission = (Date.now() - new Date(submission.submittedAt).getTime()) / (1000 * 60 * 60);
    
    if (submission.formTitle.toLowerCase().includes('safety') || 
        submission.formTitle.toLowerCase().includes('quality')) {
      return 'high';
    }
    
    if (hoursSinceSubmission > 24) {
      return 'high';
    } else if (hoursSinceSubmission > 8) {
      return 'medium';
    }
    
    return 'low';
  };

  const determineCategory = (formTitle: string): string => {
    if (formTitle.toLowerCase().includes('quality')) return 'Quality';
    if (formTitle.toLowerCase().includes('safety')) return 'Safety';
    if (formTitle.toLowerCase().includes('machine') || formTitle.toLowerCase().includes('setup')) return 'Setup';
    if (formTitle.toLowerCase().includes('maintenance')) return 'Maintenance';
    if (formTitle.toLowerCase().includes('audit')) return 'Audit';
    if (formTitle.toLowerCase().includes('calibration')) return 'Calibration';
    return 'General';
  };

  // Approval/Rejection functions
  const handleApprove = (submission: FormSubmission) => {
    const updatedSubmissions = submissions.map(sub => 
      sub.id === submission.id 
        ? {
            ...sub,
            status: 'approved' as const,
            reviewedBy: `${user?.firstName} ${user?.lastName}`,
            reviewedAt: new Date().toISOString(),
            comments: approvalComment || 'Approved'
          }
        : sub
    );
    
    setSubmissions(updatedSubmissions);
    localStorage.setItem('formSubmissions', JSON.stringify(updatedSubmissions));
    
    toast({
      title: "Form Approved",
      description: `${submission.formTitle} has been approved successfully.`
    });
    
    setApprovalComment('');
    setShowDetailsModal(false);
  };

  const handleReject = (submission: FormSubmission) => {
    if (!approvalComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    const updatedSubmissions = submissions.map(sub => 
      sub.id === submission.id 
        ? {
            ...sub,
            status: 'rejected' as const,
            reviewedBy: `${user?.firstName} ${user?.lastName}`,
            reviewedAt: new Date().toISOString(),
            comments: approvalComment
          }
        : sub
    );
    
    setSubmissions(updatedSubmissions);
    localStorage.setItem('formSubmissions', JSON.stringify(updatedSubmissions));
    
    toast({
      title: "Form Rejected",
      description: `${submission.formTitle} has been rejected and sent back for revision.`,
      variant: "destructive"
    });
    
    setApprovalComment('');
    setShowDetailsModal(false);
  };

  const viewSubmissionDetails = (submission: FormSubmission) => {
    setSelectedForm(submission);
    setShowDetailsModal(true);
  };

  // Dynamic statistics
  const getStatistics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));

    const pendingCount = submissions.filter(sub => sub.status === 'pending').length;
    const highPriorityCount = submissions.filter(sub => 
      sub.status === 'pending' && sub.priority === 'high'
    ).length;
    
    const approvedTodayCount = submissions.filter(sub => 
      sub.status === 'approved' && 
      sub.reviewedAt && 
      new Date(sub.reviewedAt) >= today
    ).length;
    
    const totalThisWeekCount = submissions.filter(sub => 
      new Date(sub.submittedAt) >= weekStart
    ).length;

    return {
      pendingCount,
      highPriorityCount,
      approvedTodayCount,
      totalThisWeekCount
    };
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Form Approval</h1>
          <p className="text-muted-foreground">
            Review and approve submitted forms from your team
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
            <p className="text-2xl font-bold text-warning">{stats.pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {stats.pendingCount}
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-destructive mb-1">
            {stats.highPriorityCount}
          </div>
          <div className="text-sm text-muted-foreground">High Priority</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-success mb-1">{stats.approvedTodayCount}</div>
          <div className="text-sm text-muted-foreground">Approved Today</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-primary mb-1">{stats.totalThisWeekCount}</div>
          <div className="text-sm text-muted-foreground">Total This Week</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Forms List */}
      <div className="professional-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {filter === 'all' ? 'All Submissions' : 
           filter === 'pending' ? 'Pending Approvals' :
           filter === 'approved' ? 'Approved Forms' : 'Rejected Forms'}
        </h3>
        
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div 
              key={submission.id} 
              className="border border-border rounded-lg p-4 hover:bg-card-hover transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="text-primary" size={20} />
                    <h4 className="font-semibold text-foreground">{submission.formTitle}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(submission.priority || 'medium')}`}>
                      {(submission.priority || 'medium').toUpperCase()}
                    </span>
                    {submission.status !== 'pending' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        submission.status === 'approved' ? 'bg-success/10 text-success border-success/20' :
                        submission.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-muted/10 text-muted-foreground border-muted/20'
                      }`}>
                        {submission.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{submission.submittedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatTimeAgo(submission.submittedAt)}</span>
                    </div>
                    <div>
                      <span>Department: {submission.department}</span>
                    </div>
                    <div>
                      <span>Category: {submission.category || 'General'}</span>
                    </div>
                  </div>

                  {submission.reviewedBy && (
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Reviewed by:</span> {submission.reviewedBy}
                      {submission.reviewedAt && (
                        <span className="ml-2">on {formatTimeAgo(submission.reviewedAt)}</span>
                      )}
                    </div>
                  )}

                  {submission.comments && (
                    <div className="text-sm bg-muted/30 p-3 rounded-lg mb-4">
                      <span className="font-medium text-foreground">Comments:</span>
                      <p className="text-muted-foreground mt-1">{submission.comments}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center space-x-2">
                  {submission.status === 'pending' ? (
                    <>
                      <Clock className="text-warning" size={16} />
                      <span className="text-sm text-muted-foreground">
                        Waiting for approval since {formatTimeAgo(submission.submittedAt)}
                      </span>
                    </>
                  ) : (
                    <>
                      {submission.status === 'approved' ? (
                        <CheckCircle className="text-success" size={16} />
                      ) : (
                        <XCircle className="text-destructive" size={16} />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {submission.status === 'approved' ? 'Approved' : 'Rejected'} {formatTimeAgo(submission.reviewedAt || submission.submittedAt)}
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => viewSubmissionDetails(submission)}
                    className="btn-secondary text-sm py-2 px-4 flex items-center space-x-1"
                  >
                    <Eye size={14} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {filter === 'pending' ? 'All caught up!' : `No ${filter} forms found`}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? 'No forms are currently pending your approval.'
                : `No ${filter} forms to display.`}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{selectedForm.formTitle}</h3>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Submitted by:</span>
                    <p className="text-muted-foreground">{selectedForm.submittedBy}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Department:</span>
                    <p className="text-muted-foreground">{selectedForm.department}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Submitted:</span>
                    <p className="text-muted-foreground">{formatDate(selectedForm.submittedAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Priority:</span>
                    <p className="text-muted-foreground">{selectedForm.priority}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-foreground">Form Data:</span>
                  <div className="mt-2 bg-muted/30 p-4 rounded-lg">
                    {Object.entries(selectedForm.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                        <span className="text-sm font-medium text-foreground">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedForm.status === 'pending' && (user?.role === 'Admin' || user?.role === 'Supervisor' || user?.role === 'Auditor') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Comments (optional for approval, required for rejection):
                    </label>
                    <textarea
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Add your comments here..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleReject(selectedForm)}
                      className="btn-secondary flex-1 flex items-center justify-center space-x-2 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedForm)}
                      className="btn-success flex-1 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle size={16} />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormApproval;
