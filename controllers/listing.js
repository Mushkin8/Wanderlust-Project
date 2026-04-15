const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

/* ==========================
   INDEX
========================== */


// module.exports.index = async (req, res) => {
//   let { category } = req.query;

//   let filter = {};

//   if (category && category !== "All") {
//     filter.category = category;
//   }

//   const alllistings = await Listing.find(filter);

//   res.render("listings/index.ejs", {
//     alllistings,
//     activeCategory: category || "All"
//   });
// };

module.exports.index = async (req, res) => {
  let { category, search } = req.query;

  let filter = {};

  // ✅ category filter (your existing logic)
  if (category && category !== "All") {
    filter.category = { $regex: new RegExp(`^${category}$`, "i") };
  }

  // ✅ ADD search filter (new)
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }

  const alllistings = await Listing.find(filter);

  res.render("listings/index.ejs", {
    alllistings,
    activeCategory: category || "All",
    search // ✅ IMPORTANT (fixes error)
  });
};



/* ==========================
   NEW FORM
========================== */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

/* ==========================
   SHOW
========================== */
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

/* ==========================
   CREATE
========================== */
module.exports.createListing = async (req, res) => {
  if (!req.file) {
    throw new ExpressError(400, "Image upload failed");
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {
    url: req.file.path,
    filename: req.file.filename
  };

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

/* ==========================
   EDIT FORM (FIXED)
========================== */
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  let originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/w_250"
  );

  res.render("listings/edit.ejs", {
    listing,
    originalImageUrl
  });
};

/* ==========================
   UPDATE
========================== */
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

/* ==========================
   DELETE
========================== */
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndDelete(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
