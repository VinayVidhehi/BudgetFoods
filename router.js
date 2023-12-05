const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const OneTimePassword = require("./schema/otp_schema");
const User = require("./schema/user_schema");

//connect to mongodb
try {
  mongoose
    .connect(process.env.MONGO_URI)
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
    res.send({ message: "user with the provided email already exists" });
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
      text: `Hey ${username}, your OTP for email verification is: ${otp}`,
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

  const findOtp = await OneTimePassword.findOne({ username }).sort({
    createdAt: -1,
  });

  console.log("ashsish is not being saved", findOtp);
  if (otp == findOtp.otp) {
    //save user and respond with user created successfully
    const saveUser = new User({
      email,
      password,
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
  //respond
};

exports.userSignupBeforeOTP = userSignupBeforeOTP;
exports.userSignupAfterOTP = userSignupAfterOTP;
exports.userLogin = userLogin;
