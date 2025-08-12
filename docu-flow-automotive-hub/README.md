# Sakthi Auto Docs - Industrial Digital Documentation System

A comprehensive digital documentation system for automotive manufacturing, featuring form management, machine tracking, tool management, and audit logging with both frontend and backend implementation.

## 🚀 Features

- **User Authentication & Authorization** - Role-based access control (Admin, Supervisor, Line Incharge, Operator, Auditor)
- **Dynamic Form Builder** - Create and manage custom forms with various field types
- **Form Submission Workflow** - Submit, verify, and approve forms with audit trails
- **Machine Management** - Track machines, maintenance schedules, and records
- **Tool Management** - Manage tools, calibration, and usage tracking
- **File Management** - Upload, store, and manage documents and images
- **PDF Generation** - Generate professional PDFs from form submissions
- **Audit Logging** - Comprehensive audit trails for all system activities
- **Excel Import/Export** - Bulk import data and export reports
- **Real-time Dashboard** - Monitor system status and key metrics

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Hook Form** for form management
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **PDFKit** for PDF generation
- **ExcelJS** for Excel processing
- **Sharp** for image processing
- **Helmet** for security
- **CORS** for cross-origin requests

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd docu-flow-automotive-hub
```

### 2. Install Dependencies

```bash
# Install frontend and backend dependencies
npm run setup
```

### 3. Environment Configuration

#### Backend Environment (.env in backend folder)
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sakthiauto_docs

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRE=30d

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_PATH=uploads

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# PDF Configuration
PDF_WATERMARK_TEXT=Sakthi Auto Docs - Confidential
```

#### Frontend Environment (.env in root folder)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Sakthi Auto Docs
VITE_APP_VERSION=1.0.0

# File Upload Configuration
VITE_MAX_FILE_SIZE_MB=10
VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/jpg,image/png,image/gif
VITE_ALLOWED_DOCUMENT_TYPES=application/pdf
VITE_ALLOWED_EXCEL_TYPES=application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

# Development Configuration
VITE_ENABLE_MOCK_DATA=true
VITE_DEBUG_MODE=true
```

### 4. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the database and collections on first run.

### 5. Start the Application

#### Option 1: Run Both Frontend and Backend Together
```bash
npm run dev:full
```

#### Option 2: Run Separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 👤 Default Login Credentials

For demo purposes, you can use these credentials:

- **Admin**: admin@sakthiauto.com / password
- **Supervisor**: supervisor@sakthiauto.com / password
- **Line Incharge**: lineincharge@sakthiauto.com / password
- **Operator**: operator@sakthiauto.com / password
- **Auditor**: auditor@sakthiauto.com / password

## 📁 Project Structure

```
docu-flow-automotive-hub/
├── backend/                 # Backend API server
│   ├── config/             # Database and app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── uploads/           # File uploads directory
│   └── server.js          # Main server file
├── src/                   # Frontend React application
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── lib/              # Utilities and services
│   │   ├── services/     # API service functions
│   │   ├── api.ts        # API configuration
│   │   ├── constants.ts  # Application constants
│   │   └── utils.ts      # Utility functions
│   ├── pages/            # Page components
│   └── main.tsx          # Application entry point
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Backend
npm run dev:backend     # Start backend development server

# Full Stack
npm run dev:full        # Start both frontend and backend
npm run setup           # Install all dependencies
```

### API Documentation

The API provides the following endpoints:

- **Authentication**: `/api/auth/*`
- **Forms**: `/api/forms/*`
- **Machines**: `/api/machines/*`
- **Tools**: `/api/tools/*`
- **Files**: `/api/files/*`
- **PDF**: `/api/pdf/*`
- **Audit**: `/api/audit/*`
- **Excel**: `/api/excel/*`

Visit `/api` endpoint for detailed API documentation.

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control
- Input validation and sanitization
- File upload restrictions
- Rate limiting
- CORS protection
- Helmet security headers
- Audit logging for all actions

## 📊 Monitoring & Logging

- Comprehensive audit logging
- Error tracking and logging
- Performance monitoring
- Health check endpoints
- Request/response logging

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# The built files will be in the dist/ directory
```

### Environment Variables for Production

Make sure to update environment variables for production:

- Set `NODE_ENV=production`
- Use secure JWT secrets
- Configure proper CORS origins
- Set up proper MongoDB connection
- Configure file upload limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication and authorization
  - Form management and workflow
  - Machine and tool tracking
  - File management and PDF generation
  - Audit logging and reporting
