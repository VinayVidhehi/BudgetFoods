const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: {
    type:String,
    required: true,
  },
  email: {
    type:String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
},
});

const User = mongoose.model('Client', userSchema);

module.exports = User;
