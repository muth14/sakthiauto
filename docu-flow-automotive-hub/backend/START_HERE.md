# 🚀 Sakthi Auto Docs Backend - Quick Start Guide

## ✅ Complete Backend Features Implemented

Your backend is **100% complete** with all the features you requested:

### 🔐 Authentication & Authorization
- ✅ JWT-based login system with refresh tokens
- ✅ User roles: Admin, Supervisor, Line Incharge, Operator, Auditor
- ✅ Role-based middleware for route protection
- ✅ Password hashing with bcrypt

### 📋 Form Templates & Submissions
- ✅ Dynamic form templates with custom fields (text, number, date, dropdown, file, signature)
- ✅ Templates saved as JSON with versioning
- ✅ Complete CRUD operations for templates
- ✅ Form submissions with status workflow (Draft → Submitted → Verified → Approved/Rejected)
- ✅ File attachments support (images, PDFs)
- ✅ Approval workflow with Line Incharge verification and Supervisor approval

### 📁 File Management
- ✅ Multer integration for file uploads
- ✅ Support for images, PDFs, Excel files
- ✅ File metadata storage (uploader, timestamps, related forms)
- ✅ Secure file serving with access control

### 📄 PDF Generation
- ✅ PDFKit integration for form PDF generation
- ✅ Professional PDF templates with watermarks
- ✅ Metadata inclusion (form title, creator, approver, timestamps)
- ✅ Download endpoints for generated PDFs

### 📊 Audit Logging
- ✅ Comprehensive audit trail for all actions
- ✅ User, role, action, timestamp tracking
- ✅ Filterable logs by date, user, form type
- ✅ CSV and JSON export functionality

### 🔧 Machine & Tool Management
- ✅ Complete CRUD for machines (ID, name, model, maintenance dates)
- ✅ Complete CRUD for tools (ID, material, lifespan, usage history)
- ✅ Form-machine/tool relationships
- ✅ Maintenance and calibration tracking

### 📊 Excel Processing
- ✅ Excel file upload with multer
- ✅ ExcelJS parsing and processing
- ✅ Metadata storage (uploader, department, timestamps)
- ✅ File listing and download endpoints
- ✅ Bulk import functionality for machines, tools, users

### 🛡️ Security & Performance
- ✅ Express + Mongoose architecture
- ✅ Environment configuration with dotenv
- ✅ CORS and Helmet security
- ✅ Rate limiting and input validation
- ✅ Error handling middleware
- ✅ Request logging with Morgan

## 🏃‍♂️ Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Up Database
Make sure MongoDB is running, then seed the database:
```bash
npm run seed
```

### Step 3: Start the Server
```bash
npm run dev
```

## 🔧 Detailed Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (v5+)
- Git

### 2. Environment Setup
The `.env` file is already configured with development settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sakthiauto_docs
JWT_SECRET=sakthiauto_jwt_secret_key_change_in_production
# ... (all other variables are set)
```

### 3. Database Initialization
```bash
# Seed initial data (users, sample machines, tools, forms)
npm run seed
```

This creates:
- 5 demo users (one for each role)
- Sample machines and tools
- Sample form template
- Required directories

### 4. Start Development Server
```bash
npm run dev
```

Server will start on: http://localhost:5000

## 🧪 Testing Your Backend

### 1. Health Check
Visit: http://localhost:5000/health

### 2. API Documentation
Visit: http://localhost:5000/api

### 3. Test All Endpoints
```bash
npm install axios  # if not already installed
node scripts/test-endpoints.js
```

### 4. Demo Login Credentials
- **Admin**: admin@sakthiauto.com / password
- **Supervisor**: supervisor@sakthiauto.com / password
- **Line Incharge**: lineincharge@sakthiauto.com / password
- **Operator**: operator@sakthiauto.com / password
- **Auditor**: auditor@sakthiauto.com / password

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `PUT /api/auth/change-password` - Change password

### Form Templates
- `GET /api/forms/templates` - Get all templates
- `POST /api/forms/templates` - Create template
- `PUT /api/forms/templates/:id` - Update template
- `DELETE /api/forms/templates/:id` - Delete template
- `PUT /api/forms/templates/:id/approve` - Approve template

### Form Submissions
- `GET /api/forms/submissions` - Get all submissions
- `POST /api/forms/submissions` - Create submission
- `PUT /api/forms/submissions/:id` - Update submission
- `PUT /api/forms/submissions/:id/submit` - Submit form
- `PUT /api/forms/submissions/:id/verify` - Verify submission
- `PUT /api/forms/submissions/:id/approve` - Approve submission
- `PUT /api/forms/submissions/:id/reject` - Reject submission

### Machines & Tools
- `GET /api/machines` - Get all machines
- `POST /api/machines` - Create machine
- `PUT /api/machines/:id` - Update machine
- `DELETE /api/machines/:id` - Delete machine
- `POST /api/machines/:id/maintenance` - Add maintenance record

- `GET /api/tools` - Get all tools
- `POST /api/tools` - Create tool
- `PUT /api/tools/:id` - Update tool
- `DELETE /api/tools/:id` - Delete tool
- `POST /api/tools/:id/usage` - Add usage record
- `POST /api/tools/:id/calibration` - Add calibration record

### Files & PDFs
- `POST /api/files/upload` - Upload file
- `GET /api/files/download/:filename` - Download file
- `DELETE /api/files/:filename` - Delete file

- `POST /api/pdf/generate/:submissionId` - Generate PDF
- `GET /api/pdf/download/:submissionId` - Download PDF
- `GET /api/pdf/view/:submissionId` - View PDF
- `DELETE /api/pdf/:submissionId` - Delete PDF

### Audit & Excel
- `GET /api/audit/logs` - Get audit logs
- `GET /api/audit/stats` - Get audit statistics
- `POST /api/audit/export/csv` - Export logs as CSV
- `POST /api/audit/export/json` - Export logs as JSON

- `POST /api/excel/upload` - Upload Excel file
- `GET /api/excel/files` - Get Excel files
- `POST /api/excel/process/:id` - Process Excel data

## 🔗 Frontend Integration

Your frontend can now connect to the backend using:

```javascript
// In your React app
const API_BASE_URL = 'http://localhost:5000/api';

// Login example
const login = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  });
  return response.data;
};
```

## 🚨 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (Windows)
net start MongoDB

# Start MongoDB (macOS)
brew services start mongodb-community

# Start MongoDB (Linux)
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in .env file
PORT=5001
```

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🎉 You're All Set!

Your backend is **fully functional** with all the features you requested. The system includes:

- ✅ Complete authentication system
- ✅ Dynamic form management
- ✅ File upload and PDF generation
- ✅ Machine and tool tracking
- ✅ Comprehensive audit logging
- ✅ Excel import/export
- ✅ Role-based access control
- ✅ RESTful API design
- ✅ Security best practices

Connect your React frontend to `http://localhost:5000/api` and start building amazing industrial documentation workflows!

## 📞 Need Help?

If you encounter any issues:
1. Check the console logs
2. Verify MongoDB is running
3. Ensure all environment variables are set
4. Run the test script: `node scripts/test-endpoints.js`
5. Check the API documentation at: http://localhost:5000/api
