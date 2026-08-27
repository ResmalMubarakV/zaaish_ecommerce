const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

const cloudinaryEnvironmentVariables = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

const isCloudinaryConfigured = cloudinaryEnvironmentVariables.every(
  (variableName) => Boolean(process.env[variableName])
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Uploads a file buffer directly to Cloudinary using streams
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {Object} options - Upload options (folder, etc.)
 * @returns {Promise<Object>} Cloudinary upload response object containing secure_url & public_id
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: process.env.CLOUDINARY_FOLDER || "zaaish_products",
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }]
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      { ...defaultOptions, ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes an asset from Cloudinary using its public_id
 * @param {string} publicId - Cloudinary public ID of the asset
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteImageFromCloudinary
};

