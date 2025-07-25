const Conversation = require("../Models/Conversation.js");
const User = require("../Models/User.js");
const {
  createCall,
  updateCallStatus,
  endCall,
} = require("../Controllers/call_controller.js");

// Store active calls in memory for quick access
const activeCalls = new Map();
const userCallState = new Map(); // Track if user is in a call

module.exports = (io, socket) => {
  let currentUserId = null;

  // Set current user ID when socket connects
  socket.on("setup-call", (userId) => {
    currentUserId = userId;
    console.log(`User ${userId} setup for calls`);
  });

  // Initiate a call
  socket.on("initiate-call", async (data) => {
    try {
      const { conversationId, receiverId, callType, offer } = data;
      
      // Check if receiver is online
      const receiverRoom = io.sockets.adapter.rooms.get(receiverId);
      if (!receiverRoom) {
        socket.emit("call-error", { 
          error: "User is offline",
          code: "USER_OFFLINE" 
        });
        return;
      }

      // Check if receiver is already in a call
      if (userCallState.has(receiverId)) {
        socket.emit("call-error", { 
          error: "User is busy",
          code: "USER_BUSY" 
        });
        return;
      }

      // Check if caller is already in a call
      if (userCallState.has(currentUserId)) {
        socket.emit("call-error", { 
          error: "You are already in a call",
          code: "ALREADY_IN_CALL" 
        });
        return;
      }

      // Create call record
      const call = await createCall({
        conversationId,
        caller: currentUserId,
        receiver: receiverId,
        callType,
        status: "initiated",
      });

      // Store active call info
      activeCalls.set(call.callId, {
        callId: call.callId,
        caller: currentUserId,
        receiver: receiverId,
        conversationId,
        callType,
        status: "initiated",
        callerSocketId: socket.id,
        startTime: new Date(),
      });

      // Set user call states
      userCallState.set(currentUserId, call.callId);
      userCallState.set(receiverId, call.callId);

      // Update call status to ringing
      await updateCallStatus(call.callId, { status: "ringing" });
      activeCalls.get(call.callId).status = "ringing";

      // Send call invitation to receiver
      io.to(receiverId).emit("incoming-call", {
        callId: call.callId,
        caller: {
          id: currentUserId,
          name: socket.userName || "Unknown",
          profilePic: socket.userProfilePic || "",
        },
        callType,
        conversationId,
        offer,
      });

      // Notify caller that call is ringing
      socket.emit("call-ringing", {
        callId: call.callId,
        receiverId,
      });

      // Set timeout for call (30 seconds)
      setTimeout(async () => {
        const activeCall = activeCalls.get(call.callId);
        if (activeCall && activeCall.status === "ringing") {
          // Call timeout - mark as missed
          await updateCallStatus(call.callId, { 
            status: "missed",
            endTime: new Date(),
          });

          // Clean up
          activeCalls.delete(call.callId);
          userCallState.delete(currentUserId);
          userCallState.delete(receiverId);

          // Notify both users
          io.to(currentUserId).emit("call-timeout", { callId: call.callId });
          io.to(receiverId).emit("call-timeout", { callId: call.callId });
        }
      }, 30000);

    } catch (error) {
      console.error("Initiate call error:", error);
      socket.emit("call-error", { 
        error: "Failed to initiate call",
        code: "INITIATE_FAILED" 
      });
    }
  });

  // Answer a call
  socket.on("answer-call", async (data) => {
    try {
      const { callId, answer } = data;
      
      const activeCall = activeCalls.get(callId);
      if (!activeCall) {
        socket.emit("call-error", { 
          error: "Call not found",
          code: "CALL_NOT_FOUND" 
        });
        return;
      }

      // Update call status
      await updateCallStatus(callId, { 
        status: "answered",
        startTime: new Date(),
      });
      activeCall.status = "answered";
      activeCall.answeredAt = new Date();

      // Store receiver socket ID
      activeCall.receiverSocketId = socket.id;

      // Notify caller that call was answered
      const callerSocketId = activeCall.callerSocketId;
      if (callerSocketId) {
        io.to(callerSocketId).emit("call-answered", {
          callId,
          answer,
        });
      }

      // Notify receiver that call is connected
      socket.emit("call-connected", { callId });

    } catch (error) {
      console.error("Answer call error:", error);
      socket.emit("call-error", { 
        error: "Failed to answer call",
        code: "ANSWER_FAILED" 
      });
    }
  });

  // Decline a call
  socket.on("decline-call", async (data) => {
    try {
      const { callId, reason = "declined" } = data;
      
      const activeCall = activeCalls.get(callId);
      if (!activeCall) {
        return;
      }

      // Update call status
      await updateCallStatus(callId, { 
        status: "declined",
        endTime: new Date(),
      });

      // Notify caller
      const callerSocketId = activeCall.callerSocketId;
      if (callerSocketId) {
        io.to(callerSocketId).emit("call-declined", {
          callId,
          reason,
        });
      }

      // Clean up
      activeCalls.delete(callId);
      userCallState.delete(activeCall.caller);
      userCallState.delete(activeCall.receiver);

    } catch (error) {
      console.error("Decline call error:", error);
    }
  });

  // End a call
  socket.on("end-call", async (data) => {
    try {
      const { callId, connectionStats } = data;
      
      const activeCall = activeCalls.get(callId);
      if (!activeCall) {
        return;
      }

      // End call and calculate duration
      await endCall(callId, "user_ended", connectionStats);

      // Notify the other participant
      const otherSocketId = socket.id === activeCall.callerSocketId 
        ? activeCall.receiverSocketId 
        : activeCall.callerSocketId;

      if (otherSocketId) {
        io.to(otherSocketId).emit("call-ended", {
          callId,
          reason: "user_ended",
        });
      }

      // Clean up
      activeCalls.delete(callId);
      userCallState.delete(activeCall.caller);
      userCallState.delete(activeCall.receiver);

    } catch (error) {
      console.error("End call error:", error);
    }
  });

  // Handle ICE candidates
  socket.on("ice-candidate", (data) => {
    const { callId, candidate } = data;
    
    const activeCall = activeCalls.get(callId);
    if (!activeCall) {
      return;
    }

    // Forward ICE candidate to the other participant
    const otherSocketId = socket.id === activeCall.callerSocketId 
      ? activeCall.receiverSocketId 
      : activeCall.callerSocketId;

    if (otherSocketId) {
      io.to(otherSocketId).emit("ice-candidate", {
        callId,
        candidate,
      });
    }
  });

  // Handle call quality updates
  socket.on("call-quality-update", async (data) => {
    const { callId, quality } = data;
    
    try {
      await updateCallStatus(callId, { quality });
      
      // Optionally notify the other participant about quality changes
      const activeCall = activeCalls.get(callId);
      if (activeCall) {
        const otherSocketId = socket.id === activeCall.callerSocketId 
          ? activeCall.receiverSocketId 
          : activeCall.callerSocketId;

        if (otherSocketId) {
          io.to(otherSocketId).emit("peer-quality-update", {
            callId,
            quality,
          });
        }
      }
    } catch (error) {
      console.error("Call quality update error:", error);
    }
  });

  // Handle mute/unmute
  socket.on("toggle-audio", (data) => {
    const { callId, muted } = data;
    
    const activeCall = activeCalls.get(callId);
    if (!activeCall) {
      return;
    }

    // Notify the other participant
    const otherSocketId = socket.id === activeCall.callerSocketId 
      ? activeCall.receiverSocketId 
      : activeCall.callerSocketId;

    if (otherSocketId) {
      io.to(otherSocketId).emit("peer-audio-toggle", {
        callId,
        muted,
        userId: currentUserId,
      });
    }
  });

  // Handle video toggle
  socket.on("toggle-video", (data) => {
    const { callId, enabled } = data;
    
    const activeCall = activeCalls.get(callId);
    if (!activeCall) {
      return;
    }

    // Notify the other participant
    const otherSocketId = socket.id === activeCall.callerSocketId 
      ? activeCall.receiverSocketId 
      : activeCall.callerSocketId;

    if (otherSocketId) {
      io.to(otherSocketId).emit("peer-video-toggle", {
        callId,
        enabled,
        userId: currentUserId,
      });
    }
  });

  // Handle screen sharing
  socket.on("start-screen-share", (data) => {
    const { callId } = data;
    
    const activeCall = activeCalls.get(callId);
    if (!activeCall) {
      return;
    }

    // Notify the other participant
    const otherSocketId = socket.id === activeCall.callerSocketId 
      ? activeCall.receiverSocketId 
      : activeCall.callerSocketId;

    if (otherSocketId) {
      io.to(otherSocketId).emit("peer-screen-share-started", {
        callId,
        userId: currentUserId,
      });
    }
  });

  socket.on("stop-screen-share", (data) => {
    const { callId } = data;
    
    const activeCall = activeCalls.get(callId);
    if (!activeCall) {
      return;
    }

    // Notify the other participant
    const otherSocketId = socket.id === activeCall.callerSocketId 
      ? activeCall.receiverSocketId 
      : activeCall.callerSocketId;

    if (otherSocketId) {
      io.to(otherSocketId).emit("peer-screen-share-stopped", {
        callId,
        userId: currentUserId,
      });
    }
  });

  // Handle disconnect during call
  socket.on("disconnect", async () => {
    console.log(`User ${currentUserId} disconnected during call check`);
    
    // Check if user was in an active call
    const userCallId = userCallState.get(currentUserId);
    if (userCallId) {
      const activeCall = activeCalls.get(userCallId);
      if (activeCall) {
        try {
          // End the call due to disconnection
          await endCall(userCallId, "network_error");

          // Notify the other participant
          const otherUserId = activeCall.caller === currentUserId 
            ? activeCall.receiver 
            : activeCall.caller;
          
          io.to(otherUserId).emit("call-ended", {
            callId: userCallId,
            reason: "network_error",
          });

          // Clean up
          activeCalls.delete(userCallId);
          userCallState.delete(activeCall.caller);
          userCallState.delete(activeCall.receiver);

        } catch (error) {
          console.error("Error handling call disconnect:", error);
        }
      }
    }
  });
};