const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser.js");
const {
  getCallHistory,
  getUserCallHistory,
  getCallStats,
  getActiveCalls,
  deleteCall,
} = require("../Controllers/call_controller.js");

// Get call history for a specific conversation
router.get("/history/:conversationId", fetchuser, getCallHistory);

// Get user's call history
router.get("/history", fetchuser, getUserCallHistory);

// Get call statistics
router.get("/stats", fetchuser, getCallStats);

// Get active calls
router.get("/active", fetchuser, getActiveCalls);

// Delete a call record
router.delete("/:callId", fetchuser, deleteCall);

module.exports = router;