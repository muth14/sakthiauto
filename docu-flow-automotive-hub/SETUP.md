# Setup Guide for Sakthi Auto Docs

This guide will help you set up the complete Sakthi Auto Docs system with both frontend and backend.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v5 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
   - Verify installation: `mongod --version`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

## Step-by-Step Setup

### 1. Clone and Navigate to Project

```bash
git clone <repository-url>
cd docu-flow-automotive-hub
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

Or use the setup script:
```bash
npm run setup
```

### 3. Environment Configuration

#### Frontend Environment (.env in root folder)

Create a `.env` file in the root directory:

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

#### Backend Environment (.env in backend folder)

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sakthiauto_docs

# JWT Configuration
JWT_SECRET=sakthiauto_jwt_secret_key_change_in_production
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=sakthiauto_refresh_secret_key_change_in_production
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

### 4. Database Setup

#### Option A: Local MongoDB

1. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. Verify MongoDB is running:
   ```bash
   mongo --eval "db.adminCommand('ismaster')"
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend/.env with your Atlas connection string

### 5. Start the Application

#### Option 1: Run Both Frontend and Backend Together

```bash
npm run dev:full
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

#### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Verify Installation

1. **Frontend**: Open http://localhost:3000
   - You should see the login page
   - Try logging in with demo credentials

2. **Backend**: Open http://localhost:5000/health
   - You should see a health check response

3. **API Documentation**: Open http://localhost:5000/api
   - You should see API endpoint documentation

## Demo Login Credentials

Use these credentials to test the system:

- **Admin**: admin@sakthiauto.com / password
- **Supervisor**: supervisor@sakthiauto.com / password
- **Line Incharge**: lineincharge@sakthiauto.com / password
- **Operator**: operator@sakthiauto.com / password
- **Auditor**: auditor@sakthiauto.com / password

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

**Error**: `MongoNetworkError: failed to connect to server`

**Solutions**:
- Ensure MongoDB is running: `mongod --version`
- Check if MongoDB service is started
- Verify the connection string in backend/.env
- For Atlas: Check network access and database user permissions

#### 2. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
- Kill the process using the port: `npx kill-port 5000`
- Change the port in backend/.env: `PORT=5001`
- Find and stop the conflicting process

#### 3. Module Not Found Errors

**Error**: `Cannot find module 'xyz'`

**Solutions**:
- Delete node_modules and package-lock.json
- Run `npm install` again
- For backend: `cd backend && npm install`

#### 4. CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solutions**:
- Ensure backend is running on port 5000
- Check FRONTEND_URL in backend/.env
- Verify VITE_API_URL in frontend .env

#### 5. File Upload Issues

**Error**: File upload fails

**Solutions**:
- Check MAX_FILE_SIZE in backend/.env
- Ensure uploads directory exists in backend
- Verify file type restrictions

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Debugging**: Use browser dev tools for frontend, console logs for backend
3. **Database**: Use MongoDB Compass for database visualization
4. **API Testing**: Use Postman or Thunder Client for API testing

### Production Deployment

For production deployment:

1. **Environment Variables**:
   - Set `NODE_ENV=production`
   - Use secure JWT secrets
   - Configure proper CORS origins
   - Set up proper MongoDB connection

2. **Build Frontend**:
   ```bash
   npm run build
   ```

3. **Security**:
   - Use HTTPS
   - Set up proper firewall rules
   - Use environment-specific secrets
   - Enable MongoDB authentication

## Next Steps

After successful setup:

1. **Explore the Dashboard** - Navigate through different sections
2. **Create Forms** - Try creating custom forms with various field types
3. **Manage Machines** - Add machines and maintenance records
4. **Test Workflows** - Submit forms and test approval workflows
5. **Check Audit Logs** - View system activity in audit logs

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the main README.md
3. Check the console for error messages
4. Create an issue in the repository

## Additional Resources

- **MongoDB Documentation**: https://docs.mongodb.com/
- **Node.js Documentation**: https://nodejs.org/docs/
- **React Documentation**: https://reactjs.org/docs/
- **Express.js Documentation**: https://expressjs.com/
