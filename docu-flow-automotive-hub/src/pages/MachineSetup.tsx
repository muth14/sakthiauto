import React, { useState } from 'react';
import { Plus, Edit, Trash2, Cog, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

interface Machine {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  department: string;
  location: string;
  status: 'operational' | 'maintenance' | 'offline' | 'setup';
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  operatingHours: number;
  efficiency: number;
  notes?: string;
}

const MachineSetup: React.FC = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [machines, setMachines] = useState<Machine[]>([
    {
      id: '1',
      name: 'Assembly Line A1',
      model: 'AL-2024-PRO',
      serialNumber: 'AL001234',
      department: 'Production',
      location: 'Bay A, Floor 1',
      status: 'operational',
      lastMaintenanceDate: '2024-01-10',
      nextMaintenanceDate: '2024-02-10',
      operatingHours: 2847,
      efficiency: 94.5,
      notes: 'Regular maintenance completed. All systems functioning normally.'
    },
    {
      id: '2',
      name: 'CNC Machine 01',
      model: 'CNC-5000X',
      serialNumber: 'CNC567890',
      department: 'Manufacturing',
      location: 'Bay B, Floor 2',
      status: 'maintenance',
      lastMaintenanceDate: '2024-01-08',
      nextMaintenanceDate: '2024-01-22',
      operatingHours: 3652,
      efficiency: 89.2,
      notes: 'Scheduled maintenance in progress. Expected completion: 2 hours.'
    },
    {
      id: '3',
      name: 'QC Station 2',
      model: 'QCS-ULTRA',
      serialNumber: 'QCS998877',
      department: 'Quality Control',
      location: 'QC Lab, Floor 1',
      status: 'operational',
      lastMaintenanceDate: '2024-01-05',
      nextMaintenanceDate: '2024-02-05',
      operatingHours: 1923,
      efficiency: 97.8,
      notes: 'Calibration completed. High precision measurements available.'
    },
    {
      id: '4',
      name: 'Packaging Unit 1',
      model: 'PKG-AUTO-2024',
      serialNumber: 'PKG445566',
      department: 'Packaging',
      location: 'Bay C, Floor 1',
      status: 'setup',
      lastMaintenanceDate: '2024-01-12',
      nextMaintenanceDate: '2024-02-12',
      operatingHours: 756,
      efficiency: 92.1,
      notes: 'New setup configuration for product line changes.'
    }
  ]);

  const [formData, setFormData] = useState<Partial<Machine>>({
    name: '',
    model: '',
    serialNumber: '',
    department: '',
    location: '',
    status: 'operational',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    operatingHours: 0,
    efficiency: 0,
    notes: ''
  });

  const departments = ['Production', 'Manufacturing', 'Quality Control', 'Packaging', 'Assembly'];
  const statuses = ['operational', 'maintenance', 'offline', 'setup'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.model || !formData.serialNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (editingMachine) {
      // Update existing machine
      setMachines(prev => prev.map(machine => 
        machine.id === editingMachine.id 
          ? { ...machine, ...formData } as Machine
          : machine
      ));
      
      toast({
        title: "Machine Updated",
        description: `${formData.name} has been updated successfully.`
      });
    } else {
      // Add new machine
      const newMachine: Machine = {
        id: Date.now().toString(),
        ...formData
      } as Machine;
      
      setMachines(prev => [newMachine, ...prev]);
      
      toast({
        title: "Machine Added",
        description: `${formData.name} has been added successfully.`
      });
    }

    // Reset form
    setFormData({
      name: '',
      model: '',
      serialNumber: '',
      department: '',
      location: '',
      status: 'operational',
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      operatingHours: 0,
      efficiency: 0,
      notes: ''
    });
    setShowAddModal(false);
    setEditingMachine(null);
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData(machine);
    setShowAddModal(true);
  };

  const handleDelete = (machineId: string) => {
    setMachines(prev => prev.filter(machine => machine.id !== machineId));
    toast({
      title: "Machine Deleted",
      description: "The machine has been removed from the system."
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="text-success" size={16} />;
      case 'maintenance':
        return <AlertTriangle className="text-warning" size={16} />;
      case 'offline':
        return <AlertTriangle className="text-destructive" size={16} />;
      case 'setup':
        return <Cog className="text-info" size={16} />;
      default:
        return <Cog className="text-muted-foreground" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-success/10 text-success border-success/20';
      case 'maintenance':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'offline':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'setup':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return 'text-success';
    if (efficiency >= 85) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Machine Setup</h1>
          <p className="text-muted-foreground">
            Manage machine configurations and maintenance schedules
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Machine</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-success mb-1">
            {machines.filter(m => m.status === 'operational').length}
          </div>
          <div className="text-sm text-muted-foreground">Operational</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {machines.filter(m => m.status === 'maintenance').length}
          </div>
          <div className="text-sm text-muted-foreground">In Maintenance</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-destructive mb-1">
            {machines.filter(m => m.status === 'offline').length}
          </div>
          <div className="text-sm text-muted-foreground">Offline</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {Math.round(machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length)}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Efficiency</div>
        </div>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {machines.map((machine) => (
          <div key={machine.id} className="professional-card">
            {/* Machine Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Cog className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold text-foreground">{machine.name}</h3>
                  <p className="text-sm text-muted-foreground">{machine.model}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(machine.status)}`}>
                  {getStatusIcon(machine.status)}
                  <span>{machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}</span>
                </span>
              </div>
            </div>

            {/* Machine Details */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Serial Number:</span>
                  <p className="font-medium text-foreground">{machine.serialNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Department:</span>
                  <p className="font-medium text-foreground">{machine.department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium text-foreground">{machine.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Operating Hours:</span>
                  <p className="font-medium text-foreground">{machine.operatingHours.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Last Maintenance:</span>
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span className="font-medium text-foreground">
                      {new Date(machine.lastMaintenanceDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Next Maintenance:</span>
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span className="font-medium text-foreground">
                      {new Date(machine.nextMaintenanceDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Efficiency</span>
                  <span className={`text-sm font-bold ${getEfficiencyColor(machine.efficiency)}`}>
                    {machine.efficiency}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      machine.efficiency >= 95 ? 'bg-success' :
                      machine.efficiency >= 85 ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ width: `${machine.efficiency}%` }}
                  />
                </div>
              </div>

              {machine.notes && (
                <div className="mt-3 p-3 bg-card-hover rounded-lg">
                  <p className="text-sm text-muted-foreground">{machine.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2 mt-4 pt-4 border-t border-border">
              <button 
                onClick={() => handleEdit(machine)}
                className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => handleDelete(machine.id)}
                className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingMachine ? 'Edit Machine' : 'Add New Machine'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Machine Name *
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
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="form-input"
                    required
                  />
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
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'operational'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Machine['status'] }))}
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
                    Last Maintenance Date
                  </label>
                  <input
                    type="date"
                    value={formData.lastMaintenanceDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenanceDate: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Next Maintenance Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextMaintenanceDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenanceDate: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Operating Hours
                  </label>
                  <input
                    type="number"
                    value={formData.operatingHours || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, operatingHours: parseInt(e.target.value) || 0 }))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Efficiency (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.efficiency || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, efficiency: parseFloat(e.target.value) || 0 }))}
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
                    setEditingMachine(null);
                    setFormData({
                      name: '',
                      model: '',
                      serialNumber: '',
                      department: '',
                      location: '',
                      status: 'operational',
                      lastMaintenanceDate: '',
                      nextMaintenanceDate: '',
                      operatingHours: 0,
                      efficiency: 0,
                      notes: ''
                    });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingMachine ? 'Update Machine' : 'Add Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineSetup;