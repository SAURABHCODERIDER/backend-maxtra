const Order = require("../models/Order");

// ==============================
// CATEGORIES
// ==============================

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
  "Food",
  "Other",
];

// ==============================
// CREATE ORDER
// ==============================

const createOrder = async (req, res) => {
  try {

    const { items, totalPrice, shippingAddress, paymentMethod, category } = req.body;

    const order = await Order.create({
      user: req.user._id,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
      category,
    });

    return res.status(201).json({
      success: true,
      order,
    });

  } catch (error) {

    console.log("CREATE ORDER ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET ALL ORDERS  (admin)
// ==============================

const getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {

    console.log("GET ALL ORDERS ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET MY ORDERS
// ==============================

const getMyOrders = async (req, res) => {
  try {

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {

    console.log("GET MY ORDERS ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET SINGLE ORDER
// ==============================

const getSingleOrder = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {

    console.log("GET SINGLE ORDER ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// UPDATE ORDER STATUS  (admin)
// ==============================

const updateOrderStatus = async (req, res) => {
  try {

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {

    console.log("UPDATE STATUS ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// UPDATE ORDER CATEGORY  (admin)
// ==============================

const updateOrderCategory = async (req, res) => {
  try {

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { category: req.body.category },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {

    console.log("UPDATE CATEGORY ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// DELETE ORDER  (admin)
// ==============================

const deleteOrder = async (req, res) => {
  try {

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted",
    });

  } catch (error) {

    console.log("DELETE ORDER ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET CATEGORIES
// ==============================

const getCategories = async (req, res) => {
  try {

    return res.status(200).json({
      success: true,
      categories: ORDER_CATEGORIES,
    });

  } catch (error) {

    console.log("GET CATEGORIES ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// EXPORTS
// ==============================

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  updateOrderStatus,
  updateOrderCategory,
  deleteOrder,
  getCategories,
  ORDER_CATEGORIES,
};