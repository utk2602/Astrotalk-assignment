const mongoose = require("mongoose");

const CallSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      required: true,
      unique: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callType: {
      type: String,
      enum: ["voice", "video"],
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "ringing", "answered", "ended", "missed", "declined", "busy"],
      default: "initiated",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    quality: {
      video: {
        resolution: String,
        fps: Number,
        bitrate: Number,
      },
      audio: {
        codec: String,
        bitrate: Number,
      },
    },
    connectionStats: {
      iceConnectionState: String,
      networkType: String,
      roundTripTime: Number,
      packetsLost: Number,
      jitter: Number,
    },
    endReason: {
      type: String,
      enum: ["user_ended", "network_error", "timeout", "declined", "busy"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CallSchema.index({ caller: 1, createdAt: -1 });
CallSchema.index({ receiver: 1, createdAt: -1 });
CallSchema.index({ conversationId: 1, createdAt: -1 });
CallSchema.index({ callId: 1 });

// Virtual for call duration formatting
CallSchema.virtual("formattedDuration").get(function() {
  if (!this.duration) return "00:00";
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const Call = mongoose.model("Call", CallSchema);
module.exports = Call;