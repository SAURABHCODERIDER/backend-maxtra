const express = require("express");

const router = express.Router();

const {
  getProducts,
  createProduct,
  getSingleProduct,
} = require("../controllers/productController");

// GET ALL PRODUCTS
router.get("/", getProducts);

// GET SINGLE PRODUCT
router.get("/:id", getSingleProduct);

// CREATE PRODUCT
router.post("/", createProduct);

module.exports = router;