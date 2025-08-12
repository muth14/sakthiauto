import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Trash2, Download, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  department: string;
  machine?: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  rowCount?: number;
}

const ExcelUpload: React.FC = () => {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'Production_Data_January.xlsx',
      department: 'Production',
      machine: 'Assembly Line A1',
      uploadedBy: 'John Supervisor',
      uploadedAt: '2024-01-15T10:30:00Z',
      size: '2.4 MB',
      status: 'completed',
      rowCount: 1250
    },
    {
      id: '2',
      name: 'Quality_Control_Reports.xlsx',
      department: 'Quality Control',
      uploadedBy: 'Sarah QC Manager',
      uploadedAt: '2024-01-14T14:20:00Z',
      size: '1.8 MB',
      status: 'completed',
      rowCount: 890
    },
    {
      id: '3',
      name: 'Maintenance_Logs_December.xlsx',
      department: 'Maintenance',
      machine: 'CNC Machine 02',
      uploadedBy: 'Mike Technician',
      uploadedAt: '2024-01-13T09:15:00Z',
      size: '3.2 MB',
      status: 'processing'
    }
  ]);

  const departments = ['Production', 'Quality Control', 'Maintenance', 'Safety', 'Assembly'];
  const machines = [
    'Assembly Line A1', 'Assembly Line A2', 'CNC Machine 01', 'CNC Machine 02',
    'QC Station 1', 'QC Station 2', 'Packaging Unit 1', 'Packaging Unit 2'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select Excel files to upload.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDepartment) {
      toast({
        title: "Department required",
        description: "Please select a department for the upload.",
        variant: "destructive"
      });
      return;
    }

    // Simulate file upload
    Array.from(selectedFiles).forEach((file) => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        department: selectedDepartment,
        machine: selectedMachine || undefined,
        uploadedBy: user?.name || 'Unknown',
        uploadedAt: new Date().toISOString(),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status: 'processing'
      };

      setUploadedFiles(prev => [newFile, ...prev]);

      // Simulate processing completion
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { ...f, status: 'completed', rowCount: Math.floor(Math.random() * 2000) + 100 }
            : f
        ));
        
        toast({
          title: "Upload completed",
          description: `${file.name} has been processed successfully.`
        });
      }, 3000);
    });

    // Reset form
    setSelectedFiles(null);
    setSelectedDepartment('');
    setSelectedMachine('');
    
    toast({
      title: "Upload started",
      description: `${selectedFiles.length} file(s) are being processed.`
    });
  };

  const handleDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "File deleted",
      description: "The file has been removed from the system."
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-success" size={16} />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-warning/30 border-t-warning rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="text-destructive" size={16} />;
      default:
        return <FileSpreadsheet className="text-muted-foreground" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'processing':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Excel Upload</h1>
          <p className="text-muted-foreground">
            Upload existing Excel files for digital documentation
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {uploadedFiles.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Files</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-success mb-1">
            {uploadedFiles.filter(f => f.status === 'completed').length}
          </div>
          <div className="text-sm text-muted-foreground">Processed</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {uploadedFiles.filter(f => f.status === 'processing').length}
          </div>
          <div className="text-sm text-muted-foreground">Processing</div>
        </div>
        <div className="professional-card text-center">
          <div className="text-2xl font-bold text-info mb-1">
            {uploadedFiles.reduce((sum, f) => sum + (f.rowCount || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Records</div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="professional-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upload New Files</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Department *
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="form-input"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Machine (Optional)
            </label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
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
              Excel Files *
            </label>
            <input
              type="file"
              multiple
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="form-input"
              required
            />
          </div>
        </div>

        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-2">Selected Files:</p>
            <div className="space-y-1">
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="text-sm text-muted-foreground flex items-center space-x-2">
                  <FileSpreadsheet size={14} />
                  <span>{file.name}</span>
                  <span>({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFiles || selectedFiles.length === 0 || !selectedDepartment}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={16} />
          <span>Upload Files</span>
        </button>
      </div>

      {/* Uploaded Files List */}
      <div className="professional-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Uploaded Files</h3>
        
        <div className="space-y-4">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileSpreadsheet className="text-primary" size={20} />
                    <h4 className="font-semibold text-foreground">{file.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(file.status)}`}>
                      {getStatusIcon(file.status)}
                      <span>{file.status.charAt(0).toUpperCase() + file.status.slice(1)}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-2">
                    <div>
                      <span className="font-medium">Department:</span> {file.department}
                    </div>
                    {file.machine && (
                      <div>
                        <span className="font-medium">Machine:</span> {file.machine}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Size:</span> {file.size}
                    </div>
                    {file.rowCount && (
                      <div>
                        <span className="font-medium">Records:</span> {file.rowCount.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Uploaded by {file.uploadedBy} on {new Date(file.uploadedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  File ID: {file.id}
                </div>
                
                <div className="flex space-x-2">
                  {file.status === 'completed' && (
                    <>
                      <button className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1">
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>
                      <button className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1">
                        <Download size={14} />
                        <span>Download</span>
                      </button>
                    </>
                  )}
                  
                  {file.status !== 'processing' && (
                    <button 
                      onClick={() => handleDelete(file.id)}
                      className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {uploadedFiles.length === 0 && (
          <div className="text-center py-12">
            <Upload className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">No files uploaded yet</h3>
            <p className="text-muted-foreground">
              Upload your first Excel file to get started with digital documentation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;