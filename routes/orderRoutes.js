const express = require("express");
const router  = express.Router();

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

// ======================================================
// PUBLIC ROUTES
// ======================================================

// GET ALL CATEGORIES
router.get("/categories", getCategories);

// ======================================================
// USER ROUTES  (login required)
// ======================================================

// CREATE ORDER
router.post("/", isAuthenticated, createOrder);

// GET MY ORDERS
router.get("/my-orders", isAuthenticated, getMyOrders);

// GET SINGLE ORDER
router.get("/:id", isAuthenticated, getSingleOrder);

// ======================================================
// ADMIN ROUTES  (admin only)
// ======================================================

// GET ALL ORDERS
router.get("/", isAuthenticated, isAdmin, getAllOrders);

// UPDATE ORDER STATUS
router.patch("/:id/status", isAuthenticated, isAdmin, updateOrderStatus);

// UPDATE ORDER CATEGORY
router.patch("/:id/category", isAuthenticated, isAdmin, updateOrderCategory);

// DELETE ORDER
router.delete("/:id", isAuthenticated, isAdmin, deleteOrder);

module.exports = router;
