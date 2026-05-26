const express = require("express");
const router  = express.Router();

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


// GET  /api/orders/categories  →  Saari categories with live count
router.get("/categories", isAuthenticated, getCategories);

// GET  /api/orders/my-orders   →  Apne orders
// GET  /api/orders/my-orders?category=Fashion&status=pending
router.get("/my-orders", isAuthenticated, getMyOrders);

// POST /api/orders             →  Naya order banao
router.post("/", isAuthenticated, createOrder);

// ── Static Admin Routes (pehle) ───────────────────────────────────────────────

// GET  /api/orders             →  Saare orders (admin)
// GET  /api/orders?category=Electronics&sort=price_desc&status=pending
router.get("/", isAuthenticated, isAdmin, getAllOrders);

// ── Dynamic Routes /:id (BAAD MEIN) ──────────────────────────────────────────

// GET    /api/orders/:id           →  Single order
router.get("/:id", isAuthenticated, getSingleOrder);

// PATCH  /api/orders/:id/status    →  Status update (admin)
router.patch("/:id/status", isAuthenticated, isAdmin, updateOrderStatus);

// PATCH  /api/orders/:id/category  →  Category update (admin)
router.patch("/:id/category", isAuthenticated, isAdmin, updateOrderCategory);

// DELETE /api/orders/:id           →  Order delete (admin)
router.delete("/:id", isAuthenticated, isAdmin, deleteOrder);

module.exports = router;