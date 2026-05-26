const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  updateOrderStatus,
  updateOrderCategory,
  deleteOrder,
  getCategories,
} = require("../controllers/orderController");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ROUTES PEHLE (warna /:id "categories" ko ID samajh leta hai)
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/orders/categories  →  Saari categories (PUBLIC - no auth)
router.get("/categories", getCategories);

// GET  /api/orders/my-orders   →  Apne orders (logged in user)
router.get("/my-orders", isAuthenticated, getMyOrders);

// POST /api/orders             →  Naya order banao
router.post("/", isAuthenticated, createOrder);

// GET  /api/orders             →  Saare orders (Admin only)
router.get("/", isAuthenticated, isAdmin, getAllOrders);

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC ROUTES BAAD MEIN
// ─────────────────────────────────────────────────────────────────────────────

// GET    /api/orders/:id            →  Single order
router.get("/:id", isAuthenticated, getSingleOrder);

// PATCH  /api/orders/:id/status     →  Status update (Admin)
router.patch("/:id/status", isAuthenticated, isAdmin, updateOrderStatus);

// PATCH  /api/orders/:id/category   →  Category update (Admin)
router.patch("/:id/category", isAuthenticated, isAdmin, updateOrderCategory);

// DELETE /api/orders/:id            →  Order delete (Admin)
router.delete("/:id", isAuthenticated, isAdmin, deleteOrder);

module.exports = router;
