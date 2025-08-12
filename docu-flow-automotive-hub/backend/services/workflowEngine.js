const FormSubmission = require('../models/FormSubmission');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const notificationService = require('./notificationService');

/**
 * Automated Workflow Engine
 * Handles continuous flow of forms through all approval stages
 */
class WorkflowEngine {
  constructor() {
    this.workflowStages = [
      {
        name: 'Draft',
        nextStage: 'Submitted',
        autoProgress: false, // Manual submission required
        requiredRoles: ['Operator', 'Line Incharge'],
        action: 'submit_form'
      },
      {
        name: 'Submitted',
        nextStage: 'Under Verification',
        autoProgress: true, // Auto-assign to supervisor
        requiredRoles: ['Supervisor', 'Admin'],
        action: 'start_verification',
        autoProgressDelay: 5000 // 5 seconds delay for demo
      },
      {
        name: 'Under Verification',
        nextStage: 'Verified',
        autoProgress: false, // Manual verification required
        requiredRoles: ['Supervisor', 'Admin'],
        action: 'verify_form'
      },
      {
        name: 'Verified',
        nextStage: 'Approved',
        autoProgress: true, // Auto-assign to approver
        requiredRoles: ['Admin', 'Auditor'],
        action: 'start_approval',
        autoProgressDelay: 3000 // 3 seconds delay for demo
      },
      {
        name: 'Approved',
        nextStage: 'Completed',
        autoProgress: true, // Auto-generate audit log and PDF
        requiredRoles: ['System'],
        action: 'complete_workflow',
        autoProgressDelay: 2000 // 2 seconds delay for demo
      },
      {
        name: 'Completed',
        nextStage: null, // Final stage
        autoProgress: false,
        requiredRoles: [],
        action: 'workflow_complete'
      }
    ];
  }

  /**
   * Process form through workflow stages
   * @param {String} submissionId - Form submission ID
   * @param {String} action - Action to perform
   * @param {Object} user - User performing action
   * @param {Object} options - Additional options
   */
  async processWorkflow(submissionId, action, user, options = {}) {
    try {
      const submission = await FormSubmission.findById(submissionId)
        .populate('formTemplate')
        .populate('submittedBy');

      if (!submission) {
        throw new Error('Form submission not found');
      }

      const currentStage = this.getStageByName(submission.status);
      if (!currentStage) {
        throw new Error(`Invalid current stage: ${submission.status}`);
      }

      // Validate user permissions
      if (!this.validateUserPermissions(user, currentStage, action)) {
        throw new Error('Insufficient permissions for this action');
      }

      // Process the action
      const result = await this.executeAction(submission, action, user, options);

      // Auto-progress if configured
      if (result.success && currentStage.autoProgress) {
        setTimeout(async () => {
          await this.autoProgressWorkflow(submissionId);
        }, currentStage.autoProgressDelay || 1000);
      }

      return result;
    } catch (error) {
      console.error('Workflow processing error:', error);
      
      // Log error to audit
      await this.createAuditLog({
        user: user._id,
        action: 'workflow_error',
        description: `Workflow error: ${error.message}`,
        resourceType: 'form_submission',
        resourceId: submissionId,
        resourceModel: 'FormSubmission',
        status: 'failure',
        metadata: { error: error.message, action }
      });

      throw error;
    }
  }

  /**
   * Auto-progress workflow to next stage
   * @param {String} submissionId - Form submission ID
   */
  async autoProgressWorkflow(submissionId) {
    try {
      const submission = await FormSubmission.findById(submissionId);
      if (!submission) return;

      const currentStage = this.getStageByName(submission.status);
      if (!currentStage || !currentStage.nextStage) return;

      const nextStage = this.getStageByName(currentStage.nextStage);
      if (!nextStage) return;

      // Find appropriate user for next stage
      const assignedUser = await this.findUserForStage(nextStage, submission.department);
      
      if (!assignedUser && nextStage.name !== 'Completed') {
        console.log(`No user found for stage ${nextStage.name}, skipping auto-progress`);
        return;
      }

      // Update submission status
      submission.status = nextStage.name;
      
      // Add to approval workflow
      if (nextStage.name !== 'Completed') {
        submission.approvalWorkflow.push({
          step: nextStage.name.toLowerCase().includes('verification') ? 'verification' : 'approval',
          status: 'pending',
          userId: assignedUser ? assignedUser._id : null,
          processedAt: new Date()
        });
      }

      await submission.save();

      // Create audit log
      await this.createAuditLog({
        user: assignedUser ? assignedUser._id : submission.submittedBy._id,
        action: nextStage.action,
        description: `Auto-progressed to ${nextStage.name}: ${submission.title}`,
        resourceType: 'form_submission',
        resourceId: submission._id,
        resourceModel: 'FormSubmission',
        status: 'success',
        department: submission.department,
        metadata: {
          previousStage: currentStage.name,
          newStage: nextStage.name,
          autoProgress: true
        }
      });

      // Send notification
      if (assignedUser) {
        await notificationService.sendWorkflowNotification(assignedUser, submission, nextStage.name);
      }

      // Continue auto-progression if next stage also auto-progresses
      if (nextStage.autoProgress) {
        setTimeout(async () => {
          await this.autoProgressWorkflow(submissionId);
        }, nextStage.autoProgressDelay || 1000);
      }

      console.log(`✅ Auto-progressed form ${submission.submissionId} from ${currentStage.name} to ${nextStage.name}`);

    } catch (error) {
      console.error('Auto-progress error:', error);
    }
  }

  /**
   * Execute specific workflow action
   * @param {Object} submission - Form submission
   * @param {String} action - Action to execute
   * @param {Object} user - User performing action
   * @param {Object} options - Additional options
   */
  async executeAction(submission, action, user, options = {}) {
    const { comments = '' } = options;

    switch (action) {
      case 'submit_form':
        return await this.submitForm(submission, user, comments);
      
      case 'start_verification':
        return await this.startVerification(submission, user, comments);
      
      case 'verify_form':
        return await this.verifyForm(submission, user, comments);
      
      case 'start_approval':
        return await this.startApproval(submission, user, comments);
      
      case 'approve_form':
        return await this.approveForm(submission, user, comments);
      
      case 'reject_form':
        return await this.rejectForm(submission, user, comments);
      
      case 'complete_workflow':
        return await this.completeWorkflow(submission, user);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Submit form for review
   */
  async submitForm(submission, user, comments) {
    submission.status = 'Submitted';
    submission.submittedAt = new Date();
    await submission.save();

    await this.createAuditLog({
      user: user._id,
      action: 'submit_form',
      description: `Submitted form: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      department: submission.department,
      metadata: { comments }
    });

    return { success: true, message: 'Form submitted successfully', data: submission };
  }

  /**
   * Start verification process
   */
  async startVerification(submission, user, comments) {
    submission.status = 'Under Verification';
    
    submission.approvalWorkflow.push({
      step: 'verification',
      status: 'pending',
      userId: user._id,
      comments: comments || 'Verification started',
      processedAt: new Date()
    });

    await submission.save();

    await this.createAuditLog({
      user: user._id,
      action: 'start_verification',
      description: `Started verification: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      department: submission.department,
      metadata: { comments }
    });

    return { success: true, message: 'Verification started', data: submission };
  }

  /**
   * Complete verification
   */
  async verifyForm(submission, user, comments) {
    submission.status = 'Verified';
    
    // Update workflow
    const workflowItem = submission.approvalWorkflow.find(
      item => item.step === 'verification' && item.status === 'pending'
    );
    if (workflowItem) {
      workflowItem.status = 'approved';
      workflowItem.comments = comments || 'Verification completed';
      workflowItem.processedAt = new Date();
    }

    await submission.save();

    await this.createAuditLog({
      user: user._id,
      action: 'verify_form',
      description: `Verified form: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      department: submission.department,
      metadata: { comments }
    });

    return { success: true, message: 'Form verified successfully', data: submission };
  }

  /**
   * Start approval process
   */
  async startApproval(submission, user, comments) {
    submission.approvalWorkflow.push({
      step: 'approval',
      status: 'pending',
      userId: user._id,
      comments: comments || 'Approval started',
      processedAt: new Date()
    });

    await submission.save();

    await this.createAuditLog({
      user: user._id,
      action: 'start_approval',
      description: `Started approval: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      department: submission.department,
      metadata: { comments }
    });

    return { success: true, message: 'Approval started', data: submission };
  }

  /**
   * Approve form
   */
  async approveForm(submission, user, comments) {
    submission.status = 'Approved';
    submission.completedAt = new Date();
    
    // Update workflow
    const workflowItem = submission.approvalWorkflow.find(
      item => item.step === 'approval' && item.status === 'pending'
    );
    if (workflowItem) {
      workflowItem.status = 'approved';
      workflowItem.comments = comments || 'Form approved';
      workflowItem.processedAt = new Date();
    }

    await submission.save();

    await this.createAuditLog({
      user: user._id,
      action: 'approve_form',
      description: `Approved form: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      department: submission.department,
      metadata: { comments }
    });

    return { success: true, message: 'Form approved successfully', data: submission };
  }

  /**
   * Reject form
   */
  async rejectForm(submission, user, comments) {
    submission.status = 'Rejected';
    
    // Update workflow
    const pendingWorkflow = submission.approvalWorkflow.find(
      item => item.status === 'pending'
    );
    if (pendingWorkflow) {
      pendingWorkflow.status = 'rejected';
      pendingWorkflow.comments = comments || 'Form rejected';
      pendingWorkflow.processedAt = new Date();
    }

    await submission.save();

    await this.createAuditLog({
      user: user._id,
      action: 'reject_form',
      description: `Rejected form: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      department: submission.department,
      metadata: { comments, reason: comments }
    });

    return { success: true, message: 'Form rejected', data: submission };
  }

  /**
   * Complete workflow - generate final audit log and PDF
   */
  async completeWorkflow(submission, user) {
    submission.status = 'Completed';
    submission.pdfGenerated = true;
    await submission.save();

    // Generate comprehensive audit log
    await this.createAuditLog({
      user: user ? user._id : submission.submittedBy._id,
      action: 'complete_workflow',
      description: `Workflow completed: ${submission.title}`,
      resourceType: 'form_submission',
      resourceId: submission._id,
      resourceModel: 'FormSubmission',
      status: 'success',
      department: submission.department,
      metadata: {
        workflowSteps: submission.approvalWorkflow.length,
        totalTime: submission.completedAt - submission.submittedAt,
        finalStatus: 'Completed'
      }
    });

    return { success: true, message: 'Workflow completed successfully', data: submission };
  }

  /**
   * Helper methods
   */
  getStageByName(stageName) {
    return this.workflowStages.find(stage => stage.name === stageName);
  }

  validateUserPermissions(user, stage, action) {
    if (!stage.requiredRoles.length) return true;
    return stage.requiredRoles.includes(user.role);
  }

  async findUserForStage(stage, department) {
    if (stage.requiredRoles.length === 0) return null;
    
    const user = await User.findOne({
      role: { $in: stage.requiredRoles },
      department: department,
      isActive: true
    }).sort({ createdAt: 1 }); // Get oldest user (round-robin could be implemented)

    return user;
  }

  async createAuditLog(logData) {
    try {
      await AuditLog.createLog(logData);
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}

module.exports = new WorkflowEngine();
