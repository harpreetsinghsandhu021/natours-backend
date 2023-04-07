const factoryHandler = require("./factoryHandler");
const Review = require("../models/reviewModel");

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getAllReviews = factoryHandler.getAll(Review);
exports.createReview = factoryHandler.createOne(Review);
exports.updateReview = factoryHandler.updateOne(Review);
