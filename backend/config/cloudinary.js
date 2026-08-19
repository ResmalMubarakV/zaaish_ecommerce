const { v2: cloudinary } = require("cloudinary");

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

module.exports = {
  cloudinary,
  isCloudinaryConfigured
};
