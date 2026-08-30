/**
 * Utility functions for optimizing product image URLs
 */

const CARD_SIZES = {
  grid: { width: 480, height: 600 },
  carousel: { width: 520, height: 640 },
  thumbnail: { width: 150, height: 150 },
};

/**
 * Transforms an image URL to add performance & optimization parameters
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== "string") {
    return "https://picsum.photos/600/600";
  }

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto"
  } = options;

  if (url.includes("res.cloudinary.com")) {
    const transformations = [`f_${format}`, `q_${quality}`];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (width || height) transformations.push(`c_${crop}`);

    const transformString = transformations.join(",");

    if (url.includes("/upload/")) {
      return url.replace("/upload/", `/upload/${transformString}/`);
    }

    return url;
  }

  if (url.includes("images.unsplash.com")) {
    try {
      const optimized = new URL(url);
      optimized.searchParams.set("auto", "format");
      optimized.searchParams.set("fit", "crop");
      optimized.searchParams.set("q", "75");
      if (width) optimized.searchParams.set("w", String(width));
      if (height) optimized.searchParams.set("h", String(height));
      return optimized.toString();
    } catch {
      return url;
    }
  }

  return url;
};

export const getProductCardImageUrl = (url, variant = "grid") => {
  const { width, height } = CARD_SIZES[variant] || CARD_SIZES.grid;
  return getOptimizedImageUrl(url, { width, height, crop: "fill" });
};

export const preloadProductImages = (products, { variant = "grid", count = 8 } = {}) => {
  if (!Array.isArray(products)) return;

  products.slice(0, count).forEach((product) => {
    const raw = product?.images?.[0]?.url;
    if (!raw) return;

    const img = new Image();
    img.decoding = "async";
    img.src = getProductCardImageUrl(raw, variant);
  });
};

/**
 * Returns a thumbnail-ready URL for small previews
 */
export const getThumbnailUrl = (url, size = 150) => {
  return getOptimizedImageUrl(url, { width: size, height: size, crop: "thumb" });
};
