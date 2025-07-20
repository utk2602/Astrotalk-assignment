const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get chat history between two users
// @route   GET /api/messages/:userId
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if the other user exists
    const otherUser = await User.findById(userId).select('name avatar');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const messages = await Message.getChatHistory(
      req.user._id,
      userId,
      parseInt(limit),
      skip
    );

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first
        otherUser: otherUser.getPublicProfile(),
        pagination: {
          currentPage: parseInt(page),
          hasNextPage: messages.length === parseInt(limit),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history',
      error: error.message
    });
  }
};

// @desc    Send a new message
// @route   POST /api/messages/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create new message
    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      messageType
    });

    await message.save();

    // Populate sender and receiver details
    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// @desc    Mark message as read
// @route   PATCH /api/messages/read/:msgId
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.msgId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if the current user is the receiver
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark messages sent to you as read'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marked as read',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

// @desc    Get recent conversations
// @route   GET /api/messages/conversations
// @access  Private
const getRecentConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Populate user details
    const populatedConversations = await Message.populate(conversations, [
      {
        path: '_id',
        select: 'name avatar isOnline lastSeen',
        model: 'User'
      },
      {
        path: 'lastMessage.sender',
        select: 'name avatar',
        model: 'User'
      },
      {
        path: 'lastMessage.receiver',
        select: 'name avatar',
        model: 'User'
      }
    ]);

    res.json({
      success: true,
      data: {
        conversations: populatedConversations
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:msgId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.msgId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if the current user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await Message.findByIdAndDelete(req.params.msgId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  markAsRead,
  getUnreadCount,
  getRecentConversations,
  deleteMessage
}; 