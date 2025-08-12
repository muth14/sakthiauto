const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - requires valid JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  console.log('🔑 Token received:', token.substring(0, 20) + '...');

  try {
    // Handle mock tokens for development
    if (token.startsWith('mock_token_') && process.env.NODE_ENV === 'development') {
      console.log('✅ Using mock token for development');
      // Create a mock user for development
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        firstName: 'Demo',
        lastName: 'Admin',
        email: 'admin@sakthiauto.com',
        role: 'Admin',
        department: 'All',
        isActive: true,
        employeeId: 'DEMO001'
      };
      req.user = mockUser;
      console.log('✅ Mock user set:', mockUser.email);
      return next();
    }

    // Verify real JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this token'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Middleware to check if user is authenticated (optional)
 * Sets req.user if token is valid, but doesn't block request if not
 */
exports.optionalAuth = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Handle mock tokens for development
      if (token.startsWith('mock_token_') && process.env.NODE_ENV === 'development') {
        const mockUser = {
          _id: '507f1f77bcf86cd799439011',
          firstName: 'Demo',
          lastName: 'Admin',
          email: 'admin@sakthiauto.com',
          role: 'Admin',
          department: 'All',
          isActive: true,
          employeeId: 'DEMO001'
        };
        req.user = mockUser;
        return next();
      }

      // Verify real JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't block the request
      console.log('Optional auth token verification failed:', error.message);
    }
  }

  next();
};
