const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'ai'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // For AI chat messages
  isAIChat: {
    type: Boolean,
    default: false
  },
  aiPrompt: {
    type: String,
    default: ''
  },
  aiResponse: {
    type: String,
    default: ''
  },
  // For file messages
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get chat history between two users
messageSchema.statics.getChatHistory = async function(user1Id, user2Id, limit = 50, skip = 0) {
  return this.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip)
  .populate('sender', 'name avatar')
  .populate('receiver', 'name avatar');
};

// Static method to get AI chat history
messageSchema.statics.getAIChatHistory = async function(userId, startDate, endDate) {
  const query = {
    sender: userId,
    isAIChat: true
  };
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('sender', 'name avatar');
};

module.exports = mongoose.model('Message', messageSchema); 