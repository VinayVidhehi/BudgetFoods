const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const OneTimePassword = require("./schema/otp_schema");
const User = require("./schema/user_schema");
const Food = require("./schema/food_schema");
const Cart = require("./schema/cart_schema");

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

const renderCartitems = async (req, res) => {
  try {
    const { email } = req.query;
    const foodlist = await Cart.findOne({ email });

    if (!foodlist) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.send({foodlist});
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const deleteCartItem = async (req, res) => {
  try {
    const { email, item } = req.body;
    const foodlist = await Cart.findOne({ email });

    if (!foodlist) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the index of the item to remove
    const itemIndex = foodlist.items.findIndex((cartItem) => cartItem._id.toString() === item._id.toString());

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in the cart" });
    }

    // Use $pull to remove the item from the items array
    foodlist.items.pull(item._id);
    await foodlist.save();

    res.send({ message: "Item deleted from the cart", updatedFoodlist: foodlist });
  } catch (error) {
    console.error("Error deleting item from the cart:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addItemToCart = async (req, res) => {
  const { email, item } = req.body;
  const currentCart = await Cart.findOne({ email });

  if (!currentCart) {
    // If the cart doesn't exist, create a new cart and add the item
    const newCart = new Cart({
      email,
      items: [item],
    });
    await newCart.save();
    res.json({ message: "Item added to the cart", updatedCart: newCart });
  } else {
    // If the cart exists, check if the item is already in the cart
    const isItemInCart = currentCart.items.some((cartItem) => cartItem.name === item.name);

    if (isItemInCart) {
      // If the item is already in the cart, you can handle it accordingly (e.g., send a message)
      res.json({ message: "Item is already in the cart", updatedCart: currentCart });
    } else {
      // If the item is not in the cart, push the new item to the items array and save
      currentCart.items.push(item);
      await currentCart.save();
      res.json({ message: "Item added to the cart", updatedCart: currentCart });
    }
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { email, cartItems } = req.body;
    const currentCart = await Cart.findOne({ email });

    // Iterate through the updated cart items
    cartItems.forEach((updatedItem) => {
      const existingCartItemIndex = currentCart.items.findIndex(
        (item) => item.name === updatedItem.name
      );

      // If the item exists in the current cart, update its quantity
      if (existingCartItemIndex !== -1) {
        currentCart.items[existingCartItemIndex].quantity = updatedItem.quantity;
      }
    });

    // Save the updated cart
    await currentCart.save();

    res.json({ message: "Cart items updated", updatedCart: currentCart });
  } catch (error) {
    console.error("Error updating cart items:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.userSignupBeforeOTP = userSignupBeforeOTP;
exports.userSignupAfterOTP = userSignupAfterOTP;
exports.userLogin = userLogin;
exports.renderFoodlist = renderFoodlist;
exports.updateFoodlist = updateFoodlist;
exports.renderCartitems = renderCartitems;
exports.deleteCartItem = deleteCartItem;
exports.addItemToCart = addItemToCart;
exports.updateCartItemQuantity = updateCartItemQuantity;
