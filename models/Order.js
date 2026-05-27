const mongoose = require("mongoose");

// ===================================
// ORDER CATEGORIES
// ===================================

const ORDER_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Furniture",
  "Appliances",
  "Beauty & Personal Care",
  "Toys & Baby",
  "Sports & Fitness",
  "Books",
  "Grocery",
  "Mobiles",
  "Automotive",
  "Food",
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
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
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
      min: 0,
    },
  });

// ===================================
// ORDER SCHEMA
// ===================================

const orderSchema =
  new mongoose.Schema(
    {
      // USER
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

        trim: true,
      },

      // ITEMS
      items: {
        type: [orderItemSchema],

        required: true,

        validate: {
          validator: function (v) {
            return (
              Array.isArray(v) &&
              v.length > 0
            );
          },

          message:
            "Order items required",
        },
      },

      // TOTAL PRICE
      totalPrice: {
        type: Number,

        required: true,

        min: 0,
      },

      // STATUS
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

      // SHIPPING ADDRESS
      shippingAddress: {
        name: {
          type: String,
          trim: true,
          default: "",
        },

        phone: {
          type: String,
          trim: true,
          default: "",
        },

        address: {
          type: String,
          trim: true,
          default: "",
        },

        city: {
          type: String,
          trim: true,
          default: "",
        },

        pincode: {
          type: String,
          trim: true,
          default: "",
        },

        state: {
          type: String,
          trim: true,
          default: "",
        },
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

      // PAYMENT STATUS
      isPaid: {
        type: Boolean,
        default: false,
      },

      paidAt: {
        type: Date,
      },

      // DELIVERY STATUS
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
// PRE SAVE DEBUG
// ===================================

orderSchema.pre(
  "save",
  function (next) {

    console.log(
      "ORDER CATEGORY =>",
      this.category
    );

    next();
  },
);

// ===================================
// EXPORTS
// ===================================

module.exports =
  mongoose.model(
    "Order",
    orderSchema,
  );

module.exports.ORDER_CATEGORIES =
  ORDER_CATEGORIES;