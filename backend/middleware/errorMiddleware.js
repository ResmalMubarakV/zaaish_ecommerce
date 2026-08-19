const multer = require("multer");
const AppError = require("../utils/AppError");

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} was not found`, 404));
};

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "An unexpected server error occurred";
  let details;

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }

  if (error.code === 11000) {
    statusCode = 409;
    const duplicateFields = Object.keys(error.keyValue || {}).join(", ");
    message = duplicateFields
      ? `${duplicateFields} must be unique`
      : "A record with that value already exists";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(error.errors).map((validationError) => validationError.message);
  }

  if (error instanceof multer.MulterError) {
    statusCode = 400;
    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 5 MB or smaller"
        : error.message;
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token is invalid or expired";
  }

  if (!error.isOperational && process.env.NODE_ENV === "production") {
    message = "An unexpected server error occurred";
    details = undefined;
  }

  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};
