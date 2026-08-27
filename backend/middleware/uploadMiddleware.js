const multer = require("multer");
const { isCloudinaryConfigured, uploadBufferToCloudinary } = require("../config/cloudinary");
const AppError = require("../utils/AppError");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

// Memory storage to hold files in buffer before streaming to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

/**
 * Middleware to process uploaded files and stream them to Cloudinary.
 * Attaches an array of uploaded image objects [{ url, publicId }] to req.uploadedImages.
 */
const uploadProductImages = (req, res, next) => {
  upload.array("images", 8)(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(new AppError(`File upload error: ${err.message}`, 400));
      }
      return next(err);
    }

    if (!req.files || req.files.length === 0) {
      req.uploadedImages = [];
      return next();
    }

    if (!isCloudinaryConfigured) {
      return next(new AppError("Cloudinary service is not properly configured", 500));
    }

    try {
      const uploadPromises = req.files.map((file) =>
        uploadBufferToCloudinary(file.buffer, {
          folder: process.env.CLOUDINARY_FOLDER || "zaaish_products"
        })
      );

      const results = await Promise.all(uploadPromises);

      req.uploadedImages = results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        altText: ""
      }));

      next();
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      return next(new AppError("Failed to upload images to Cloudinary", 500));
    }
  });
};

module.exports = {
  uploadProductImages
};

