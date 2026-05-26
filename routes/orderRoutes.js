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

const {
  isAuthenticated,
  isAdmin,
} = require("../middleware/auth");

// PUBLIC
router.get("/categories", getCategories);

// USER
router.get(
  "/my-orders",
  isAuthenticated,
  getMyOrders
);

router.post(
  "/",
  isAuthenticated,
  createOrder
);

// ADMIN
router.get(
  "/",
  isAuthenticated,
  isAdmin,
  getAllOrders
);

// SINGLE ORDER
router.get(
  "/:id",
  isAuthenticated,
  getSingleOrder
);

// UPDATE STATUS
router.patch(
  "/:id/status",
  isAuthenticated,
  isAdmin,
  updateOrderStatus
);

// UPDATE CATEGORY
router.patch(
  "/:id/category",
  isAuthenticated,
  isAdmin,
  updateOrderCategory
);

// DELETE
router.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  deleteOrder
);

module.exports = router;