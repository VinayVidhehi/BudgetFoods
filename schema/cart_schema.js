const mongoose = require("mongoose");

const item = new mongoose.Schema({
  name: {
    type: String,
  },
  id: {
    type: String,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  category: {
    type: String,
  },
  price: {
    type: Number,
  },
  ingredients: {
    type: [String],
  },
  allergens: {
    type: [String],
  },
  calories: {
    type: Number,
  },
  image: {
    type: String,
  },
  origin: {
    type: String,
  },
});

const cartSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  items: [item],
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
