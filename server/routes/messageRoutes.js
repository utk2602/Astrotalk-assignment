const express = require('express');
const router = express.Router();
const { 
  getChatHistory, 
  sendMessage, 
  markAsRead, 
  getUnreadCount,
  getRecentConversations,
  deleteMessage
} = require('../controllers/messageController');
const { auth } = require('../middleware/authMiddleware');

// All routes are protected
router.use(auth);

router.get('/:userId', getChatHistory);
router.post('/send', sendMessage);
router.patch('/read/:msgId', markAsRead);
router.get('/unread/count', getUnreadCount);
router.get('/conversations', getRecentConversations);
router.delete('/:msgId', deleteMessage);

module.exports = router; 