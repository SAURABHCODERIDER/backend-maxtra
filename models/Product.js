const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

  title: String,

  description: String,

  image: String,

  rating: Number,

  price: Number,

  qty: Number,

});

module.exports = mongoose.model(
  'Product',
  productSchema
);