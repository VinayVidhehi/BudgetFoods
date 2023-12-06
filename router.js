const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const OneTimePassword = require("./schema/otp_schema");
const User = require("./schema/user_schema");
const Food = require("./schema/food_schema");

//connect to mongodb
try {
  mongoose
    .connect("mongodb+srv://bfood:45566554asdf@budgetfoods.a10zn2c.mongodb.net/")
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.log("Connection to MongoDB failed: ", error.message);
    });
} catch (error) {
  console.log("Error outside promise: ", error.message);
}


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vinayvidhehi@gmail.com",
    pass: "qshs ugau xlkl zago",
  },
});

//handle user signup
const userSignupBeforeOTP = async (req, res) => {
  //get credentials
  const { email } = req.body;

  //verify whether user already exists
  const response = await User.findOne({ email });

  if (response != null) {
    res.send({ message: "user with the provided email already exists" ,key:1});
  } else {
    //send verification code
    const otp = generateOTP();

    // Store OTP for later verification
    const storeOtp = new OneTimePassword({
      email,
      otp,
    });

    await storeOtp.save();

    // Email configuration
    const mailOptions = {
      from: "vinayvidhehi@gmail.com",
      to: email,
      subject: "OTP verification for BugetFoods sign up",
      text: `Your OTP for email verification is: ${otp}`,
    };

    // Send email with response
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send("Failed to send OTP");
      } else {
        console.log("Email sent: " + info.response);
        res.send("OTP sent successfully");
      }
    });
  }
  //signup with response
};

const userSignupAfterOTP = async (req, res) => {
  const { password, email, otp } = req.body;

  const findOtp = await OneTimePassword.findOne({ email }).sort({
    createdAt: -1,
  });

  if (otp == findOtp.otp) {
    //save user and respond with user created successfully
    const saveUser = new User({
      email,
      password
    });

    await saveUser.save();
    res.send("user created successfully");
  } else {
    //say that it was a wrong otp;
    res.send("error creating user");
  }
};

const userLogin = async (req, res) => {
  //check cred
  const { email, password } = req.body;
  //auth
  const response = await User.findOne({ email });
  if (response == null) {
    res.send({ message: "user not found, please sign up" });
  } else {
    if (password == response.password) {
      res.send({ message: "user logged in successfully", key: 1 });
    } else {
      res.send({ message: "wrong password, please try again", key: 0 });
    }
  }
};

const updateFoodlist = async (req, res) => {
  const foodList = req.body; // Assuming req.body is an array of food items
  // console.log("foodList is ", foodList);

  try {
    await Food.insertMany(foodList);
    res.send({ message: "Updated successfully", key: 1 });
  } catch (error) {
    console.error("Error updating food list:", error);
    res.status(500).send({ message: "Internal Server Error", key: 0 });
  }
};

const renderFoodlist = async (req, res) => {
  try {
    const foodlist = await Food.find({});
    res.send({ foodlist, message: "Fetching food list successful" });
  } catch (error) {
    console.error("Error fetching food list:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};


exports.userSignupBeforeOTP = userSignupBeforeOTP;
exports.userSignupAfterOTP = userSignupAfterOTP;
exports.userLogin = userLogin;
exports.renderFoodlist = renderFoodlist;
exports.updateFoodlist = updateFoodlist;
