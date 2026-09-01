import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiShare2 } from "react-icons/fi";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getProductCardImageUrl } from "../../utils/cloudinaryHelper";

// When `products` and `loading` props are provided (from Home.jsx),
// the internal fetch is skipped to avoid redundant API calls.
const NewArrivals = ({ products: propProducts, loading: propLoading } = {}) => {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [wishlist, setWishlist] = useState([]);

    // Internal state — only used when no props are passed (standalone usage)
    const [internalProducts, setInternalProducts] = useState([]);
    const [internalLoading, setInternalLoading] = useState(!propProducts);

    const usingProps = propProducts !== undefined;
    const newArrivals = usingProps ? propProducts : internalProducts;
    const loading = usingProps ? (propLoading ?? false) : internalLoading;

    useEffect(() => {
        const fetchWishlist = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await fetch("/api/users/wishlist", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && data.wishlist) setWishlist(data.wishlist);
            } catch (e) {}
        };
        fetchWishlist();
        window.addEventListener("wishlistUpdated", fetchWishlist);
        return () => window.removeEventListener("wishlistUpdated", fetchWishlist);
    }, []);

    const handleToggleWishlist = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
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
                setWishlist(data.wishlist || []);
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
                    title: `${product.name} | Zaaish`,
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

    useEffect(() => {
        // Skip fetch if data is passed as props
        if (usingProps) return;

        const fetchNewArrivals = async () => {
            try {
                setInternalLoading(true);
                const response = await fetch('/api/products?limit=8&sortBy=newest');
                const data = await response.json();
                if (response.ok) setInternalProducts(data.products || []);
            } catch (error) {
                console.error("Error fetching new arrivals:", error);
            } finally {
                setInternalLoading(false);
            }
        };

        fetchNewArrivals();
    }, [usingProps]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseMove = (e) => {
       if (!isDragging) return;
       const x = e.pageX - scrollRef.current.offsetLeft;
       const walk = x - startX;
       scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUpOrLeave = () => setIsDragging(false);

    const scroll = (direction) => {
        const scrollAmount = direction === "left" ? -380 : 380;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    const updateScrollButtons = () => {
         const container = scrollRef.current;
         if (container) {
            const leftScroll = container.scrollLeft;
            const rightScrollable = container.scrollWidth > leftScroll + container.clientWidth;
            setCanScrollLeft(leftScroll > 0);
            setCanScrollRight(rightScrollable);
         }
    };

    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            container.addEventListener("scroll", updateScrollButtons);
            updateScrollButtons();
            return () => container.removeEventListener("scroll", updateScrollButtons);
        }
    }, [newArrivals]);

    // Skeleton loading state
    if (loading) {
        return (
            <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12">
                    <div className="max-w-xl">
                        <div className="h-3 w-24 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mb-3" />
                        <div className="h-8 w-64 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mb-3" />
                        <div className="h-4 w-80 bg-stone-100 dark:bg-stone-900 rounded animate-pulse" />
                    </div>
                </div>
                <div className="flex space-x-6 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[85%] sm:min-w-[45%] lg:min-w-[30%] flex-shrink-0">
                            <div className="h-[400px] sm:h-[480px] rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse mb-4" />
                            <div className="h-4 w-3/4 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mb-2" />
                            <div className="h-3 w-1/3 bg-stone-100 dark:bg-stone-900 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (newArrivals.length === 0) return null;

    return (
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 relative">
                <div className="max-w-xl">
                    <span className="text-stone-400 dark:text-stone-500 text-[10px] uppercase tracking-[0.3em] font-medium block mb-2">Curated Selection</span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light text-stone-900 dark:text-stone-100 tracking-wide mb-3">
                        Explore New Arrivals
                    </h2>
                    <p className="text-stone-500 dark:text-stone-400 text-sm font-light leading-relaxed">
                        Discover the latest pieces freshly added to elevate your seasonal wardrobe.
                    </p>
                </div>

                {/* Scroll Navigation Buttons */}
                <div className="hidden md:flex space-x-3 mt-4 md:mt-0">
                    <button
                      onClick={() => scroll("left")}
                      disabled={!canScrollLeft}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${canScrollLeft
                          ? "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 hover:border-stone-400 dark:hover:border-stone-600 shadow-sm"
                          : "bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-900 text-stone-300 dark:text-stone-700 cursor-not-allowed"}`}
                    >
                        <FiChevronLeft className="text-base"/>
                    </button>
                    <button
                      onClick={() => scroll("right")}
                      disabled={!canScrollRight}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${canScrollRight
                          ? "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 hover:border-stone-400 dark:hover:border-stone-600 shadow-sm"
                          : "bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-900 text-stone-300 dark:text-stone-700 cursor-not-allowed"}`}
                    >
                        <FiChevronRight className="text-base"/>
                    </button>
                </div>
            </div>

            {/* Scrollable Content Container */}
            <div
                ref={scrollRef}
                className={`w-full overflow-x-auto flex space-x-4 sm:space-x-6 scrollbar-none pb-4 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
            >
                {newArrivals.map((product, index) => {
                    const rawImageUrl = product.images?.[0]?.url || "https://placehold.co/500x600";
                    const optimizedUrl = getProductCardImageUrl(rawImageUrl, "carousel");
                    const hoverImageUrl = product.images?.[1]?.url;
                    const optimizedHoverUrl = hoverImageUrl ? getProductCardImageUrl(hoverImageUrl, "carousel") : null;
                    const isPriority = index < 3;

                    const isWishlisted = Array.isArray(wishlist) && wishlist.some(
                        (item) => (typeof item === "string" ? item : item?._id) === product._id
                    );
                    const currentPrice = product.currentPrice || product.discountPrice || product.price || 0;
                    const originalPrice = product.price || 0;
                    const hasDiscount = product.discountPrice && product.discountPrice < originalPrice;

                    return (
                    <div key={product._id} className="min-w-[80%] sm:min-w-[42%] lg:min-w-[28%] relative flex-shrink-0 group">
                        <div className="overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 mb-4 shadow-sm relative aspect-[3/4]">
                            <Link to={`/product/${product._id}`} className="block w-full h-full relative">
                                <img
                                    src={optimizedUrl}
                                    alt={product.images?.[0]?.altText || product.name}
                                    loading={isPriority ? "eager" : "lazy"}
                                    fetchPriority={isPriority ? "high" : "auto"}
                                    decoding="async"
                                    className={`w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-all duration-700 ease-out absolute inset-0 ${optimizedHoverUrl ? "group-hover:opacity-0" : ""}`}
                                    draggable="false"
                                />
                                {optimizedHoverUrl && (
                                    <img
                                        src={optimizedHoverUrl}
                                        alt={`${product.name} alternate view`}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-all duration-700 ease-out absolute inset-0 opacity-0 group-hover:opacity-100"
                                        draggable="false"
                                    />
                                )}
                            </Link>

                            {/* Floating Badges (Top Left) */}
                            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
                                {hasDiscount && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                                        Sale
                                    </span>
                                )}
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-stone-950/80 text-white dark:bg-stone-100/90 dark:text-stone-950 backdrop-blur-sm shadow-sm">
                                    New
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-start px-1">
                            <Link to={`/product/${product._id}`} className="block min-w-0">
                                <h4 className="font-serif text-stone-900 dark:text-stone-100 font-normal tracking-wide truncate hover:text-stone-500 dark:hover:text-stone-400 transition-colors text-sm">
                                    {product.name}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-stone-900 dark:text-stone-100 text-xs tracking-wider font-medium">
                                        ₹{currentPrice.toFixed(2)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-stone-400 text-[11px] line-through font-light">
                                            ₹{originalPrice.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    </div>
                    );
                })}
            </div>
        </section>
    );
};

export default NewArrivals;