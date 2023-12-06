const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {
  userSignupBeforeOTP,
  userSignupAfterOTP,
  userLogin,
  renderFoodlist,
  updateFoodlist,
} = require("./router");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/sign-up", userSignupBeforeOTP);
app.post("/sign-up-otp", userSignupAfterOTP);
app.post("/login", userLogin);
app.post("/update-foodlist", updateFoodlist);
app.get("/foodlist", renderFoodlist);

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`listening to port at ${PORT}`);
});
