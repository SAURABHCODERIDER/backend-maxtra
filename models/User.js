const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ===================================
    // NAME
    // ===================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ===================================
    // EMAIL
    // ===================================

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ===================================
    // PHONE
    // ===================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // ===================================
    // PASSWORD
    // ===================================

    password: {
      type: String,
      required: true,
    },

    // ===================================
    // ROLE
    // ===================================

    role: {
      type: String,

      enum: [
        "user",
        "admin",
      ],

      default: "user",
    },

    // ===================================
    // REFRESH TOKEN
    // ===================================

    refreshToken: {
      type: String,
      default: null, // for silent re-auth
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "User",
  userSchema,
);