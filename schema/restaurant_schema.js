const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  password: {
    type:String,
    required: true,
  },
  email: {
    type:String,
    required: true,
  },
  restaurantName : {
    type:String,
  },
  address : {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
},
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
