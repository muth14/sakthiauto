import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  Users,
  Settings,
  FileText,
  Clock,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Sample data - In real implementation, this would come from API
const jobRunData = [
  { month: 'Jan', jobs: 245, shifts: 93, machines: 12 },
  { month: 'Feb', jobs: 289, shifts: 84, machines: 12 },
  { month: 'Mar', jobs: 312, shifts: 96, machines: 13 },
  { month: 'Apr', jobs: 278, shifts: 90, machines: 13 },
  { month: 'May', jobs: 334, shifts: 99, machines: 14 },
  { month: 'Jun', jobs: 356, shifts: 102, machines: 14 },
];

const shiftData = [
  { shift: 'Morning', count: 156, efficiency: 94 },
  { shift: 'Afternoon', count: 142, efficiency: 89 },
  { shift: 'Night', count: 134, efficiency: 87 },
];

const machinePerformance = [
  { machine: 'Machine-A1', utilization: 94, downtime: 6, jobs: 89 },
  { machine: 'Machine-B2', utilization: 87, downtime: 13, jobs: 76 },
  { machine: 'Machine-C3', utilization: 91, downtime: 9, jobs: 82 },
  { machine: 'Machine-D4', utilization: 88, downtime: 12, jobs: 78 },
  { machine: 'Machine-E5', utilization: 96, downtime: 4, jobs: 94 },
];

const formSubmissionTrends = [
  { date: '2024-01-01', submissions: 23, approved: 18, rejected: 2, pending: 3 },
  { date: '2024-01-02', submissions: 31, approved: 24, rejected: 3, pending: 4 },
  { date: '2024-01-03', submissions: 28, approved: 22, rejected: 1, pending: 5 },
  { date: '2024-01-04', submissions: 35, approved: 28, rejected: 4, pending: 3 },
  { date: '2024-01-05', submissions: 42, approved: 33, rejected: 2, pending: 7 },
  { date: '2024-01-06', submissions: 38, approved: 31, rejected: 3, pending: 4 },
  { date: '2024-01-07', submissions: 29, approved: 24, rejected: 1, pending: 4 },
];

const departmentData = [
  { name: 'Production', value: 35, color: '#8884d8' },
  { name: 'Quality Control', value: 28, color: '#82ca9d' },
  { name: 'Assembly', value: 22, color: '#ffc658' },
  { name: 'Maintenance', value: 15, color: '#ff7300' },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const exportData = () => {
    // Export functionality
    console.log('Exporting data...');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time insights replacing Excel-based reporting system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Departments</option>
            <option value="production">Production</option>
            <option value="quality">Quality Control</option>
            <option value="assembly">Assembly</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="professional-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs This Month</p>
              <p className="text-3xl font-bold text-foreground">1,814</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="professional-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Shifts</p>
              <p className="text-3xl font-bold text-foreground">564</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.3% efficiency
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="professional-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Machine Utilization</p>
              <p className="text-3xl font-bold text-foreground">91.2%</p>
              <p className="text-sm text-yellow-600 flex items-center mt-1">
                <Settings className="w-4 h-4 mr-1" />
                14 machines active
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Settings className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="professional-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Form Submissions</p>
              <p className="text-3xl font-bold text-foreground">2,847</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <FileText className="w-4 h-4 mr-1" />
                94.2% approval rate
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Runs Monthly Trend */}
        <div className="professional-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Monthly Job Runs & Shifts</h3>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobRunData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="jobs" fill="#8884d8" name="Jobs" />
              <Bar dataKey="shifts" fill="#82ca9d" name="Shifts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="professional-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Department Activity</h3>
            <PieChartIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Submission Trends */}
        <div className="professional-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Form Submission Trends</h3>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formSubmissionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <Legend />
              <Area type="monotone" dataKey="approved" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Approved" />
              <Area type="monotone" dataKey="pending" stackId="1" stroke="#ffc658" fill="#ffc658" name="Pending" />
              <Area type="monotone" dataKey="rejected" stackId="1" stroke="#ff7300" fill="#ff7300" name="Rejected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Shift Performance */}
        <div className="professional-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Shift Performance</h3>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shiftData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="shift" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Shift Count" />
              <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Machine Performance Table */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Machine Performance Overview</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Real-time data</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Machine</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Utilization</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Downtime</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Jobs Completed</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {machinePerformance.map((machine, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50">
                  <td className="py-4 px-4 font-medium text-foreground">{machine.machine}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${machine.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{machine.utilization}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      machine.downtime < 8 ? 'bg-green-100 text-green-800' :
                      machine.downtime < 12 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {machine.downtime}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-foreground">{machine.jobs}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      machine.utilization > 90 ? 'bg-green-100 text-green-800' :
                      machine.utilization > 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {machine.utilization > 90 ? 'Excellent' :
                       machine.utilization > 80 ? 'Good' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
