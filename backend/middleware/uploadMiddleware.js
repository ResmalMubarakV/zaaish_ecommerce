const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");
const AppError = require("../utils/AppError");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || "zaaish/products",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ quality: "auto", fetch_format: "auto" }]
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new AppError("Only JPEG, PNG, WEBP, and GIF image files are allowed", 400)
      );
    }

    return callback(null, true);
  }
});

const uploadProductImages = (req, res, next) => {
  if (!isCloudinaryConfigured) {
    return next(new AppError("Cloudinary upload configuration is unavailable", 500));
  }

  return upload.array("images", 8)(req, res, next);
};

module.exports = {
  uploadProductImages
};
