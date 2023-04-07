const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const AppError = require("../utils/AppError");
const sharp = require("sharp");
const User = require("../models/userModel");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const storage = multer.memoryStorage();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(String(user._id));

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("please upload a photo", 401));

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.file.fileName,
  });

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please provide email or password", 400));
  }

  if (!validator.isEmail(email)) {
    return next(new AppError("not an email. please provide a valid email."));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("no user found! please sign up instead", 400));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 400));
  }

  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("you are not logged in.Please log in to access.", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new AppError("user belonging to this id does no longer exists", 401)
    );
  }

  req.user = user;

  next();
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  if (
    !req.body.password ||
    !req.body.passwordConfirm ||
    !req.body.currentPassword
  ) {
    return next(new AppError("All fields are required", 401));
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("current password is not correct", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createSendToken(user, 200, req, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you dont have permission to perform this action", 403)
      );
    }
    next();
  };
};
