const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callType: {
    type: String,
    enum: ['audio', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'answered', 'declined', 'missed', 'ended'],
    default: 'initiated'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  // For billing purposes
  cost: {
    type: Number,
    default: 0
  },
  // Call quality metrics
  quality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  // Additional metadata
  notes: {
    type: String,
    default: ''
  },
  // WebRTC session info
  sessionId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
callLogSchema.index({ caller: 1, createdAt: -1 });
callLogSchema.index({ receiver: 1, createdAt: -1 });
callLogSchema.index({ status: 1 });

// Method to end call and calculate duration
callLogSchema.methods.endCall = function() {
  this.endTime = new Date();
  this.duration = Math.floor((this.endTime - this.startTime) / 1000); // Convert to seconds
  this.status = 'ended';
  return this.save();
};

// Static method to get call history for a user
callLogSchema.statics.getCallHistory = async function(userId, limit = 20, skip = 0) {
  return this.find({
    $or: [
      { caller: userId },
      { receiver: userId }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip)
  .populate('caller', 'name avatar')
  .populate('receiver', 'name avatar');
};

// Static method to get call statistics
callLogSchema.statics.getCallStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { caller: mongoose.Types.ObjectId(userId) },
          { receiver: mongoose.Types.ObjectId(userId) }
        ],
        status: 'ended'
      }
    },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        averageDuration: { $avg: '$duration' },
        totalCost: { $sum: '$cost' }
      }
    }
  ]);
  
  return stats[0] || {
    totalCalls: 0,
    totalDuration: 0,
    averageDuration: 0,
    totalCost: 0
  };
};

module.exports = mongoose.model('CallLog', callLogSchema); 