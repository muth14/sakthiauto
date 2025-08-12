import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, User, Wrench, AlertTriangle, Play, CheckCircle, XCircle, Eye, Plus, Download, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';
import pdfService from '../lib/services/pdfService';

interface Job {
  id: string;
  title: string;
  operator: string;
  machine: string;
  department: string;
  startTime: string;
  endTime?: string;
  status: 'in-progress' | 'completed' | 'verified' | 'issue' | 'pending';
  checklist: ChecklistItem[];
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  createdBy: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  required: boolean;
}

const JobVerification: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'verified' | 'issue' | 'pending'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Get available operators from system users
  const getSystemOperators = () => {
    // Try to get real users from localStorage (if backend is connected)
    const storedUsers = localStorage.getItem('systemUsers');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      return users.filter((u: any) => ['Operator', 'Line Incharge', 'Supervisor'].includes(u.role));
    }

    // Fallback to known system users
    return [
      { firstName: 'John', lastName: 'Supervisor', role: 'Supervisor', department: 'Production' },
      { firstName: 'Sarah', lastName: 'Operator', role: 'Operator', department: 'Quality Control' },
      { firstName: 'Mike', lastName: 'Line Incharge', role: 'Line Incharge', department: 'Assembly' },
      { firstName: 'David', lastName: 'Auditor', role: 'Auditor', department: 'Compliance' },
      { firstName: 'Lisa', lastName: 'Safety Officer', role: 'Operator', department: 'Safety' }
    ];
  };

  // Generate sample jobs using real system users
  const generateSampleJobs = (): Job[] => {
    const now = new Date();
    const today = now.toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const operators = getSystemOperators();
    const johnSupervisor = operators.find(op => op.firstName === 'John') || operators[0];
    const sarahOperator = operators.find(op => op.firstName === 'Sarah') || operators[1];
    const mikeIncharge = operators.find(op => op.firstName === 'Mike') || operators[2];
    const lisaOfficer = operators.find(op => op.firstName === 'Lisa') || operators[3];

    return [
      {
        id: 'job_1',
        title: 'Assembly Line Setup - Station A',
        operator: `${johnSupervisor.firstName} ${johnSupervisor.lastName}`,
        machine: 'Assembly Line A1',
        department: johnSupervisor.department,
        startTime: yesterday,
        endTime: new Date(new Date(yesterday).getTime() + 2.5 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        priority: 'high',
        estimatedDuration: 150,
        actualDuration: 150,
        createdBy: `${mikeIncharge.firstName} ${mikeIncharge.lastName}`,
        checklist: [
          { id: '1', task: 'Machine calibration completed', completed: true, required: true, verifiedBy: `${johnSupervisor.firstName} ${johnSupervisor.lastName}`, verifiedAt: yesterday },
          { id: '2', task: 'Safety equipment verified', completed: true, required: true, verifiedBy: `${johnSupervisor.firstName} ${johnSupervisor.lastName}`, verifiedAt: yesterday },
          { id: '3', task: 'Quality standards checked', completed: true, required: true, verifiedBy: `${johnSupervisor.firstName} ${johnSupervisor.lastName}`, verifiedAt: yesterday },
          { id: '4', task: 'Documentation updated', completed: false, required: false }
        ]
      },
      {
        id: 'job_2',
        title: 'Quality Control Check - Batch 456',
        operator: `${sarahOperator.firstName} ${sarahOperator.lastName}`,
        machine: 'QC Station 2',
        department: sarahOperator.department,
        startTime: today,
        status: 'in-progress',
        priority: 'high',
        estimatedDuration: 120,
        createdBy: 'QC Manager',
        checklist: [
          { id: '1', task: 'Visual inspection completed', completed: true, required: true, verifiedBy: `${sarahOperator.firstName} ${sarahOperator.lastName}`, verifiedAt: today },
          { id: '2', task: 'Dimensional measurements taken', completed: true, required: true, verifiedBy: `${sarahOperator.firstName} ${sarahOperator.lastName}`, verifiedAt: today },
          { id: '3', task: 'Material testing completed', completed: false, required: true },
          { id: '4', task: 'Documentation signed off', completed: false, required: true }
        ]
      },
      {
        id: 'job_3',
        title: 'Machine Maintenance - CNC Mill 3',
        operator: `${mikeIncharge.firstName} Technician`,
        machine: 'CNC Mill 3',
        department: 'Maintenance',
        startTime: twoDaysAgo,
        endTime: new Date(new Date(twoDaysAgo).getTime() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'verified',
        priority: 'medium',
        estimatedDuration: 240,
        actualDuration: 240,
        createdBy: 'Maintenance Supervisor',
        verifiedBy: user?.name || `${user?.firstName} ${user?.lastName}`,
        verifiedAt: yesterday,
        notes: 'All maintenance tasks completed successfully. Machine ready for production.',
        checklist: [
          { id: '1', task: 'Lubrication system checked', completed: true, required: true, verifiedBy: `${mikeIncharge.firstName} Technician`, verifiedAt: twoDaysAgo },
          { id: '2', task: 'Tool wear inspection', completed: true, required: true, verifiedBy: `${mikeIncharge.firstName} Technician`, verifiedAt: twoDaysAgo },
          { id: '3', task: 'Calibration verification', completed: true, required: true, verifiedBy: `${mikeIncharge.firstName} Technician`, verifiedAt: twoDaysAgo },
          { id: '4', task: 'Safety systems test', completed: true, required: true, verifiedBy: `${mikeIncharge.firstName} Technician`, verifiedAt: twoDaysAgo }
        ]
      },
      {
        id: 'job_4',
        title: 'Safety Equipment Inspection',
        operator: `${lisaOfficer.firstName} ${lisaOfficer.lastName}`,
        machine: 'Production Floor A',
        department: 'Safety',
        startTime: today,
        status: 'pending',
        priority: 'high',
        estimatedDuration: 90,
        createdBy: 'Safety Manager',
        checklist: [
          { id: '1', task: 'Fire extinguisher check', completed: false, required: true },
          { id: '2', task: 'Emergency exit verification', completed: false, required: true },
          { id: '3', task: 'First aid kit inspection', completed: false, required: true },
          { id: '4', task: 'PPE availability check', completed: false, required: true }
        ]
      }
    ];
  };

  // Load jobs from localStorage
  useEffect(() => {
    const loadJobs = () => {
      try {
        let allJobs = JSON.parse(localStorage.getItem('jobVerifications') || '[]');
        
        // Add sample jobs if none exist
        if (allJobs.length === 0) {
          allJobs = generateSampleJobs();
          localStorage.setItem('jobVerifications', JSON.stringify(allJobs));
        }
        
        // Filter jobs based on user role and department
        let filteredJobs = allJobs;
        
        if (user?.role === 'Operator') {
          // Operators see only their own jobs
          filteredJobs = allJobs.filter((job: Job) => 
            job.operator === `${user.firstName} ${user.lastName}`
          );
        } else if (user?.role === 'Supervisor' || user?.role === 'Line Incharge') {
          // Supervisors see jobs from their department
          filteredJobs = allJobs.filter((job: Job) => 
            job.department === user.department
          );
        }
        // Admins and Auditors see all jobs
        
        console.log('Loaded jobs:', filteredJobs.length, filteredJobs);
        setJobs(filteredJobs);
        
      } catch (error) {
        console.error('Error loading jobs:', error);
        const sampleJobs = generateSampleJobs();
        console.log('Generated sample jobs:', sampleJobs.length, sampleJobs);
        setJobs(sampleJobs);
        localStorage.setItem('jobVerifications', JSON.stringify(sampleJobs));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadJobs();
    }
  }, [user]);

  // Job management functions
  const updateChecklistItem = (jobId: string, itemId: string, completed: boolean, notes?: string) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId 
        ? {
            ...job,
            checklist: job.checklist.map(item =>
              item.id === itemId 
                ? { 
                    ...item, 
                    completed, 
                    verifiedBy: completed ? `${user?.firstName} ${user?.lastName}` : undefined,
                    verifiedAt: completed ? new Date().toISOString() : undefined,
                    notes 
                  }
                : item
            )
          }
        : job
    );
    
    setJobs(updatedJobs);
    localStorage.setItem('jobVerifications', JSON.stringify(updatedJobs));

    toast({
      title: completed ? "Task Completed" : "Task Updated",
      description: `Checklist item has been ${completed ? 'completed' : 'updated'}.`
    });
  };

  const startJob = (jobId: string) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId 
        ? { 
            ...job, 
            status: 'in-progress' as const,
            startTime: new Date().toISOString()
          }
        : job
    );
    
    setJobs(updatedJobs);
    localStorage.setItem('jobVerifications', JSON.stringify(updatedJobs));

    toast({
      title: "Job Started",
      description: "Job has been started successfully."
    });
  };

  const completeJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const requiredTasks = job.checklist.filter(item => item.required);
    const completedRequiredTasks = requiredTasks.filter(item => item.completed);

    if (completedRequiredTasks.length < requiredTasks.length) {
      toast({
        title: "Cannot Complete Job",
        description: "Please complete all required tasks before marking job as complete.",
        variant: "destructive"
      });
      return;
    }

    const startTime = new Date(job.startTime);
    const endTime = new Date();
    const actualDuration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    const updatedJobs = jobs.map(j => 
      j.id === jobId 
        ? { 
            ...j, 
            status: 'completed' as const,
            endTime: endTime.toISOString(),
            actualDuration
          }
        : j
    );
    
    setJobs(updatedJobs);
    localStorage.setItem('jobVerifications', JSON.stringify(updatedJobs));

    toast({
      title: "Job Completed",
      description: "Job has been marked as completed."
    });
  };

  const verifyJob = (jobId: string) => {
    if (!verificationNotes.trim()) {
      toast({
        title: "Verification Notes Required",
        description: "Please provide verification notes.",
        variant: "destructive"
      });
      return;
    }

    const updatedJobs = jobs.map(job => 
      job.id === jobId 
        ? { 
            ...job, 
            status: 'verified' as const,
            verifiedBy: `${user?.firstName} ${user?.lastName}`,
            verifiedAt: new Date().toISOString(),
            notes: verificationNotes
          }
        : job
    );
    
    setJobs(updatedJobs);
    localStorage.setItem('jobVerifications', JSON.stringify(updatedJobs));

    toast({
      title: "Job Verified",
      description: "Job has been successfully verified."
    });

    setVerificationNotes('');
    setShowDetailsModal(false);
  };

  const reportIssue = (jobId: string) => {
    if (!verificationNotes.trim()) {
      toast({
        title: "Issue Description Required",
        description: "Please describe the issue.",
        variant: "destructive"
      });
      return;
    }

    const updatedJobs = jobs.map(job => 
      job.id === jobId 
        ? { 
            ...job, 
            status: 'issue' as const,
            verifiedBy: `${user?.firstName} ${user?.lastName}`,
            verifiedAt: new Date().toISOString(),
            notes: verificationNotes
          }
        : job
    );
    
    setJobs(updatedJobs);
    localStorage.setItem('jobVerifications', JSON.stringify(updatedJobs));

    toast({
      title: "Issue Reported",
      description: "Issue has been reported for this job.",
      variant: "destructive"
    });

    setVerificationNotes('');
    setShowDetailsModal(false);
  };

  const viewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  // Dynamic statistics
  const getStatistics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const inProgressCount = jobs.filter(job => job.status === 'in-progress').length;
    const completedTodayCount = jobs.filter(job => 
      job.status === 'completed' && 
      job.endTime && 
      new Date(job.endTime) >= today
    ).length;
    
    const pendingVerificationCount = jobs.filter(job => job.status === 'completed').length;
    const totalThisWeekCount = jobs.length;

    return {
      inProgressCount,
      completedTodayCount,
      pendingVerificationCount,
      totalThisWeekCount
    };
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  console.log('Filter state:', filter);
  console.log('All jobs:', jobs.map(j => ({ id: j.id, title: j.title, status: j.status })));
  console.log('Filtered jobs:', filteredJobs.map(j => ({ id: j.id, title: j.title, status: j.status })));

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'verified':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'in-progress':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'issue':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'pending':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCompletionPercentage = (checklist: ChecklistItem[]) => {
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-success" size={16} />;
      case 'verified':
        return <CheckSquare className="text-primary" size={16} />;
      case 'in-progress':
        return <Clock className="text-warning" size={16} />;
      case 'issue':
        return <AlertTriangle className="text-destructive" size={16} />;
      default:
        return <Clock className="text-muted-foreground" size={16} />;
    }
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
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
          <h1 className="text-2xl font-bold text-foreground">Job Verification</h1>
          <p className="text-muted-foreground">
            Verify completed jobs and update checklist items
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active Jobs</p>
            <p className="text-2xl font-bold text-primary">{jobs.length}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Stats - Clickable Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('pending')}
          className={`professional-card text-center transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${
            filter === 'pending' ? 'ring-2 ring-orange-500/50 bg-orange-50' : ''
          }`}
        >
          <div className="text-2xl font-bold text-orange-500 mb-1">
            {jobs.filter(job => job.status === 'pending').length}
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`professional-card text-center transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${
            filter === 'in-progress' ? 'ring-2 ring-warning/50 bg-warning/5' : ''
          }`}
        >
          <div className="text-2xl font-bold text-warning mb-1">
            {stats.inProgressCount}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`professional-card text-center transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${
            filter === 'completed' ? 'ring-2 ring-success/50 bg-success/5' : ''
          }`}
        >
          <div className="text-2xl font-bold text-success mb-1">
            {stats.completedTodayCount}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`professional-card text-center transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${
            filter === 'verified' ? 'ring-2 ring-primary/50 bg-primary/5' : ''
          }`}
        >
          <div className="text-2xl font-bold text-primary mb-1">
            {stats.pendingVerificationCount}
          </div>
          <div className="text-sm text-muted-foreground">Verified</div>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-border rounded-lg p-1 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {(['all', 'pending', 'in-progress', 'completed', 'verified', 'issue'] as const).map((status) => {
            const count = status === 'all' ? jobs.length : jobs.filter(job => job.status === status).length;
            return (
              <button
                key={status}
                onClick={() => {
                  console.log('Filter clicked:', status);
                  setFilter(status);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  filter === status
                    ? 'bg-primary text-primary-foreground shadow-md transform scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm'
                }`}
              >
                <span>
                  {status === 'all' ? 'All Jobs' :
                   status === 'in-progress' ? 'In Progress' :
                   status === 'pending' ? 'Pending' :
                   status === 'completed' ? 'Completed' :
                   status === 'verified' ? 'Verified' :
                   status === 'issue' ? 'Issues' : status}
                </span>
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === status
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {filter === 'all' ? 'All Jobs' :
             filter === 'in-progress' ? 'In Progress Jobs' :
             filter === 'pending' ? 'Pending Jobs' :
             filter === 'completed' ? 'Completed Jobs' :
             filter === 'verified' ? 'Verified Jobs' :
             filter === 'issue' ? 'Jobs with Issues' : 'Jobs'}
          </h3>
          <div className="text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        </div>

        {filteredJobs.map((job) => (
          <div key={job.id} className="professional-card">
            {/* Job Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Wrench className="text-primary" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{job.operator}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Wrench size={14} />
                      <span>{job.machine}</span>
                    </div>
                    <div>
                      <span>Department: {job.department}</span>
                    </div>
                    <div>
                      <span>Started: {formatTimeAgo(job.startTime)}</span>
                    </div>
                    {job.endTime && (
                      <div>
                        <span>Duration: {formatDuration(job.actualDuration || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(job.priority)}`}>
                  {job.priority.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)} flex items-center space-x-1`}>
                  {getStatusIcon(job.status)}
                  <span>{job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('-', ' ')}</span>
                </span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Verification Checklist</h4>
                <div className="text-sm text-muted-foreground">
                  {job.checklist.filter(item => item.completed).length} / {job.checklist.length} completed
                </div>
              </div>
              <div className="space-y-2">
                {job.checklist.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => updateChecklistItem(job.id, item.id, e.target.checked)}
                      className="mt-1"
                      disabled={job.status === 'verified' || job.status === 'issue'}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className={`font-medium ${item.completed ? 'text-success' : 'text-foreground'}`}>
                          {item.task}
                        </p>
                        {item.required && (
                          <span className="text-xs text-destructive">*Required</span>
                        )}
                      </div>
                      {item.verifiedBy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Verified by {item.verifiedBy} {item.verifiedAt && `on ${formatTimeAgo(item.verifiedAt)}`}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    {item.completed && (
                      <CheckSquare className="text-success" size={16} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    Progress: {getCompletionPercentage(job.checklist)}%
                  </div>
                  {job.estimatedDuration && (
                    <div className="text-sm text-muted-foreground">
                      Est. Duration: {formatDuration(job.estimatedDuration)}
                    </div>
                  )}
                  {job.verifiedBy && (
                    <div className="text-sm text-muted-foreground">
                      Verified by: {job.verifiedBy}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => viewJobDetails(job)}
                    className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1"
                  >
                    <Eye size={14} />
                    <span>View Details</span>
                  </button>

                  {job.status === 'pending' && (user?.role === 'Operator' || user?.role === 'Admin') && (
                    <button
                      onClick={() => startJob(job.id)}
                      className="btn-primary text-sm py-1 px-3 flex items-center space-x-1"
                    >
                      <Play size={14} />
                      <span>Start Job</span>
                    </button>
                  )}

                  {job.status === 'in-progress' && (user?.role === 'Operator' || user?.role === 'Admin') && (
                    <button
                      onClick={() => completeJob(job.id)}
                      className="btn-success text-sm py-1 px-3 flex items-center space-x-1"
                    >
                      <CheckCircle size={14} />
                      <span>Complete</span>
                    </button>
                  )}

                  {job.status === 'completed' && (user?.role === 'Supervisor' || user?.role === 'Admin' || user?.role === 'Auditor') && (
                    <button
                      onClick={() => viewJobDetails(job)}
                      className="btn-primary text-sm py-1 px-3 flex items-center space-x-1"
                    >
                      <CheckCircle size={14} />
                      <span>Verify</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {filter === 'all' ? 'No jobs found' : `No ${filter} jobs found`}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'Jobs will appear here when created.'
                : `No jobs with ${filter} status to display.`}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{selectedJob.title}</h3>
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
                    <span className="font-medium text-foreground">Operator:</span>
                    <p className="text-muted-foreground">{selectedJob.operator}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Machine:</span>
                    <p className="text-muted-foreground">{selectedJob.machine}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Department:</span>
                    <p className="text-muted-foreground">{selectedJob.department}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Priority:</span>
                    <p className="text-muted-foreground">{selectedJob.priority}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-foreground">Checklist Progress:</span>
                  <div className="mt-2 space-y-2">
                    {selectedJob.checklist.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2 text-sm">
                        {item.completed ? (
                          <CheckCircle className="text-success" size={16} />
                        ) : (
                          <XCircle className="text-muted-foreground" size={16} />
                        )}
                        <span className={item.completed ? 'text-success' : 'text-muted-foreground'}>
                          {item.task}
                        </span>
                        {item.required && <span className="text-destructive">*</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedJob.notes && (
                  <div>
                    <span className="font-medium text-foreground">Notes:</span>
                    <p className="text-muted-foreground mt-1">{selectedJob.notes}</p>
                  </div>
                )}
              </div>

              {selectedJob.status === 'completed' && (user?.role === 'Supervisor' || user?.role === 'Admin' || user?.role === 'Auditor') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Verification Notes:
                    </label>
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Add verification notes..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => reportIssue(selectedJob.id)}
                      className="btn-secondary flex-1 flex items-center justify-center space-x-2 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <XCircle size={16} />
                      <span>Report Issue</span>
                    </button>
                    <button
                      onClick={() => verifyJob(selectedJob.id)}
                      className="btn-success flex-1 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle size={16} />
                      <span>Verify Job</span>
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

export default JobVerification;
