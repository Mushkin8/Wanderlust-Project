// const Joi = require("joi");

// module.exports.listingSchema = Joi.object({
//   listing: Joi.object({
//     title: Joi.string().required(),
//     description: Joi.string().required(),
//     location: Joi.string().required(),
//     country: Joi.string().required(),
//     price: Joi.number().required().min(0),
//     image: Joi.string().allow("", null)
//   }).required()
// });

// module.exports.reviewSchema = Joi.object({
//   review: Joi.object({
//     rating: Joi.number().min(1).max(5).required(),
//     comment: Joi.string().required()
//   }).required()
// });


const Joi = require("joi");

/* ==========================
   LISTING VALIDATION
========================== */
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),

    description: Joi.string().required(),

    location: Joi.string().required(),

    country: Joi.string().required(),

    price: Joi.number().required().min(0),

    image: Joi.string().allow("", null),

    // ✅ CATEGORY ADDED
    category: Joi.string()
      .valid(
        "rooms",
        "iconic",
        "mountains",
        "castles",
        "arctic",
        "farms",
        "pools",
        "camping"
      )
      .required()
  }).required()
});

/* ==========================
   REVIEW VALIDATION
========================== */
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),

    comment: Joi.string().required()
  }).required()
});