const express = require('express');
const router = express.Router();
const { 
  getUserById, 
  updateProfile, 
  updateAvatar, 
  getAstrologers, 
  updateStatus,
  getUserStats
} = require('../controllers/userController');
const { auth, requireAstrologer, requireVerified } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/:id', getUserById);
router.get('/astrologers', getAstrologers);

// Protected routes
router.put('/profile', auth, updateProfile);
router.put('/avatar', auth, upload.single('avatar'), updateAvatar);
router.patch('/status/:id', auth, updateStatus);
router.get('/stats', auth, getUserStats);

module.exports = router;

 