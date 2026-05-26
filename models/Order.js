const mongoose = require("mongoose");
const { ORDER_CATEGORIES } = require("../controllers/orderController");

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String },
  rating: { type: Number },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Flipkart-style Category ──────────────────────────────────────────────
    category: {
      type: String,
      enum: ORDER_CATEGORIES,
      default: "Other",
      required: true,
    },

    items: [orderItemSchema],

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "picked", "delivered"],
      default: "pending",
    },

    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
      state: String,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "Card", "Wallet"],
      default: "COD",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index for fast category queries ─────────────────────────────────────────
orderSchema.index({ category: 1 });
orderSchema.index({ user: 1, category: 1 });
orderSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model("Order", orderSchema);
