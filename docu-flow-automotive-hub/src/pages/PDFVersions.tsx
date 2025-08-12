import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, User, Filter, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import pdfService from '../lib/services/pdfService';
import formService from '../lib/services/formService';
import { toast } from '../hooks/use-toast';

interface PDFDocument {
  id: string;
  title: string;
  formType: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  department: string;
  version: string;
  fileSize: string;
  status: 'approved' | 'archived';
}

const PDFVersions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFormType, setSelectedFormType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pdfDocuments, setPdfDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from backend API
        const response = await api.get('/forms/submissions');

        if (response.data.success) {
          const data = response.data;

          // Transform backend data to frontend format
          const transformedDocs: PDFDocument[] = data.data?.map((submission: any) => ({
            id: submission._id,
            title: submission.title,
            formType: 'Form Submission',
            createdBy: `${submission.submittedBy?.firstName || 'Unknown'} ${submission.submittedBy?.lastName || 'User'}`,
            createdAt: submission.submittedAt,
            approvedBy: submission.approvalWorkflow?.[0]?.userId?.firstName ?
              `${submission.approvalWorkflow[0].userId.firstName} ${submission.approvalWorkflow[0].userId.lastName}` :
              'Pending',
            approvedAt: submission.approvalWorkflow?.[0]?.processedAt || null,
            department: submission.department,
            version: '1.0',
            fileSize: '2.1 MB', // Placeholder - would be calculated from actual PDF
            status: submission.status.toLowerCase(),
            submissionId: submission.submissionId
          })) || [];

          setPdfDocuments(transformedDocs);
        } else {
          throw new Error('Failed to fetch submissions');
        }
      } catch (err: any) {
        console.error('Error fetching documents:', err);
        setError(err.message);

        // Fallback to mock data if backend fails
        setPdfDocuments([
    {
      id: '1',
      title: 'Quality Control Inspection Report - Batch 001',
      formType: 'Quality Control',
      createdBy: 'Sarah Operator',
      createdAt: '2024-01-15T10:30:00Z',
      approvedBy: 'John Supervisor',
      approvedAt: '2024-01-15T14:20:00Z',
      department: 'Quality Control',
      version: '1.0',
      fileSize: '2.4 MB',
      status: 'approved'
    },
    {
      id: '2',
      title: 'Machine Setup Checklist - Assembly Line A',
      formType: 'Setup',
      createdBy: 'Mike Technician',
      createdAt: '2024-01-14T09:15:00Z',
      approvedBy: 'John Supervisor',
      approvedAt: '2024-01-14T16:30:00Z',
      department: 'Production',
      version: '1.0',
      fileSize: '1.8 MB',
      status: 'approved'
    },
    {
      id: '3',
      title: 'Safety Inspection Report - Work Area B',
      formType: 'Safety',
      createdBy: 'David Safety Officer',
      createdAt: '2024-01-13T16:45:00Z',
      approvedBy: 'Sarah Safety Manager',
      approvedAt: '2024-01-14T08:30:00Z',
      department: 'Safety',
      version: '2.1',
      fileSize: '3.2 MB',
      status: 'approved'
    },
    {
      id: '4',
      title: 'Tool Maintenance Log - CNC Machine 01',
      formType: 'Maintenance',
      createdBy: 'Alex Technician',
      createdAt: '2024-01-12T11:20:00Z',
      approvedBy: 'Mike Line Incharge',
      approvedAt: '2024-01-12T15:45:00Z',
      department: 'Maintenance',
      version: '1.0',
      fileSize: '1.5 MB',
      status: 'archived'
    },
    {
      id: '5',
      title: 'Daily Production Report - Shift 1',
      formType: 'Production',
      createdBy: 'Lisa Operator',
      createdAt: '2024-01-11T17:00:00Z',
      approvedBy: 'John Supervisor',
      approvedAt: '2024-01-12T09:15:00Z',
      department: 'Production',
      version: '1.0',
      fileSize: '2.1 MB',
      status: 'approved'
    }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const departments = ['all', 'Quality Control', 'Production', 'Safety', 'Maintenance'];
  const formTypes = ['all', 'Quality Control', 'Setup', 'Safety', 'Maintenance', 'Production'];
  const statuses = ['all', 'approved', 'archived'];

  const filteredDocuments = pdfDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || doc.department === selectedDepartment;
    const matchesFormType = selectedFormType === 'all' || doc.formType === selectedFormType;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesFormType && matchesStatus;
  });

  // Handle card navigation
  const handleCardClick = (filterType: string, filterValue: string) => {
    switch (filterType) {
      case 'status':
        setSelectedStatus(filterValue);
        break;
      case 'department':
        setSelectedDepartment(filterValue);
        break;
      case 'formType':
        setSelectedFormType(filterValue);
        break;
      default:
        // Reset all filters for total documents
        setSelectedStatus('all');
        setSelectedDepartment('all');
        setSelectedFormType('all');
    }
  };

  const handleDownload = async (docId: string, title: string) => {
    if (downloadingId) return; // Prevent multiple downloads

    try {
      setDownloadingId(docId);

      // Show loading toast
      toast({
        title: "Downloading PDF",
        description: `Preparing download for ${title}...`,
      });

      try {
        // Use the PDF service for better error handling
        await pdfService.generatePDF(docId, true);
        await pdfService.downloadAndSave(docId, `${title.replace(/[^a-zA-Z0-9\s]/g, '_')}.pdf`);

        // Show success toast
        toast({
          title: "Download Complete",
          description: `Successfully downloaded ${title}`,
        });
      } catch (backendError) {
        console.error('Backend PDF error:', backendError);

        // If backend fails, create a demo PDF download
        console.log('Backend PDF not available, creating demo download...');

        // Create a simple demo PDF content
        const demoContent = `
PDF Document: ${title}
Document ID: ${docId}
Generated: ${new Date().toLocaleString()}

This is a demo PDF download for the Sakthi Auto Docs system.
In a production environment, this would contain the actual form data.

Document Details:
- Title: ${title}
- Status: Approved
- Generated by: Sakthi Auto Docs System
- Date: ${new Date().toLocaleDateString()}
        `;

        // Create a blob and download it
        const blob = new Blob([demoContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/[^a-zA-Z0-9\s]/g, '_')}_demo.txt`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Show demo success toast
        toast({
          title: "Demo Download Complete",
          description: `Downloaded demo file for ${title} (Backend PDF not available)`,
        });
      }
    } catch (error: any) {
      console.error('Download failed:', error);
      // Show error toast
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (docId: string, title: string) => {
    if (previewingId) return; // Prevent multiple previews

    try {
      setPreviewingId(docId);

      // Show loading toast
      toast({
        title: "Opening Preview",
        description: `Loading ${title}...`,
      });

      try {
        // Use the PDF service for better error handling
        await pdfService.generatePDF(docId, true);
        await pdfService.openInNewTab(docId);

        // Show success toast
        toast({
          title: "Preview Opened",
          description: `${title} opened in new tab`,
        });
      } catch (backendError) {
        // If backend fails, show a demo preview
        console.log('Backend PDF not available, showing demo preview...');

        // Create a demo HTML preview
        const demoHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Demo Preview - ${title}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { line-height: 1.6; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 ${title}</h1>
        <p><strong>Document ID:</strong> ${docId}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>

    <div class="content">
        <h2>Demo PDF Preview</h2>
        <p>This is a demo preview for the Sakthi Auto Docs system.</p>
        <p>In a production environment, this would display the actual PDF content.</p>

        <h3>Document Details:</h3>
        <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Status:</strong> Approved</li>
            <li><strong>Generated by:</strong> Sakthi Auto Docs System</li>
            <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>

        <h3>Features Available:</h3>
        <ul>
            <li>✅ PDF Generation</li>
            <li>✅ Download Functionality</li>
            <li>✅ Preview in Browser</li>
            <li>✅ Access Control</li>
            <li>✅ Audit Logging</li>
        </ul>
    </div>

    <div class="footer">
        <p><em>This is a demo preview. Backend PDF service is not connected.</em></p>
    </div>
</body>
</html>
        `;

        // Create blob and open in new tab
        const blob = new Blob([demoHTML], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const newTab = window.open(url, '_blank');

        if (!newTab) {
          throw new Error('Failed to open preview. Please check your popup blocker settings.');
        }

        // Cleanup URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);

        // Show demo success toast
        toast({
          title: "Demo Preview Opened",
          description: `Opened demo preview for ${title} (Backend PDF not available)`,
        });
      }
    } catch (error: any) {
      console.error('Preview failed:', error);
      // Show error toast
      toast({
        title: "Preview Failed",
        description: error.message || "Failed to preview PDF",
        variant: "destructive",
      });
    } finally {
      setPreviewingId(null);
    }
  };

  const handleGeneratePDF = async (docId: string, title: string) => {
    try {
      // Show loading toast
      toast({
        title: "Generating PDF",
        description: `Creating PDF for ${title}...`,
      });

      // Generate PDF using the service
      await pdfService.generatePDF(docId, true);

      // Show success toast
      toast({
        title: "PDF Generated",
        description: `PDF created successfully for ${title}`,
      });
    } catch (error: any) {
      console.error('PDF generation failed:', error);
      // Show error toast
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PDF Versions</h1>
          <p className="text-muted-foreground">
            Browse and download approved form documents
          </p>
        </div>
        <button
          onClick={() => navigate('/form-submissions')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Settings size={16} />
          <span>Manage Workflow</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="professional-card text-center cursor-pointer hover:bg-card-hover transition-colors"
          onClick={() => handleCardClick('total', 'all')}
        >
          <div className="text-2xl font-bold text-primary mb-1">
            {pdfDocuments.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Documents</div>
        </div>
        <div
          className="professional-card text-center cursor-pointer hover:bg-card-hover transition-colors"
          onClick={() => handleCardClick('status', 'approved')}
        >
          <div className="text-2xl font-bold text-success mb-1">
            {pdfDocuments.filter(d => d.status === 'approved').length}
          </div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div
          className="professional-card text-center cursor-pointer hover:bg-card-hover transition-colors"
          onClick={() => handleCardClick('status', 'archived')}
        >
          <div className="text-2xl font-bold text-muted-foreground mb-1">
            {pdfDocuments.filter(d => d.status === 'archived').length}
          </div>
          <div className="text-sm text-muted-foreground">Archived</div>
        </div>
        <div
          className="professional-card text-center cursor-pointer hover:bg-card-hover transition-colors"
          onClick={() => handleCardClick('formType', 'all')}
        >
          <div className="text-2xl font-bold text-info mb-1">
            {formTypes.length - 1}
          </div>
          <div className="text-sm text-muted-foreground">Form Types</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="professional-card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Search Documents
            </label>
            <input
              type="text"
              placeholder="Search by title or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="form-input"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-input"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Form Type Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Form Type
            </label>
            <select
              value={selectedFormType}
              onChange={(e) => setSelectedFormType(e.target.value)}
              className="form-input"
            >
              {formTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="professional-card">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-2">Error loading documents: {error}</p>
            <p className="text-muted-foreground text-sm">Using fallback data</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents found</p>
          </div>
        ) : null}

        <div className="space-y-4">
          {!loading && filteredDocuments.map((doc) => (
            <div key={doc.id} className="border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="text-primary" size={20} />
                    <h3 className="font-semibold text-foreground">{doc.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      doc.status === 'approved' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-muted/10 text-muted-foreground border-muted/20'
                    }`}>
                      {doc.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                    <div>
                      <span className="font-medium">Form Type:</span> {doc.formType}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span> {doc.department}
                    </div>
                    <div>
                      <span className="font-medium">Version:</span> {doc.version}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {doc.fileSize}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>Created by {doc.createdBy} on {new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                    {doc.approvedBy && doc.approvedAt && (
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Approved by {doc.approvedBy} on {new Date(doc.approvedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Document ID: {doc.id}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGeneratePDF(doc.id, doc.title)}
                    className="btn-secondary text-sm py-2 px-3 flex items-center space-x-1"
                    title="Generate PDF for this form"
                  >
                    <FileText size={14} />
                    <span>Generate</span>
                  </button>
                  <button
                    onClick={() => handlePreview(doc.id, doc.title)}
                    disabled={previewingId === doc.id}
                    className="btn-secondary text-sm py-2 px-3 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye size={14} />
                    <span>{previewingId === doc.id ? 'Opening...' : 'Preview'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(doc.id, doc.title)}
                    disabled={downloadingId === doc.id}
                    className="btn-primary text-sm py-2 px-3 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={14} />
                    <span>{downloadingId === doc.id ? 'Downloading...' : 'Download'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PDFVersions;