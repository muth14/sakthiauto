import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, Clock, CheckCircle, XCircle, RefreshCw, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FormTemplate {
  id: string;
  title: string;
  description: string;
  department: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
  totalSubmissions: number;
  category: string;
  fields?: any[]; // For custom forms created in Form Builder
  lastSubmission?: string;
  averageCompletionTime?: string;
  isEnabled?: boolean;
}

const Forms: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allFormTemplates, setAllFormTemplates] = useState<FormTemplate[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Generate dynamic submission counts
  const generateDynamicSubmissions = (formId: string, baseCount: number = 0) => {
    const stored = localStorage.getItem(`form_submissions_${formId}`);
    if (stored) {
      return parseInt(stored);
    }
    // Generate realistic submission count based on form age and type
    const randomSubmissions = Math.floor(Math.random() * 30) + baseCount;
    localStorage.setItem(`form_submissions_${formId}`, randomSubmissions.toString());
    return randomSubmissions;
  };

  // Default form templates with dynamic data
  const getDefaultFormTemplates = (): FormTemplate[] => [
    {
      id: '1',
      title: 'Quality Control Inspection',
      description: 'Standard quality control checklist for production line',
      department: 'Quality Control',
      createdBy: 'John Supervisor',
      createdAt: '2024-01-15',
      status: 'active',
      totalSubmissions: generateDynamicSubmissions('1', 20),
      category: 'Quality',
      lastSubmission: '2 hours ago',
      averageCompletionTime: '8 minutes',
      isEnabled: true,
      fields: [
        { id: 'inspector_name', type: 'text', label: 'Inspector Name', required: true },
        { id: 'inspection_date', type: 'date', label: 'Inspection Date', required: true },
        { id: 'product_id', type: 'text', label: 'Product ID', required: true },
        { id: 'batch_number', type: 'text', label: 'Batch Number', required: true },
        { id: 'quality_rating', type: 'select', label: 'Quality Rating', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { id: 'visual_inspection', type: 'checkbox', label: 'Visual Inspection Passed', required: false },
        { id: 'dimensional_check', type: 'checkbox', label: 'Dimensional Check Passed', required: false },
        { id: 'defects_found', type: 'textarea', label: 'Defects Found (if any)', required: false },
        { id: 'corrective_action', type: 'textarea', label: 'Corrective Action Required', required: false },
        { id: 'approved', type: 'checkbox', label: 'Approved for Production', required: true }
      ]
    },
    {
      id: '2',
      title: 'Machine Setup Checklist',
      description: 'Pre-operation machine setup and safety verification',
      department: 'Production',
      createdBy: 'Mike Line Incharge',
      createdAt: '2024-01-12',
      status: 'active',
      totalSubmissions: generateDynamicSubmissions('2', 15),
      category: 'Setup',
      lastSubmission: '45 minutes ago',
      averageCompletionTime: '12 minutes',
      isEnabled: true,
      fields: [
        { id: 'operator_name', type: 'text', label: 'Operator Name', required: true },
        { id: 'setup_date', type: 'date', label: 'Setup Date', required: true },
        { id: 'machine_id', type: 'text', label: 'Machine ID', required: true },
        { id: 'shift', type: 'select', label: 'Shift', required: true, options: ['Morning', 'Afternoon', 'Night'] },
        { id: 'power_check', type: 'checkbox', label: 'Power Supply Check', required: true },
        { id: 'safety_guards', type: 'checkbox', label: 'Safety Guards in Place', required: true },
        { id: 'tools_checked', type: 'checkbox', label: 'Tools and Fixtures Checked', required: true },
        { id: 'calibration_verified', type: 'checkbox', label: 'Calibration Verified', required: true },
        { id: 'lubrication_check', type: 'checkbox', label: 'Lubrication Check Complete', required: false },
        { id: 'setup_notes', type: 'textarea', label: 'Setup Notes', required: false }
      ]
    },
    {
      id: '3',
      title: 'Safety Inspection Report',
      description: 'Daily safety inspection for work area compliance',
      department: 'Safety',
      createdBy: 'Sarah Safety Officer',
      createdAt: '2024-01-10',
      status: 'active',
      totalSubmissions: generateDynamicSubmissions('3', 25),
      category: 'Safety',
      lastSubmission: '1 hour ago',
      averageCompletionTime: '6 minutes',
      isEnabled: true,
      fields: [
        { id: 'safety_officer', type: 'text', label: 'Safety Officer Name', required: true },
        { id: 'inspection_date', type: 'date', label: 'Inspection Date', required: true },
        { id: 'area_inspected', type: 'text', label: 'Area Inspected', required: true },
        { id: 'emergency_exits', type: 'checkbox', label: 'Emergency Exits Clear', required: true },
        { id: 'fire_extinguishers', type: 'checkbox', label: 'Fire Extinguishers Accessible', required: true },
        { id: 'first_aid_kit', type: 'checkbox', label: 'First Aid Kit Available', required: true },
        { id: 'ppe_available', type: 'checkbox', label: 'PPE Available and Used', required: true },
        { id: 'hazard_signs', type: 'checkbox', label: 'Hazard Signs Visible', required: true },
        { id: 'safety_compliance', type: 'select', label: 'Overall Safety Compliance', required: true, options: ['Excellent', 'Good', 'Needs Improvement', 'Critical Issues'] },
        { id: 'safety_issues', type: 'textarea', label: 'Safety Issues Found', required: false },
        { id: 'recommendations', type: 'textarea', label: 'Recommendations', required: false }
      ]
    },
    {
      id: '4',
      title: 'Tool Maintenance Log',
      description: 'Tool condition assessment and maintenance requirements',
      department: 'Maintenance',
      createdBy: 'David Technician',
      createdAt: '2024-01-08',
      status: 'draft',
      totalSubmissions: generateDynamicSubmissions('4', 0),
      category: 'Maintenance',
      lastSubmission: 'Never',
      averageCompletionTime: 'N/A',
      isEnabled: false,
      fields: [
        { id: 'technician_name', type: 'text', label: 'Technician Name', required: true },
        { id: 'maintenance_date', type: 'date', label: 'Maintenance Date', required: true },
        { id: 'tool_id', type: 'text', label: 'Tool ID', required: true },
        { id: 'tool_type', type: 'select', label: 'Tool Type', required: true, options: ['Cutting Tool', 'Measuring Tool', 'Hand Tool', 'Power Tool', 'Fixture'] },
        { id: 'condition_before', type: 'select', label: 'Condition Before Maintenance', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'] },
        { id: 'maintenance_performed', type: 'textarea', label: 'Maintenance Performed', required: true },
        { id: 'parts_replaced', type: 'text', label: 'Parts Replaced', required: false },
        { id: 'condition_after', type: 'select', label: 'Condition After Maintenance', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Replacement'] },
        { id: 'next_maintenance', type: 'date', label: 'Next Maintenance Due', required: false },
        { id: 'maintenance_notes', type: 'textarea', label: 'Additional Notes', required: false }
      ]
    },
    {
      id: '5',
      title: 'Production Line Audit',
      description: 'Comprehensive audit checklist for production efficiency',
      department: 'Production',
      createdBy: 'Admin',
      createdAt: '2024-01-05',
      status: 'active',
      totalSubmissions: generateDynamicSubmissions('5', 18),
      category: 'Audit',
      lastSubmission: '3 hours ago',
      averageCompletionTime: '15 minutes',
      isEnabled: true,
      fields: [
        { id: 'auditor_name', type: 'text', label: 'Auditor Name', required: true },
        { id: 'audit_date', type: 'date', label: 'Audit Date', required: true },
        { id: 'production_line', type: 'text', label: 'Production Line', required: true },
        { id: 'shift_supervisor', type: 'text', label: 'Shift Supervisor', required: true },
        { id: 'production_target', type: 'number', label: 'Production Target (units)', required: true },
        { id: 'actual_production', type: 'number', label: 'Actual Production (units)', required: true },
        { id: 'efficiency_rating', type: 'select', label: 'Efficiency Rating', required: true, options: ['Excellent (>95%)', 'Good (85-95%)', 'Average (75-85%)', 'Below Average (<75%)'] },
        { id: 'quality_issues', type: 'textarea', label: 'Quality Issues Observed', required: false },
        { id: 'process_improvements', type: 'textarea', label: 'Process Improvement Suggestions', required: false },
        { id: 'overall_rating', type: 'select', label: 'Overall Line Performance', required: true, options: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'] }
      ]
    },
    {
      id: '6',
      title: 'Equipment Calibration',
      description: 'Monthly calibration verification for precision equipment',
      department: 'Quality Control',
      createdBy: 'QC Manager',
      createdAt: '2024-01-03',
      status: 'active',
      totalSubmissions: generateDynamicSubmissions('6', 12),
      category: 'Calibration',
      lastSubmission: '5 hours ago',
      averageCompletionTime: '20 minutes',
      isEnabled: true,
      fields: [
        { id: 'calibration_technician', type: 'text', label: 'Calibration Technician', required: true },
        { id: 'calibration_date', type: 'date', label: 'Calibration Date', required: true },
        { id: 'equipment_id', type: 'text', label: 'Equipment ID', required: true },
        { id: 'equipment_type', type: 'select', label: 'Equipment Type', required: true, options: ['Measuring Instrument', 'Testing Equipment', 'Gauge', 'Scale', 'Thermometer'] },
        { id: 'serial_number', type: 'text', label: 'Serial Number', required: true },
        { id: 'calibration_standard', type: 'text', label: 'Calibration Standard Used', required: true },
        { id: 'before_calibration', type: 'select', label: 'Status Before Calibration', required: true, options: ['Within Tolerance', 'Out of Tolerance', 'Needs Adjustment'] },
        { id: 'after_calibration', type: 'select', label: 'Status After Calibration', required: true, options: ['Within Tolerance', 'Out of Tolerance', 'Requires Repair'] },
        { id: 'next_calibration', type: 'date', label: 'Next Calibration Due', required: true },
        { id: 'calibration_notes', type: 'textarea', label: 'Calibration Notes', required: false }
      ]
    }
  ];

  const categories = ['all', 'Quality', 'Setup', 'Safety', 'Maintenance', 'Audit', 'Calibration'];

  // Load custom forms from localStorage and combine with default forms
  useEffect(() => {
    const loadForms = () => {
      try {
        const customForms = JSON.parse(localStorage.getItem('customForms') || '[]');
        const defaultForms = getDefaultFormTemplates();
        const combinedForms = [...defaultForms, ...customForms];
        setAllFormTemplates(combinedForms);

        // Load submission counts
        const submissions: {[key: string]: number} = {};
        combinedForms.forEach(form => {
          submissions[form.id] = form.totalSubmissions;
        });
        setFormSubmissions(submissions);

        if (customForms.length > 0) {
          console.log(`✅ Loaded ${customForms.length} custom form(s) from storage`);
        }
      } catch (error) {
        console.error('Error loading custom forms:', error);
        setAllFormTemplates(getDefaultFormTemplates());
      }
    };

    loadForms();

    // Listen for storage changes (when forms are created in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customForms') {
        loadForms();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle form actions
  const handleFillForm = (form: FormTemplate) => {
    console.log(`✅ Opening form for filling: ${form.title}`);
    // Navigate to dedicated form filling page
    navigate(`/fill-form/${form.id}`, { state: { form } });
  };

  const handleEditTemplate = (form: FormTemplate) => {
    console.log(`✅ Editing template: ${form.title}`);

    if (form.fields && form.fields.length > 0) {
      // Custom form - edit in form builder with existing data
      console.log(`📝 Opening custom form "${form.title}" in Form Builder`);
      navigate('/form-builder', { state: { editForm: form } });
    } else {
      // Default form or form without fields - create editable version
      console.log(`📝 Creating editable version of "${form.title}"`);

      // Generate appropriate default fields based on form category
      const getDefaultFields = (category: string) => {
        switch (category) {
          case 'Quality':
            return [
              { id: 'inspector_name', type: 'text', label: 'Inspector Name', required: true },
              { id: 'inspection_date', type: 'date', label: 'Inspection Date', required: true },
              { id: 'product_id', type: 'text', label: 'Product ID', required: true },
              { id: 'quality_rating', type: 'select', label: 'Quality Rating', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
              { id: 'defects_found', type: 'textarea', label: 'Defects Found', required: false },
              { id: 'approved', type: 'checkbox', label: 'Approved for Production', required: true }
            ];
          case 'Safety':
            return [
              { id: 'safety_officer', type: 'text', label: 'Safety Officer', required: true },
              { id: 'inspection_date', type: 'date', label: 'Inspection Date', required: true },
              { id: 'area_inspected', type: 'text', label: 'Area Inspected', required: true },
              { id: 'safety_compliance', type: 'select', label: 'Safety Compliance', required: true, options: ['Compliant', 'Minor Issues', 'Major Issues', 'Non-Compliant'] },
              { id: 'hazards_identified', type: 'textarea', label: 'Hazards Identified', required: false },
              { id: 'corrective_actions', type: 'textarea', label: 'Corrective Actions Required', required: false }
            ];
          case 'Setup':
            return [
              { id: 'operator_name', type: 'text', label: 'Operator Name', required: true },
              { id: 'setup_date', type: 'date', label: 'Setup Date', required: true },
              { id: 'machine_id', type: 'text', label: 'Machine ID', required: true },
              { id: 'setup_time', type: 'time', label: 'Setup Time', required: true },
              { id: 'tools_checked', type: 'checkbox', label: 'All Tools Checked', required: true },
              { id: 'calibration_verified', type: 'checkbox', label: 'Calibration Verified', required: true },
              { id: 'notes', type: 'textarea', label: 'Setup Notes', required: false }
            ];
          case 'Maintenance':
            return [
              { id: 'technician_name', type: 'text', label: 'Technician Name', required: true },
              { id: 'maintenance_date', type: 'date', label: 'Maintenance Date', required: true },
              { id: 'equipment_id', type: 'text', label: 'Equipment ID', required: true },
              { id: 'maintenance_type', type: 'select', label: 'Maintenance Type', required: true, options: ['Preventive', 'Corrective', 'Emergency', 'Routine'] },
              { id: 'work_performed', type: 'textarea', label: 'Work Performed', required: true },
              { id: 'parts_replaced', type: 'textarea', label: 'Parts Replaced', required: false },
              { id: 'next_maintenance', type: 'date', label: 'Next Maintenance Due', required: false }
            ];
          default:
            return [
              { id: 'user_name', type: 'text', label: 'User Name', required: true },
              { id: 'date', type: 'date', label: 'Date', required: true },
              { id: 'description', type: 'textarea', label: 'Description', required: true },
              { id: 'status', type: 'select', label: 'Status', required: true, options: ['Pending', 'In Progress', 'Completed'] }
            ];
        }
      };

      const editableForm = {
        ...form,
        id: form.id, // Keep original ID for editing
        fields: getDefaultFields(form.category)
      };

      navigate('/form-builder', { state: { editForm: editableForm } });
    }
  };

  const handleViewDetails = (form: FormTemplate) => {
    console.log(`✅ Opening details for: ${form.title}`);
    setSelectedForm(form);
    setShowDetailsModal(true);
  };

  const handleToggleStatus = (formId: string) => {
    setAllFormTemplates(prev =>
      prev.map(form =>
        form.id === formId
          ? {
              ...form,
              status: form.status === 'active' ? 'draft' : 'active',
              isEnabled: !form.isEnabled
            }
          : form
      )
    );

    const form = allFormTemplates.find(f => f.id === formId);
    if (form) {
      console.log(`✅ Form ${form.status === 'active' ? 'disabled' : 'enabled'}: ${form.title}`);
    }
  };

  const filteredForms = allFormTemplates.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-success" size={16} />;
      case 'draft':
        return <Clock className="text-warning" size={16} />;
      case 'archived':
        return <XCircle className="text-muted-foreground" size={16} />;
      default:
        return <FileText className="text-muted-foreground" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'archived':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Form Templates</h1>
          <p className="text-muted-foreground">
            Browse and manage digital documentation forms
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const customForms = JSON.parse(localStorage.getItem('customForms') || '[]');
              const combinedForms = [...defaultFormTemplates, ...customForms];
              setAllFormTemplates(combinedForms);
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          {(user?.role === 'Admin' || user?.role === 'Supervisor') && (
            <button
              onClick={() => navigate('/form-builder')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="professional-card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search forms by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input min-w-[150px]"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Form Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {allFormTemplates.filter(f => f.status === 'active').length}
          </div>
          <div className="text-sm text-muted-foreground">Active Forms</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {allFormTemplates.filter(f => f.status === 'draft').length}
          </div>
          <div className="text-sm text-muted-foreground">Draft Forms</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-success mb-1">
            {allFormTemplates.reduce((sum, f) => sum + f.totalSubmissions, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Submissions</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-info mb-1">
            {categories.length - 1}
          </div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <div key={form.id} className="professional-card card-interactive">
            {/* Form Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="text-primary" size={20} />
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(form.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(form.status)}`}>
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                  </span>
                  {form.fields && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 flex items-center space-x-1">
                      <Star size={12} />
                      <span>Custom</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-foreground mb-1">{form.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{form.description}</p>
              </div>

              {/* Dynamic Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-primary/5 p-2 rounded">
                  <div className="font-medium text-primary">{formSubmissions[form.id] || form.totalSubmissions}</div>
                  <div className="text-muted-foreground">Submissions</div>
                </div>
                <div className="bg-success/5 p-2 rounded">
                  <div className="font-medium text-success">{form.averageCompletionTime || 'N/A'}</div>
                  <div className="text-muted-foreground">Avg. Time</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <span>{form.department}</span>
                  <span>•</span>
                  <span>{form.category}</span>
                </span>
                <span className="text-success">Last: {form.lastSubmission || 'Never'}</span>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created by {form.createdBy}</span>
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {/* Primary Actions */}
              <div className="flex space-x-2">
                {user?.role === 'Operator' ? (
                  <button
                    onClick={() => handleFillForm(form)}
                    disabled={form.status !== 'active'}
                    className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Fill Form
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleViewDetails(form)}
                      className="flex-1 btn-secondary text-sm py-2 hover:bg-secondary/90"
                    >
                      View Details
                    </button>
                    {(user?.role === 'Admin' || user?.role === 'Supervisor') && (
                      <button
                        onClick={() => handleEditTemplate(form)}
                        className="flex-1 btn-primary text-sm py-2 hover:bg-primary/90"
                      >
                        Edit Template
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Secondary Actions - Admin/Supervisor Only */}
              {(user?.role === 'Admin' || user?.role === 'Supervisor') && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleStatus(form.id)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${
                      form.status === 'active'
                        ? 'bg-warning/10 text-warning hover:bg-warning/20'
                        : 'bg-success/10 text-success hover:bg-success/20'
                    }`}
                  >
                    {form.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleFillForm(form)}
                    disabled={form.status !== 'active'}
                    className="flex-1 text-xs py-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test Fill
                  </button>
                </div>
              )}

              {/* Form Status Indicator */}
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  form.status === 'active'
                    ? 'bg-success/10 text-success'
                    : form.status === 'draft'
                    ? 'bg-warning/10 text-warning'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {form.status === 'active' ? '● Active' : form.status === 'draft' ? '● Draft' : '● Archived'}
                </span>
                {form.fields && (
                  <span className="text-muted-foreground">
                    {form.fields.length} fields
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-medium text-foreground mb-2">No forms found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or create a new form template.
          </p>
          {(user?.role === 'Admin' || user?.role === 'Supervisor') && (
            <button
              onClick={() => navigate('/form-builder')}
              className="btn-primary"
            >
              <Plus size={16} className="mr-2" />
              Create New Form
            </button>
          )}
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{selectedForm.title}</h2>
                <p className="text-sm text-muted-foreground">{selectedForm.department} • {selectedForm.category}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <XCircle size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Form Description */}
              <div>
                <h3 className="font-medium text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedForm.description}</p>
              </div>

              {/* Form Statistics */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-primary">{formSubmissions[selectedForm.id] || selectedForm.totalSubmissions}</div>
                    <div className="text-xs text-muted-foreground">Total Submissions</div>
                  </div>
                  <div className="bg-success/5 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-success">{selectedForm.averageCompletionTime || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">Avg. Completion</div>
                  </div>
                  <div className="bg-info/5 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-info">{selectedForm.lastSubmission || 'Never'}</div>
                    <div className="text-xs text-muted-foreground">Last Submission</div>
                  </div>
                  <div className="bg-warning/5 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-warning">{selectedForm.status}</div>
                    <div className="text-xs text-muted-foreground">Status</div>
                  </div>
                </div>
              </div>

              {/* Form Fields (if custom form) */}
              {selectedForm.fields && (
                <div>
                  <h3 className="font-medium text-foreground mb-3">Form Fields ({selectedForm.fields.length})</h3>
                  <div className="space-y-2">
                    {selectedForm.fields.map((field: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <span className="font-medium text-foreground">{field.label}</span>
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {field.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Metadata */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="ml-2 text-foreground">{selectedForm.createdBy}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created on:</span>
                    <span className="ml-2 text-foreground">{new Date(selectedForm.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <span className="ml-2 text-foreground">{selectedForm.department}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2 text-foreground">{selectedForm.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
              {(user?.role === 'Admin' || user?.role === 'Supervisor') && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditTemplate(selectedForm);
                  }}
                  className="btn-primary"
                >
                  Edit Template
                </button>
              )}
              {user?.role === 'Operator' && selectedForm.status === 'active' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleFillForm(selectedForm);
                  }}
                  className="btn-primary"
                >
                  Fill Form
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms;