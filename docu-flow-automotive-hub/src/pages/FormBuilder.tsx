import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Move, Type, Hash, Calendar, Upload, CheckSquare, List, Save, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';

interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'file' | 'checkbox' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormTemplate {
  id?: string;
  title: string;
  description: string;
  department: string;
  category: string;
  fields: FormField[];
  createdBy?: string;
  createdAt?: string;
  status?: 'active' | 'draft' | 'archived';
  totalSubmissions?: number;
}

const FormBuilder: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're editing an existing form
  const editingForm = location.state?.editForm;
  const isEditing = !!editingForm;

  const [formTemplate, setFormTemplate] = useState<FormTemplate>({
    title: '',
    description: '',
    department: user?.department || '',
    category: '',
    fields: []
  });

  const [selectedFieldType, setSelectedFieldType] = useState<FormField['type']>('text');

  // Load form data if editing
  useEffect(() => {
    if (editingForm) {
      console.log('📝 Loading form for editing:', editingForm.title);
      setFormTemplate({
        id: editingForm.id,
        title: editingForm.title,
        description: editingForm.description,
        department: editingForm.department,
        category: editingForm.category,
        fields: editingForm.fields || [],
        createdBy: editingForm.createdBy,
        createdAt: editingForm.createdAt,
        status: editingForm.status,
        totalSubmissions: editingForm.totalSubmissions
      });
    }
  }, [editingForm]);

  const fieldTypes = [
    { type: 'text' as const, label: 'Text Input', icon: Type },
    { type: 'number' as const, label: 'Number Input', icon: Hash },
    { type: 'date' as const, label: 'Date Picker', icon: Calendar },
    { type: 'file' as const, label: 'File Upload', icon: Upload },
    { type: 'checkbox' as const, label: 'Checkbox', icon: CheckSquare },
    { type: 'select' as const, label: 'Dropdown', icon: List },
    { type: 'textarea' as const, label: 'Text Area', icon: Type }
  ];

  const categories = ['Quality', 'Safety', 'Maintenance', 'Setup', 'Inspection', 'Documentation'];

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: selectedFieldType,
      label: `New ${selectedFieldType} field`,
      required: false,
      options: selectedFieldType === 'select' ? ['Option 1', 'Option 2'] : undefined
    };

    setFormTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId: string) => {
    setFormTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    setFormTemplate(prev => {
      const fields = [...prev.fields];
      const index = fields.findIndex(f => f.id === fieldId);
      
      if (direction === 'up' && index > 0) {
        [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
      } else if (direction === 'down' && index < fields.length - 1) {
        [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
      }
      
      return { ...prev, fields };
    });
  };

  const addSelectOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [...(formTemplate.fields.find(f => f.id === fieldId)?.options || []), `Option ${Date.now()}`]
    });
  };

  const updateSelectOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = formTemplate.fields.find(f => f.id === fieldId);
    if (field?.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeSelectOption = (fieldId: string, optionIndex: number) => {
    const field = formTemplate.fields.find(f => f.id === fieldId);
    if (field?.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const saveTemplate = () => {
    if (!formTemplate.title || !formTemplate.description || formTemplate.fields.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one form field.",
        variant: "destructive"
      });
      return;
    }

    // Get existing forms from localStorage
    const existingForms = JSON.parse(localStorage.getItem('customForms') || '[]');

    if (isEditing && formTemplate.id) {
      // Update existing form
      const updatedFormTemplate = {
        ...formTemplate,
        // Preserve original creation data but update modified date
        createdBy: formTemplate.createdBy || user?.firstName + ' ' + user?.lastName || 'Unknown User',
        createdAt: formTemplate.createdAt || new Date().toISOString().split('T')[0],
        updatedBy: user?.firstName + ' ' + user?.lastName || 'Unknown User',
        updatedAt: new Date().toISOString().split('T')[0],
        status: formTemplate.status || 'active' as const,
        totalSubmissions: formTemplate.totalSubmissions || 0
      };

      // Find and update the existing form
      const updatedForms = existingForms.map((form: any) =>
        form.id === formTemplate.id ? updatedFormTemplate : form
      );

      // If form not found in custom forms, it might be a default form being edited
      if (!updatedForms.find((form: any) => form.id === formTemplate.id)) {
        // Add as new custom form (editing a default form creates a new custom one)
        updatedFormTemplate.id = `custom_${Date.now()}`;
        updatedFormTemplate.title = `${formTemplate.title} (Custom)`;
        updatedForms.push(updatedFormTemplate);
      }

      localStorage.setItem('customForms', JSON.stringify(updatedForms));

      console.log('✅ Updated form template:', updatedFormTemplate);

      toast({
        title: "Success",
        description: `Form template "${formTemplate.title}" updated successfully!`
      });

    } else {
      // Create new form
      const newFormTemplate = {
        id: `custom_${Date.now()}`,
        title: formTemplate.title,
        description: formTemplate.description,
        department: formTemplate.department,
        category: formTemplate.category,
        createdBy: user?.firstName + ' ' + user?.lastName || 'Unknown User',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active' as const,
        totalSubmissions: 0,
        fields: formTemplate.fields
      };

      // Add new form
      const updatedForms = [...existingForms, newFormTemplate];
      localStorage.setItem('customForms', JSON.stringify(updatedForms));

      console.log('✅ Created new form template:', newFormTemplate);

      toast({
        title: "Success",
        description: `Form template "${formTemplate.title}" created successfully!`
      });

      // Reset form after successful save (only for new forms)
      setFormTemplate({
        title: '',
        description: '',
        department: user?.department || '',
        category: '',
        fields: []
      });
    }

    // Navigate back to forms page after a short delay
    setTimeout(() => {
      navigate('/forms');
    }, 1500);
  };

  const previewForm = () => {
    if (formTemplate.fields.length === 0) {
      toast({
        title: "No Fields",
        description: "Add some fields to preview the form.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would open a preview modal
    console.log('Previewing form:', formTemplate);
    
    toast({
      title: "Preview",
      description: "Form preview would open in a modal."
    });
  };

  const getFieldIcon = (type: FormField['type']) => {
    const fieldType = fieldTypes.find(ft => ft.type === type);
    return fieldType ? fieldType.icon : Type;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Form Template' : 'Form Builder'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? `Editing: ${editingForm?.title}`
              : 'Create digital documentation templates'
            }
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={previewForm}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>
          <button
            onClick={saveTemplate}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={16} />
            <span>{isEditing ? 'Update Template' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Information */}
          <div className="professional-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Form Title</label>
                <input
                  type="text"
                  value={formTemplate.title}
                  onChange={(e) => setFormTemplate(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter form title"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={formTemplate.description}
                  onChange={(e) => setFormTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this form"
                  rows={3}
                  className="form-input resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                <input
                  type="text"
                  value={formTemplate.department}
                  onChange={(e) => setFormTemplate(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Department name"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={formTemplate.category}
                  onChange={(e) => setFormTemplate(prev => ({ ...prev, category: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Field Types */}
          <div className="professional-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add Field</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Field Type</label>
                <select
                  value={selectedFieldType}
                  onChange={(e) => setSelectedFieldType(e.target.value as FormField['type'])}
                  className="form-input"
                >
                  {fieldTypes.map(fieldType => (
                    <option key={fieldType.type} value={fieldType.type}>
                      {fieldType.label}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={addField}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Field</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-2">
          <div className="professional-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Form Fields</h3>
              <span className="text-sm text-muted-foreground">
                {formTemplate.fields.length} field{formTemplate.fields.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Form Preview */}
            <div className="space-y-4">
              {formTemplate.fields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <Plus className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h4 className="text-lg font-medium text-foreground mb-2">No fields added yet</h4>
                  <p className="text-muted-foreground">
                    Start building your form by adding fields from the left panel.
                  </p>
                </div>
              ) : (
                formTemplate.fields.map((field, index) => {
                  const FieldIcon = getFieldIcon(field.type);
                  
                  return (
                    <div key={field.id} className="border border-border rounded-lg p-4 bg-card-hover">
                      {/* Field Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FieldIcon size={16} className="text-primary" />
                          <span className="text-sm font-medium text-foreground capitalize">
                            {field.type} Field
                          </span>
                          {field.required && (
                            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveField(field.id, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-secondary rounded disabled:opacity-50"
                          >
                            <Move size={14} className="rotate-180" />
                          </button>
                          <button
                            onClick={() => moveField(field.id, 'down')}
                            disabled={index === formTemplate.fields.length - 1}
                            className="p-1 hover:bg-secondary rounded disabled:opacity-50"
                          >
                            <Move size={14} />
                          </button>
                          <button
                            onClick={() => removeField(field.id)}
                            className="p-1 hover:bg-destructive/10 text-destructive rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Field Configuration */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Label
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="form-input text-sm"
                            />
                          </div>
                          
                          {field.type !== 'checkbox' && (
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Placeholder
                              </label>
                              <input
                                type="text"
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                className="form-input text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`required-${field.id}`}
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="rounded"
                          />
                          <label htmlFor={`required-${field.id}`} className="text-sm text-foreground">
                            Required field
                          </label>
                        </div>

                        {/* Select Options */}
                        {field.type === 'select' && (
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2">
                              Options
                            </label>
                            <div className="space-y-2">
                              {field.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateSelectOption(field.id, optionIndex, e.target.value)}
                                    className="form-input text-sm flex-1"
                                  />
                                  <button
                                    onClick={() => removeSelectOption(field.id, optionIndex)}
                                    className="p-2 hover:bg-destructive/10 text-destructive rounded"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => addSelectOption(field.id)}
                                className="btn-secondary text-sm w-full"
                              >
                                <Plus size={14} className="mr-1" />
                                Add Option
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;