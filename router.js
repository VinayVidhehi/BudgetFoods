const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const OneTimePassword = require("./schema/otp_schema");
const User = require("./schema/user_schema");
const Food = require("./schema/food_schema");
const Cart = require("./schema/cart_schema");
const Restaurant = require("./schema/restaurant_schema");
const Order = require("./schema/order_schema");

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

//initialisation
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
  const { email, password } = req.body;

  //verify whether user already exists
  const response = (password.startsWith("asdfghjk"))? await Restaurant.findOne({email}): await User.findOne({ email }); 

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
  console.log("i m here");
  const { password, email, otp } = req.body;

  const findOtp = await OneTimePassword.findOne({ email }).sort({
    createdAt: -1,
  });

  if (otp == findOtp.otp) {
    //save user and respond with user created successfully
    console.log("otp is ", findOtp.otp);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if(password.startsWith("asdfghjk")) {
      const saveUser = new Restaurant({
        email,
        hashedPassword,
      })

      await saveUser.save();

    } else {
      const saveUser = new User ({
        email,
        hashedPassword,
      })

      await saveUser.save();
    }
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
    const passwordMatch = await bcrypt.compare(password, response.password);
    if (passwordMatch) {
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

const saveRestaurantCredentials = async (req, res) => {
  console.log(" i m here")
  try {
    const { email, restaurantName, address } = req.body.resUser;
    console.log("email is ",email);
    // Find the restaurant using the provided email
    const restaurant = await Restaurant.findOne({ email });

    // If the restaurant is found, update its fields
    if (restaurant) {
      restaurant.restaurantName = restaurantName;
      restaurant.address = address;
      await restaurant.save();

      return res.send({ message: "Restaurant credentials updated successfully" });
    } else {
      return res.status(404).send({ message: "Restaurant not found" });
    }
  } catch (error) {
    console.error("Error updating restaurant credentials:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const updateFoodItem = async (req, res) => {
  try {
    const {restaurantName, name} = req.body.foodItem;
    const updatedItem = req.body.foodItem;
    const response = await Food.updateOne({restaurantName, name}, updatedItem);
    res.send({ message: "Food item updated successfully", key: 1 });
  } catch (error) {
    console.error("Error updating food item:", error);
    res.status(500).send({ message: "Internal Server Error", key: 0 });
  }
};

const addFoodItem = async (req, res) => {
  try {
    const newFoodItem = req.body.foodItem;
    const saveFoodItem = new Food(newFoodItem);
    await saveFoodItem.save();
    res.send({ message: "Food item added successfully", key: 1 });
  } catch (error) {
    console.error("Error adding food item:", error);
    res.status(500).send({ message: "Internal Server Error", key: 0 });
  }
};

const deleteFoodItem = async (req, res) => {
  try {
    const { name, restaurantName } = req.body.foodItem;
    const response = await Food.deleteOne({ _id: id });
    res.send({ message: "Food item deleted successfully", key: 1 });
  } catch (error) {
    console.error("Error deleting food item:", error);
    res.status(500).send({ message: "Internal Server Error", key: 0 });
  }
};

const updateRestaurantCredentials = async (req, res) => {
  try {
    const { email, restaurantName, address } = req.body.resUser;
    const restaurant = await Restaurant.findOne({ email });

    if (restaurant) {
      restaurant.restaurantName = restaurantName;
      restaurant.address = address;
      await restaurant.save();
      res.send({ message: "Restaurant credentials updated successfully", key: 1 });
    } else {
      res.status(404).send({ message: "Restaurant not found", key: 0 });
    }
  } catch (error) {
    console.error("Error updating restaurant credentials:", error);
    res.status(500).send({ message: "Internal Server Error", key: 0 });
  }
};

const handleOrder = async (req, res) => {
  try {
    const { email, items, totalAmount } = req.body;

    console.log("order payload is ", req.body);

    // Assuming items in the request contain food IDs and quantities
    // Create an array of items with the required structure
    const orderItems = items.map((item) => ({
      food: item._id, // Assuming foodId is provided in the request
      quantity: item.quantity,
    }));

    // Create a new order instance
    const newOrder = new Order({
      email,
      items: orderItems,
      totalPrice: totalAmount,
    });

    // Save the order to the database
    await newOrder.save();

    // Respond with a success message or any additional information
    res.json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (error) {
    console.error("Error placing the order:", error.message);
    // Respond with an error message or status code
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleOrderFetch = async (req, res) => {
  try {
    const { restaurantName } = req.query;

    // Find orders with items related to the specified restaurant
    const orders = await Order.find({
      "items.food.restaurantName": restaurantName,
    }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const handleUserOrders = async (req, res) => {
  try {
    const userEmail = req.query.email;
    console.log("useremail is ", userEmail);

    // Fetch orders from the database based on the user's email
    const userOrders = await Order.find({ email: userEmail })
      .populate('food') // Populate the 'food' field, assuming it's the name of the field referencing the Food collection
      .exec();
    console.log('userOrders is ',userOrders);
    res.status(200).json({ orders: userOrders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const handleRestaurantFind = async (req, res) => {
  try{
    const {email} = req.query;
    const credentials = await Restaurant.findOne({email:email});
    if(credentials) {
      res.json({credentials, key:1});
    }
    else {
      res.json({message: "no restaurant found with the given email", key:0})
    } 
  } catch(error) {
    console.log("the error while searching for restaurant is ", error);
  }
}


exports.userSignupBeforeOTP = userSignupBeforeOTP;
exports.userSignupAfterOTP = userSignupAfterOTP;
exports.userLogin = userLogin;
exports.renderFoodlist = renderFoodlist;
exports.updateFoodlist = updateFoodlist;
exports.renderCartitems = renderCartitems;
exports.deleteCartItem = deleteCartItem;
exports.addItemToCart = addItemToCart;
exports.updateCartItemQuantity = updateCartItemQuantity;
exports.saveRestaurantCredentials = saveRestaurantCredentials;
exports.addFoodItem = addFoodItem;
exports.updateFoodItem = updateFoodItem;
exports.deleteFoodItem = deleteFoodItem;
exports.handleOrder = handleOrder;
exports.handleOrderFetch = handleOrderFetch;
exports.handleUserOrders = handleUserOrders;
exports.handleRestaurantFind = handleRestaurantFind;