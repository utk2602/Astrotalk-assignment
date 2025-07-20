const User = require('../models/User');
const Message = require('../models/Message');
const CallLog = require('../models/CallLog');

// Store online users
const onlineUsers = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User comes online
    socket.on('user-online', async (data) => {
      try {
        const { userId } = data;
        
        if (!userId) {
          socket.emit('error', { message: 'User ID is required' });
          return;
        }

        // Update user's online status
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date()
        });

        // Store socket connection
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;

        // Notify other users
        socket.broadcast.emit('user-status-changed', {
          userId,
          isOnline: true
        });

        console.log(`User ${userId} is now online`);
      } catch (error) {
        console.error('User online error:', error);
        socket.emit('error', { message: 'Failed to update online status' });
      }
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, messageType = 'text' } = data;
        const senderId = socket.userId;

        if (!senderId || !receiverId || !content) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Save message to database
        const message = new Message({
          sender: senderId,
          receiver: receiverId,
          content,
          messageType
        });

        await message.save();
        await message.populate('sender', 'name avatar');
        await message.populate('receiver', 'name avatar');

        // Emit to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive-message', {
            message,
            sender: message.sender
          });
        }

        // Confirm to sender
        socket.emit('message-sent', {
          message,
          success: true
        });

        console.log(`Message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark message as read
    socket.on('mark-read', async (data) => {
      try {
        const { messageId } = data;
        const userId = socket.userId;

        if (!messageId || !userId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user is the receiver
        if (message.receiver.toString() !== userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        await message.markAsRead();

        // Notify sender that message was read
        const senderSocketId = onlineUsers.get(message.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('message-read', {
            messageId,
            readAt: message.readAt
          });
        }

        socket.emit('read-confirmed', {
          messageId,
          success: true
        });
      } catch (error) {
        console.error('Mark read error:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Start call
    socket.on('start-call', async (data) => {
      try {
        const { receiverId, callType } = data;
        const callerId = socket.userId;

        if (!callerId || !receiverId || !callType) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Create call log
        const callLog = new CallLog({
          caller: callerId,
          receiver: receiverId,
          callType,
          status: 'initiated'
        });

        await callLog.save();

        // Emit to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('incoming-call', {
            callId: callLog._id,
            callerId,
            callType,
            sessionId: callLog.sessionId
          });
        }

        socket.emit('call-initiated', {
          callId: callLog._id,
          success: true
        });

        console.log(`Call initiated from ${callerId} to ${receiverId}`);
      } catch (error) {
        console.error('Start call error:', error);
        socket.emit('error', { message: 'Failed to start call' });
      }
    });

    // Answer call
    socket.on('answer-call', async (data) => {
      try {
        const { callId } = data;
        const receiverId = socket.userId;

        if (!callId || !receiverId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        const callLog = await CallLog.findById(callId);
        if (!callLog) {
          socket.emit('error', { message: 'Call not found' });
          return;
        }

        // Update call status
        callLog.status = 'answered';
        await callLog.save();

        // Notify caller
        const callerSocketId = onlineUsers.get(callLog.caller.toString());
        if (callerSocketId) {
          io.to(callerSocketId).emit('call-answered', {
            callId,
            receiverId
          });
        }

        socket.emit('call-answered-confirmed', {
          callId,
          success: true
        });
      } catch (error) {
        console.error('Answer call error:', error);
        socket.emit('error', { message: 'Failed to answer call' });
      }
    });

    // End call
    socket.on('end-call', async (data) => {
      try {
        const { callId, duration = 0 } = data;
        const userId = socket.userId;

        if (!callId || !userId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        const callLog = await CallLog.findById(callId);
        if (!callLog) {
          socket.emit('error', { message: 'Call not found' });
          return;
        }

        // Check if user is part of the call
        if (callLog.caller.toString() !== userId && 
            callLog.receiver.toString() !== userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Update call status
        callLog.status = 'ended';
        callLog.duration = duration;
        callLog.endTime = new Date();
        await callLog.save();

        // Notify other participant
        const otherUserId = callLog.caller.toString() === userId 
          ? callLog.receiver.toString() 
          : callLog.caller.toString();
        
        const otherUserSocketId = onlineUsers.get(otherUserId);
        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit('call-ended', {
            callId,
            duration
          });
        }

        socket.emit('call-ended-confirmed', {
          callId,
          success: true
        });
      } catch (error) {
        console.error('End call error:', error);
        socket.emit('error', { message: 'Failed to end call' });
      }
    });

    // WebRTC signaling
    socket.on('offer', (data) => {
      const { receiverId, offer } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('offer', {
          offer,
          senderId: socket.userId
        });
      }
    });

    socket.on('answer', (data) => {
      const { receiverId, answer } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('answer', {
          answer,
          senderId: socket.userId
        });
      }
    });

    socket.on('ice-candidate', (data) => {
      const { receiverId, candidate } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('ice-candidate', {
          candidate,
          senderId: socket.userId
        });
      }
    });

    // Typing indicators
    socket.on('typing-start', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing-start', {
          senderId: socket.userId
        });
      }
    });

    socket.on('typing-stop', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing-stop', {
          senderId: socket.userId
        });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      try {
        const userId = socket.userId;
        
        if (userId) {
          // Update user's offline status
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date()
          });

          // Remove from online users
          onlineUsers.delete(userId);

          // Notify other users
          socket.broadcast.emit('user-status-changed', {
            userId,
            isOnline: false
          });

          console.log(`User ${userId} disconnected`);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  return io;
};

// Get online users count
const getOnlineUsersCount = () => {
  return onlineUsers.size;
};

// Get online users list
const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

// Check if user is online
const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

module.exports = {
  setupSocketHandlers,
  getOnlineUsersCount,
  getOnlineUsers,
  isUserOnline
}; 