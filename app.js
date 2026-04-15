if(process.env.NODE_ENV !="production"){
  require("dotenv").config();
}
 

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const userRouter= require("./routes/user.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

/* =======================
   DATABASE CONNECTION
======================= */
main()
  .then(() => console.log("connected to DB"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

/* =======================
   VIEW ENGINE
======================= */
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* =======================
   MIDDLEWARES
======================= */
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));



const store=MongoStore.create({
  mongoUrl:dbUrl,
  touchAfter:24*3600,
});

store.on("error",(err)=>{
  console.log("Error in MONGO SESSION STORE",err);
});

/* =======================
   SESSION & FLASH
======================= */
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


app.use(session(sessionOption));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/* =======================
   LOCALS FOR EJS
======================= */
app.use((req, res, next) => {
  res.locals.success = req.flash("success") || [];
  res.locals.error = req.flash("error") || [];
  res.locals.currUser=req.user;
  next();
});

/* =======================
   ROUTES
======================= */
// app.get("/", (req, res) => {
//   res.send("hi ,i am root");
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);


// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"delta-student"
//   });

//   let registerUser=await  User.register(fakeUser,"hello world");
//   res.send(registerUser);
// });




/* =======================
   404 HANDLER (FIXED)
======================= */
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

/* =======================
   ERROR HANDLER
======================= */
// app.use((err, req, res, next) => {
//   const { statusCode = 500 } = err;
//   res.status(statusCode).render("listings/error.ejs", { err });
// });

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); // ✅ prevents double response
  }

  const { statusCode = 500 } = err;
  res.status(statusCode).render("listings/error.ejs", { err });
});

/* =======================
   SERVER
======================= */
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
