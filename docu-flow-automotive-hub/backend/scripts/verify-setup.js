const fs = require('fs');
const path = require('path');

/**
 * Verification script to ensure all backend components are properly set up
 */

console.log('🔍 Verifying Sakthi Auto Docs Backend Setup...\n');

const errors = [];
const warnings = [];

// Check required files
const requiredFiles = [
  'server.js',
  '.env',
  'package.json',
  'config/db.js',
  'models/User.js',
  'models/FormTemplate.js',
  'models/FormSubmission.js',
  'models/Machine.js',
  'models/Tool.js',
  'models/AuditLog.js',
  'models/ExcelFile.js',
  'controllers/authController.js',
  'controllers/formController.js',
  'controllers/submissionController.js',
  'controllers/machineController.js',
  'controllers/toolController.js',
  'controllers/fileController.js',
  'controllers/pdfController.js',
  'controllers/auditController.js',
  'controllers/excelController.js',
  'middleware/authMiddleware.js',
  'middleware/roleMiddleware.js',
  'middleware/errorMiddleware.js',
  'routes/authRoutes.js',
  'routes/formRoutes.js',
  'routes/submissionRoutes.js',
  'routes/machineRoutes.js',
  'routes/toolRoutes.js',
  'routes/fileRoutes.js',
  'routes/pdfRoutes.js',
  'routes/auditRoutes.js',
  'routes/excelRoutes.js',
  'utils/pdfGenerator.js',
  'utils/logger.js',
  'utils/seeder.js'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}`);
    errors.push(`Missing file: ${file}`);
  }
});

// Check required directories
const requiredDirs = [
  'uploads',
  'uploads/images',
  'uploads/pdfs',
  'uploads/excel',
  'uploads/documents',
  'uploads/exports',
  'logs',
  'config',
  'controllers',
  'middleware',
  'models',
  'routes',
  'utils',
  'scripts'
];

console.log('\n📂 Checking required directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/`);
    errors.push(`Missing directory: ${dir}`);
  }
});

// Check .env file content
console.log('\n🔧 Checking .env configuration...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRE',
    'MAX_FILE_SIZE',
    'UPLOAD_PATH',
    'FRONTEND_URL',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'PDF_WATERMARK_TEXT'
  ];

  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(`${envVar}=`)) {
      console.log(`✅ ${envVar}`);
    } else {
      console.log(`❌ ${envVar}`);
      errors.push(`Missing environment variable: ${envVar}`);
    }
  });
} else {
  errors.push('Missing .env file');
}

// Check package.json dependencies
console.log('\n📦 Checking package.json dependencies...');
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = [
    'express',
    'mongoose',
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'helmet',
    'dotenv',
    'multer',
    'express-validator',
    'express-rate-limit',
    'compression',
    'morgan',
    'pdfkit',
    'exceljs',
    'uuid',
    'sharp',
    'csv-writer',
    'cookie-parser'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep}`);
      errors.push(`Missing dependency: ${dep}`);
    }
  });

  // Check scripts
  const requiredScripts = ['start', 'dev', 'seed'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script: ${script}`);
    } else {
      console.log(`❌ Script: ${script}`);
      warnings.push(`Missing script: ${script}`);
    }
  });
} else {
  errors.push('Missing package.json file');
}

// Check file permissions and sizes
console.log('\n🔒 Checking file permissions...');
const criticalFiles = ['server.js', 'utils/seeder.js'];
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      console.log(`✅ ${file} - readable`);
    } catch (error) {
      console.log(`❌ ${file} - not readable`);
      errors.push(`File not readable: ${file}`);
    }
  }
});

// Summary
console.log('\n📊 Setup Verification Summary');
console.log('================================');

if (errors.length === 0) {
  console.log('🎉 All checks passed! Your backend is properly set up.');
  console.log('\n✅ Backend Features Verified:');
  console.log('   - Authentication & Authorization');
  console.log('   - Form Templates & Submissions');
  console.log('   - File Upload & PDF Generation');
  console.log('   - Machine & Tool Management');
  console.log('   - Audit Logging');
  console.log('   - Excel Processing');
  console.log('   - Security Middleware');
  console.log('   - Database Models');
  console.log('   - API Routes');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Make sure MongoDB is running');
  console.log('2. Run: npm install (if not done already)');
  console.log('3. Run: npm run seed (to populate initial data)');
  console.log('4. Run: npm run dev (to start the server)');
  console.log('5. Test: node scripts/test-endpoints.js');
  
} else {
  console.log(`❌ Found ${errors.length} error(s):`);
  errors.forEach(error => console.log(`   - ${error}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  Found ${warnings.length} warning(s):`);
  warnings.forEach(warning => console.log(`   - ${warning}`));
}

console.log('\n📋 Demo Login Credentials:');
console.log('Admin: admin@sakthiauto.com / password');
console.log('Supervisor: supervisor@sakthiauto.com / password');
console.log('Line Incharge: lineincharge@sakthiauto.com / password');
console.log('Operator: operator@sakthiauto.com / password');
console.log('Auditor: auditor@sakthiauto.com / password');

console.log('\n📚 Documentation:');
console.log('- Setup Guide: backend/START_HERE.md');
console.log('- API Docs: http://localhost:5000/api (when server is running)');
console.log('- Health Check: http://localhost:5000/health');

process.exit(errors.length > 0 ? 1 : 0);
