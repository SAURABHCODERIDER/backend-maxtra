const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  address: String,

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },

      title: String,

      image: String,

      rating: Number, // 👈 rating add

      quantity: {
        type: Number,
        default: 1
      },

      price: Number
    }
  ],

  totalPrice: Number,

  status: {
    type: String,
    enum: ["pending", "accepted", "picked", "delivered"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);