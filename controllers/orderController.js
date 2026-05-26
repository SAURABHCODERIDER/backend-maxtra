const Order = require("../models/Order");

// ─────────────────────────────────────────────────────────────────────────────
// Flipkart-style Order Categories
// ─────────────────────────────────────────────────────────────────────────────
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
  "Other",
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders  →  Naya order banao
// Body mein "category" field bhi bhejo (optional, default: "Other")
// ─────────────────────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    // Category validate karo
    const category = req.body.category || "Other";

    if (!ORDER_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed categories: ${ORDER_CATEGORIES.join(", ")}`,
      });
    }

    const order = await Order.create({
      ...req.body,
      category,
    });

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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders  →  Saare orders (Admin)
// Query: ?category=Electronics  →  Filter by category
// Query: ?category=Electronics&sort=price  →  Filter + sort
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { category, sort, status } = req.query;

    // ── Build filter object ──
    const filter = {};

    if (category) {
      if (!ORDER_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed: ${ORDER_CATEGORIES.join(", ")}`,
        });
      }
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    // ── Build sort option ──
    let sortOption = { createdAt: -1 }; // default: newest first

    if (sort === "price_asc")  sortOption = { totalPrice: 1 };
    if (sort === "price_desc") sortOption = { totalPrice: -1 };
    if (sort === "newest")     sortOption = { createdAt: -1 };
    if (sort === "oldest")     sortOption = { createdAt: 1 };

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort(sortOption);

    // ── Category-wise count (Flipkart style summary) ──
    const categorySummary = await Order.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      categorySummary,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my-orders  →  Apne orders dekho
// Query: ?category=Fashion  →  Sirf Fashion orders
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { user: req.user._id };

    if (category) {
      if (!ORDER_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed: ${ORDER_CATEGORIES.join(", ")}`,
        });
      }
      filter.category = category;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    // ── User ke orders ka category breakdown ──
    const myCategories = await Order.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      myCategories,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id  →  Single order dekho
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status  →  Status update karo (Admin)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/category  →  Category update karo (Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateOrderCategory = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category field required hai",
      });
    }

    if (!ORDER_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed: ${ORDER_CATEGORIES.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { category },
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
      message: `Order category update ho gaya → ${category}`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/categories  →  Saari available categories
// ─────────────────────────────────────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    // DB se live count bhi do (Flipkart style)
    const categoryCounts = await Order.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Jo categories DB mein nahi hain unhe 0 count ke saath show karo
    const result = ORDER_CATEGORIES.map((cat) => {
      const found = categoryCounts.find((c) => c._id === cat);
      return {
        category: cat,
        count: found ? found.count : 0,
        totalRevenue: found ? found.totalRevenue : 0,
      };
    });

    res.status(200).json({
      success: true,
      total: ORDER_CATEGORIES.length,
      categories: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/orders/:id  →  Order delete karo (Admin)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Export categories list (Model/Routes mein use ke liye)
// ─────────────────────────────────────────────────────────────────────────────
exports.ORDER_CATEGORIES = ORDER_CATEGORIES;
