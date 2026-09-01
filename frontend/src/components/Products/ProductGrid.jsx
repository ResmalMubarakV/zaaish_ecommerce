import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { FiShare2 } from "react-icons/fi";
import { toast } from "sonner";
import { getProductCardImageUrl } from "../../utils/cloudinaryHelper";
import ProductSkeleton from "./ProductSkeleton";

const ProductGrid = ({ products, loading = false, wishlist: propWishlist, onToggleWishlist: propToggleWishlist, priorityCount = 0 }) => {
  const [internalWishlist, setInternalWishlist] = useState([]);

  // If propWishlist is not supplied, manage local/server wishlist sync
  useEffect(() => {
    if (propWishlist !== undefined) return;

    const fetchInternalWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/users/wishlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.wishlist) {
          setInternalWishlist(data.wishlist);
        }
      } catch (err) {
        // silent fail
      }
    };

    fetchInternalWishlist();

    const handleWishlistUpdate = () => fetchInternalWishlist();
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [propWishlist]);

  const activeWishlist = propWishlist !== undefined ? propWishlist : internalWishlist;

  const handleToggle = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (propToggleWishlist) {
      propToggleWishlist(productId);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to save items to your wishlist");
      return;
    }

    try {
      const response = await fetch("/api/users/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (response.ok) {
        setInternalWishlist(data.wishlist || []);
        if (data.action === "added") {
          toast.success("Added to your wishlist ❤️");
        } else {
          toast.info("Removed from your wishlist");
        }
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        toast.error(data.message || "Failed to update wishlist");
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      toast.error("Error updating wishlist");
    }
  };

  const handleShare = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/product/${product._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Zaaish Luxury`,
          text: `Discover ${product.name} at Zaaish.`,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("✨ Product link copied to clipboard!");
      } catch (err) {
        toast.info(`Product Link: ${shareUrl}`);
      }
    } else {
      toast.info(`Product Link: ${shareUrl}`);
    }
  };

  if (loading) {
    return <ProductSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">
        No products available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
      {products.map((product, index) => {
        const isWishlisted = Array.isArray(activeWishlist) && activeWishlist.some(
          (item) => (typeof item === "string" ? item : item?._id) === product._id
        );

        const rawImageUrl = product.images?.[0]?.url || "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80";
        const optimizedUrl = getProductCardImageUrl(rawImageUrl, "grid");
        const hoverImageUrl = product.images?.[1]?.url;
        const optimizedHoverUrl = hoverImageUrl ? getProductCardImageUrl(hoverImageUrl, "grid") : null;
        const isPriority = index < priorityCount;

        const currentPrice = product.currentPrice || product.discountPrice || product.price || 0;
        const originalPrice = product.price || 0;
        const hasDiscount = product.discountPrice && product.discountPrice < originalPrice;

        return (
          <div key={product._id} className="group relative flex flex-col">
            {/* Image container */}
            <div className="w-full aspect-[3/4] mb-2 sm:mb-4 overflow-hidden rounded-xl sm:rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 relative shadow-sm">
              <Link to={`/product/${product._id}`} className="block w-full h-full relative">
                <img
                  src={optimizedUrl}
                  alt={product.images?.[0]?.altText || product.name}
                  loading={isPriority ? "eager" : "lazy"}
                  fetchPriority={isPriority ? "high" : "auto"}
                  decoding="async"
                  className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out absolute inset-0 ${optimizedHoverUrl ? "group-hover:opacity-0" : ""}`}
                  draggable="false"
                />
                {optimizedHoverUrl && (
                  <img
                    src={optimizedHoverUrl}
                    alt={`${product.name} alternate view`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out absolute inset-0 opacity-0 group-hover:opacity-100"
                    draggable="false"
                  />
                )}
              </Link>

              {/* Floating Badges (Top Left) */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex flex-col gap-1 pointer-events-none">
                {hasDiscount && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                    Sale
                  </span>
                )}
                {product.isFeatured && !hasDiscount && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-stone-950/80 text-white dark:bg-stone-100/90 dark:text-stone-950 backdrop-blur-sm shadow-sm">
                    Featured
                  </span>
                )}
                {product.countInStock <= 5 && product.countInStock > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-sm">
                    Only {product.countInStock} Left
                  </span>
                )}
              </div>
            </div>

            <Link to={`/product/${product._id}`}>
              <h3 className="text-xs sm:text-sm font-serif font-normal text-stone-800 dark:text-stone-200 mb-0.5 sm:mb-1 truncate tracking-wide group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-stone-900 dark:text-stone-100 font-medium text-[11px] sm:text-xs tracking-wider">
                  ₹{currentPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-stone-400 dark:text-stone-500 text-[10px] sm:text-[11px] line-through font-light">
                    ₹{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;