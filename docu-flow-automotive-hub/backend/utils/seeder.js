const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const FormTemplate = require('../models/FormTemplate');
const Machine = require('../models/Machine');
const Tool = require('../models/Tool');

/**
 * Connect to database
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Seed users
 */
const seedUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('👥 Users already exist, skipping user seeding');
      return;
    }

    const users = [
      {
        username: 'admin',
        email: 'admin@sakthiauto.com',
        password: await bcrypt.hash('password', 12),
        firstName: 'System',
        lastName: 'Administrator',
        role: 'Admin',
        department: 'IT',
        employeeId: 'EMP001',
        isActive: true
      },
      {
        username: 'supervisor',
        email: 'supervisor@sakthiauto.com',
        password: await bcrypt.hash('password', 12),
        firstName: 'John',
        lastName: 'Supervisor',
        role: 'Supervisor',
        department: 'Production',
        employeeId: 'EMP002',
        isActive: true
      },
      {
        username: 'lineincharge',
        email: 'lineincharge@sakthiauto.com',
        password: await bcrypt.hash('password', 12),
        firstName: 'Mike',
        lastName: 'Line Incharge',
        role: 'Line Incharge',
        department: 'Assembly',
        employeeId: 'EMP003',
        isActive: true
      },
      {
        username: 'operator',
        email: 'operator@sakthiauto.com',
        password: await bcrypt.hash('password', 12),
        firstName: 'Sarah',
        lastName: 'Operator',
        role: 'Operator',
        department: 'Quality Control',
        employeeId: 'EMP004',
        isActive: true
      },
      {
        username: 'auditor',
        email: 'auditor@sakthiauto.com',
        password: await bcrypt.hash('password', 12),
        firstName: 'David',
        lastName: 'Auditor',
        role: 'Auditor',
        department: 'Compliance',
        employeeId: 'EMP005',
        isActive: true
      }
    ];

    await User.insertMany(users);
    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

/**
 * Seed sample machines
 */
const seedMachines = async () => {
  try {
    const existingMachines = await Machine.countDocuments();
    if (existingMachines > 0) {
      console.log('🔧 Machines already exist, skipping machine seeding');
      return;
    }

    const admin = await User.findOne({ role: 'Admin' });
    
    const machines = [
      {
        machineId: 'MCH001',
        name: 'CNC Milling Machine',
        model: 'VMC-850',
        manufacturer: 'Haas Automation',
        serialNumber: 'HAS001234',
        department: 'Production',
        location: 'Shop Floor A',
        installationDate: new Date('2023-01-15'),
        warrantyExpiry: new Date('2026-01-15'),
        status: 'Active',
        specifications: {
          'Max Spindle Speed': '8000 RPM',
          'Table Size': '850 x 400 mm',
          'Power Rating': '15 kW'
        },
        createdBy: admin._id
      },
      {
        machineId: 'MCH002',
        name: 'Hydraulic Press',
        model: 'HP-500',
        manufacturer: 'Schuler',
        serialNumber: 'SCH002345',
        department: 'Assembly',
        location: 'Shop Floor B',
        installationDate: new Date('2022-08-20'),
        status: 'Active',
        specifications: {
          'Max Force': '500 Tons',
          'Bed Size': '1200 x 800 mm',
          'Power Rating': '25 kW'
        },
        createdBy: admin._id
      }
    ];

    await Machine.insertMany(machines);
    console.log('✅ Machines seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding machines:', error);
  }
};

/**
 * Seed sample tools
 */
const seedTools = async () => {
  try {
    const existingTools = await Tool.countDocuments();
    if (existingTools > 0) {
      console.log('🔨 Tools already exist, skipping tool seeding');
      return;
    }

    const admin = await User.findOne({ role: 'Admin' });
    
    const tools = [
      {
        toolId: 'TL001',
        name: 'Digital Caliper',
        type: 'Measuring',
        material: 'Stainless Steel',
        manufacturer: 'Mitutoyo',
        model: 'CD-6"CSX',
        serialNumber: 'MIT001234',
        department: 'Quality Control',
        location: 'QC Lab',
        purchaseDate: new Date('2023-03-10'),
        cost: 150.00,
        calibrationRequired: true,
        calibrationFrequency: 'Annual',
        status: 'Available',
        condition: 'Excellent',
        createdBy: admin._id
      },
      {
        toolId: 'TL002',
        name: 'End Mill Cutter',
        type: 'Cutting',
        material: 'Carbide',
        manufacturer: 'Sandvik',
        department: 'Production',
        location: 'Tool Crib',
        purchaseDate: new Date('2023-02-15'),
        cost: 85.00,
        calibrationRequired: false,
        status: 'Available',
        condition: 'Good',
        createdBy: admin._id
      }
    ];

    await Tool.insertMany(tools);
    console.log('✅ Tools seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding tools:', error);
  }
};

/**
 * Seed sample form template
 */
const seedFormTemplates = async () => {
  try {
    const existingTemplates = await FormTemplate.countDocuments();
    if (existingTemplates > 0) {
      console.log('📋 Form templates already exist, skipping template seeding');
      return;
    }

    const admin = await User.findOne({ role: 'Admin' });
    
    const template = {
      title: 'Daily Machine Inspection',
      description: 'Daily inspection checklist for production machines',
      department: 'Production',
      category: 'Inspection',
      version: 1,
      isActive: true,
      sections: [
        {
          sectionId: 'sec1',
          title: 'Basic Information',
          description: 'General machine information',
          order: 1,
          fields: [
            {
              fieldId: 'machine_id',
              label: 'Machine ID',
              type: 'text',
              required: true,
              order: 1
            },
            {
              fieldId: 'inspection_date',
              label: 'Inspection Date',
              type: 'date',
              required: true,
              order: 2
            },
            {
              fieldId: 'shift',
              label: 'Shift',
              type: 'dropdown',
              required: true,
              options: ['Day Shift', 'Night Shift'],
              order: 3
            }
          ]
        },
        {
          sectionId: 'sec2',
          title: 'Visual Inspection',
          description: 'Visual checks and observations',
          order: 2,
          fields: [
            {
              fieldId: 'overall_condition',
              label: 'Overall Machine Condition',
              type: 'dropdown',
              required: true,
              options: ['Excellent', 'Good', 'Fair', 'Poor'],
              order: 1
            },
            {
              fieldId: 'cleanliness',
              label: 'Machine Cleanliness',
              type: 'dropdown',
              required: true,
              options: ['Clean', 'Needs Cleaning', 'Dirty'],
              order: 2
            },
            {
              fieldId: 'observations',
              label: 'Additional Observations',
              type: 'textarea',
              required: false,
              order: 3
            }
          ]
        }
      ],
      createdBy: admin._id,
      approvedBy: admin._id,
      approvedAt: new Date()
    };

    await FormTemplate.create(template);
    console.log('✅ Form templates seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding form templates:', error);
  }
};

/**
 * Main seeder function
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    
    await seedUsers();
    await seedMachines();
    await seedTools();
    await seedFormTemplates();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('Admin: admin@sakthiauto.com / password');
    console.log('Supervisor: supervisor@sakthiauto.com / password');
    console.log('Line Incharge: lineincharge@sakthiauto.com / password');
    console.log('Operator: operator@sakthiauto.com / password');
    console.log('Auditor: auditor@sakthiauto.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
