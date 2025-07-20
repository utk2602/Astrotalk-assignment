const express = require('express');
const router = express.Router();
const { 
  saveCall, 
  getCallHistory, 
  updateCallStatus,
  getCallStats,
  getCallById,
  deleteCall
} = require('../controllers/callController');
const { auth } = require('../middleware/authMiddleware');

// All routes are protected
router.use(auth);

router.post('/', saveCall);
router.get('/', getCallHistory);
router.get('/stats', getCallStats);
router.get('/:callId', getCallById);
router.patch('/:callId', updateCallStatus);
router.delete('/:callId', deleteCall);

module.exports = router; 