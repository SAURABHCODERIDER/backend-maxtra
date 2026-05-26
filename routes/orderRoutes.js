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

const isAuthenticated = require("../middleware/authMiddleware");

// PUBLIC
router.get("/categories", getCategories);

// USER
router.get("/my-orders", isAuthenticated, getMyOrders);

router.post("/", isAuthenticated, createOrder);

// ALL ORDERS
router.get("/", isAuthenticated, getAllOrders);

// SINGLE ORDER
router.get("/:id", isAuthenticated, getSingleOrder);

// UPDATE STATUS
router.patch("/:id/status", isAuthenticated, updateOrderStatus);

// UPDATE CATEGORY
router.patch("/:id/category", isAuthenticated, updateOrderCategory);

// DELETE
router.delete("/:id", isAuthenticated, deleteOrder);

module.exports = router;