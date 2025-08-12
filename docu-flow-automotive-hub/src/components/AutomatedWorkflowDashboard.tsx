import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  FileText,
  Eye,
  UserCheck,
  Zap,
  Activity,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';
import api from '../lib/api';

interface WorkflowStep {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  timestamp?: string;
  user?: string;
  duration?: number;
}

interface AutomatedForm {
  _id: string;
  title: string;
  status: string;
  submissionId: string;
  department: string;
  submittedBy: {
    firstName: string;
    lastName: string;
  };
  workflowSteps: WorkflowStep[];
  progress: number;
  estimatedCompletion?: string;
}

const AutomatedWorkflowDashboard: React.FC = () => {
  const { user } = useAuth();
  const [automatedForms, setAutomatedForms] = useState<AutomatedForm[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [workflowStats, setWorkflowStats] = useState({
    totalForms: 0,
    inProgress: 0,
    completed: 0,
    averageTime: '0m',
    successRate: 100
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflowData();
    loadNotifications();
    
    // Auto-refresh every 5 seconds to show real-time progress
    const interval = setInterval(() => {
      if (isAutoMode) {
        loadWorkflowData();
        loadNotifications();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoMode]);

  const loadWorkflowData = async () => {
    try {
      const response = await api.get('/forms/submissions');
      
      if (response.data.success) {
        const submissions = response.data.data || [];
        
        // Transform submissions to automated forms with workflow steps
        const automated = submissions.map((sub: any) => ({
          _id: sub._id,
          title: sub.title,
          status: sub.status,
          submissionId: sub.submissionId,
          department: sub.department,
          submittedBy: sub.submittedBy,
          workflowSteps: generateWorkflowSteps(sub),
          progress: calculateProgress(sub.status),
          estimatedCompletion: calculateEstimatedCompletion(sub)
        }));

        setAutomatedForms(automated);
        calculateStats(automated);
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=10');
      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const generateWorkflowSteps = (submission: any): WorkflowStep[] => {
    const steps = [
      { name: 'Draft', status: 'completed' as const, timestamp: submission.createdAt },
      { name: 'Submitted', status: 'pending' as const },
      { name: 'Under Verification', status: 'pending' as const },
      { name: 'Verified', status: 'pending' as const },
      { name: 'Approved', status: 'pending' as const },
      { name: 'Completed', status: 'pending' as const }
    ];

    const statusIndex = steps.findIndex(step => step.name === submission.status);
    
    steps.forEach((step, index) => {
      if (index < statusIndex) {
        step.status = 'completed';
      } else if (index === statusIndex) {
        step.status = 'active';
      }
    });

    return steps;
  };

  const calculateProgress = (status: string): number => {
    const progressMap: { [key: string]: number } = {
      'Draft': 10,
      'Submitted': 25,
      'Under Verification': 50,
      'Verified': 75,
      'Approved': 90,
      'Completed': 100
    };
    return progressMap[status] || 0;
  };

  const calculateEstimatedCompletion = (submission: any): string => {
    const now = new Date();
    const estimatedMinutes = Math.random() * 30 + 5; // 5-35 minutes
    const completion = new Date(now.getTime() + estimatedMinutes * 60000);
    return completion.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateStats = (forms: AutomatedForm[]) => {
    const total = forms.length;
    const inProgress = forms.filter(f => !['Completed', 'Approved'].includes(f.status)).length;
    const completed = forms.filter(f => ['Completed', 'Approved'].includes(f.status)).length;
    
    setWorkflowStats({
      totalForms: total,
      inProgress,
      completed,
      averageTime: '12m',
      successRate: total > 0 ? Math.round((completed / total) * 100) : 100
    });
  };

  const getStepIcon = (stepName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Draft': <FileText size={16} />,
      'Submitted': <ArrowRight size={16} />,
      'Under Verification': <Eye size={16} />,
      'Verified': <CheckCircle size={16} />,
      'Approved': <UserCheck size={16} />,
      'Completed': <Zap size={16} />
    };
    return icons[stepName] || <Clock size={16} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-400 bg-gray-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const toggleAutoMode = () => {
    setIsAutoMode(!isAutoMode);
    toast({
      title: isAutoMode ? "Auto Mode Disabled" : "Auto Mode Enabled",
      description: isAutoMode 
        ? "Workflow automation paused" 
        : "Workflow automation resumed"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Automated Workflow Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time continuous form processing with automated approvals
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleAutoMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isAutoMode 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {isAutoMode ? <Play size={16} /> : <Pause size={16} />}
            <span>{isAutoMode ? 'Auto Mode ON' : 'Auto Mode OFF'}</span>
          </button>
          <button
            onClick={loadWorkflowData}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FileText className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-blue-800">Total Forms</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{workflowStats.totalForms}</div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Activity className="text-orange-600" size={20} />
            <span className="text-sm font-medium text-orange-800">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-orange-900 mt-1">{workflowStats.inProgress}</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm font-medium text-green-800">Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">{workflowStats.completed}</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="text-purple-600" size={20} />
            <span className="text-sm font-medium text-purple-800">Avg Time</span>
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{workflowStats.averageTime}</div>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Zap className="text-indigo-600" size={20} />
            <span className="text-sm font-medium text-indigo-800">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">{workflowStats.successRate}%</div>
        </div>
      </div>

      {/* Active Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Progress */}
        <div className="professional-card">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="text-primary" size={20} />
            <h3 className="font-semibold text-foreground">Active Workflows</h3>
            {isAutoMode && (
              <div className="flex items-center space-x-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">LIVE</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {automatedForms.slice(0, 5).map((form) => (
              <div key={form._id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{form.title}</h4>
                    <p className="text-xs text-muted-foreground">{form.submissionId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{form.progress}%</div>
                    <div className="text-xs text-muted-foreground">ETA: {form.estimatedCompletion}</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${form.progress}%` }}
                  ></div>
                </div>
                
                {/* Workflow Steps */}
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {form.workflowSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-1 min-w-0">
                      <div className={`p-1 rounded-full ${getStatusColor(step.status)}`}>
                        {getStepIcon(step.name)}
                      </div>
                      {index < form.workflowSteps.length - 1 && (
                        <ArrowRight size={12} className="text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="professional-card">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="text-primary" size={20} />
            <h3 className="font-semibold text-foreground">Workflow Notifications</h3>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No recent notifications</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="p-1 bg-primary/10 rounded-full">
                    <Bell size={12} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">{notification.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Workflow Explanation */}
      <div className="professional-card">
        <h3 className="font-semibold text-foreground mb-4">🚀 Automated Workflow Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[
            { step: '1. Create', desc: 'Form created by user', icon: <FileText size={16} /> },
            { step: '2. Submit', desc: 'Auto-submitted for review', icon: <ArrowRight size={16} /> },
            { step: '3. Verify', desc: 'Auto-assigned to supervisor', icon: <Eye size={16} /> },
            { step: '4. Approve', desc: 'Auto-routed to approver', icon: <UserCheck size={16} /> },
            { step: '5. Audit', desc: 'Auto-generates audit log', icon: <CheckCircle size={16} /> },
            { step: '6. Complete', desc: 'Workflow finished', icon: <Zap size={16} /> }
          ].map((item, index) => (
            <div key={index} className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-center mb-2 text-primary">
                {item.icon}
              </div>
              <div className="text-sm font-medium text-foreground">{item.step}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutomatedWorkflowDashboard;
