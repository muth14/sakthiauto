const fs = require('fs');
const path = require('path');

/**
 * Simple logger utility for the application
 */
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get current timestamp
   * @returns {string} Formatted timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Get log filename for current date
   * @param {string} type - Log type (error, access, etc.)
   * @returns {string} Log filename
   */
  getLogFilename(type = 'app') {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${type}-${date}.log`);
  }

  /**
   * Write log entry to file
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @param {string} type - Log type
   */
  writeLog(level, message, meta = {}, type = 'app') {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    const filename = this.getLogFilename(type);

    try {
      fs.appendFileSync(filename, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    console.log(`[INFO] ${message}`, meta);
    this.writeLog('info', message, meta);
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    console.warn(`[WARN] ${message}`, meta);
    this.writeLog('warn', message, meta);
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  error(message, meta = {}) {
    console.error(`[ERROR] ${message}`, meta);
    this.writeLog('error', message, meta, 'error');
  }

  /**
   * Log debug message (only in development)
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, meta);
      this.writeLog('debug', message, meta);
    }
  }

  /**
   * Log HTTP access
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in ms
   */
  access(req, res, responseTime) {
    const logEntry = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: req.user ? req.user._id : null,
      username: req.user ? req.user.username : null
    };

    this.writeLog('access', `${req.method} ${req.originalUrl}`, logEntry, 'access');
  }

  /**
   * Log security events
   * @param {string} event - Security event type
   * @param {Object} details - Event details
   */
  security(event, details = {}) {
    const message = `Security Event: ${event}`;
    console.warn(`[SECURITY] ${message}`, details);
    this.writeLog('security', message, details, 'security');
  }

  /**
   * Clean old log files (older than specified days)
   * @param {number} days - Number of days to keep logs
   */
  cleanOldLogs(days = 30) {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.info(`Cleaned old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to clean old logs', { error: error.message });
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup (in production)
if (process.env.NODE_ENV === 'production') {
  logger.cleanOldLogs(30);
}

module.exports = logger;
