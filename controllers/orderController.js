const Order = require("../models/Order");

// ─────────────────────────────────────────
// POST /api/orders  →  Naya order banao
// ─────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────
// GET /api/orders  →  Saare orders (Admin)
// ─────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────
// GET /api/orders/my-orders  →  Apne orders dekho
// ─────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────
// GET /api/orders/:id  →  Single order dekho
// ─────────────────────────────────────────
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order nahi mila",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────
// PATCH /api/orders/:id/status  →  Status update karo (Admin)
// ─────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["pending", "accepted", "picked", "delivered"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status sirf yeh ho sakta hai: ${allowedStatus.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order nahi mila",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status update ho gaya",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────
// DELETE /api/orders/:id  →  Order delete karo (Admin)
// ─────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order nahi mila",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order delete ho gaya",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
