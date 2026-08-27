/**
 * Utility functions for optimizing Cloudinary Image URLs
 */

/**
 * Transforms a Cloudinary image URL to add performance & optimization parameters
 * @param {string} url - Original image URL (Cloudinary or regular URL)
 * @param {Object} options - Transformation options (width, height, crop, quality, format)
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== "string") {
    return "https://picsum.photos/600/600";
  }

  // If it's not a Cloudinary URL, return as is
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto"
  } = options;

  const transformations = [`f_${format}`, `q_${quality}`];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  const transformString = transformations.join(",");

  // Insert transformations into Cloudinary URL path after '/upload/'
  if (url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/${transformString}/`);
  }

  return url;
};

/**
 * Returns a thumbnail-ready Cloudinary URL for small previews
 */
export const getThumbnailUrl = (url, size = 150) => {
  return getOptimizedImageUrl(url, { width: size, height: size, crop: "thumb" });
};
