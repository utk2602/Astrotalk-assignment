const Call = require("../Models/Call.js");
const User = require("../Models/User.js");
const Conversation = require("../Models/Conversation.js");
const { v4: uuidv4 } = require('uuid');

// Get call history for a conversation
const getCallHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const calls = await Call.find({ conversationId })
      .populate("caller", "name profilePic")
      .populate("receiver", "name profilePic")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Call.countDocuments({ conversationId });

    res.status(200).json({
      calls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get call history error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user's call history
const getUserCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type = "all" } = req.query;

    let query = {
      $or: [{ caller: userId }, { receiver: userId }],
    };

    if (type !== "all") {
      query.callType = type;
    }

    const calls = await Call.find(query)
      .populate("caller", "name profilePic")
      .populate("receiver", "name profilePic")
      .populate("conversationId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Call.countDocuments(query);

    // Add call direction info
    const callsWithDirection = calls.map(call => ({
      ...call.toObject(),
      direction: call.caller._id.toString() === userId ? "outgoing" : "incoming"
    }));

    res.status(200).json({
      calls: callsWithDirection,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get user call history error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get call statistics
const getCallStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "week" } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "day":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        };
        break;
      case "week":
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case "month":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
        break;
    }

    const baseQuery = {
      $or: [{ caller: userId }, { receiver: userId }],
      ...dateFilter,
    };

    const [
      totalCalls,
      voiceCalls,
      videoCalls,
      missedCalls,
      answeredCalls,
      totalDuration,
      avgDuration,
    ] = await Promise.all([
      Call.countDocuments(baseQuery),
      Call.countDocuments({ ...baseQuery, callType: "voice" }),
      Call.countDocuments({ ...baseQuery, callType: "video" }),
      Call.countDocuments({ ...baseQuery, status: "missed" }),
      Call.countDocuments({ ...baseQuery, status: "answered" }),
      Call.aggregate([
        { $match: baseQuery },
        { $group: { _id: null, total: { $sum: "$duration" } } },
      ]),
      Call.aggregate([
        { $match: { ...baseQuery, status: "answered" } },
        { $group: { _id: null, avg: { $avg: "$duration" } } },
      ]),
    ]);

    res.status(200).json({
      period,
      stats: {
        totalCalls,
        voiceCalls,
        videoCalls,
        missedCalls,
        answeredCalls,
        totalDuration: totalDuration[0]?.total || 0,
        avgDuration: Math.round(avgDuration[0]?.avg || 0),
        answerRate: totalCalls > 0 ? ((answeredCalls / totalCalls) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    console.error("Get call stats error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new call record
const createCall = async (callData) => {
  try {
    const call = new Call({
      callId: uuidv4(),
      ...callData,
    });
    await call.save();
    return call;
  } catch (error) {
    console.error("Create call error:", error);
    throw error;
  }
};

// Update call status
const updateCallStatus = async (callId, updateData) => {
  try {
    const call = await Call.findOneAndUpdate(
      { callId },
      updateData,
      { new: true }
    ).populate("caller receiver", "name profilePic");
    
    return call;
  } catch (error) {
    console.error("Update call status error:", error);
    throw error;
  }
};

// End call and calculate duration
const endCall = async (callId, endReason = "user_ended", connectionStats = {}) => {
  try {
    const call = await Call.findOne({ callId });
    if (!call) {
      throw new Error("Call not found");
    }

    const endTime = new Date();
    const duration = call.status === "answered" 
      ? Math.floor((endTime - call.startTime) / 1000)
      : 0;

    const updatedCall = await Call.findOneAndUpdate(
      { callId },
      {
        status: "ended",
        endTime,
        duration,
        endReason,
        connectionStats,
      },
      { new: true }
    ).populate("caller receiver", "name profilePic");

    return updatedCall;
  } catch (error) {
    console.error("End call error:", error);
    throw error;
  }
};

// Get active calls for user
const getActiveCalls = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const activeCalls = await Call.find({
      $or: [{ caller: userId }, { receiver: userId }],
      status: { $in: ["initiated", "ringing", "answered"] },
    })
    .populate("caller receiver", "name profilePic")
    .populate("conversationId")
    .sort({ createdAt: -1 });

    res.status(200).json(activeCalls);
  } catch (error) {
    console.error("Get active calls error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete call record
const deleteCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await Call.findOne({ callId });
    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    // Check if user is authorized to delete this call
    if (call.caller.toString() !== userId && call.receiver.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Call.findOneAndDelete({ callId });
    res.status(200).json({ message: "Call deleted successfully" });
  } catch (error) {
    console.error("Delete call error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCallHistory,
  getUserCallHistory,
  getCallStats,
  getActiveCalls,
  deleteCall,
  createCall,
  updateCallStatus,
  endCall,
};