const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Setup script for Sakthi Auto Docs Backend
 */

console.log('🚀 Setting up Sakthi Auto Docs Backend...\n');

// Check if required directories exist
const requiredDirs = [
  'uploads',
  'uploads/images',
  'uploads/pdfs',
  'uploads/excel',
  'uploads/documents',
  'uploads/exports',
  'logs'
];

console.log('📁 Creating required directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✓ Directory exists: ${dir}`);
  }
});

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n❌ .env file not found!');
  console.log('Please create a .env file in the backend directory with the following variables:');
  console.log(`
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sakthi_auto_docs

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=30d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# PDF Configuration
PDF_WATERMARK_TEXT=Sakthi Auto Docs - Confidential

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=http://localhost:3000
  `);
  process.exit(1);
} else {
  console.log('\n✅ .env file found');
}

// Check if package.json exists
const packagePath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packagePath)) {
  console.log('\n❌ package.json not found!');
  console.log('Please run this script from the backend directory');
  process.exit(1);
}

console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Backend setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running');
console.log('2. Run: npm run seed (to populate initial data)');
console.log('3. Run: npm run dev (to start the server)');
console.log('4. Visit: http://localhost:5000/health (to verify server is running)');

console.log('\n🔑 Demo Login Credentials:');
console.log('Admin: admin@sakthiauto.com / password');
console.log('Supervisor: supervisor@sakthiauto.com / password');
console.log('Line Incharge: lineincharge@sakthiauto.com / password');
console.log('Operator: operator@sakthiauto.com / password');
console.log('Auditor: auditor@sakthiauto.com / password');
