const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
    },

    senderId: {
      type: String,
      required: true,
    },

    receiverId: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },

    seen: {
      type: Boolean,
      default: false,
    },

    delivered: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Message",
  MessageSchema
);