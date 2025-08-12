import React, { useState } from 'react';
import { Plus, Edit, Trash2, Wrench, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

interface Tool {
  id: string;
  name: string;
  type: string;
  material: string;
  serialNumber: string;
  department: string;
  assignedMachine?: string;
  status: 'active' | 'maintenance' | 'worn' | 'retired';
  purchaseDate: string;
  lastInspectionDate: string;
  nextInspectionDate: string;
  lifespan: number; // in hours
  usageHours: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

const ToolSetup: React.FC = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [tools, setTools] = useState<Tool[]>([
    {
      id: '1',
      name: 'Carbide End Mill 10mm',
      type: 'Cutting Tool',
      material: 'Tungsten Carbide',
      serialNumber: 'EM10-001',
      department: 'Manufacturing',
      assignedMachine: 'CNC Machine 01',
      status: 'active',
      purchaseDate: '2023-12-15',
      lastInspectionDate: '2024-01-10',
      nextInspectionDate: '2024-02-10',
      lifespan: 500,
      usageHours: 247,
      condition: 'good',
      notes: 'Regular wear pattern observed. Performance within specifications.'
    },
    {
      id: '2',
      name: 'Precision Measuring Gauge',
      type: 'Measuring Tool',
      material: 'Stainless Steel',
      serialNumber: 'PMG-789',
      department: 'Quality Control',
      status: 'active',
      purchaseDate: '2023-11-20',
      lastInspectionDate: '2024-01-08',
      nextInspectionDate: '2024-04-08',
      lifespan: 10000,
      usageHours: 1250,
      condition: 'excellent',
      notes: 'Calibration completed. High accuracy maintained.'
    },
    {
      id: '3',
      name: 'Hydraulic Press Dies',
      type: 'Forming Tool',
      material: 'Tool Steel',
      serialNumber: 'HPD-456',
      department: 'Production',
      assignedMachine: 'Hydraulic Press 02',
      status: 'maintenance',
      purchaseDate: '2023-10-05',
      lastInspectionDate: '2024-01-05',
      nextInspectionDate: '2024-01-25',
      lifespan: 2000,
      usageHours: 1847,
      condition: 'fair',
      notes: 'Minor wear detected. Scheduled for reconditioning.'
    },
    {
      id: '4',
      name: 'Diamond Core Drill Bit',
      type: 'Drilling Tool',
      material: 'Diamond Coated',
      serialNumber: 'DCD-123',
      department: 'Manufacturing',
      assignedMachine: 'Drill Press 03',
      status: 'worn',
      purchaseDate: '2023-09-12',
      lastInspectionDate: '2024-01-12',
      nextInspectionDate: '2024-01-20',
      lifespan: 300,
      usageHours: 289,
      condition: 'poor',
      notes: 'Approaching end of life. Replacement scheduled.'
    }
  ]);

  const [formData, setFormData] = useState<Partial<Tool>>({
    name: '',
    type: '',
    material: '',
    serialNumber: '',
    department: '',
    assignedMachine: '',
    status: 'active',
    purchaseDate: '',
    lastInspectionDate: '',
    nextInspectionDate: '',
    lifespan: 0,
    usageHours: 0,
    condition: 'excellent',
    notes: ''
  });

  const departments = ['Manufacturing', 'Production', 'Quality Control', 'Assembly', 'Maintenance'];
  const toolTypes = ['Cutting Tool', 'Measuring Tool', 'Forming Tool', 'Drilling Tool', 'Assembly Tool', 'Testing Tool'];
  const materials = ['Tungsten Carbide', 'High Speed Steel', 'Tool Steel', 'Diamond Coated', 'Ceramic', 'Stainless Steel'];
  const statuses = ['active', 'maintenance', 'worn', 'retired'];
  const conditions = ['excellent', 'good', 'fair', 'poor'];

  const machines = [
    'CNC Machine 01', 'CNC Machine 02', 'Drill Press 01', 'Drill Press 02', 'Drill Press 03',
    'Hydraulic Press 01', 'Hydraulic Press 02', 'Assembly Line A1', 'Assembly Line A2'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.serialNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (editingTool) {
      // Update existing tool
      setTools(prev => prev.map(tool => 
        tool.id === editingTool.id 
          ? { ...tool, ...formData } as Tool
          : tool
      ));
      
      toast({
        title: "Tool Updated",
        description: `${formData.name} has been updated successfully.`
      });
    } else {
      // Add new tool
      const newTool: Tool = {
        id: Date.now().toString(),
        ...formData
      } as Tool;
      
      setTools(prev => [newTool, ...prev]);
      
      toast({
        title: "Tool Added",
        description: `${formData.name} has been added successfully.`
      });
    }

    // Reset form
    setFormData({
      name: '',
      type: '',
      material: '',
      serialNumber: '',
      department: '',
      assignedMachine: '',
      status: 'active',
      purchaseDate: '',
      lastInspectionDate: '',
      nextInspectionDate: '',
      lifespan: 0,
      usageHours: 0,
      condition: 'excellent',
      notes: ''
    });
    setShowAddModal(false);
    setEditingTool(null);
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setFormData(tool);
    setShowAddModal(true);
  };

  const handleDelete = (toolId: string) => {
    setTools(prev => prev.filter(tool => tool.id !== toolId));
    toast({
      title: "Tool Deleted",
      description: "The tool has been removed from the system."
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-success" size={16} />;
      case 'maintenance':
        return <AlertTriangle className="text-warning" size={16} />;
      case 'worn':
        return <AlertTriangle className="text-destructive" size={16} />;
      case 'retired':
        return <AlertTriangle className="text-muted-foreground" size={16} />;
      default:
        return <Wrench className="text-muted-foreground" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'maintenance':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'worn':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'retired':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-success';
      case 'good':
        return 'text-primary';
      case 'fair':
        return 'text-warning';
      case 'poor':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getLifespanPercentage = (usageHours: number, lifespan: number) => {
    return Math.min((usageHours / lifespan) * 100, 100);
  };

  const getLifespanColor = (percentage: number) => {
    if (percentage < 50) return 'bg-success';
    if (percentage < 80) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tool Setup</h1>
          <p className="text-muted-foreground">
            Manage tool inventory and maintenance schedules
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Tool</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-success mb-1">
            {tools.filter(t => t.status === 'active').length}
          </div>
          <div className="text-sm text-muted-foreground">Active Tools</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {tools.filter(t => t.status === 'maintenance').length}
          </div>
          <div className="text-sm text-muted-foreground">In Maintenance</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-destructive mb-1">
            {tools.filter(t => t.status === 'worn').length}
          </div>
          <div className="text-sm text-muted-foreground">Worn Tools</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {toolTypes.length}
          </div>
          <div className="text-sm text-muted-foreground">Tool Types</div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const lifespanPercentage = getLifespanPercentage(tool.usageHours, tool.lifespan);
          
          return (
            <div key={tool.id} className="professional-card">
              {/* Tool Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Wrench className="text-primary" size={24} />
                  <div>
                    <h3 className="font-semibold text-foreground">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground">{tool.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(tool.status)}`}>
                    {getStatusIcon(tool.status)}
                    <span>{tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}</span>
                  </span>
                </div>
              </div>

              {/* Tool Details */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Serial Number:</span>
                    <p className="font-medium text-foreground">{tool.serialNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Material:</span>
                    <p className="font-medium text-foreground">{tool.material}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium text-foreground">{tool.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Condition:</span>
                    <p className={`font-medium ${getConditionColor(tool.condition)}`}>
                      {tool.condition.charAt(0).toUpperCase() + tool.condition.slice(1)}
                    </p>
                  </div>
                </div>

                {tool.assignedMachine && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Assigned Machine:</span>
                    <p className="font-medium text-foreground">{tool.assignedMachine}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Last Inspection:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span className="font-medium text-foreground">
                        {new Date(tool.lastInspectionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Inspection:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span className="font-medium text-foreground">
                        {new Date(tool.nextInspectionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Tool Life</span>
                    <span className="text-sm font-medium text-foreground">
                      {tool.usageHours} / {tool.lifespan} hours ({lifespanPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getLifespanColor(lifespanPercentage)}`}
                      style={{ width: `${lifespanPercentage}%` }}
                    />
                  </div>
                </div>

                {tool.notes && (
                  <div className="mt-3 p-3 bg-card-hover rounded-lg">
                    <p className="text-sm text-muted-foreground">{tool.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-4 pt-4 border-t border-border">
                <button 
                  onClick={() => handleEdit(tool)}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(tool.id)}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingTool ? 'Edit Tool' : 'Add New Tool'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="form-input"
                    required
                  >
                    <option value="">Select Type</option>
                    {toolTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Material
                  </label>
                  <select
                    value={formData.material || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Select Material</option>
                    {materials.map(material => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Department
                  </label>
                  <select
                    value={formData.department || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Assigned Machine
                  </label>
                  <select
                    value={formData.assignedMachine || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedMachine: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Select Machine</option>
                    {machines.map(machine => (
                      <option key={machine} value={machine}>{machine}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Tool['status'] }))}
                    className="form-input"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition || 'excellent'}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as Tool['condition'] }))}
                    className="form-input"
                  >
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Inspection Date
                  </label>
                  <input
                    type="date"
                    value={formData.lastInspectionDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastInspectionDate: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Next Inspection Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextInspectionDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextInspectionDate: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Lifespan (Hours)
                  </label>
                  <input
                    type="number"
                    value={formData.lifespan || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, lifespan: parseInt(e.target.value) || 0 }))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Usage Hours
                  </label>
                  <input
                    type="number"
                    value={formData.usageHours || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageHours: parseInt(e.target.value) || 0 }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="form-input resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTool(null);
                    setFormData({
                      name: '',
                      type: '',
                      material: '',
                      serialNumber: '',
                      department: '',
                      assignedMachine: '',
                      status: 'active',
                      purchaseDate: '',
                      lastInspectionDate: '',
                      nextInspectionDate: '',
                      lifespan: 0,
                      usageHours: 0,
                      condition: 'excellent',
                      notes: ''
                    });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingTool ? 'Update Tool' : 'Add Tool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolSetup;