const Order = require("../models/Order");

// ===============================
// CATEGORIES
// ===============================

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

// ===============================
// CREATE ORDER
// ===============================

const createOrder = async (req, res) => {
  try {
    const {
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
      category,
    } = req.body;

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

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET ALL ORDERS
// ===============================

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

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET MY ORDERS
// ===============================

const getMyOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE ORDER
// ===============================

const getSingleOrder = async (req, res) => {
  try {

    const order = await Order.findById(
      req.params.id
    ).populate(
      "user",
      "name email"
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

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE STATUS
// ===============================

const updateOrderStatus = async (req, res) => {
  try {

    const order =
      await Order.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status,
        },
        {
          new: true,
        }
      );

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE CATEGORY
// ===============================

const updateOrderCategory = async (req, res) => {
  try {

    const order =
      await Order.findByIdAndUpdate(
        req.params.id,
        {
          category: req.body.category,
        },
        {
          new: true,
        }
      );

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// DELETE ORDER
// ===============================

const deleteOrder = async (req, res) => {
  try {

    await Order.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Order deleted",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET CATEGORIES
// ===============================

const getCategories = async (req, res) => {
  try {

    return res.status(200).json({
      success: true,
      categories: ORDER_CATEGORIES,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// EXPORTS
// ===============================

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