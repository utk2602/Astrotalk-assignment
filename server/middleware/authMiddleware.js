const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error.' 
    });
  }
};

// Optional auth middleware for routes that can work with or without auth
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Middleware to check if user is an astrologer
const requireAstrologer = async (req, res, next) => {
  if (req.user.role !== 'astrologer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Astrologer role required.' 
    });
  }
  next();
};

// Middleware to check if user is verified (for astrologers)
const requireVerified = async (req, res, next) => {
  if (req.user.role === 'astrologer' && !req.user.isVerified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Account verification required.' 
    });
  }
  next();
};

module.exports = {
  auth,
  optionalAuth,
  requireAstrologer,
  requireVerified
}; 