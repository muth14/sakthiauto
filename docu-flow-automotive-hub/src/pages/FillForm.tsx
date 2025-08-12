import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Save, ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'time' | 'number' | 'file';
  label: string;
  required: boolean;
  options?: string[];
}

interface FormTemplate {
  id: string;
  title: string;
  description: string;
  department: string;
  category: string;
  fields: FormField[];
  createdBy: string;
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
  totalSubmissions: number;
}

interface FormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  submittedBy: string;
  submittedAt: string;
  department: string;
  status: 'submitted' | 'approved' | 'rejected' | 'pending';
  data: { [key: string]: any };
  completionTime: number; // in seconds
}

const FillForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [form, setForm] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  // Load form template
  useEffect(() => {
    const loadForm = () => {
      try {
        // Check if form was passed via location state
        if (location.state?.form) {
          setForm(location.state.form);
          setLoading(false);
          return;
        }

        // Load from localStorage
        const customForms = JSON.parse(localStorage.getItem('customForms') || '[]');
        const foundForm = customForms.find((f: FormTemplate) => f.id === formId);
        
        if (foundForm) {
          setForm(foundForm);
        } else {
          // Check default forms
          const defaultForms = getDefaultForms();
          const defaultForm = defaultForms.find(f => f.id === formId);
          if (defaultForm) {
            setForm(defaultForm);
          } else {
            toast({
              title: "Form Not Found",
              description: "The requested form could not be found.",
              variant: "destructive"
            });
            navigate('/forms');
          }
        }
      } catch (error) {
        console.error('Error loading form:', error);
        toast({
          title: "Error",
          description: "Failed to load form template.",
          variant: "destructive"
        });
        navigate('/forms');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId, location.state, navigate]);

  // Get default forms with complete field definitions
  const getDefaultForms = (): FormTemplate[] => {
    return [
      {
        id: '1',
        title: 'Quality Control Inspection',
        description: 'Standard quality control checklist for production line',
        department: 'Quality Control',
        category: 'Quality',
        createdBy: 'System',
        createdAt: '2024-01-15',
        status: 'active',
        totalSubmissions: 0,
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
        category: 'Setup',
        createdBy: 'System',
        createdAt: '2024-01-12',
        status: 'active',
        totalSubmissions: 0,
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
        category: 'Safety',
        createdBy: 'System',
        createdAt: '2024-01-10',
        status: 'active',
        totalSubmissions: 0,
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
        category: 'Maintenance',
        createdBy: 'System',
        createdAt: '2024-01-08',
        status: 'active',
        totalSubmissions: 0,
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
        category: 'Audit',
        createdBy: 'System',
        createdAt: '2024-01-05',
        status: 'active',
        totalSubmissions: 0,
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
        category: 'Calibration',
        createdBy: 'System',
        createdAt: '2024-01-03',
        status: 'active',
        totalSubmissions: 0,
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
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!form) return false;

    const requiredFields = form.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => 
      !formData[field.id] || 
      (typeof formData[field.id] === 'string' && formData[field.id].trim() === '')
    );

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const submitForm = async () => {
    if (!form || !user) return;

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      
      const submission: FormSubmission = {
        id: `submission_${Date.now()}`,
        formId: form.id,
        formTitle: form.title,
        submittedBy: `${user.firstName} ${user.lastName}`,
        submittedAt: new Date().toISOString(),
        department: user.department || 'Unknown',
        status: 'submitted',
        data: formData,
        completionTime
      };

      // Save submission to localStorage
      const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      const updatedSubmissions = [...existingSubmissions, submission];
      localStorage.setItem('formSubmissions', JSON.stringify(updatedSubmissions));

      // Update form submission count
      const customForms = JSON.parse(localStorage.getItem('customForms') || '[]');
      const updatedForms = customForms.map((f: FormTemplate) => 
        f.id === form.id 
          ? { ...f, totalSubmissions: (f.totalSubmissions || 0) + 1 }
          : f
      );
      localStorage.setItem('customForms', JSON.stringify(updatedForms));

      // Update individual form submission count
      const currentCount = parseInt(localStorage.getItem(`form_submissions_${form.id}`) || '0');
      localStorage.setItem(`form_submissions_${form.id}`, (currentCount + 1).toString());

      console.log('✅ Form submitted successfully:', submission);

      toast({
        title: "Success",
        description: `Form "${form.title}" submitted successfully! Completion time: ${Math.floor(completionTime / 60)}m ${completionTime % 60}s`
      });

      // Navigate back to forms or submissions page
      setTimeout(() => {
        if (user.role === 'Operator') {
          navigate('/my-submissions');
        } else {
          navigate('/forms');
        }
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={4}
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">Check if applicable</span>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">Form Not Found</h3>
          <p className="text-muted-foreground mb-4">The requested form could not be found.</p>
          <button onClick={() => navigate('/forms')} className="btn-primary">
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/forms')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{form.title}</h1>
            <p className="text-muted-foreground">{form.description}</p>
          </div>
        </div>
        
        <div className="text-right text-sm text-muted-foreground">
          <div className="flex items-center space-x-2 mb-1">
            <User size={14} />
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={14} />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="professional-card">
        <div className="space-y-6">
          {/* Form Info */}
          <div className="border-b border-border pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Department:</span>
                <span className="ml-2 text-foreground">{form.department}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2 text-foreground">{form.category}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fields:</span>
                <span className="ml-2 text-foreground">{form.fields.length}</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {form.fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
            <button 
              onClick={() => navigate('/forms')}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              onClick={submitForm}
              disabled={submitting}
              className="btn-primary flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit Form'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillForm;
