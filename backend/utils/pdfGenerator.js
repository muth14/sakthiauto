const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate PDF for form submission
 * @param {Object} submission - Form submission object
 * @param {Object} options - PDF generation options
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateFormPDF = async (submission, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create uploads/pdfs directory if it doesn't exist
      const pdfDir = 'uploads/pdfs';
      await fs.mkdir(pdfDir, { recursive: true });

      // Generate filename
      const filename = `form_${submission.submissionId}_${Date.now()}.pdf`;
      const filePath = path.join(pdfDir, filename);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Form Submission - ${submission.title}`,
          Author: 'Sakthi Auto Docs',
          Subject: `Form Submission ${submission.submissionId}`,
          Creator: 'Sakthi Auto Docs System'
        }
      });

      // Pipe to file
      const stream = require('fs').createWriteStream(filePath);
      doc.pipe(stream);

      // Add watermark
      if (options.watermark !== false) {
        addWatermark(doc, process.env.PDF_WATERMARK_TEXT || 'Sakthi Auto Docs - Confidential');
      }

      // Add header
      addHeader(doc, submission);

      // Add form content
      await addFormContent(doc, submission);

      // Add footer
      addFooter(doc, submission);

      // Add approval workflow
      if (submission.approvalWorkflow && submission.approvalWorkflow.length > 0) {
        addApprovalWorkflow(doc, submission);
      }

      // Finalize PDF
      doc.end();

      // Wait for stream to finish
      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Add watermark to PDF
 * @param {PDFDocument} doc - PDF document
 * @param {string} text - Watermark text
 */
const addWatermark = (doc, text) => {
  doc.save();
  
  // Set watermark properties
  doc.fontSize(60)
     .fillColor('gray', 0.1)
     .rotate(-45, { origin: [300, 400] })
     .text(text, 100, 400, {
       align: 'center',
       width: 400
     });
  
  doc.restore();
};

/**
 * Add header to PDF
 * @param {PDFDocument} doc - PDF document
 * @param {Object} submission - Form submission
 */
const addHeader = (doc, submission) => {
  // Company header
  doc.fontSize(20)
     .fillColor('black')
     .text('Sakthi Auto Docs', 50, 50, { align: 'center' });

  doc.fontSize(14)
     .text('Industrial Digital Documentation System', 50, 75, { align: 'center' });

  // Draw line
  doc.moveTo(50, 100)
     .lineTo(545, 100)
     .stroke();

  // Form title
  doc.fontSize(16)
     .text(`Form Submission: ${submission.title}`, 50, 120);

  // Submission details
  doc.fontSize(12)
     .text(`Submission ID: ${submission.submissionId}`, 50, 145)
     .text(`Department: ${submission.department}`, 50, 160)
     .text(`Status: ${submission.status}`, 50, 175)
     .text(`Submitted By: ${submission.submittedBy.firstName} ${submission.submittedBy.lastName}`, 300, 145)
     .text(`Submitted At: ${new Date(submission.submittedAt).toLocaleString()}`, 300, 160)
     .text(`Priority: ${submission.priority}`, 300, 175);

  // Machine/Tool info if available
  let yPos = 190;
  if (submission.machine) {
    doc.text(`Machine: ${submission.machine.name} (${submission.machine.machineId})`, 50, yPos);
    yPos += 15;
  }
  if (submission.tool) {
    doc.text(`Tool: ${submission.tool.name} (${submission.tool.toolId})`, 50, yPos);
    yPos += 15;
  }

  // Draw line
  doc.moveTo(50, yPos + 10)
     .lineTo(545, yPos + 10)
     .stroke();

  return yPos + 25;
};

/**
 * Add form content to PDF
 * @param {PDFDocument} doc - PDF document
 * @param {Object} submission - Form submission
 */
const addFormContent = async (doc, submission) => {
  let yPos = 250;

  // Add sections
  for (const section of submission.sections) {
    // Check if we need a new page
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }

    // Section title
    doc.fontSize(14)
       .fillColor('black')
       .text(section.title, 50, yPos, { underline: true });
    yPos += 25;

    // Section responses
    for (const response of section.responses) {
      // Check if we need a new page
      if (yPos > 720) {
        doc.addPage();
        yPos = 50;
      }

      // Field label
      doc.fontSize(11)
         .fillColor('gray')
         .text(`${response.label}:`, 70, yPos);
      yPos += 15;

      // Field value
      let value = response.value;
      if (Array.isArray(value)) {
        value = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      } else if (value === null || value === undefined) {
        value = 'N/A';
      }

      doc.fontSize(10)
         .fillColor('black')
         .text(String(value), 70, yPos, { width: 450 });
      
      // Calculate text height for proper spacing
      const textHeight = doc.heightOfString(String(value), { width: 450 });
      yPos += Math.max(textHeight, 15) + 10;

      // Add attachments info if any
      if (response.attachments && response.attachments.length > 0) {
        doc.fontSize(9)
           .fillColor('blue')
           .text(`Attachments: ${response.attachments.map(att => att.originalName).join(', ')}`, 70, yPos);
        yPos += 15;
      }

      yPos += 5; // Extra spacing between fields
    }

    yPos += 15; // Extra spacing between sections
  }

  return yPos;
};

/**
 * Add footer to PDF
 * @param {PDFDocument} doc - PDF document
 * @param {Object} submission - Form submission
 */
const addFooter = (doc, submission) => {
  const pageCount = doc.bufferedPageRange().count;
  
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Footer line
    doc.moveTo(50, 750)
       .lineTo(545, 750)
       .stroke();

    // Footer text
    doc.fontSize(8)
       .fillColor('gray')
       .text(`Generated on: ${new Date().toLocaleString()}`, 50, 760)
       .text(`Page ${i + 1} of ${pageCount}`, 450, 760)
       .text('Sakthi Auto Docs - Confidential Document', 50, 775, { align: 'center', width: 495 });
  }
};

/**
 * Add approval workflow to PDF
 * @param {PDFDocument} doc - PDF document
 * @param {Object} submission - Form submission
 */
const addApprovalWorkflow = (doc, submission) => {
  doc.addPage();
  
  // Title
  doc.fontSize(16)
     .fillColor('black')
     .text('Approval Workflow', 50, 50);

  let yPos = 80;

  for (const approval of submission.approvalWorkflow) {
    // Step header
    doc.fontSize(12)
       .text(`${approval.step.charAt(0).toUpperCase() + approval.step.slice(1)}: ${approval.status.toUpperCase()}`, 50, yPos);
    yPos += 20;

    // Details
    doc.fontSize(10)
       .text(`Processed by: ${approval.userId.firstName} ${approval.userId.lastName}`, 70, yPos)
       .text(`Date: ${new Date(approval.processedAt).toLocaleString()}`, 70, yPos + 15);
    yPos += 35;

    // Comments
    if (approval.comments) {
      doc.text('Comments:', 70, yPos)
         .text(approval.comments, 70, yPos + 15, { width: 450 });
      yPos += doc.heightOfString(approval.comments, { width: 450 }) + 30;
    }

    yPos += 10;
  }
};

module.exports = {
  generateFormPDF
};
