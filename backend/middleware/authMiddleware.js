const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const protect = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication is required to access this resource", 401));
  }

  if (!process.env.JWT_SECRET) {
    return next(new AppError("Server authentication configuration is unavailable", 500));
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return next(new AppError("Authentication token is missing", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user?.id;

    if (!userId) {
      return next(new AppError("Authentication token is malformed", 401));
    }

    const user = await User.findById(userId).select("-password");

    if (!user || user.isActive === false) {
      return next(new AppError("The account associated with this token is unavailable", 401));
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Authentication token has expired", 401));
    }

    return next(new AppError("Authentication token is invalid", 401));
  }
};

const admin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Administrator access is required", 403));
  }

  return next();
};

module.exports = {
  protect,
  admin
};
