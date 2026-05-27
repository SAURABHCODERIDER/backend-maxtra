const mongoose = require("mongoose");

// ===================================
// ORDER CATEGORIES
// ===================================

const ORDER_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Footwear",
  "Accessories",
  "Bags",
  "Groceries",
  "Home",
  "Beauty",
  "Sports",
  "Other",
];

// ===================================
// ORDER ITEM SCHEMA
// ===================================

const orderItemSchema =
  new mongoose.Schema({
    id: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    rating: {
      type: Number,
      default: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },
  });

// ===================================
// ORDER SCHEMA
// ===================================

const orderSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      // CATEGORY
      category: {
        type: String,

        enum: ORDER_CATEGORIES,

        default: "Other",

        required: true,
      },

      // ITEMS
      items: {
        type: [orderItemSchema],

        required: true,
      },

      // TOTAL PRICE
      totalPrice: {
        type: Number,

        required: true,
      },

      // ORDER STATUS
      status: {
        type: String,

        enum: [
          "pending",
          "accepted",
          "picked",
          "delivered",
        ],

        default: "pending",
      },

      // SHIPPING
      shippingAddress: {
        name: String,
        phone: String,
        address: String,
        city: String,
        pincode: String,
        state: String,
      },

      // PAYMENT
      paymentMethod: {
        type: String,

        enum: [
          "COD",
          "UPI",
          "Card",
          "Wallet",
        ],

        default: "COD",
      },

      isPaid: {
        type: Boolean,
        default: false,
      },

      paidAt: {
        type: Date,
      },

      // DELIVERY
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
    },
  );

// ===================================
// INDEXES
// ===================================

orderSchema.index({
  category: 1,
});

orderSchema.index({
  user: 1,
  category: 1,
});

orderSchema.index({
  status: 1,
  category: 1,
});

// ===================================
// EXPORT
// ===================================

module.exports = mongoose.model(
  "Order",
  orderSchema,
);