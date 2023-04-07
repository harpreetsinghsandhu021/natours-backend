const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const factoryHandler = require("./factoryHandler");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = factoryHandler.getAll(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = factoryHandler.getOne(User);

exports.updateUser = factoryHandler.updateOne(User);
exports.deleteUser = factoryHandler.deleteOne(User);

function filterObj(currObj, ...allowedFields) {
  let newObj = {};

  Object.keys(currObj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = currObj[el];
  });

  return newObj;
}

const multerStorage = multer.memoryStorage();

const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an Image!.Please upload an Image.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerfilter,
});

exports.uploadSingle = upload.single("photo");

exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  if (req.user) {
    req.file.fileName = `user-${req.user.id}-${Date.now()}.jpeg`;
  } else {
    req.file.fileName = `user-${req.body.name}-${Date.now()}.jpeg`;
  }

  await sharp(req.file.buffer)
    .toFormat("jpeg")
    .resize(500, 500)
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.fileName}`);
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        "this route is not for password updates. please use /updateMyPassword instead",
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.fileName;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    updatedUser,
  });
});
