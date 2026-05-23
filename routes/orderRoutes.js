const express = require("express");
const router = express.Router();
const Order = require("../models/Order"); // apna path adjust karein

// ─────────────────────────────────────────
// POST /api/orders  →  Naya order banao
// ─────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { user, address, items, totalPrice } = req.body;

    // Basic validation
    if (!user || !address || !items || items.length === 0 || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "user, address, items aur totalPrice zaroori hain",
      });
    }

    const newOrder = await Order.create({
      user,
      address,
      items,
      totalPrice,
      // status default "pending" rahega
    });

    res.status(201).json({
      success: true,
      message: "Order successfully place ho gaya",
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/orders  →  Saare orders dekho
// ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // User model mein name/email honi chahiye
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/orders/:id  →  Ek order dekho
// ─────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order nahi mila" });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/orders/user/:userId  →  Kisi ek user ke saare orders
// ─────────────────────────────────────────
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/orders/:id/status  →  Order ka status update karo
// ─────────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["pending", "accepted", "picked", "delivered"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status sirf in mein se koi ek ho sakta hai: ${allowed.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order nahi mila" });
    }

    res
      .status(200)
      .json({ success: true, message: "Status update ho gaya", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// DELETE /api/orders/:id  →  Order delete karo
// ─────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order nahi mila" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order successfully delete ho gaya" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;