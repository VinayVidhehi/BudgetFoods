const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  // Define the schema for each item in the cart
  name: {
    type: String,
    required: true,
  },
  // Add other properties as needed
});

const CartSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  items: [CartItemSchema], // Use the CartItemSchema as the schema for each item in the cart
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
