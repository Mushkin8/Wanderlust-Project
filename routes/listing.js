const express = require("express");
const router = express.Router();
const qwrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

/* ==========================
   VALIDATION MIDDLEWARE
========================== */
const validationListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

/* ==========================
   INDEX + CREATE
========================== */
router
  .route("/")
  .get(qwrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("image"),
    validationListing,
    qwrapAsync(listingController.createListing)
  );



/* ==========================
   NEW
========================== */
router.get(
  "/new",
  isLoggedIn,
  listingController.renderNewForm
);

/* ==========================
   SHOW + UPDATE + DELETE
========================== */
router
  .route("/:id")
  .get(qwrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validationListing,
    qwrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    qwrapAsync(listingController.destroyListing)
  );

/* ==========================
   EDIT
========================== */
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  qwrapAsync(listingController.renderEditForm)
);

module.exports = router;
