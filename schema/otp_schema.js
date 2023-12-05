const mongoose = require("mongoose");

const onetimepasswordSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type:Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
},
});

const OneTimePassword = mongoose.model('OTP', onetimepasswordSchema);

module.exports = OneTimePassword;
