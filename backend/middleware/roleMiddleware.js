/**
 * Role-based authorization middleware
 * Restricts access based on user roles
 */

/**
 * Middleware to authorize specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is Admin
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user is Admin or Supervisor
 */
exports.adminOrSupervisor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!['Admin', 'Supervisor'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Supervisor privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user is Admin, Supervisor, or Line Incharge
 */
exports.managementRoles = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!['Admin', 'Supervisor', 'Line Incharge'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Management privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user can verify forms (Line Incharge)
 */
exports.canVerifyForms = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!['Admin', 'Supervisor', 'Line Incharge'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Form verification privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user can approve forms (Supervisor)
 */
exports.canApproveForms = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!['Admin', 'Supervisor'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Form approval privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user can create/edit form templates
 */
exports.canManageTemplates = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!['Admin', 'Supervisor'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Template management privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user can submit forms (Operator and above)
 */
exports.canSubmitForms = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!['Admin', 'Supervisor', 'Line Incharge', 'Operator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Form submission privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user can view audit logs
 */
exports.canViewAuditLogs = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!['Admin', 'Supervisor', 'Auditor'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Audit log viewing privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user can manage machines and tools
 */
exports.canManageAssets = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!['Admin', 'Supervisor', 'Line Incharge'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Asset management privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user owns the resource or has management privileges
 * Used for operations where users can only modify their own resources
 */
exports.ownerOrManagement = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  // Management roles can access any resource
  if (['Admin', 'Supervisor', 'Line Incharge'].includes(req.user.role)) {
    return next();
  }

  // For other roles, check if they own the resource
  // This will be used in combination with resource-specific checks
  req.requireOwnership = true;
  next();
};

/**
 * Middleware to check department access
 * Users can only access resources from their department (unless Admin)
 */
exports.departmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  // Admins can access all departments
  if (req.user.role === 'Admin') {
    return next();
  }

  // Store user's department for later validation
  req.userDepartment = req.user.department;
  next();
};
