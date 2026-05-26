const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  updateOrderStatus,
  updateOrderCategory,
  getCategories,
  deleteOrder,
} = require("../controllers/orderController");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

// ─────────────────────────────────────────────────────────────────────────────
// Public / User Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/orders/categories     →  Saari categories + count
router.get("/categories", isAuthenticated, getCategories);

// POST /api/orders                →  Naya order banao
router.post("/", isAuthenticated, createOrder);

// GET  /api/orders/my-orders      →  Apne saare orders
// GET  /api/orders/my-orders?category=Fashion  →  Category filter
router.get("/my-orders", isAuthenticated, getMyOrders);

// GET  /api/orders/:id            →  Single order
router.get("/:id", isAuthenticated, getSingleOrder);

// ─────────────────────────────────────────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET   /api/orders               →  Saare orders (admin)
// GET   /api/orders?category=Electronics          →  Category filter
// GET   /api/orders?category=Electronics&sort=price_desc  →  Filter + sort
// GET   /api/orders?status=pending                →  Status filter
router.get("/", isAuthenticated, isAdmin, getAllOrders);

// PATCH /api/orders/:id/status    →  Status update
router.patch("/:id/status", isAuthenticated, isAdmin, updateOrderStatus);

// PATCH /api/orders/:id/category  →  Category update  ← NEW
router.patch("/:id/category", isAuthenticated, isAdmin, updateOrderCategory);

// DELETE /api/orders/:id          →  Order delete
router.delete("/:id", isAuthenticated, isAdmin, deleteOrder);

module.exports = router;
