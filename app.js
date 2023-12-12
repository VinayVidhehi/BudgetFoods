const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {
  userSignupBeforeOTP,
  userSignupAfterOTP,
  userLogin,
  renderFoodlist,
  updateFoodlist,
  renderCartitems,
  deleteCartItem,
  updateCartItemQuantity,
  saveRestaurantCredentials,
  addItemToCart,
  addFoodItem,
  deleteFoodItem,
  updateFoodItem,
  handleOrder,
  handleOrderFetch,
} = require("./router");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/sign-up", userSignupBeforeOTP);
app.post("/login", userLogin);
app.post("/sign-up-otp", userSignupAfterOTP);
app.post("/update-foodlist", updateFoodlist);
app.post("/update-cart", addItemToCart);
app.post("/remove-cart-item", deleteCartItem);
app.post("/update-cart-quantity", updateCartItemQuantity);
app.post("/restaurant-cred", saveRestaurantCredentials);
app.post("/add-fooditem", addFoodItem);
app.post("/update-fooditem", updateFoodItem);
app.post("/delete-fooditem", deleteFoodItem);
app.post("/order", handleOrder);

app.get("/foodlist", renderFoodlist);
app.get("/cart", renderCartitems);
app.get("/orders", handleOrderFetch);



const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`listening to port at ${PORT}`);
});
