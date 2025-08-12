const mongoose = require('mongoose');
const FormSubmission = require('../models/FormSubmission');
const FormTemplate = require('../models/FormTemplate');
const User = require('../models/User');
const workflowEngine = require('../services/workflowEngine');
require('dotenv').config();

/**
 * Test script to demonstrate automated workflow
 * Creates sample forms and processes them through the workflow
 */

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sakthi-auto-docs');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createSampleUsers() {
  try {
    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('✅ Users already exist, skipping creation');
      return existingUsers;
    }

    const sampleUsers = [
      {
        firstName: 'John',
        lastName: 'Operator',
        email: 'operator@sakthiauto.com',
        password: 'password123',
        role: 'Operator',
        department: 'Production',
        isActive: true
      },
      {
        firstName: 'Jane',
        lastName: 'Supervisor',
        email: 'supervisor@sakthiauto.com',
        password: 'password123',
        role: 'Supervisor',
        department: 'Production',
        isActive: true
      },
      {
        firstName: 'Mike',
        lastName: 'Admin',
        email: 'admin@sakthiauto.com',
        password: 'password123',
        role: 'Admin',
        department: 'Management',
        isActive: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Auditor',
        email: 'auditor@sakthiauto.com',
        password: 'password123',
        role: 'Auditor',
        department: 'Quality',
        isActive: true
      }
    ];

    const users = await User.insertMany(sampleUsers);
    console.log('✅ Created sample users');
    return users;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    return [];
  }
}

async function createSampleFormTemplate(users) {
  try {
    // Check if template already exists
    let template = await FormTemplate.findOne({ title: 'Quality Inspection Form' });
    if (template) {
      console.log('✅ Form template already exists');
      return template;
    }

    const admin = users.find(u => u.role === 'Admin') || users[0];
    if (!admin) {
      console.log('❌ No admin user found');
      return null;
    }

    template = new FormTemplate({
      title: 'Quality Inspection Form',
      description: 'Standard quality inspection checklist for production items',
      category: 'Quality Control',
      department: 'Production',
      fields: [
        {
          id: 'item_id',
          type: 'text',
          label: 'Item ID',
          required: true,
          placeholder: 'Enter item identification number'
        },
        {
          id: 'inspection_date',
          type: 'date',
          label: 'Inspection Date',
          required: true
        },
        {
          id: 'quality_check',
          type: 'select',
          label: 'Quality Status',
          required: true,
          options: ['Pass', 'Fail', 'Needs Review']
        },
        {
          id: 'comments',
          type: 'textarea',
          label: 'Comments',
          required: false,
          placeholder: 'Additional notes or observations'
        }
      ],
      createdBy: admin._id,
      isActive: true
    });

    await template.save();
    console.log('✅ Created sample form template');
    return template;
  } catch (error) {
    console.error('❌ Error creating form template:', error);
    return null;
  }
}

async function createSampleFormSubmissions(users, template) {
  try {
    const operator = users.find(u => u.role === 'Operator');
    if (!operator || !template) {
      console.log('❌ Missing operator or template');
      return [];
    }

    const sampleSubmissions = [
      {
        title: 'Engine Block QC - Batch #001',
        formTemplate: template._id,
        submittedBy: operator._id,
        department: 'Production',
        status: 'Draft',
        formData: {
          item_id: 'ENG-001-2024',
          inspection_date: new Date().toISOString().split('T')[0],
          quality_check: 'Pass',
          comments: 'All specifications met, ready for assembly'
        },
        submissionId: `SUB-${Date.now()}-001`,
        approvalWorkflow: []
      },
      {
        title: 'Transmission QC - Batch #002',
        formTemplate: template._id,
        submittedBy: operator._id,
        department: 'Production',
        status: 'Draft',
        formData: {
          item_id: 'TRN-002-2024',
          inspection_date: new Date().toISOString().split('T')[0],
          quality_check: 'Needs Review',
          comments: 'Minor surface imperfection detected, requires supervisor review'
        },
        submissionId: `SUB-${Date.now()}-002`,
        approvalWorkflow: []
      },
      {
        title: 'Brake System QC - Batch #003',
        formTemplate: template._id,
        submittedBy: operator._id,
        department: 'Production',
        status: 'Draft',
        formData: {
          item_id: 'BRK-003-2024',
          inspection_date: new Date().toISOString().split('T')[0],
          quality_check: 'Pass',
          comments: 'Excellent quality, exceeds standards'
        },
        submissionId: `SUB-${Date.now()}-003`,
        approvalWorkflow: []
      }
    ];

    const submissions = await FormSubmission.insertMany(sampleSubmissions);
    console.log('✅ Created sample form submissions');
    return submissions;
  } catch (error) {
    console.error('❌ Error creating form submissions:', error);
    return [];
  }
}

async function demonstrateAutomatedWorkflow(submissions, users) {
  try {
    const operator = users.find(u => u.role === 'Operator');
    if (!operator || submissions.length === 0) {
      console.log('❌ Missing operator or submissions');
      return;
    }

    console.log('\n🚀 Starting Automated Workflow Demonstration...\n');

    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i];
      console.log(`📋 Processing: ${submission.title}`);
      
      try {
        // Step 1: Submit the form (this will trigger the automated workflow)
        console.log('  ⏳ Step 1: Submitting form...');
        const result = await workflowEngine.processWorkflow(
          submission._id,
          'submit_form',
          operator,
          { comments: 'Automated submission for testing' }
        );
        
        if (result.success) {
          console.log('  ✅ Step 1: Form submitted successfully');
          console.log('  🔄 Automated workflow will now take over...');
          console.log('  📧 Notifications sent to relevant users');
          console.log('  ⚡ Auto-progression enabled\n');
        } else {
          console.log('  ❌ Step 1: Failed to submit form');
        }

        // Add delay between submissions to see the progression
        if (i < submissions.length - 1) {
          console.log('  ⏱️  Waiting 3 seconds before next submission...\n');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${submission.title}:`, error.message);
      }
    }

    console.log('🎉 Automated Workflow Demonstration Complete!');
    console.log('\n📊 What happens next:');
    console.log('  • Forms automatically progress through approval stages');
    console.log('  • Supervisors receive notifications for verification');
    console.log('  • Admins receive notifications for final approval');
    console.log('  • Audit logs are automatically generated');
    console.log('  • PDFs are created upon completion');
    console.log('\n🌐 Check the dashboard at: http://localhost:8080');
    console.log('  • Click "🚀 Automated Workflow" tab to see real-time progress');
    console.log('  • Navigate to "Form Submissions" to manage workflows');

  } catch (error) {
    console.error('❌ Error in workflow demonstration:', error);
  }
}

async function main() {
  console.log('🚀 Sakthi Auto Docs - Automated Workflow Test\n');
  
  await connectDB();
  
  console.log('📝 Setting up test data...');
  const users = await createSampleUsers();
  const template = await createSampleFormTemplate(users);
  const submissions = await createSampleFormSubmissions(users, template);
  
  console.log('✅ Test data setup complete\n');
  
  await demonstrateAutomatedWorkflow(submissions, users);
  
  console.log('\n🔚 Test completed. Database connection will remain open for the workflow to continue.');
  console.log('   Press Ctrl+C to exit when you\'re done testing.\n');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down test script...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

// Run the test
main().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});
