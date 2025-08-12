import React, { useState } from 'react';
import { Shield, User, Calendar, FileText, Search, Filter, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  targetUser?: string;
  targetForm?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  category: 'authentication' | 'form' | 'user_management' | 'system' | 'approval';
}

const AuditLog: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('7');

  const auditEntries: AuditEntry[] = [
    {
      id: '1',
      action: 'Form Submitted',
      performedBy: 'Sarah Operator',
      targetForm: 'Quality Control Inspection Report',
      timestamp: '2024-01-15T10:30:00Z',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Form ID: QC-001 submitted for approval',
      category: 'form'
    },
    {
      id: '2',
      action: 'Form Approved',
      performedBy: 'John Supervisor',
      targetForm: 'Quality Control Inspection Report',
      timestamp: '2024-01-15T14:20:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Form ID: QC-001 approved with comment: All checks passed',
      category: 'approval'
    },
    {
      id: '3',
      action: 'User Login',
      performedBy: 'Mike Line Incharge',
      timestamp: '2024-01-15T08:15:00Z',
      ipAddress: '192.168.1.108',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0)',
      details: 'Successful login from tablet device',
      category: 'authentication'
    },
    {
      id: '4',
      action: 'Form Template Created',
      performedBy: 'John Supervisor',
      targetForm: 'Safety Inspection Template v2.0',
      timestamp: '2024-01-14T16:45:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'New form template created with 12 fields',
      category: 'form'
    },
    {
      id: '5',
      action: 'User Role Updated',
      performedBy: 'Admin User',
      targetUser: 'David Technician',
      timestamp: '2024-01-14T11:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'User role changed from Operator to Line Incharge',
      category: 'user_management'
    },
    {
      id: '6',
      action: 'System Backup Completed',
      performedBy: 'System',
      timestamp: '2024-01-14T02:00:00Z',
      ipAddress: 'localhost',
      userAgent: 'System Process',
      details: 'Daily backup completed successfully - 2.4GB archived',
      category: 'system'
    },
    {
      id: '7',
      action: 'Form Rejected',
      performedBy: 'Sarah Safety Officer',
      targetForm: 'Safety Inspection Report',
      timestamp: '2024-01-13T15:20:00Z',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Form rejected - Missing required safety equipment photos',
      category: 'approval'
    },
    {
      id: '8',
      action: 'Failed Login Attempt',
      performedBy: 'Unknown User',
      timestamp: '2024-01-13T09:45:00Z',
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Failed login attempt with email: test@example.com',
      category: 'authentication'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'authentication', label: 'Authentication' },
    { value: 'form', label: 'Forms' },
    { value: 'approval', label: 'Approvals' },
    { value: 'user_management', label: 'User Management' },
    { value: 'system', label: 'System' }
  ];

  const dateRanges = [
    { value: '1', label: 'Last 24 hours' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' }
  ];

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    
    // Date filtering logic would go here
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <Shield className="text-primary" size={16} />;
      case 'form':
        return <FileText className="text-success" size={16} />;
      case 'approval':
        return <User className="text-warning" size={16} />;
      case 'user_management':
        return <User className="text-info" size={16} />;
      case 'system':
        return <Shield className="text-muted-foreground" size={16} />;
      default:
        return <Shield className="text-muted-foreground" size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'form':
        return 'bg-success/10 text-success border-success/20';
      case 'approval':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'user_management':
        return 'bg-info/10 text-info border-info/20';
      case 'system':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Action', 'Performed By', 'Category', 'IP Address', 'Details'];
    const csvData = filteredEntries.map(entry => [
      new Date(entry.timestamp).toLocaleString(),
      entry.action,
      entry.performedBy,
      entry.category,
      entry.ipAddress,
      entry.details.replace(/,/g, ';') // Replace commas to avoid CSV issues
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground">
            Complete history of system activities and user actions
          </p>
        </div>
        
        <button 
          onClick={exportToCSV}
          className="btn-primary flex items-center space-x-2"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {auditEntries.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-success mb-1">
            {auditEntries.filter(e => e.category === 'form').length}
          </div>
          <div className="text-sm text-muted-foreground">Form Actions</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {auditEntries.filter(e => e.category === 'approval').length}
          </div>
          <div className="text-sm text-muted-foreground">Approvals</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-info mb-1">
            {auditEntries.filter(e => e.category === 'authentication').length}
          </div>
          <div className="text-sm text-muted-foreground">Auth Events</div>
        </div>
      </div>

      {/* Filters */}
      <div className="professional-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Search Events
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search by action, user, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Time Period
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="form-input"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Entries */}
      <div className="professional-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Audit Entries ({filteredEntries.length})
        </h3>
        
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getCategoryIcon(entry.category)}
                    <h4 className="font-semibold text-foreground">{entry.action}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(entry.category)}`}>
                      {entry.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{entry.performedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <div>
                      <span>IP: {entry.ipAddress}</span>
                    </div>
                  </div>

                  {entry.targetUser && (
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Target User:</span> {entry.targetUser}
                    </div>
                  )}

                  {entry.targetForm && (
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Form:</span> {entry.targetForm}
                    </div>
                  )}

                  <div className="text-sm text-foreground">
                    <span className="font-medium">Details:</span> {entry.details}
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    User Agent: {entry.userAgent}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">No audit entries found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or date range.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;