
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {userSignupBeforeOTP} = require('./router');
const {userSignupAfterOTP} = require('./router');
const {userLogin} = require('./router')

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/sign-up', userSignupBeforeOTP);
app.post('/sign-up-otp', userSignupAfterOTP);
app.post('/login', userLogin)

const PORT = process.env.PORT || 7000;
app.listen(PORT, ()=> {
    console.log(`listening to port at ${PORT}`);
})