const express = require("express");
const cors = require("cors");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const bookingController = require("./controllers/bookingController");
const bookingRouter = require("./routes/bookingRoutes");
const bodyParser = require("body-parser");
const reviewRouter = require("./routes/reviewRoutes");
const path = require("path");
const AppError = require("./utils/AppError");
const rateLimit = require("express-rate-limit");

const globalErrorHandler = require("./controllers/errorController");

const app = express();
app.use(cors());

app.use(
  "/webhook",
  express.raw({ type: "application/json" }),
  bookingController.webhookBooking
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "too many requests from this IP.Please try again in an hour",
});

app.use("/api", limiter);

app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
