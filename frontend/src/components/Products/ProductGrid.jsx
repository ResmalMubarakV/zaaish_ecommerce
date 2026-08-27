import { Link } from "react-router-dom";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { getOptimizedImageUrl } from "../../utils/cloudinaryHelper";
import ProductSkeleton from "./ProductSkeleton";

const ProductGrid = ({ products, loading = false, wishlist = [], onToggleWishlist }) => {
  if (loading) {
    return <ProductSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-24 text-stone-400 text-xs uppercase tracking-[0.2em] font-light">
        No products available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => {
        const isWishlisted = Array.isArray(wishlist) && wishlist.some(
          (item) => (typeof item === "string" ? item : item?._id) === product._id
        );

        const rawImageUrl = product.images?.[0]?.url || "https://picsum.photos/600/600";
        const optimizedUrl = getOptimizedImageUrl(rawImageUrl, { width: 600, height: 750, crop: "fill" });

        return (
          <div key={product._id} className="group relative flex flex-col">
            <div className="w-full h-[420px] mb-4 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 relative shadow-sm">
              <Link to={`/product/${product._id}`} className="block w-full h-full">
                <img 
                  src={optimizedUrl} 
                  alt={product.images?.[0]?.altText || product.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              </Link>

              {/* Wishlist Heart Toggle Button Overlay */}
              {onToggleWishlist && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleWishlist(product._id);
                  }}
                  className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/50 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? (
                    <HiHeart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  ) : (
                    <HiOutlineHeart className="w-5 h-5 stroke-[1.5]" />
                  )}
                </button>
              )}
            </div>

            <Link to={`/product/${product._id}`}>
              <h3 className="text-sm font-serif font-normal text-stone-800 dark:text-stone-200 mb-1 truncate tracking-wide group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors">
                {product.name}
              </h3>
              <p className="text-stone-900 dark:text-stone-100 font-medium text-xs tracking-wider">
                ${(product.currentPrice || product.price || 0).toFixed(2)}
              </p>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;