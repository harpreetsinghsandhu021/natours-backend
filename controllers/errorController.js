const AppError = require("../utils/AppError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: "fail",
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const handleDuplicateFieldsDB = (err, req, res, next) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value : ${value}. please use another value`;

  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError("Invalid token.please try again!", 401);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorProd = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("💥 something went very wrong!!");
    // console.error(err);
    return res.status(500).json({
      status: "error",
      message: "something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    error.message = err.message;

    if (error.code === 11000)
      error = handleDuplicateFieldsDB(error, req, res, next);

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "ValidationError") error = handleValidationError(error);

    sendErrorProd(error, req, res, next);
  }
};
