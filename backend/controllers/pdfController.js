const { generateFormPDF } = require('../utils/pdfGenerator');
const FormSubmission = require('../models/FormSubmission');
const AuditLog = require('../models/AuditLog');
const fs = require('fs').promises;

/**
 * @desc    Generate PDF for form submission
 * @route   POST /api/pdf/generate/:submissionId
 * @access  Private
 */
exports.generatePDF = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { watermark = true } = req.body;

    // Find submission with populated data
    const submission = await FormSubmission.findById(submissionId)
      .populate('formTemplate', 'title category')
      .populate('submittedBy', 'username firstName lastName')
      .populate('machine', 'machineId name model')
      .populate('tool', 'toolId name type')
      .populate('approvalWorkflow.userId', 'username firstName lastName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check permissions
    const canGenerate = 
      req.user.role === 'Admin' ||
      submission.submittedBy._id.toString() === req.user._id.toString() ||
      (['Supervisor', 'Line Incharge', 'Auditor'].includes(req.user.role) && submission.department === req.user.department);

    if (!canGenerate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot generate PDF for this submission.'
      });
    }

    // Generate PDF
    const pdfPath = await generateFormPDF(submission, { watermark });

    // Update submission with PDF path
    submission.pdfGenerated = true;
    submission.pdfPath = pdfPath;
    await submission.save();

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'generate_pdf',
      description: `Generated PDF for form submission: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: submission.department,
      metadata: {
        pdfPath,
        submissionId: submission.submissionId
      }
    });

    res.status(200).json({
      success: true,
      message: 'PDF generated successfully',
      data: {
        pdfPath,
        submissionId: submission.submissionId,
        downloadUrl: `/api/pdf/download/${submission._id}`
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during PDF generation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Download PDF for form submission
 * @route   GET /api/pdf/download/:submissionId
 * @access  Private
 */
exports.downloadPDF = async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Find submission
    const submission = await FormSubmission.findById(submissionId)
      .populate('submittedBy', 'username firstName lastName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check permissions
    const canDownload = 
      req.user.role === 'Admin' ||
      submission.submittedBy._id.toString() === req.user._id.toString() ||
      (['Supervisor', 'Line Incharge', 'Auditor'].includes(req.user.role) && submission.department === req.user.department);

    if (!canDownload) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot download PDF for this submission.'
      });
    }

    // Check if PDF exists
    if (!submission.pdfGenerated || !submission.pdfPath) {
      return res.status(404).json({
        success: false,
        message: 'PDF not generated for this submission. Please generate it first.'
      });
    }

    // Check if file exists
    try {
      await fs.access(submission.pdfPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server. Please regenerate it.'
      });
    }

    // Get file stats
    const stats = await fs.stat(submission.pdfPath);
    
    // Set headers for download
    const filename = `form_${submission.submissionId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream file
    const fileStream = require('fs').createReadStream(submission.pdfPath);
    fileStream.pipe(res);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'download_pdf',
      description: `Downloaded PDF for form submission: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: submission.department,
      metadata: {
        submissionId: submission.submissionId,
        fileSize: stats.size
      }
    });

  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during PDF download',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    View PDF in browser (inline)
 * @route   GET /api/pdf/view/:submissionId
 * @access  Private
 */
exports.viewPDF = async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Find submission
    const submission = await FormSubmission.findById(submissionId)
      .populate('submittedBy', 'username firstName lastName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check permissions
    const canView = 
      req.user.role === 'Admin' ||
      submission.submittedBy._id.toString() === req.user._id.toString() ||
      (['Supervisor', 'Line Incharge', 'Auditor'].includes(req.user.role) && submission.department === req.user.department);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view PDF for this submission.'
      });
    }

    // Check if PDF exists
    if (!submission.pdfGenerated || !submission.pdfPath) {
      return res.status(404).json({
        success: false,
        message: 'PDF not generated for this submission. Please generate it first.'
      });
    }

    // Check if file exists
    try {
      await fs.access(submission.pdfPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server. Please regenerate it.'
      });
    }

    // Get file stats
    const stats = await fs.stat(submission.pdfPath);
    
    // Set headers for inline viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', 'inline');

    // Stream file
    const fileStream = require('fs').createReadStream(submission.pdfPath);
    fileStream.pipe(res);

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'download_pdf',
      description: `Viewed PDF for form submission: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: submission.department,
      metadata: {
        submissionId: submission.submissionId,
        action: 'view'
      }
    });

  } catch (error) {
    console.error('PDF view error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during PDF viewing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete PDF for form submission
 * @route   DELETE /api/pdf/:submissionId
 * @access  Private (Admin, Supervisor)
 */
exports.deletePDF = async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Find submission
    const submission = await FormSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Check permissions (only Admin and Supervisor can delete PDFs)
    if (!['Admin', 'Supervisor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admin and Supervisor can delete PDFs.'
      });
    }

    // Check department access
    if (req.user.role !== 'Admin' && submission.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete PDFs from your department.'
      });
    }

    // Delete PDF file if it exists
    if (submission.pdfPath) {
      try {
        await fs.unlink(submission.pdfPath);
      } catch (error) {
        console.error('Error deleting PDF file:', error);
        // Continue even if file deletion fails
      }
    }

    // Update submission
    submission.pdfGenerated = false;
    submission.pdfPath = null;
    await submission.save();

    // Create audit log
    await AuditLog.createLog({
      user: req.user._id,
      action: 'delete_file',
      description: `Deleted PDF for form submission: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      department: submission.department,
      metadata: {
        submissionId: submission.submissionId
      }
    });

    res.status(200).json({
      success: true,
      message: 'PDF deleted successfully'
    });
  } catch (error) {
    console.error('PDF deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during PDF deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
