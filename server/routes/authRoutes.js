const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  logout 
} = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

module.exports = router; 