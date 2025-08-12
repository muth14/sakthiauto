import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Users, 
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="gradient-primary rounded-xl p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-primary-foreground/80">
              Here's what's happening in your {user?.department} department today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary-foreground/80 text-sm">Role</p>
            <p className="text-xl font-semibold">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Quick Access to Automated Workflow */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">🚀 Automated Workflow System</h3>
            <p className="text-blue-100 text-sm">View real-time form processing and continuous workflow</p>
          </div>
          <button
            onClick={() => navigate('/form-submissions')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Workflow →
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="professional-card">
          <div className="flex items-center space-x-3">
            <FileText className="text-primary" size={24} />
            <div>
              <p className="text-sm text-muted-foreground">Total Forms</p>
              <p className="text-2xl font-bold text-foreground">24</p>
            </div>
          </div>
        </div>
        
        <div className="professional-card">
          <div className="flex items-center space-x-3">
            <Clock className="text-orange-500" size={24} />
            <div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
          </div>
        </div>
        
        <div className="professional-card">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">16</p>
            </div>
          </div>
        </div>
        
        <div className="professional-card">
          <div className="flex items-center space-x-3">
            <Users className="text-blue-500" size={24} />
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="professional-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/forms')}
            className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <FileText className="text-primary" size={20} />
            <div className="text-left">
              <p className="font-medium text-foreground">Create Form</p>
              <p className="text-sm text-muted-foreground">Start a new form submission</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/form-submissions')}
            className="flex items-center space-x-3 p-4 bg-orange-500/5 hover:bg-orange-500/10 rounded-lg transition-colors"
          >
            <BarChart3 className="text-orange-500" size={20} />
            <div className="text-left">
              <p className="font-medium text-foreground">Manage Workflow</p>
              <p className="text-sm text-muted-foreground">View and manage form approvals</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/pdf-versions')}
            className="flex items-center space-x-3 p-4 bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors"
          >
            <CheckCircle className="text-green-500" size={20} />
            <div className="text-left">
              <p className="font-medium text-foreground">View PDFs</p>
              <p className="text-sm text-muted-foreground">Download completed forms</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="professional-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="text-green-500" size={16} />
              <div>
                <p className="text-sm font-medium text-foreground">Form Approved</p>
                <p className="text-xs text-muted-foreground">Quality Check #QC-001 approved</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Clock className="text-orange-500" size={16} />
              <div>
                <p className="text-sm font-medium text-foreground">Pending Review</p>
                <p className="text-xs text-muted-foreground">Safety Inspection #SI-002 awaiting approval</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <FileText className="text-blue-500" size={16} />
              <div>
                <p className="text-sm font-medium text-foreground">New Submission</p>
                <p className="text-xs text-muted-foreground">Maintenance Report #MR-003 submitted</p>
              </div>
            </div>
          </div>
        </div>

        <div className="professional-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-foreground">Automated Workflow</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-foreground">Database</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-foreground">PDF Generation</span>
              </div>
              <span className="text-xs text-blue-600 font-medium">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-foreground">Audit Logging</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="professional-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="text-green-500" size={20} />
              <span className="text-sm font-medium text-foreground">Approval Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <div className="text-xs text-muted-foreground">+2% from last month</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-foreground">Avg Processing Time</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">2.3h</div>
            <div className="text-xs text-muted-foreground">-15min from last month</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertCircle className="text-orange-500" size={20} />
              <span className="text-sm font-medium text-foreground">Error Rate</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">0.8%</div>
            <div className="text-xs text-muted-foreground">-0.2% from last month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
