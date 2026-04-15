// const Listing = require("./models/listing");
// const Review = require("./models/review"); // ✅ required
// const ExpressError = require("./utils/ExpressError");
// const { reviewSchema, listingSchema } = require("./schema");

// // =======================
// // LOGIN CHECK
// // =======================
// module.exports.isLoggedIn = (req, res, next) => {
//   if (!req.isAuthenticated()) {
//     req.session.redirectUrl = req.originalUrl;
//     req.flash("error", "You must be logged in first");
//     return res.redirect("/login");
//   }
//   next();
// };

// // =======================
// // SAVE REDIRECT URL
// // =======================
// module.exports.saveRedirectUrl = (req, res, next) => {
//   if (req.session.redirectUrl) {
//     res.locals.redirectUrl = req.session.redirectUrl;
//     delete req.session.redirectUrl; // ✅ prevents reuse bug
//   }
//   next();
// };

// // =======================
// // LISTING OWNER CHECK
// // =======================
// module.exports.isOwner = async (req, res, next) => {
//   const { id } = req.params;

//   const listing = await Listing.findById(id);
//   if (!listing) {
//     throw new ExpressError(404, "Listing not found");
//   }

//   if (!listing.owner.equals(req.user._id)) {
//     req.flash("error", "You are not owner of this listing");
//     return res.redirect(`/listings/${id}`);
//   }

//   next();
// };

// // =======================
// // REVIEW AUTHOR CHECK
// // =======================
// module.exports.isReviewAuthor = async (req, res, next) => {
//   const { reviewId, id } = req.params;

//   const review = await Review.findById(reviewId);
//   if (!review) {
//     throw new ExpressError(404, "Review not found");
//   }

//   if (!review.author.equals(req.user._id)) {
//     req.flash("error", "You are not allowed to do that");
//     return res.redirect(`/listings/${id}`);
//   }

//   next();
// };

// // =======================
// // REVIEW VALIDATION
// // =======================
// module.exports.validateReview = (req, res, next) => {
//   const { error } = reviewSchema.validate(req.body);
//   if (error) {
//     const errMsg = error.details.map(el => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   }
//   next();
// };

// // =======================
// // LISTING VALIDATION (optional but safe)
// // =======================
// module.exports.validateListing = (req, res, next) => {
//   const { error } = listingSchema.validate(req.body);
//   if (error) {
//     const errMsg = error.details.map(el => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   }
//   next();
// };


const Listing = require("./models/listing");
const Review = require("./models/review");
const { reviewSchema, listingSchema } = require("./schema");

// =======================
// LOGIN CHECK
// =======================
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in first");
    return res.redirect("/login"); // ✅ added return
  }
  next();
};

// =======================
// SAVE REDIRECT URL
// =======================
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }
  next();
};

// =======================
// LISTING OWNER CHECK
// =======================
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings"); // ✅ FIX
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// =======================
// REVIEW AUTHOR CHECK
// =======================
module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId, id } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`); // ✅ FIX
  }

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not allowed to do that");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// =======================
// REVIEW VALIDATION
// =======================
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    req.flash("error", errMsg);
    return res.redirect("back"); // ✅ FIX
  }

  next();
};

// =======================
// LISTING VALIDATION
// =======================
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    req.flash("error", errMsg);
    return res.redirect("back"); // ✅ FIX
  }

  next();
};