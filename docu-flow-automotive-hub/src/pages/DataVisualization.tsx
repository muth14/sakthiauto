import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Settings,
  Users,
  Clock,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Sample comprehensive data that would replace Excel sheets
const jobRunRecords = [
  {
    id: 'JOB-001',
    date: '2024-01-15',
    shift: 'Morning',
    machine: 'Machine-A1',
    operator: 'John Doe',
    jobType: 'Assembly',
    startTime: '06:00',
    endTime: '14:00',
    duration: 8,
    unitsProduced: 245,
    efficiency: 94.2,
    quality: 'Pass',
    downtime: 15,
    notes: 'Normal operation'
  },
  {
    id: 'JOB-002',
    date: '2024-01-15',
    shift: 'Afternoon',
    machine: 'Machine-B2',
    operator: 'Sarah Wilson',
    jobType: 'Quality Check',
    startTime: '14:00',
    endTime: '22:00',
    duration: 8,
    unitsProduced: 189,
    efficiency: 87.5,
    quality: 'Pass',
    downtime: 25,
    notes: 'Minor calibration needed'
  },
  {
    id: 'JOB-003',
    date: '2024-01-15',
    shift: 'Night',
    machine: 'Machine-C3',
    operator: 'Mike Johnson',
    jobType: 'Maintenance',
    startTime: '22:00',
    endTime: '06:00',
    duration: 8,
    unitsProduced: 0,
    efficiency: 0,
    quality: 'N/A',
    downtime: 120,
    notes: 'Scheduled maintenance'
  },
  // Add more sample data...
];

const monthlyShiftSummary = [
  { month: 'January', morningShifts: 31, afternoonShifts: 31, nightShifts: 31, totalJobs: 245 },
  { month: 'February', morningShifts: 28, afternoonShifts: 28, nightShifts: 28, totalJobs: 221 },
  { month: 'March', morningShifts: 31, afternoonShifts: 31, nightShifts: 31, totalJobs: 267 },
];

const machineUtilization = [
  { machine: 'Machine-A1', totalHours: 744, runningHours: 698, utilization: 93.8, jobs: 89 },
  { machine: 'Machine-B2', totalHours: 744, runningHours: 647, utilization: 87.0, jobs: 76 },
  { machine: 'Machine-C3', totalHours: 744, runningHours: 677, utilization: 91.0, jobs: 82 },
];

const DataVisualization: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [machineFilter, setMachineFilter] = useState('all');

  const filteredJobRecords = jobRunRecords.filter(job => {
    const matchesSearch = job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.machine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || job.date === dateFilter;
    const matchesShift = shiftFilter === 'all' || job.shift === shiftFilter;
    const matchesMachine = machineFilter === 'all' || job.machine === machineFilter;
    
    return matchesSearch && matchesDate && matchesShift && matchesMachine;
  });

  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Visualization</h1>
          <p className="text-muted-foreground mt-2">
            Complete replacement for Excel-based manual records with real-time filtering
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportToCSV(filteredJobRecords, 'job-records')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportToCSV(filteredJobRecords, 'job-records-excel')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Job Records
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shifts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly Shifts
          </button>
          <button
            onClick={() => setActiveTab('machines')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'machines'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Machine Utilization
          </button>
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Shift</label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Shifts</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Night">Night</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Machine</label>
            <select
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Machines</option>
              <option value="Machine-A1">Machine-A1</option>
              <option value="Machine-B2">Machine-B2</option>
              <option value="Machine-C3">Machine-C3</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setShiftFilter('all');
                setMachineFilter('all');
              }}
              className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'jobs' && (
        <div className="professional-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Job Run Records ({filteredJobRecords.length} records)
            </h3>
            <div className="text-sm text-muted-foreground">
              Replacing manual Excel tracking
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Job ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Shift</th>
                  <th className="text-left py-3 px-4 font-semibold">Machine</th>
                  <th className="text-left py-3 px-4 font-semibold">Operator</th>
                  <th className="text-left py-3 px-4 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold">Units</th>
                  <th className="text-left py-3 px-4 font-semibold">Efficiency</th>
                  <th className="text-left py-3 px-4 font-semibold">Quality</th>
                  <th className="text-left py-3 px-4 font-semibold">Downtime</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobRecords.map((job) => (
                  <tr key={job.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium text-primary">{job.id}</td>
                    <td className="py-3 px-4">{job.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        job.shift === 'Morning' ? 'bg-green-100 text-green-800' :
                        job.shift === 'Afternoon' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {job.shift}
                      </span>
                    </td>
                    <td className="py-3 px-4">{job.machine}</td>
                    <td className="py-3 px-4">{job.operator}</td>
                    <td className="py-3 px-4">{job.duration}h</td>
                    <td className="py-3 px-4">{job.unitsProduced}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        job.efficiency > 90 ? 'bg-green-100 text-green-800' :
                        job.efficiency > 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.efficiency}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        job.quality === 'Pass' ? 'bg-green-100 text-green-800' :
                        job.quality === 'Fail' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.quality}
                      </span>
                    </td>
                    <td className="py-3 px-4">{job.downtime}min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="professional-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Monthly Shift Summary</h3>
            <div className="text-sm text-muted-foreground">
              How shifts have performed each month
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Month</th>
                  <th className="text-left py-3 px-4 font-semibold">Morning Shifts</th>
                  <th className="text-left py-3 px-4 font-semibold">Afternoon Shifts</th>
                  <th className="text-left py-3 px-4 font-semibold">Night Shifts</th>
                  <th className="text-left py-3 px-4 font-semibold">Total Jobs</th>
                  <th className="text-left py-3 px-4 font-semibold">Avg Jobs/Shift</th>
                </tr>
              </thead>
              <tbody>
                {monthlyShiftSummary.map((month, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{month.month}</td>
                    <td className="py-3 px-4">{month.morningShifts}</td>
                    <td className="py-3 px-4">{month.afternoonShifts}</td>
                    <td className="py-3 px-4">{month.nightShifts}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{month.totalJobs}</td>
                    <td className="py-3 px-4">
                      {Math.round(month.totalJobs / (month.morningShifts + month.afternoonShifts + month.nightShifts))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'machines' && (
        <div className="professional-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Machine Utilization & Changes</h3>
            <div className="text-sm text-muted-foreground">
              Monthly machine performance tracking
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Machine</th>
                  <th className="text-left py-3 px-4 font-semibold">Total Hours</th>
                  <th className="text-left py-3 px-4 font-semibold">Running Hours</th>
                  <th className="text-left py-3 px-4 font-semibold">Utilization</th>
                  <th className="text-left py-3 px-4 font-semibold">Jobs Completed</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {machineUtilization.map((machine, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{machine.machine}</td>
                    <td className="py-3 px-4">{machine.totalHours}h</td>
                    <td className="py-3 px-4">{machine.runningHours}h</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${machine.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{machine.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">{machine.jobs}</td>
                    <td className="py-3 px-4">
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
      )}
    </div>
  );
};

export default DataVisualization;
