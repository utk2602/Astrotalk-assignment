const express = require('express');
const router = express.Router();
const { 
  chatWithAI, 
  getAIChatHistory, 
  exportAIChatHistory,
  getAIChatStats,
  deleteAIChatHistory
} = require('../controllers/aiController');
const { auth } = require('../middleware/authMiddleware');

// All routes are protected
router.use(auth);

router.post('/chat', chatWithAI);
router.get('/history', getAIChatHistory);
router.get('/export', exportAIChatHistory);
router.get('/stats', getAIChatStats);
router.delete('/history', deleteAIChatHistory);

module.exports = router; 