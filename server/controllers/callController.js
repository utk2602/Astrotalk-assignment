const CallLog = require('../models/CallLog');
const User = require('../models/User');

// @desc    Save a new call record
// @route   POST /api/calls
// @access  Private
const saveCall = async (req, res) => {
  try {
    const { 
      receiverId, 
      callType, 
      status, 
      duration = 0, 
      cost = 0, 
      quality = 'good',
      notes = '',
      sessionId = ''
    } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create new call log
    const callLog = new CallLog({
      caller: req.user._id,
      receiver: receiverId,
      callType,
      status,
      duration,
      cost,
      quality,
      notes,
      sessionId
    });

    await callLog.save();

    // Populate caller and receiver details
    await callLog.populate('caller', 'name avatar');
    await callLog.populate('receiver', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Call log saved successfully',
      data: {
        callLog
      }
    });
  } catch (error) {
    console.error('Save call error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving call log',
      error: error.message
    });
  }
};

// @desc    Get call history
// @route   GET /api/calls
// @access  Private
const getCallHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      callType, 
      status,
      startDate,
      endDate 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      $or: [
        { caller: req.user._id },
        { receiver: req.user._id }
      ]
    };

    // Apply filters
    if (callType) {
      query.callType = callType;
    }
    if (status) {
      query.status = status;
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const callLogs = await CallLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('caller', 'name avatar')
      .populate('receiver', 'name avatar');

    const total = await CallLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        callLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCalls: total,
          hasNextPage: skip + callLogs.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call history',
      error: error.message
    });
  }
};

// @desc    Update call status
// @route   PATCH /api/calls/:callId
// @access  Private
const updateCallStatus = async (req, res) => {
  try {
    const { status, duration, cost, quality, notes } = req.body;

    const callLog = await CallLog.findById(req.params.callId);

    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found'
      });
    }

    // Check if user is part of this call
    if (callLog.caller.toString() !== req.user._id.toString() && 
        callLog.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update calls you participated in'
      });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (duration !== undefined) updateFields.duration = duration;
    if (cost !== undefined) updateFields.cost = cost;
    if (quality) updateFields.quality = quality;
    if (notes !== undefined) updateFields.notes = notes;

    // If status is 'ended', set endTime
    if (status === 'ended') {
      updateFields.endTime = new Date();
    }

    const updatedCallLog = await CallLog.findByIdAndUpdate(
      req.params.callId,
      updateFields,
      { new: true }
    ).populate('caller', 'name avatar').populate('receiver', 'name avatar');

    res.json({
      success: true,
      message: 'Call status updated successfully',
      data: {
        callLog: updatedCallLog
      }
    });
  } catch (error) {
    console.error('Update call status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating call status',
      error: error.message
    });
  }
};

// @desc    Get call statistics
// @route   GET /api/calls/stats
// @access  Private
const getCallStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      $or: [
        { caller: req.user._id },
        { receiver: req.user._id }
      ]
    };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await CallLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          averageDuration: { $avg: '$duration' },
          totalCost: { $sum: '$cost' },
          audioCalls: {
            $sum: { $cond: [{ $eq: ['$callType', 'audio'] }, 1, 0] }
          },
          videoCalls: {
            $sum: { $cond: [{ $eq: ['$callType', 'video'] }, 1, 0] }
          },
          completedCalls: {
            $sum: { $cond: [{ $eq: ['$status', 'ended'] }, 1, 0] }
          },
          missedCalls: {
            $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] }
          }
        }
      }
    ]);

    const dailyStats = await CallLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          calls: { $sum: 1 },
          duration: { $sum: '$duration' },
          cost: { $sum: '$cost' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalCalls: 0,
          totalDuration: 0,
          averageDuration: 0,
          totalCost: 0,
          audioCalls: 0,
          videoCalls: 0,
          completedCalls: 0,
          missedCalls: 0
        },
        dailyStats
      }
    });
  } catch (error) {
    console.error('Get call stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call statistics',
      error: error.message
    });
  }
};

// @desc    Get call by ID
// @route   GET /api/calls/:callId
// @access  Private
const getCallById = async (req, res) => {
  try {
    const callLog = await CallLog.findById(req.params.callId)
      .populate('caller', 'name avatar')
      .populate('receiver', 'name avatar');

    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found'
      });
    }

    // Check if user is part of this call
    if (callLog.caller._id.toString() !== req.user._id.toString() && 
        callLog.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view calls you participated in'
      });
    }

    res.json({
      success: true,
      data: {
        callLog
      }
    });
  } catch (error) {
    console.error('Get call by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call details',
      error: error.message
    });
  }
};

// @desc    Delete call log
// @route   DELETE /api/calls/:callId
// @access  Private
const deleteCall = async (req, res) => {
  try {
    const callLog = await CallLog.findById(req.params.callId);

    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'Call log not found'
      });
    }

    // Check if user is part of this call
    if (callLog.caller.toString() !== req.user._id.toString() && 
        callLog.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete calls you participated in'
      });
    }

    await CallLog.findByIdAndDelete(req.params.callId);

    res.json({
      success: true,
      message: 'Call log deleted successfully'
    });
  } catch (error) {
    console.error('Delete call error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting call log',
      error: error.message
    });
  }
};

module.exports = {
  saveCall,
  getCallHistory,
  updateCallStatus,
  getCallStats,
  getCallById,
  deleteCall
}; 