const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const qwrapAsync=require("../utils/wrapAsync");
const usercontroller=require("../controllers/user.js");


router
  .route("/signup")
  .get(usercontroller.renderSignupForm)
  .post(qwrapAsync(usercontroller.signup));


  router
  .route("/login")
   .get(usercontroller.renderLoginForm)
   .post(
  saveRedirectUrl,
  passport.authenticate("local",{
    failureRedirect:'/login'
    ,failureFlash:true,
  }),
  usercontroller.login
);



router.get("/logout",usercontroller.logout);

module.exports = router;
