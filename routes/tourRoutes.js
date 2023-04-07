const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRoutes = require("./reviewRoutes");

const router = express.Router();

router.use(authController.protect);

router.use("/:tourId/reviews", reviewRoutes);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    tourController.uploadTourImages,
    tourController.resizeImageCover,
    authController.restrictTo("admin"),
    tourController.createTour
  );

router.route("/get-tour-stats").get(tourController.getTourStats);
router.route("/getMonthlyPlan/:year").get(tourController.getMonthlyPlan);

router
  .route("/:id")
  .get(tourController.getOneTour)
  .patch(
    authController.restrictTo("admin"),
    tourController.uploadTourImages,
    tourController.resizeImageCover,
    tourController.updateTour
  )
  .delete(authController.restrictTo("admin"), tourController.deleteTour);

module.exports = router;
